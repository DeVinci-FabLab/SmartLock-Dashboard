import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { dev } from '$app/environment';
import type { Cookies } from '@sveltejs/kit';
import { config } from '$lib/config';
import type { UserContext } from './types';

const SESSION_COOKIE = 'smartlock_session';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days
const COOKIE_OPTIONS = {
	path: '/',
	httpOnly: true,
	secure: !dev,
	sameSite: 'lax' as const,
	maxAge: SESSION_TTL_SECONDS,
};

export interface Session {
	accessToken: string;
	refreshToken: string;
	idToken: string;
	expiresAt: number; // epoch seconds
	user?: UserContext;
	oauthState?: string;
	codeVerifier?: string;
}

interface StoreEntry {
	session: Session;
	expiresAt: number; // ms epoch
}

// Server-side session store. The cookie carries only a signed session ID
// (~80 bytes); tokens and user context stay here.
//
// Why not the cookie:
// 1. Three Keycloak JWTs + a UserContext blob easily exceed the 4096-byte
//    per-cookie browser limit. Browsers silently drop oversize cookies,
//    which manifests as a silent login loop (callback writes cookie →
//    browser rejects → next request finds no session → landing page).
// 2. Keeping tokens server-side also removes the access-token-in-cookie
//    exfiltration surface entirely.
//
// Trade-offs accepted for the MVP:
// - Single-replica only. A second replica would not see the same Map.
//   When we scale out, swap the Map for Redis or a shared KV.
// - Process restart drops every session (users re-auth once).
const sessions = new Map<string, StoreEntry>();

function sign(payload: string): string {
	return createHmac('sha256', config.sessionSecret).update(payload).digest('base64url');
}

function constantTimeEqual(a: string, b: string): boolean {
	const bufA = Buffer.from(a);
	const bufB = Buffer.from(b);
	if (bufA.length !== bufB.length) return false;
	return timingSafeEqual(bufA, bufB);
}

function extractValidId(cookies: Cookies): string | null {
	const raw = cookies.get(SESSION_COOKIE);
	if (!raw) return null;
	const parts = raw.split('.');
	if (parts.length !== 2) return null;
	const [id, sig] = parts;
	if (!id || !sig) return null;
	if (!constantTimeEqual(sig, sign(id))) return null;
	return id;
}

export function readSession(cookies: Cookies): Session | null {
	const id = extractValidId(cookies);
	if (!id) return null;
	const entry = sessions.get(id);
	if (!entry) return null;
	if (entry.expiresAt < Date.now()) {
		sessions.delete(id);
		return null;
	}
	return entry.session;
}

export function writeSession(cookies: Cookies, session: Session): void {
	// Re-use the existing session ID when one is present so the Map doesn't
	// orphan entries on every refresh. Generate a fresh UUID on first write.
	const existingId = extractValidId(cookies);
	const id = existingId ?? randomUUID();
	sessions.set(id, { session, expiresAt: Date.now() + SESSION_TTL_SECONDS * 1000 });
	const sig = sign(id);
	cookies.set(SESSION_COOKIE, `${id}.${sig}`, COOKIE_OPTIONS);
}

export function clearSession(cookies: Cookies): void {
	const id = extractValidId(cookies);
	if (id) sessions.delete(id);
	cookies.delete(SESSION_COOKIE, { path: '/' });
}

export function isExpired(session: Session, nowSeconds = Math.floor(Date.now() / 1000)): boolean {
	return session.expiresAt <= nowSeconds + 30; // 30s leeway
}

// Periodic GC so expired entries don't accumulate. `unref()` ensures the
// timer doesn't keep the process alive on shutdown.
if (typeof setInterval !== 'undefined') {
	const gc = setInterval(
		() => {
			const now = Date.now();
			for (const [id, entry] of sessions) {
				if (entry.expiresAt < now) sessions.delete(id);
			}
		},
		60 * 60 * 1000, // 1 hour
	);
	gc.unref?.();
}
