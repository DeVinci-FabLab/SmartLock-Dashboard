import { z } from 'zod';

export const armoireSchema = z.object({
	id: z.number().int().positive(),
	locker_type: z.string(),
	is_active: z.boolean(),
	created_at: z.string().nullable().optional(),
	updated_at: z.string().nullable().optional(),
});

export const armoireListResponseSchema = z.array(armoireSchema);

export type ArmoireDTO = z.infer<typeof armoireSchema>;

export const armoireCreateSchema = z.object({
	locker_type: z.string().min(1).max(50),
	is_active: z.boolean().default(true),
});

export type ArmoireCreatePayload = z.infer<typeof armoireCreateSchema>;

export const armoireUpdateSchema = z.object({
	locker_type: z.string().min(1).max(50).optional(),
	is_active: z.boolean().optional(),
});

export type ArmoireUpdatePayload = z.infer<typeof armoireUpdateSchema>;
