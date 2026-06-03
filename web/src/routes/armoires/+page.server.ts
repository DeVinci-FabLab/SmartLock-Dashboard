import { error } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { getServerApi } from '$lib/api/server';
import { armoiresApi } from '$lib/api/armoires';
import { ApiError } from '$lib/api/client';
import { config } from '$lib/config';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) throw error(401, 'Non authentifié');
	try {
		const armoires = await armoiresApi(getServerApi(locals.accessToken)).list();
		return { armoires };
	} catch (e) {
		if (dev && !config.keycloak.issuer) return { armoires: [] };
		if (e instanceof ApiError) throw error(e.status, e.detail);
		throw e;
	}
};
