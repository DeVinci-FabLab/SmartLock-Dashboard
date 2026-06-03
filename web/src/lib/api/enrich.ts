import { itemsApi } from './items';
import type { StockEntryDTO } from '$lib/schemas/stock';
import type { EnrichedStockRowDTO } from '$lib/schemas/stock';
import type { ApiClient } from './client';

/**
 * Server-only: takes raw stock entries + an ApiClient and returns one row
 * per entry with `item_name` and `item_reference` filled in. Falls back to
 * `"#<id>"` if a referenced item id is missing from the catalog (deleted
 * item, race with sync). One GET /items/ per call — caller is expected to
 * scope this to a single locker.
 */
export async function enrichStockRows(
	entries: StockEntryDTO[],
	api: ApiClient,
): Promise<EnrichedStockRowDTO[]> {
	if (entries.length === 0) return [];
	const items = await itemsApi(api).list({ limit: 1000 });
	const byId = new Map(items.map((i) => [i.id, i]));
	return entries.map((e) => {
		const it = byId.get(e.item_id);
		return {
			...e,
			item_name: it?.name ?? `#${e.item_id}`,
			item_reference: it?.reference ?? '',
		};
	});
}
