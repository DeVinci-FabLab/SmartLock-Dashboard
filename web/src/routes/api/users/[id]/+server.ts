import { error, json } from '@sveltejs/kit';
import { getServerApi } from '$lib/api/server';
import { usersApi } from '$lib/api/users';
import { ApiError } from '$lib/api/client';
import { can } from '$lib/auth/permissions';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, locals }) => {
	if (!locals.user || !locals.accessToken) throw error(401, 'Non authentifié');
	// Self-read is always allowed; otherwise require view_users.
	if (locals.user.id !== params.id && !can(locals.user, { type: 'view_users' })) {
		throw error(403, 'Accès refusé');
	}

	try {
		const user = await usersApi(getServerApi(locals.accessToken)).get(params.id);
		return json(user);
	} catch (e) {
		if (e instanceof ApiError) throw error(e.status, e.detail);
		throw e;
	}
};
