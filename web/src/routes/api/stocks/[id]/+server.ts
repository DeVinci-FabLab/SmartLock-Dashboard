import { error, json } from '@sveltejs/kit';
import { getServerApi } from '$lib/api/server';
import { stocksApi } from '$lib/api/stocks';
import { stockUpdateSchema } from '$lib/schemas/stock';
import { ApiError } from '$lib/api/client';
import { can } from '$lib/auth/permissions';
import type { RequestHandler } from './$types';

function stockIdOr400(raw: string): number {
	const id = Number(raw);
	if (!Number.isInteger(id) || id < 1) throw error(400, 'stock id invalide');
	return id;
}

/**
 * Gates on `edit_armoire` for the locker that owns this stock row. Because
 * the caller may not pass the locker id (the flat /stocks view doesn't
 * thread it through the URL), we resolve locker_id by reading the stock
 * row first. One extra GET; acceptable.
 */
async function guardForStockId(
	locals: App.Locals,
	stockId: number,
): Promise<{ accessToken: string; lockerId: number }> {
	if (!locals.user || !locals.accessToken) throw error(401, 'Non authentifié');
	const api = getServerApi(locals.accessToken);
	const row = await stocksApi(api).get(stockId);
	if (!can(locals.user, { type: 'edit_armoire', armoireId: row.locker_id }))
		throw error(403, 'Permission can_edit requise sur l’armoire correspondante');
	return { accessToken: locals.accessToken, lockerId: row.locker_id };
}

export const PUT: RequestHandler = async ({ params, request, locals }) => {
	const stockId = stockIdOr400(params.id);
	const { accessToken } = await guardForStockId(locals, stockId);
	const raw = await request.json();
	const parsed = stockUpdateSchema.safeParse(raw);
	if (!parsed.success) throw error(400, parsed.error.message);
	try {
		const updated = await stocksApi(getServerApi(accessToken)).update(stockId, parsed.data);
		return json(updated);
	} catch (e) {
		if (e instanceof ApiError) throw error(e.status, e.detail);
		throw e;
	}
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
	const stockId = stockIdOr400(params.id);
	const { accessToken } = await guardForStockId(locals, stockId);
	try {
		await stocksApi(getServerApi(accessToken)).delete(stockId);
		return new Response(null, { status: 204 });
	} catch (e) {
		if (e instanceof ApiError) throw error(e.status, e.detail);
		throw e;
	}
};
