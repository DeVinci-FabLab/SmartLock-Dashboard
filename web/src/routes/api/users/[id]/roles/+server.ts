import { error, json } from '@sveltejs/kit';
import { getServerApi } from '$lib/api/server';
import { userRolesApi } from '$lib/api/userRoles';
import { ApiError } from '$lib/api/client';
import { can } from '$lib/auth/permissions';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, locals }) => {
	if (!locals.user || !locals.accessToken) throw error(401, 'Non authentifié');
	// Self-read is always allowed; otherwise require view_users (manager or
	// role_admin flag, matching the rest of the user-management surface).
	if (locals.user.id !== params.id && !can(locals.user, { type: 'view_users' })) {
		throw error(403, 'Accès refusé');
	}

	try {
		const names = await userRolesApi(getServerApi(locals.accessToken)).list(params.id);
		return json(names);
	} catch (e) {
		if (e instanceof ApiError) throw error(e.status, e.detail);
		throw e;
	}
};
