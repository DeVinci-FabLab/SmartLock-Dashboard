import { z } from 'zod';
import type { ApiClient } from './client';

export const accessLogSchema = z.object({
	id: z.number().int(),
	locker_id: z.number().int().nullable(),
	card_id: z.string().nullable(),
	user_id: z.string().nullable(),
	username: z.string().nullable(),
	result: z.enum(['allowed', 'denied']),
	reason: z.string().nullable(),
	can_open: z.boolean().nullable(),
	can_view: z.boolean().nullable(),
	timestamp: z.string(),
});
const accessLogListSchema = z.array(accessLogSchema);

export const logsApi = (client: ApiClient) => ({
	list: (params: { skip?: number; limit?: number; locker_id?: number } = {}) => {
		const qs = new URLSearchParams();
		if (params.skip !== undefined) qs.set('skip', String(params.skip));
		if (params.limit !== undefined) qs.set('limit', String(params.limit));
		if (params.locker_id !== undefined) qs.set('locker_id', String(params.locker_id));
		const suffix = qs.toString() ? `?${qs.toString()}` : '';
		return client.get(`/logs/${suffix}`, accessLogListSchema);
	},
});
