import { error } from '@sveltejs/kit';
import { getServerApi } from '$lib/api/server';
import { logsApi } from '$lib/api/logs';
import { ApiError } from '$lib/api/client';
import { can } from '$lib/auth/permissions';
import type { RequestHandler } from './$types';

function csvEscape(value: string): string {
	let v = value;
	if (/^[=+\-@\t\r]/.test(v)) v = `'${v}`;
	if (/[",\n\r]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
	return v;
}

export const GET: RequestHandler = async ({ url, locals }) => {
	if (!locals.user || !locals.accessToken) throw error(401, 'Non authentifié');
	if (!can(locals.user, { type: 'export_logs' })) throw error(403, 'Export logs requis');

	const lockerId = url.searchParams.get('locker_id');
	const limit = url.searchParams.get('limit');

	let rows: string[][];
	try {
		const logs = await logsApi(getServerApi(locals.accessToken)).list({
			locker_id: lockerId ? Number(lockerId) : undefined,
			limit: limit ? Number(limit) : 5000,
		});
		const header = ['timestamp', 'username', 'user_id', 'locker_id', 'result', 'reason', 'card_id'];
		rows = [header];
		for (const l of logs) {
			rows.push([
				l.timestamp,
				l.username ?? '',
				l.user_id ?? '',
				l.locker_id === null ? '' : String(l.locker_id),
				l.result,
				l.reason ?? '',
				l.card_id ?? '',
			]);
		}
	} catch (e) {
		if (e instanceof ApiError) throw error(e.status, e.detail);
		throw e;
	}

	const csv = rows.map((r) => r.map(csvEscape).join(',')).join('\n');
	const today = new Date().toISOString().slice(0, 10);
	return new Response(csv, {
		status: 200,
		headers: {
			'content-type': 'text/csv; charset=utf-8',
			'content-disposition': `attachment; filename="logs-${today}.csv"`,
		},
	});
};
