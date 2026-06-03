import { type Handle, redirect } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { refreshAccessToken, verifyAccessToken } from '$lib/auth/keycloak';
import { fetchMe } from '$lib/auth/fetchMe';
import { config } from '$lib/config';
import {
	clearSession,
	isExpired,
	readSession,
	writeSession,
	type Session,
} from '$lib/auth/session';
import type { UserContext } from '$lib/auth/types';

// Fail-fast: a production build without Keycloak configured is unsafe (the dev
// bypass below would otherwise expose a fake T0 user). Surface the misconfig
// at boot rather than at first request.
if (!dev && !config.keycloak.issuer) {
	throw new Error(
		'FATAL: production build requires KEYCLOAK_ISSUER, KEYCLOAK_CLIENT_ID and KEYCLOAK_CLIENT_SECRET to be set. See web/.env.example.',
	);
}

const PUBLIC_PATHS = ['/', '/login', '/login/callback', '/logout', '/health'];
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
			label: 'Dev Superuser',
			tier: 0,
			is_system: false,
			is_manager: true,
			is_role_admin: true,
			capacities: [
				'create_lockers',
				'configure_system',
				'audit_log_full',
				'purchase_orders',
				'manage_suppliers',
				'cascade_delete_role',
				'validate_catalog',
				'manage_stock_thresholds',
			],
		},
	],
	armoirePermissions: [],
};

const authBypass = dev && !config.keycloak.issuer;

function logoutAndRedirect(event: Parameters<Handle>[0]['event']): never {
	clearSession(event.cookies);
	if (!isPublic(event.url.pathname)) {
		throw redirect(303, '/login');
	}
	throw redirect(303, event.url.pathname);
}

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

	if (!session || !session.accessToken) {
		event.locals.accessToken = null;
		event.locals.user = null;
		if (!isPublic(event.url.pathname)) {
			throw redirect(303, '/login');
		}
		return resolve(event);
	}

	let active: Session = session;

	// Refresh if access token is near expiry. Also re-fetch /me to pick up
	// role changes that may have happened server-side.
	if (isExpired(active)) {
		try {
			const tokens = await refreshAccessToken(active.refreshToken);
			active = {
				...active,
				accessToken: tokens.access_token!,
				refreshToken: tokens.refresh_token ?? active.refreshToken,
				idToken: tokens.id_token ?? active.idToken,
				expiresAt: Math.floor(Date.now() / 1000) + (tokens.expires_in ?? 60),
			};
			const me = await fetchMe(active.accessToken);
			if (me) active.user = me;
			writeSession(event.cookies, active);
		} catch {
			logoutAndRedirect(event);
		}
	}

	// Defence in depth: verify the JWT signature against Keycloak's JWKS on
	// every request. If a cookie is forged or the signing key rotated, clear.
	try {
		await verifyAccessToken(active.accessToken);
	} catch {
		logoutAndRedirect(event);
	}

	// If user is not yet cached in session (e.g. first request after callback
	// or stale session), fetch it now.
	if (!active.user) {
		const me = await fetchMe(active.accessToken);
		if (me) {
			active.user = me;
			writeSession(event.cookies, active);
		}
	}

	event.locals.accessToken = active.accessToken;
	event.locals.user = active.user ?? null;

	return resolve(event);
};
