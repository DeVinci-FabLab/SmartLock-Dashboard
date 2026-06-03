import { error, json } from '@sveltejs/kit';
import { getServerApi } from '$lib/api/server';
import { usersApi } from '$lib/api/users';
import { userRolesApi } from '$lib/api/userRoles';
import { ApiError } from '$lib/api/client';
import { can } from '$lib/auth/permissions';
import type { RequestHandler } from './$types';

/**
 * Returns up to 5 users that have no backend role assignment yet. Used by
 * the home "Users à attribuer" widget. Backend has no dedicated endpoint,
 * so we list users and N+1 their /users/{id}/roles. Volumes are small at
 * MVP (≤ 200 users), so 1 extra call per user is acceptable.
 *
 * Gated on view_users — same as the /users page itself.
 */
export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user || !locals.accessToken) throw error(401, 'Non authentifié');
	if (!can(locals.user, { type: 'view_users' })) throw error(403, 'Accès users requis');

	const api = getServerApi(locals.accessToken);
	try {
		const users = await usersApi(api).list({ max_results: 50 });
		const withCounts = await Promise.all(
			users.map(async (u) => {
				try {
					const names = await userRolesApi(api).list(u.id);
					return { user: u, count: names.length };
				} catch {
					return { user: u, count: -1 };
				}
			}),
		);
		const noRoles = withCounts.filter((r) => r.count === 0).map((r) => r.user);
		return json(noRoles.slice(0, 5));
	} catch (e) {
		if (e instanceof ApiError) throw error(e.status, e.detail);
		throw e;
	}
};
