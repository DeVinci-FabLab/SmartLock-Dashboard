import { error, json } from '@sveltejs/kit';
import { getServerApi } from '$lib/api/server';
import { armoiresApi } from '$lib/api/armoires';
import { permissionsApi, findRolePermission } from '$lib/api/permissions';
import { ApiError } from '$lib/api/client';
import { can } from '$lib/auth/permissions';
import type { RequestHandler } from './$types';

/**
 * Returns one row per armoire describing the role's permission level on it.
 * Shape: { armoire_id, armoire_name, permission_id?, level }
 * `level` is "none" when the role has no row for that armoire.
 */
export const GET: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) throw error(401, 'Non authentifié');
	if (!can(locals.user, { type: 'view_roles' })) throw error(403, 'Accès refusé');

	const api = getServerApi(locals.accessToken);
	try {
		const armoires = await armoiresApi(api).list();
		const rows = await Promise.all(
			armoires.map(async (armoire) => {
				const perms = await permissionsApi(api).listForLocker(armoire.id);
				const found = findRolePermission(perms, params.name);
				return {
					armoire_id: armoire.id,
					armoire_name: armoire.locker_type,
					permission_id: found?.id,
					level: found ? found.permission_level : 'none',
				};
			}),
		);
		return json(rows);
	} catch (e) {
		if (e instanceof ApiError) throw error(e.status, e.detail);
		throw e;
	}
};
