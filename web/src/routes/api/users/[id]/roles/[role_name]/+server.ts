import { error, json } from '@sveltejs/kit';
import { getServerApi } from '$lib/api/server';
import { usersApi } from '$lib/api/users';
import { ApiError } from '$lib/api/client';
import { can } from '$lib/auth/permissions';
import type { RequestHandler } from './$types';

function guard(locals: App.Locals): string {
	if (!locals.user || !locals.accessToken) throw error(401, 'Non authentifié');
	if (!can(locals.user, { type: 'manage_users' })) throw error(403, 'Flag manager requis');
	return locals.accessToken;
}

export const POST: RequestHandler = async ({ params, locals }) => {
	const token = guard(locals);
	try {
		await usersApi(getServerApi(token)).assignRole(params.id, params.role_name);
		return json({ ok: true }, { status: 201 });
	} catch (e) {
		if (e instanceof ApiError) throw error(e.status, e.detail);
		throw e;
	}
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
	const token = guard(locals);
	try {
		await usersApi(getServerApi(token)).revokeRole(params.id, params.role_name);
		return new Response(null, { status: 204 });
	} catch (e) {
		if (e instanceof ApiError) throw error(e.status, e.detail);
		throw e;
	}
};
