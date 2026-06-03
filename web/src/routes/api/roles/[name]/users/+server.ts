import { error, json } from '@sveltejs/kit';
import { getServerApi } from '$lib/api/server';
import { usersApi } from '$lib/api/users';
import { ApiError } from '$lib/api/client';
import { can } from '$lib/auth/permissions';
import type { RequestHandler } from './$types';

/**
 * Returns the list of users assigned to this role. Until backend exposes
 * `GET /users?role=`, we return empty array. Best-effort: still validates
 * auth + permission, so we surface 401/403 if applicable.
 */
export const GET: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) throw error(401, 'Non authentifié');
	if (!can(locals.user, { type: 'view_roles' })) throw error(403, 'Accès refusé');

	void params; // role name not used until backend supports filtering

	try {
		// Best-effort: verify the backend is reachable, then return empty.
		await usersApi(getServerApi(locals.accessToken)).list({ max_results: 1 });
		return json([]);
	} catch (e) {
		if (e instanceof ApiError) throw error(e.status, e.detail);
		throw e;
	}
};
