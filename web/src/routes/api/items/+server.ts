import { error, json } from '@sveltejs/kit';
import { getServerApi } from '$lib/api/server';
import { itemsApi } from '$lib/api/items';
import { itemCreateSchema } from '$lib/schemas/item';
import { ApiError } from '$lib/api/client';
import { can } from '$lib/auth/permissions';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals }) => {
	if (!locals.user || !locals.accessToken) throw error(401, 'Non authentifié');
	if (!can(locals.user, { type: 'view_items' })) throw error(403, 'Accès refusé');
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

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user || !locals.accessToken) throw error(401, 'Non authentifié');
	if (!can(locals.user, { type: 'manage_items' }))
		throw error(403, 'Capacité validate_catalog requise');
	const raw = await request.json();
	const parsed = itemCreateSchema.safeParse(raw);
	if (!parsed.success) throw error(400, parsed.error.message);
	try {
		const created = await itemsApi(getServerApi(locals.accessToken)).create(parsed.data);
		return json(created, { status: 201 });
	} catch (e) {
		if (e instanceof ApiError) throw error(e.status, e.detail);
		throw e;
	}
};
