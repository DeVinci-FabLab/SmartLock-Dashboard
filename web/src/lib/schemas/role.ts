import { z } from 'zod';
import type { Tier } from '$lib/auth/types';

export const tierSchema = z
	.number()
	.int()
	.min(0)
	.max(5)
	.transform((n) => n as Tier);

export const capacitySchema = z.enum([
	'create_lockers',
	'configure_system',
	'audit_log_full',
	'purchase_orders',
	'manage_suppliers',
	'cascade_delete_role',
	'validate_catalog',
	'manage_stock_thresholds',
]);

export const roleSchema = z.object({
	id: z.number().int().positive().optional(),
	name: z.string(),
	label: z.string(),
	tier: tierSchema,
	is_system: z.boolean(),
	is_manager: z.boolean(),
	is_role_admin: z.boolean(),
	capacities: z.array(capacitySchema),
});

export const roleListResponseSchema = z.array(roleSchema);

export type RoleDTO = z.infer<typeof roleSchema>;

/**
 * Body shape for POST /roles. The backend rejects `tier === 5` (T5 is
 * reserved for the system `membre` role); enforced server-side.
 */
export const roleCreateSchema = z.object({
	name: z
		.string()
		.min(1)
		.max(100)
		.regex(/^[a-z0-9_-]+$/, 'minuscules, chiffres, _ et - uniquement'),
	label: z.string().min(1).max(255),
	tier: z.number().int().min(0).max(4),
	is_manager: z.boolean().default(false),
	is_role_admin: z.boolean().default(false),
	capacities: z.array(capacitySchema).default([]),
});

export type RoleCreatePayload = z.infer<typeof roleCreateSchema>;

export const roleUpdateSchema = z.object({
	label: z.string().min(1).max(255).optional(),
	is_manager: z.boolean().optional(),
	is_role_admin: z.boolean().optional(),
	capacities: z.array(capacitySchema).optional(),
});

export type RoleUpdatePayload = z.infer<typeof roleUpdateSchema>;
