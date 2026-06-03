import { error, json } from '@sveltejs/kit';
import { z } from 'zod';
import { getServerApi } from '$lib/api/server';
import { permissionsApi, findRolePermission } from '$lib/api/permissions';
import { ApiError } from '$lib/api/client';
import { can } from '$lib/auth/permissions';
import { backendPermissionLevelSchema } from '$lib/schemas/permission';
import type { RequestHandler } from './$types';

const bodySchema = z.object({
	level: backendPermissionLevelSchema,
	valid_until: z.string().nullable().optional(),
});

function guard(locals: App.Locals): string {
	if (!locals.user || !locals.accessToken) throw error(401, 'Non authentifié');
	if (!can(locals.user, { type: 'manage_roles' })) throw error(403, 'Flag role_admin requis');
	return locals.accessToken;
}

/**
 * PUT upserts the permission row: creates if absent, updates the level if
 * present. DELETE clears the row (= "level: none" semantically). Sending
 * `level: "none"` to PUT is rejected — the caller should DELETE instead.
 */
export const PUT: RequestHandler = async ({ params, request, locals }) => {
	const token = guard(locals);
	const raw = await request.json();
	const parsed = bodySchema.safeParse(raw);
	if (!parsed.success) throw error(400, parsed.error.message);

	const lockerId = Number(params.locker_id);
	if (!Number.isInteger(lockerId) || lockerId < 1) throw error(400, 'locker_id invalide');

	const api = getServerApi(token);
	try {
		const existing = await permissionsApi(api).listForLocker(lockerId);
		const row = findRolePermission(existing, params.name);

		if (row) {
			const updated = await permissionsApi(api).update(row.id, {
				permission_level: parsed.data.level,
				valid_until: parsed.data.valid_until,
			});
			return json(updated);
		}
		const created = await permissionsApi(api).create(lockerId, {
			locker_id: lockerId,
			role_name: params.name,
			permission_level: parsed.data.level,
			valid_until: parsed.data.valid_until,
		});
		return json(created, { status: 201 });
	} catch (e) {
		if (e instanceof ApiError) throw error(e.status, e.detail);
		throw e;
	}
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
	const token = guard(locals);
	const lockerId = Number(params.locker_id);
	if (!Number.isInteger(lockerId) || lockerId < 1) throw error(400, 'locker_id invalide');

	const api = getServerApi(token);
	try {
		const existing = await permissionsApi(api).listForLocker(lockerId);
		const row = findRolePermission(existing, params.name);
		if (!row) return new Response(null, { status: 204 });
		await permissionsApi(api).delete(row.id);
		return new Response(null, { status: 204 });
	} catch (e) {
		if (e instanceof ApiError) throw error(e.status, e.detail);
		throw e;
	}
};
