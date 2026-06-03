import { error, json } from '@sveltejs/kit';
import { getServerApi } from '$lib/api/server';
import { armoiresApi } from '$lib/api/armoires';
import { armoireUpdateSchema } from '$lib/schemas/armoire';
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
	try {
		const data = await armoiresApi(getServerApi(locals.accessToken)).get(id);
		return json(data);
	} catch (e) {
		if (e instanceof ApiError) throw error(e.status, e.detail);
		throw e;
	}
};

export const PUT: RequestHandler = async ({ params, request, locals }) => {
	if (!locals.user || !locals.accessToken) throw error(401, 'Non authentifié');
	if (!can(locals.user, { type: 'create_armoire' }))
		throw error(403, 'Capacité create_lockers requise');
	const id = lockerIdOr400(params.id);

	const raw = await request.json();
	const parsed = armoireUpdateSchema.safeParse(raw);
	if (!parsed.success) throw error(400, parsed.error.message);

	try {
		const updated = await armoiresApi(getServerApi(locals.accessToken)).update(id, parsed.data);
		return json(updated);
	} catch (e) {
		if (e instanceof ApiError) throw error(e.status, e.detail);
		throw e;
	}
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
	if (!locals.user || !locals.accessToken) throw error(401, 'Non authentifié');
	if (!can(locals.user, { type: 'delete_armoire' }))
		throw error(403, 'Capacité create_lockers requise');
	const id = lockerIdOr400(params.id);
	try {
		await armoiresApi(getServerApi(locals.accessToken)).delete(id);
		return new Response(null, { status: 204 });
	} catch (e) {
		if (e instanceof ApiError) throw error(e.status, e.detail);
		throw e;
	}
};
