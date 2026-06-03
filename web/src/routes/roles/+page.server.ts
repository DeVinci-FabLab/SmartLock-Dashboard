import { error } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { getServerApi } from '$lib/api/server';
import { rolesApi } from '$lib/api/roles';
import { can } from '$lib/auth/permissions';
import { ApiError } from '$lib/api/client';
import { config } from '$lib/config';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) throw error(401, 'Non authentifié');
	if (!can(locals.user, { type: 'view_roles' })) throw error(403, 'Accès refusé');

	try {
		const roles = await rolesApi(getServerApi(locals.accessToken)).list();
		return { roles };
	} catch (e) {
		// Dev bypass without backend: empty list, the page renders cleanly.
		if (dev && !config.keycloak.issuer) return { roles: [] };
		if (e instanceof ApiError) throw error(e.status, e.detail);
		throw e;
	}
};
