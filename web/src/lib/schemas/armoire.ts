import { z } from 'zod';

export const armoireSchema = z.object({
	id: z.number().int().positive(),
	locker_type: z.string(),
	location: z.string().nullable().optional(),
	is_active: z.boolean(),
	created_at: z.string(),
	updated_at: z.string(),
});

export const armoireListResponseSchema = z.array(armoireSchema);

export type ArmoireDTO = z.infer<typeof armoireSchema>;
