import { error } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { getServerApi } from '$lib/api/server';
import { usersApi } from '$lib/api/users';
import { can } from '$lib/auth/permissions';
import { ApiError } from '$lib/api/client';
import { config } from '$lib/config';
import { userListParamsSchema } from '$lib/schemas/user';
import type { PageServerLoad } from './$types';

const DEFAULT_LIMIT = 50;

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) throw error(401, 'Non authentifié');
	if (!can(locals.user, { type: 'view_users' })) throw error(403, 'Accès refusé');

	const raw = {
		search: url.searchParams.get('q') ?? undefined,
		first: url.searchParams.has('page')
			? Number(url.searchParams.get('page')) * DEFAULT_LIMIT
			: 0,
		max_results: DEFAULT_LIMIT,
	};
	const params = userListParamsSchema.parse(raw);
	const page = Math.floor((params.first ?? 0) / DEFAULT_LIMIT);

	try {
		const users = await usersApi(getServerApi(locals.accessToken)).list(params);
		return { users, params, page, pageSize: DEFAULT_LIMIT };
	} catch (e) {
		// In dev bypass mode (no Keycloak, no /me, often no backend either), the
		// API call will fail. Render an empty list so the chrome stays browsable
		// rather than surfacing a 500 to the user.
		if (dev && !config.keycloak.issuer) {
			return { users: [], params, page, pageSize: DEFAULT_LIMIT };
		}
		if (e instanceof ApiError) throw error(e.status, e.detail);
		throw e;
	}
};
