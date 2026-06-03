import { error, json } from '@sveltejs/kit';
import { getServerApi } from '$lib/api/server';
import { itemsApi } from '$lib/api/items';
import { categoryUpdateSchema } from '$lib/schemas/item';
import { ApiError } from '$lib/api/client';
import { can } from '$lib/auth/permissions';
import type { RequestHandler } from './$types';

function catIdOr400(raw: string): number {
	const id = Number(raw);
	if (!Number.isInteger(id) || id < 1) throw error(400, 'category id invalide');
	return id;
}

export const PUT: RequestHandler = async ({ params, request, locals }) => {
	if (!locals.user || !locals.accessToken) throw error(401, 'Non authentifié');
	if (!can(locals.user, { type: 'manage_categories' }))
		throw error(403, 'Capacité validate_catalog requise');
	const id = catIdOr400(params.id);
	const raw = await request.json();
	const parsed = categoryUpdateSchema.safeParse(raw);
	if (!parsed.success) throw error(400, parsed.error.message);
	try {
		const updated = await itemsApi(getServerApi(locals.accessToken)).updateCategory(
			id,
			parsed.data,
		);
		return json(updated);
	} catch (e) {
		if (e instanceof ApiError) throw error(e.status, e.detail);
		throw e;
	}
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
	if (!locals.user || !locals.accessToken) throw error(401, 'Non authentifié');
	if (!can(locals.user, { type: 'manage_categories' }))
		throw error(403, 'Capacité validate_catalog requise');
	const id = catIdOr400(params.id);
	try {
		await itemsApi(getServerApi(locals.accessToken)).deleteCategory(id);
		return new Response(null, { status: 204 });
	} catch (e) {
		if (e instanceof ApiError) throw error(e.status, e.detail);
		throw e;
	}
};
