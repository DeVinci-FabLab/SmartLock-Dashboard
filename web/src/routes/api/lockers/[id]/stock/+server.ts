import { error, json } from '@sveltejs/kit';
import { getServerApi } from '$lib/api/server';
import { stocksApi } from '$lib/api/stocks';
import { enrichStockRows } from '$lib/api/enrich';
import { stockCreateSchema } from '$lib/schemas/stock';
import { ApiError } from '$lib/api/client';
import { can } from '$lib/auth/permissions';
import type { RequestHandler } from './$types';

function lockerIdOr400(raw: string): number {
	const id = Number(raw);
	if (!Number.isInteger(id) || id < 1) throw error(400, 'locker id invalide');
	return id;
}

export const GET: RequestHandler = async ({ params, locals }) => {
	if (!locals.user || !locals.accessToken) throw error(401, 'Non authentifié');
	const id = lockerIdOr400(params.id);
	if (!can(locals.user, { type: 'view_armoire', armoireId: id }))
		throw error(403, 'Accès armoire requis');
	const api = getServerApi(locals.accessToken);
	try {
		const entries = await stocksApi(api).byLocker(id);
		const enriched = await enrichStockRows(entries, api);
		return json(enriched);
	} catch (e) {
		if (e instanceof ApiError) throw error(e.status, e.detail);
		throw e;
	}
};

export const POST: RequestHandler = async ({ params, request, locals }) => {
	if (!locals.user || !locals.accessToken) throw error(401, 'Non authentifié');
	const id = lockerIdOr400(params.id);
	if (!can(locals.user, { type: 'edit_armoire', armoireId: id }))
		throw error(403, 'Permission can_edit requise sur cette armoire');

	const raw = await request.json();
	const parsed = stockCreateSchema.safeParse({ ...raw, locker_id: id });
	if (!parsed.success) throw error(400, parsed.error.message);

	try {
		const created = await stocksApi(getServerApi(locals.accessToken)).create(parsed.data);
		return json(created, { status: 201 });
	} catch (e) {
		if (e instanceof ApiError) throw error(e.status, e.detail);
		throw e;
	}
};
