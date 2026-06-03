import { error, json } from '@sveltejs/kit';
import { z } from 'zod';
import { getServerApi } from '$lib/api/server';
import { permissionsApi, findRolePermission } from '$lib/api/permissions';
import { backendPermissionLevelSchema } from '$lib/schemas/permission';
import { ApiError } from '$lib/api/client';
import { can } from '$lib/auth/permissions';
import type { RequestHandler } from './$types';

const bodySchema = z.object({
	level: backendPermissionLevelSchema,
	valid_until: z.string().nullable().optional(),
});

function guard(locals: App.Locals): string {
	if (!locals.user || !locals.accessToken) throw error(401, 'Non authentifié');
	if (!can(locals.user, { type: 'manage_armoire_permissions' }))
		throw error(403, 'Flag role_admin requis');
	return locals.accessToken;
}

function lockerIdOr400(raw: string): number {
	const id = Number(raw);
	if (!Number.isInteger(id) || id < 1) throw error(400, 'locker id invalide');
	return id;
}

export const PUT: RequestHandler = async ({ params, request, locals }) => {
	const token = guard(locals);
	const lockerId = lockerIdOr400(params.id);
	const raw = await request.json();
	const parsed = bodySchema.safeParse(raw);
	if (!parsed.success) throw error(400, parsed.error.message);

	const api = getServerApi(token);
	try {
		const existing = await permissionsApi(api).listForLocker(lockerId);
		const row = findRolePermission(existing, params.roleName);
		if (row) {
			const updated = await permissionsApi(api).update(row.id, {
				permission_level: parsed.data.level,
				valid_until: parsed.data.valid_until,
			});
			return json(updated);
		}
		const created = await permissionsApi(api).create(lockerId, {
			locker_id: lockerId,
			role_name: params.roleName,
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
	const lockerId = lockerIdOr400(params.id);
	const api = getServerApi(token);
	try {
		const existing = await permissionsApi(api).listForLocker(lockerId);
		const row = findRolePermission(existing, params.roleName);
		if (!row) return new Response(null, { status: 204 });
		await permissionsApi(api).delete(row.id);
		return new Response(null, { status: 204 });
	} catch (e) {
		if (e instanceof ApiError) throw error(e.status, e.detail);
		throw e;
	}
};
