import { error, json } from '@sveltejs/kit';
import { getServerApi } from '$lib/api/server';
import { armoiresApi } from '$lib/api/armoires';
import { ApiError } from '$lib/api/client';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user || !locals.accessToken) throw error(401, 'Non authentifié');

	try {
		const armoires = await armoiresApi(getServerApi(locals.accessToken)).list();
		return json(armoires);
	} catch (e) {
		if (e instanceof ApiError) throw error(e.status, e.detail);
		throw e;
	}
};
