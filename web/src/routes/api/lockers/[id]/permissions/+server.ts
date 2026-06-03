import { error, json } from '@sveltejs/kit';
import { getServerApi } from '$lib/api/server';
import { armoiresApi } from '$lib/api/armoires';
import { rolesApi } from '$lib/api/roles';
import { ApiError } from '$lib/api/client';
import { can } from '$lib/auth/permissions';
import type { RequestHandler } from './$types';

/**
 * Returns one row per role describing its permission level on this locker.
 * Shape: { role_name, role_label, role_tier, permission_id?, level }
 * `level` is "none" when the role has no row for this locker.
 */
export const GET: RequestHandler = async ({ params, locals }) => {
	if (!locals.user || !locals.accessToken) throw error(401, 'Non authentifié');
	const lockerId = Number(params.id);
	if (!Number.isInteger(lockerId) || lockerId < 1) throw error(400, 'locker id invalide');
	if (!can(locals.user, { type: 'view_armoire', armoireId: lockerId }))
		throw error(403, 'Accès armoire requis');

	const api = getServerApi(locals.accessToken);
	try {
		const [roles, perms] = await Promise.all([
			rolesApi(api).list(),
			armoiresApi(api).listPermissions(lockerId),
		]);
		const rows = roles.map((r) => {
			const found = perms.find((p) => p.role_name === r.name);
			return {
				role_name: r.name,
				role_label: r.label,
				role_tier: r.tier,
				permission_id: found?.id,
				level: found ? found.permission_level : 'none',
			};
		});
		return json(rows);
	} catch (e) {
		if (e instanceof ApiError) throw error(e.status, e.detail);
		throw e;
	}
};
