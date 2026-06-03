import { error, json } from '@sveltejs/kit';
import { getServerApi } from '$lib/api/server';
import { itemsApi } from '$lib/api/items';
import { ApiError } from '$lib/api/client';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals }) => {
	if (!locals.user || !locals.accessToken) throw error(401, 'Non authentifié');
	const limit = url.searchParams.get('limit');
	const skip = url.searchParams.get('skip');
	try {
		const data = await itemsApi(getServerApi(locals.accessToken)).list({
			limit: limit ? Number(limit) : undefined,
			skip: skip ? Number(skip) : undefined,
		});
		return json(data);
	} catch (e) {
		if (e instanceof ApiError) throw error(e.status, e.detail);
		throw e;
	}
};
