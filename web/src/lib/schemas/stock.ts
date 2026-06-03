import { z } from 'zod';

export const stockEntrySchema = z.object({
	id: z.number().int().positive(),
	item_id: z.number().int().positive(),
	locker_id: z.number().int().positive(),
	quantity: z.number().int().nonnegative(),
	unit_measure: z.string(),
	created_at: z.string().nullable().optional(),
	updated_at: z.string().nullable().optional(),
});

export const stockListResponseSchema = z.array(stockEntrySchema);

export type StockEntryDTO = z.infer<typeof stockEntrySchema>;
