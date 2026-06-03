import { error } from '@sveltejs/kit';
import { getServerApi } from '$lib/api/server';
import { stocksApi } from '$lib/api/stocks';
import { itemsApi } from '$lib/api/items';
import { armoiresApi } from '$lib/api/armoires';
import { ApiError } from '$lib/api/client';
import { can } from '$lib/auth/permissions';
import type { RequestHandler } from './$types';

/**
 * Escape a string for CSV. Two concerns:
 * - Quote/comma/newline: standard RFC-4180 doubling.
 * - Formula injection: Excel/LibreOffice/Sheets treat leading `=`, `+`, `-`,
 *   `@`, tab, or CR as a formula, which can exfiltrate data when the file
 *   is opened. Prefix any such leading character with a single quote so
 *   spreadsheet apps render it as literal text.
 */
function csvEscape(value: string): string {
	let v = value;
	if (/^[=+\-@\t\r]/.test(v)) v = `'${v}`;
	if (/[",\n\r]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
	return v;
}

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user || !locals.accessToken) throw error(401, 'Non authentifié');
	if (!can(locals.user, { type: 'export_stocks' })) throw error(403, 'Tier T1+ requis');

	const api = getServerApi(locals.accessToken);
	let rows: string[][];
	try {
		const [stocks, items, lockers] = await Promise.all([
			stocksApi(api).list(),
			itemsApi(api).list({ limit: 1000 }),
			armoiresApi(api).list(),
		]);
		const itemById = new Map(items.map((i) => [i.id, i]));
		const lockerById = new Map(lockers.map((l) => [l.id, l]));
		const header = ['item_name', 'item_reference', 'locker', 'quantity', 'unit_measure'];
		rows = [header];
		for (const s of stocks) {
			const item = itemById.get(s.item_id);
			const locker = lockerById.get(s.locker_id);
			rows.push([
				item?.name ?? `#${s.item_id}`,
				item?.reference ?? '',
				locker?.locker_type ?? `#${s.locker_id}`,
				String(s.quantity),
				s.unit_measure,
			]);
		}
	} catch (e) {
		if (e instanceof ApiError) throw error(e.status, e.detail);
		throw e;
	}

	const csv = rows.map((r) => r.map(csvEscape).join(',')).join('\n');
	const today = new Date().toISOString().slice(0, 10);
	return new Response(csv, {
		status: 200,
		headers: {
			'content-type': 'text/csv; charset=utf-8',
			'content-disposition': `attachment; filename="stocks-${today}.csv"`,
		},
	});
};
