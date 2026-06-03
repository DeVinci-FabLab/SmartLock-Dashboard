import { z } from 'zod';
import {
	roleListResponseSchema,
	roleSchema,
	type RoleCreatePayload,
	type RoleUpdatePayload,
} from '$lib/schemas/role';
import type { ApiClient } from './client';

const groupSchema = z.object({
	id: z.string(),
	name: z.string(),
	path: z.string().optional(),
});
const groupListSchema = z.array(groupSchema);

export type Group = z.infer<typeof groupSchema>;

export const rolesApi = (client: ApiClient) => ({
	/** Direct passthrough to the backend GET /roles endpoint. Includes
	 * system + custom roles with their full metadata (label, tier int,
	 * is_* flags, capacities). */
	list: () => client.get('/roles', roleListResponseSchema),
	get: (name: string) => client.get(`/roles/${encodeURIComponent(name)}`, roleSchema),
	create: (body: RoleCreatePayload) => client.post('/roles', body, roleSchema),
	update: (name: string, body: RoleUpdatePayload) =>
		client.put(`/roles/${encodeURIComponent(name)}`, body, roleSchema),
	delete: (name: string, opts: { cascade?: boolean } = {}) =>
		client.delete(
			`/roles/${encodeURIComponent(name)}${opts.cascade ? '?cascade=true' : ''}`,
		),
	listGroups: () => client.get('/groups', groupListSchema),
});
