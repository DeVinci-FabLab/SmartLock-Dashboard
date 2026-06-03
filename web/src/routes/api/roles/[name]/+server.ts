import { error, json } from '@sveltejs/kit';
import { getServerApi } from '$lib/api/server';
import { rolesApi } from '$lib/api/roles';
import { ApiError } from '$lib/api/client';
import { can } from '$lib/auth/permissions';
import { roleUpdateSchema } from '$lib/schemas/role';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) throw error(401, 'Non authentifié');
	if (!can(locals.user, { type: 'view_roles' })) throw error(403, 'Accès refusé');

	try {
		// The backend's GET /roles/{name} is not yet implemented as of writing.
		// Fall back to filtering the list result.
		const all = await rolesApi(getServerApi(locals.accessToken)).list();
		const role = all.find((r) => r.name === params.name);
		if (!role) throw error(404, `Rôle "${params.name}" introuvable`);
		return json(role);
	} catch (e) {
		if (e instanceof ApiError) throw error(e.status, e.detail);
		throw e;
	}
};

export const PUT: RequestHandler = async ({ params, request, locals }) => {
	if (!locals.user || !locals.accessToken) throw error(401, 'Non authentifié');
	if (!can(locals.user, { type: 'manage_roles' })) throw error(403, 'Flag role_admin requis');

	const raw = await request.json();
	const parsed = roleUpdateSchema.safeParse(raw);
	if (!parsed.success) throw error(400, parsed.error.message);

	try {
		const updated = await rolesApi(getServerApi(locals.accessToken)).update(
			params.name,
			parsed.data,
		);
		return json(updated);
	} catch (e) {
		if (e instanceof ApiError) throw error(e.status, e.detail);
		throw e;
	}
};

export const DELETE: RequestHandler = async ({ params, url, locals }) => {
	if (!locals.user || !locals.accessToken) throw error(401, 'Non authentifié');
	if (!can(locals.user, { type: 'manage_roles' })) throw error(403, 'Flag role_admin requis');

	const cascade = url.searchParams.get('cascade') === 'true';

	try {
		await rolesApi(getServerApi(locals.accessToken)).delete(params.name, { cascade });
		return new Response(null, { status: 204 });
	} catch (e) {
		if (e instanceof ApiError) throw error(e.status, e.detail);
		throw e;
	}
};
