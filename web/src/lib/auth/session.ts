import { createHmac, timingSafeEqual } from 'node:crypto';
import { dev } from '$app/environment';
import type { Cookies } from '@sveltejs/kit';
import { config } from '$lib/config';
import type { UserContext } from './types';

const SESSION_COOKIE = 'smartlock_session';
const COOKIE_OPTIONS = {
	path: '/',
	httpOnly: true,
	secure: !dev,
	sameSite: 'lax' as const,
	maxAge: 60 * 60 * 24 * 7, // 7 days
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

function sign(payload: string): string {
	return createHmac('sha256', config.sessionSecret).update(payload).digest('base64url');
}

function constantTimeEqual(a: string, b: string): boolean {
	const bufA = Buffer.from(a);
	const bufB = Buffer.from(b);
	if (bufA.length !== bufB.length) return false;
	return timingSafeEqual(bufA, bufB);
}

export function readSession(cookies: Cookies): Session | null {
	const raw = cookies.get(SESSION_COOKIE);
	if (!raw) return null;
	const parts = raw.split('.');
	if (parts.length !== 2) return null;
	const [payloadB64, sig] = parts;
	let payload: string;
	try {
		payload = Buffer.from(payloadB64, 'base64url').toString('utf8');
	} catch {
		return null;
	}
	if (!payload) return null;
	if (!constantTimeEqual(sig, sign(payload))) return null;
	try {
		return JSON.parse(payload) as Session;
	} catch {
		return null;
	}
}

export function writeSession(cookies: Cookies, session: Session): void {
	const payload = JSON.stringify(session);
	const payloadB64 = Buffer.from(payload, 'utf8').toString('base64url');
	const sig = sign(payload);
	cookies.set(SESSION_COOKIE, `${payloadB64}.${sig}`, COOKIE_OPTIONS);
}

export function clearSession(cookies: Cookies): void {
	cookies.delete(SESSION_COOKIE, { path: '/' });
}

export function isExpired(session: Session, nowSeconds = Math.floor(Date.now() / 1000)): boolean {
	return session.expiresAt <= nowSeconds + 30; // 30s leeway
}
