import { error, json } from '@sveltejs/kit';
import { getServerApi } from '$lib/api/server';
import { rolesApi } from '$lib/api/roles';
import { ApiError } from '$lib/api/client';
import { can } from '$lib/auth/permissions';
import { roleCreateSchema } from '$lib/schemas/role';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user) throw error(401, 'Non authentifié');
	if (!can(locals.user, { type: 'view_roles' })) throw error(403, 'Accès refusé');

	try {
		const roles = await rolesApi(getServerApi(locals.accessToken)).list();
		return json(roles);
	} catch (e) {
		if (e instanceof ApiError) throw error(e.status, e.detail);
		throw e;
	}
};

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user || !locals.accessToken) throw error(401, 'Non authentifié');
	if (!can(locals.user, { type: 'manage_roles' })) throw error(403, 'Flag role_admin requis');

	const raw = await request.json();
	const parsed = roleCreateSchema.safeParse(raw);
	if (!parsed.success) throw error(400, parsed.error.message);

	try {
		const created = await rolesApi(getServerApi(locals.accessToken)).create(parsed.data);
		return json(created, { status: 201 });
	} catch (e) {
		if (e instanceof ApiError) throw error(e.status, e.detail);
		throw e;
	}
};
