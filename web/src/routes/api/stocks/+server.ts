import { error, json } from '@sveltejs/kit';
import { getServerApi } from '$lib/api/server';
import { stocksApi } from '$lib/api/stocks';
import { itemsApi } from '$lib/api/items';
import { armoiresApi } from '$lib/api/armoires';
import { ApiError } from '$lib/api/client';
import { can } from '$lib/auth/permissions';
import type { RequestHandler } from './$types';
import type { EnrichedFlatStockRowDTO } from '$lib/schemas/item';

/**
 * Returns every stock entry enriched with item name/reference/category and
 * locker label. The flat table on /stocks consumes this directly. Three
 * parallel backend calls; volumes are small at MVP.
 */
export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user || !locals.accessToken) throw error(401, 'Non authentifié');
	if (!can(locals.user, { type: 'view_items' })) throw error(403, 'Accès refusé');

	const api = getServerApi(locals.accessToken);
	try {
		const [stocks, items, lockers] = await Promise.all([
			stocksApi(api).list(),
			itemsApi(api).list({ limit: 1000 }),
			armoiresApi(api).list(),
		]);
		const itemById = new Map(items.map((i) => [i.id, i]));
		const lockerById = new Map(lockers.map((l) => [l.id, l]));
		const rows: EnrichedFlatStockRowDTO[] = stocks.map((s) => {
			const item = itemById.get(s.item_id);
			const locker = lockerById.get(s.locker_id);
			return {
				id: s.id,
				item_id: s.item_id,
				locker_id: s.locker_id,
				quantity: s.quantity,
				unit_measure: s.unit_measure,
				item_name: item?.name ?? `#${s.item_id}`,
				item_reference: item?.reference ?? '',
				category_id: item?.category_id ?? 0,
				locker_type: locker?.locker_type ?? `#${s.locker_id}`,
			};
		});
		return json(rows);
	} catch (e) {
		if (e instanceof ApiError) throw error(e.status, e.detail);
		throw e;
	}
};
