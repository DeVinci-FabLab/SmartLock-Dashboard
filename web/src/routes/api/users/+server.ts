import { error, json } from '@sveltejs/kit';
import { getServerApi } from '$lib/api/server';
import { usersApi } from '$lib/api/users';
import { userListParamsSchema } from '$lib/schemas/user';
import { ApiError } from '$lib/api/client';
import { can } from '$lib/auth/permissions';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals }) => {
	if (!locals.user || !locals.accessToken) throw error(401, 'Non authentifié');
	if (!can(locals.user, { type: 'view_users' })) throw error(403, 'Accès refusé');

	const raw = Object.fromEntries(url.searchParams.entries());
	const parsed = userListParamsSchema.safeParse({
		search: raw.search,
		first: raw.first ? Number(raw.first) : undefined,
		max_results: raw.max_results ? Number(raw.max_results) : undefined,
	});
	if (!parsed.success) throw error(400, parsed.error.message);

	try {
		const data = await usersApi(getServerApi(locals.accessToken)).list(parsed.data);
		return json(data);
	} catch (e) {
		if (e instanceof ApiError) throw error(e.status, e.detail);
		throw e;
	}
};
