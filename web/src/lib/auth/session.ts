import type { Cookies } from '@sveltejs/kit';
import { decodeJwt } from 'jose';
import type { Tier, UserContext } from './types';

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

/**
 * Decodes the access token into a UserContext. Does NOT verify signature —
 * that's done by the API server. This is for UI display only.
 */
export function userContextFromToken(accessToken: string): UserContext {
	const claims = decodeJwt(accessToken) as Record<string, unknown>;
	const realmRoles = ((claims.realm_access as { roles?: string[] })?.roles ?? []) as string[];

	// The API enriches the JWT with our domain attributes (tier per role, flags).
	// If absent (raw Keycloak token), we fall back to defaults.
	const rolesMeta =
		(claims.smartlock_roles as Array<{
			name: string;
			tier: Tier;
			manager: boolean;
			role_admin: boolean;
			audit_viewer: boolean;
			system: boolean;
		}>) ?? [];

	const roles = rolesMeta.length
		? rolesMeta
		: realmRoles.map((name) => ({
				name,
				tier: 'T5' as Tier,
				manager: false,
				role_admin: false,
				audit_viewer: false,
				system: false,
			}));

	return {
		id: (claims.sub as string) ?? '',
		username: (claims.preferred_username as string) ?? '',
		displayName:
			(claims.name as string) ??
			`${(claims.given_name as string) ?? ''} ${(claims.family_name as string) ?? ''}`.trim(),
		email: (claims.email as string) ?? '',
		enabled: true,
		roles,
		armoirePermissions:
			(claims.smartlock_armoire_permissions as UserContext['armoirePermissions']) ?? [],
	};
}
