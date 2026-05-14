import { z } from 'zod';

export const permissionLevelSchema = z.enum(['none', 'view', 'open', 'edit']);

export const lockerPermissionSchema = z.object({
	id: z.number().int().positive(),
	locker_id: z.number().int().positive(),
	subject_type: z.enum(['role', 'user']),
	role_name: z.string().nullable().optional(),
	user_id: z.string().nullable().optional(),
	can_view: z.boolean(),
	can_open: z.boolean(),
	can_edit: z.boolean(),
	valid_until: z.string().nullable().optional(),
	created_at: z.string(),
});

export const lockerPermissionListResponseSchema = z.array(lockerPermissionSchema);

export type LockerPermissionDTO = z.infer<typeof lockerPermissionSchema>;
export type PermissionLevelDTO = z.infer<typeof permissionLevelSchema>;
