import { error, json } from '@sveltejs/kit';
import { getServerApi } from '$lib/api/server';
import { itemsApi } from '$lib/api/items';
import { ApiError } from '$lib/api/client';
import { can } from '$lib/auth/permissions';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user || !locals.accessToken) throw error(401, 'Non authentifié');
	if (!can(locals.user, { type: 'view_low_stock' }))
		throw error(403, 'Capacité manage_stock_thresholds ou tier T1+ requis');
	try {
		const data = await itemsApi(getServerApi(locals.accessToken)).lowStock();
		return json(data);
	} catch (e) {
		if (e instanceof ApiError) throw error(e.status, e.detail);
		throw e;
	}
};
