import { decodeJwt } from 'jose';
import { createApiClient } from '$lib/api/client';
import { meApi } from '$lib/api/me';
import { rolesApi } from '$lib/api/roles';
import { userRolesApi } from '$lib/api/userRoles';
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
 * Strategy (first hit wins):
 * 1. Backend `GET /me` — once the backend implements it, source of truth.
 * 2. JWT identity (sub / preferred_username / email / names from
 *    realm-verified claims) PLUS backend `GET /users/{sub}/roles` for the
 *    *authoritative* role names (the backend has its own role assignment
 *    table that may differ from `realm_access.roles` while the two
 *    systems sync).
 * 3. If `GET /users/{sub}/roles` errors (user not yet synced backend-side,
 *    or backend down), fall back to `realm_access.roles` from the JWT.
 *
 * Role names from whichever source are enriched via `GET /roles` to fill
 * tier / flags / capacities. If `/roles` itself errors we end with an
 * empty role array — `can()` then denies everything, the safe default.
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

	// 2. Decode the JWT (already signature-verified upstream in hooks.server.ts).
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

	// 3. Resolve the user's role names. Prefer the backend's view
	//    (`GET /users/{sub}/roles`) because the rest of the dashboard reads
	//    permissions from there; falling back to the JWT keeps the dashboard
	//    usable when the backend hasn't synced the user row yet.
	let roleNames: string[];
	try {
		roleNames = await userRolesApi(client).list(claims.sub);
	} catch (e) {
		console.warn(
			'[auth] /users/{sub}/roles fetch failed; falling back to JWT realm_access.roles:',
			(e as Error).message,
		);
		roleNames = claims.realm_access?.roles ?? [];
	}

	// 4. Enrich role names with backend metadata (tier, flags, capacities).
	let allRoles: Awaited<ReturnType<ReturnType<typeof rolesApi>['list']>> = [];
	try {
		allRoles = await rolesApi(client).list();
	} catch (e) {
		console.warn(
			'[auth] /roles fetch failed during JWT-derived UserContext build:',
			(e as Error).message,
		);
	}
	const wanted = new Set(roleNames);
	const roles = allRoles.filter((r) => wanted.has(r.name));

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
