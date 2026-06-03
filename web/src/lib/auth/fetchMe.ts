import { decodeJwt } from 'jose';
import { createApiClient } from '$lib/api/client';
import { meApi } from '$lib/api/me';
import { rolesApi } from '$lib/api/roles';
import { config } from '$lib/config';
import type { UserContext } from './types';

interface KeycloakClaims {
	sub?: string;
	preferred_username?: string;
	email?: string;
	given_name?: string;
	family_name?: string;
	realm_access?: { roles?: string[] };
}

/**
 * Fetches the enriched UserContext for the holder of `accessToken`.
 *
 * Strategy:
 * 1. Try the backend's `GET /me` first — when the backend implements it
 *    this is the source of truth (role enrichment + armoire permissions).
 * 2. Fall back to deriving identity from the verified JWT claims and
 *    enriching role names via `GET /roles`. This keeps the dashboard
 *    functional today (backend has no `/me` as of 2026-06-03) without
 *    blocking on the backend.
 *
 * Returns `null` on any unrecoverable error so callers can decide how to
 * handle a missing user without crashing the request.
 */
export async function fetchMe(accessToken: string): Promise<UserContext | null> {
	const client = createApiClient({
		baseUrl: config.apiUrl,
		getToken: () => accessToken,
	});

	// 1. Backend /me is the source of truth once it exists.
	try {
		return await meApi(client).get();
	} catch {
		// /me not implemented (or temporarily down); fall through to JWT path.
	}

	// 2. Decode the JWT (already verified upstream in hooks.server.ts).
	let claims: KeycloakClaims;
	try {
		claims = decodeJwt(accessToken) as KeycloakClaims;
	} catch (e) {
		console.warn('[auth] JWT decode failed:', (e as Error).message);
		return null;
	}
	if (!claims.sub) {
		console.warn('[auth] JWT has no `sub` claim — cannot build UserContext');
		return null;
	}

	// 3. Enrich realm role names with backend metadata (tier, flags, capacities).
	//    If /roles is unreachable, fall back to an empty list — gating helpers
	//    will deny everything, which is the safe default.
	let allRoles: Awaited<ReturnType<ReturnType<typeof rolesApi>['list']>> = [];
	try {
		allRoles = await rolesApi(client).list();
	} catch (e) {
		console.warn('[auth] /roles fetch failed during JWT-derived UserContext build:', (e as Error).message);
	}
	const myRoleNames = new Set(claims.realm_access?.roles ?? []);
	const roles = allRoles.filter((r) => myRoleNames.has(r.name));

	const composedName = [claims.given_name, claims.family_name].filter(Boolean).join(' ').trim();

	return {
		id: claims.sub,
		username: claims.preferred_username ?? claims.sub,
		displayName: composedName || claims.preferred_username || claims.sub,
		email: claims.email ?? '',
		enabled: true,
		roles,
		// Backend doesn't yet expose per-user armoire permissions. Capacity-
		// and flag-based gates (manage_items, view_logs, manage_roles, etc.)
		// still work since they ride on the role records above. Armoire-
		// specific gates (view/open/edit_armoire) deny by default until the
		// backend exposes /me or we add a per-user lookup.
		armoirePermissions: [],
	};
}
