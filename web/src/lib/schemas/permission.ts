import { z } from 'zod';

export const permissionLevelSchema = z.enum(['none', 'can_view', 'can_open', 'can_edit']);

export const backendPermissionLevelSchema = z.enum(['can_view', 'can_open', 'can_edit']);

export const lockerPermissionSchema = z.object({
	id: z.number().int().positive(),
	locker_id: z.number().int().positive(),
	role_name: z.string(),
	permission_level: backendPermissionLevelSchema,
	valid_until: z.string().nullable().optional(),
	created_at: z.string().nullable().optional(),
});

export const lockerPermissionListResponseSchema = z.array(lockerPermissionSchema);

export type LockerPermissionDTO = z.infer<typeof lockerPermissionSchema>;
export type PermissionLevelDTO = z.infer<typeof permissionLevelSchema>;
export type BackendPermissionLevel = z.infer<typeof backendPermissionLevelSchema>;
