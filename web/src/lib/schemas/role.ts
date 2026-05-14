import { z } from 'zod';

export const tierSchema = z.enum(['T0', 'T1', 'T2', 'T3', 'T4', 'T5']);

export const roleSchema = z.object({
	name: z.string(),
	tier: tierSchema,
	manager: z.boolean(),
	role_admin: z.boolean(),
	audit_viewer: z.boolean(),
	system: z.boolean(),
});

export const roleListResponseSchema = z.array(roleSchema);

export type RoleDTO = z.infer<typeof roleSchema>;
