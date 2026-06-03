import { error, json } from '@sveltejs/kit';
import { getServerApi } from '$lib/api/server';
import { stocksApi } from '$lib/api/stocks';
import { stockUpdateSchema } from '$lib/schemas/stock';
import { ApiError } from '$lib/api/client';
import { can } from '$lib/auth/permissions';
import type { RequestHandler } from './$types';

function intOr400(raw: string, label: string): number {
	const n = Number(raw);
	if (!Number.isInteger(n) || n < 1) throw error(400, `${label} invalide`);
	return n;
}

export const PUT: RequestHandler = async ({ params, request, locals }) => {
	if (!locals.user || !locals.accessToken) throw error(401, 'Non authentifié');
	const lockerId = intOr400(params.id, 'locker id');
	const stockId = intOr400(params.stockId, 'stock id');
	if (!can(locals.user, { type: 'edit_armoire', armoireId: lockerId }))
		throw error(403, 'Permission can_edit requise');

	const raw = await request.json();
	const parsed = stockUpdateSchema.safeParse(raw);
	if (!parsed.success) throw error(400, parsed.error.message);

	try {
		const updated = await stocksApi(getServerApi(locals.accessToken)).update(stockId, parsed.data);
		return json(updated);
	} catch (e) {
		if (e instanceof ApiError) throw error(e.status, e.detail);
		throw e;
	}
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
	if (!locals.user || !locals.accessToken) throw error(401, 'Non authentifié');
	const lockerId = intOr400(params.id, 'locker id');
	const stockId = intOr400(params.stockId, 'stock id');
	if (!can(locals.user, { type: 'edit_armoire', armoireId: lockerId }))
		throw error(403, 'Permission can_edit requise');
	try {
		await stocksApi(getServerApi(locals.accessToken)).delete(stockId);
		return new Response(null, { status: 204 });
	} catch (e) {
		if (e instanceof ApiError) throw error(e.status, e.detail);
		throw e;
	}
};
