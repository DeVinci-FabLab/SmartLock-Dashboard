import { error } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { getServerApi } from '$lib/api/server';
import { logsApi } from '$lib/api/logs';
import { armoiresApi } from '$lib/api/armoires';
import { ApiError } from '$lib/api/client';
import { config } from '$lib/config';
import { can } from '$lib/auth/permissions';
import type { PageServerLoad } from './$types';

const PAGE_SIZE = 100;

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) throw error(401, 'Non authentifié');
	if (!can(locals.user, { type: 'view_logs' })) throw error(403, 'Accès logs requis');

	const lockerId = url.searchParams.get('locker_id')
		? Number(url.searchParams.get('locker_id'))
		: undefined;

	try {
		const api = getServerApi(locals.accessToken);
		const [logs, lockers] = await Promise.all([
			logsApi(api).list({ limit: PAGE_SIZE, locker_id: lockerId }),
			armoiresApi(api).list(),
		]);
		return { logs, lockers, pageSize: PAGE_SIZE, params: { locker_id: lockerId } };
	} catch (e) {
		if (dev && !config.keycloak.issuer) {
			return { logs: [], lockers: [], pageSize: PAGE_SIZE, params: { locker_id: lockerId } };
		}
		if (e instanceof ApiError) throw error(e.status, e.detail);
		throw e;
	}
};
