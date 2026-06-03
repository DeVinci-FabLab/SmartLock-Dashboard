import { error, json } from '@sveltejs/kit';
import { getServerApi } from '$lib/api/server';
import { logsApi } from '$lib/api/logs';
import { ApiError } from '$lib/api/client';
import { can } from '$lib/auth/permissions';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals }) => {
	if (!locals.user || !locals.accessToken) throw error(401, 'Non authentifié');
	if (!can(locals.user, { type: 'view_logs' })) throw error(403, 'Accès logs requis');

	const skip = url.searchParams.get('skip');
	const limit = url.searchParams.get('limit');
	const lockerId = url.searchParams.get('locker_id');
	try {
		const data = await logsApi(getServerApi(locals.accessToken)).list({
			skip: skip ? Number(skip) : undefined,
			limit: limit ? Number(limit) : 100,
			locker_id: lockerId ? Number(lockerId) : undefined,
		});
		return json(data);
	} catch (e) {
		if (e instanceof ApiError) throw error(e.status, e.detail);
		throw e;
	}
};
