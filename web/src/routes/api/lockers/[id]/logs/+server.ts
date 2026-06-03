import { error, json } from '@sveltejs/kit';
import { getServerApi } from '$lib/api/server';
import { logsApi } from '$lib/api/logs';
import { ApiError } from '$lib/api/client';
import { can } from '$lib/auth/permissions';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, url, locals }) => {
	if (!locals.user || !locals.accessToken) throw error(401, 'Non authentifié');
	const lockerId = Number(params.id);
	if (!Number.isInteger(lockerId) || lockerId < 1) throw error(400, 'locker id invalide');
	if (!can(locals.user, { type: 'view_logs' })) throw error(403, 'Accès logs requis');

	const skip = url.searchParams.get('skip');
	const limit = url.searchParams.get('limit');
	try {
		const data = await logsApi(getServerApi(locals.accessToken)).list({
			locker_id: lockerId,
			skip: skip ? Number(skip) : undefined,
			limit: limit ? Number(limit) : 100,
		});
		return json(data);
	} catch (e) {
		if (e instanceof ApiError) throw error(e.status, e.detail);
		throw e;
	}
};
