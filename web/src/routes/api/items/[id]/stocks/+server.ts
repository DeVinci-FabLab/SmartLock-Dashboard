import { error, json } from '@sveltejs/kit';
import { getServerApi } from '$lib/api/server';
import { stocksApi } from '$lib/api/stocks';
import { armoiresApi } from '$lib/api/armoires';
import { ApiError } from '$lib/api/client';
import { can } from '$lib/auth/permissions';
import type { RequestHandler } from './$types';

/**
 * Returns the per-armoire breakdown of stock for one item. Backend has no
 * dedicated endpoint; we fetch the full stock list, filter by item_id, and
 * join with the locker list for the locker label. Volumes are small (< few
 * hundred rows total at MVP), so the cost is acceptable.
 */
export const GET: RequestHandler = async ({ params, locals }) => {
	if (!locals.user || !locals.accessToken) throw error(401, 'Non authentifié');
	if (!can(locals.user, { type: 'view_items' })) throw error(403, 'Accès refusé');
	const itemId = Number(params.id);
	if (!Number.isInteger(itemId) || itemId < 1) throw error(400, 'item id invalide');

	const api = getServerApi(locals.accessToken);
	try {
		const [allStocks, lockers] = await Promise.all([
			stocksApi(api).list(),
			armoiresApi(api).list(),
		]);
		const lockerById = new Map(lockers.map((l) => [l.id, l]));
		const rows = allStocks
			.filter((s) => s.item_id === itemId)
			.map((s) => ({
				id: s.id,
				locker_id: s.locker_id,
				locker_type: lockerById.get(s.locker_id)?.locker_type ?? `#${s.locker_id}`,
				quantity: s.quantity,
				unit_measure: s.unit_measure,
			}));
		return json(rows);
	} catch (e) {
		if (e instanceof ApiError) throw error(e.status, e.detail);
		throw e;
	}
};
