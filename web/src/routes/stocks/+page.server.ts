import { error } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { getServerApi } from '$lib/api/server';
import { itemsApi } from '$lib/api/items';
import { armoiresApi } from '$lib/api/armoires';
import { ApiError } from '$lib/api/client';
import { config } from '$lib/config';
import { can } from '$lib/auth/permissions';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) throw error(401, 'Non authentifié');
	if (!can(locals.user, { type: 'view_items' })) throw error(403, 'Accès refusé');

	try {
		const api = getServerApi(locals.accessToken);
		const [categories, lockers] = await Promise.all([
			itemsApi(api).listCategories(),
			armoiresApi(api).list(),
		]);
		return { categories, lockers };
	} catch (e) {
		if (dev && !config.keycloak.issuer) {
			return { categories: [], lockers: [] };
		}
		if (e instanceof ApiError) throw error(e.status, e.detail);
		throw e;
	}
};
