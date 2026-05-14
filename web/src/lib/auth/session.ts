import type { Cookies } from '@sveltejs/kit';
import type { UserContext } from './types';

const SESSION_COOKIE = 'smartlock_session';
const COOKIE_OPTIONS = {
	path: '/',
	httpOnly: true,
	secure: process.env.NODE_ENV === 'production',
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

export function readSession(cookies: Cookies): Session | null {
	const raw = cookies.get(SESSION_COOKIE);
	if (!raw) return null;
	try {
		return JSON.parse(raw) as Session;
	} catch {
		return null;
	}
}

export function writeSession(cookies: Cookies, session: Session): void {
	cookies.set(SESSION_COOKIE, JSON.stringify(session), COOKIE_OPTIONS);
}

export function clearSession(cookies: Cookies): void {
	cookies.delete(SESSION_COOKIE, { path: '/' });
}

export function isExpired(session: Session, nowSeconds = Math.floor(Date.now() / 1000)): boolean {
	return session.expiresAt <= nowSeconds + 30; // 30s leeway
}
