import { z } from 'zod';
import { tierSchema } from '$lib/schemas/role';
import { permissionLevelSchema } from '$lib/schemas/permission';
import type { ApiClient } from './client';

export const meResponseSchema = z.object({
	id: z.string(),
	username: z.string(),
	displayName: z.string(),
	email: z.string(),
	enabled: z.boolean(),
	roles: z.array(
		z.object({
			name: z.string(),
			tier: tierSchema,
			manager: z.boolean(),
			role_admin: z.boolean(),
			audit_viewer: z.boolean(),
			system: z.boolean(),
		}),
	),
	armoirePermissions: z.array(
		z.object({
			armoire_id: z.number().int().positive(),
			level: permissionLevelSchema,
		}),
	),
});

export const meApi = (client: ApiClient) => ({
	get: () => client.get('/me', meResponseSchema),
});
