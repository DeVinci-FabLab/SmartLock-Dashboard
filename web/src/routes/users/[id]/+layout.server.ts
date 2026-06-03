import { error } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { getServerApi } from '$lib/api/server';
import { usersApi } from '$lib/api/users';
import { rolesApi, type Group } from '$lib/api/roles';
import { can } from '$lib/auth/permissions';
import { ApiError } from '$lib/api/client';
import { config } from '$lib/config';
import type { UserDTO } from '$lib/schemas/user';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, params, depends }) => {
	if (!locals.user) throw error(401, 'Non authentifié');
	if (!can(locals.user, { type: 'view_users' })) throw error(403, 'Accès refusé');

	// Tag this load so role mutations can `invalidate('users:<id>')` to refetch.
	depends(`users:${params.id}`);

	const api = getServerApi(locals.accessToken);

	// Under dev bypass without a backend, fabricate a placeholder user so the
	// chrome stays browsable. Real auth path throws on API failure.
	if (dev && !config.keycloak.issuer) {
		try {
			const [targetUser, groups] = await Promise.all([
				usersApi(api).get(params.id),
				rolesApi(api)
					.listGroups()
					.catch(() => [] as Group[]),
			]);
			return { targetUser, groups };
		} catch {
			const fakeUser: UserDTO = {
				id: params.id,
				username: 'unknown',
				email: '(backend non disponible)',
				enabled: true,
			};
			return { targetUser: fakeUser, groups: [] as Group[] };
		}
	}

	try {
		const [targetUser, groups] = await Promise.all([
			usersApi(api).get(params.id),
			rolesApi(api)
				.listGroups()
				.catch(() => [] as Group[]),
		]);
		return { targetUser, groups };
	} catch (e) {
		if (e instanceof ApiError) throw error(e.status, e.detail);
		throw e;
	}
};
