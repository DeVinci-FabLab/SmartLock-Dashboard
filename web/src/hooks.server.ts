import { type Handle, redirect } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { refreshAccessToken } from '$lib/auth/keycloak';
import { config } from '$lib/config';
import {
	clearSession,
	isExpired,
	readSession,
	userContextFromToken,
	writeSession,
} from '$lib/auth/session';
import type { UserContext } from '$lib/auth/types';

const PUBLIC_PATHS = ['/login', '/login/callback', '/logout'];

function isPublic(pathname: string): boolean {
	return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

const DEV_FAKE_USER: UserContext = {
	id: 'dev-fake-user',
	username: 'devuser',
	displayName: 'Dev User',
	email: 'dev@local',
	enabled: true,
	roles: [
		{
			name: 'dev-superuser',
			tier: 'T0',
			manager: true,
			role_admin: true,
			audit_viewer: true,
			system: false,
		},
	],
	armoirePermissions: [],
};

const authBypass = dev && !config.keycloak.issuer;

export const handle: Handle = async ({ event, resolve }) => {
	if (authBypass) {
		event.locals.user = DEV_FAKE_USER;
		event.locals.accessToken = null;
		if (event.url.pathname === '/login' || event.url.pathname === '/logout') {
			throw redirect(303, '/');
		}
		return resolve(event);
	}

	const session = readSession(event.cookies);

	if (session && session.accessToken) {
		let active = session;
		if (isExpired(session)) {
			try {
				const tokens = await refreshAccessToken(session.refreshToken);
				active = {
					accessToken: tokens.access_token!,
					refreshToken: tokens.refresh_token ?? session.refreshToken,
					idToken: tokens.id_token ?? session.idToken,
					expiresAt: Math.floor(Date.now() / 1000) + (tokens.expires_in ?? 60),
				};
				writeSession(event.cookies, active);
			} catch {
				clearSession(event.cookies);
				if (!isPublic(event.url.pathname)) {
					throw redirect(303, '/login');
				}
				event.locals.accessToken = null;
				event.locals.user = null;
				return resolve(event);
			}
		}
		event.locals.accessToken = active.accessToken;
		event.locals.user = userContextFromToken(active.accessToken);
	} else {
		event.locals.accessToken = null;
		event.locals.user = null;
		if (!isPublic(event.url.pathname)) {
			throw redirect(303, '/login');
		}
	}

	return resolve(event);
};
