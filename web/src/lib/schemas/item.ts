import { z } from 'zod';

export const categorySchema = z.object({
	id: z.number().int().positive(),
	name: z.string(),
	created_at: z.string(),
	updated_at: z.string(),
});

export const itemSchema = z.object({
	id: z.number().int().positive(),
	name: z.string(),
	reference: z.string(),
	description: z.string().nullable().optional(),
	category_id: z.number().int().positive(),
	photo_url: z.string().nullable().optional(),
	low_stock_threshold: z.number().int().nonnegative().nullable().optional(),
	created_at: z.string(),
	updated_at: z.string(),
});

export const itemListResponseSchema = z.array(itemSchema);

export type ItemDTO = z.infer<typeof itemSchema>;
export type CategoryDTO = z.infer<typeof categorySchema>;
