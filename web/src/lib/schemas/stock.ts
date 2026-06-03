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

export const stockCreateSchema = z.object({
	item_id: z.number().int().positive(),
	locker_id: z.number().int().positive(),
	quantity: z.number().int().nonnegative().default(0),
	unit_measure: z.string().min(1).max(50).default('units'),
});
export type StockCreatePayload = z.infer<typeof stockCreateSchema>;

export const stockUpdateSchema = z.object({
	quantity: z.number().int().nonnegative().optional(),
	unit_measure: z.string().min(1).max(50).optional(),
});
export type StockUpdatePayload = z.infer<typeof stockUpdateSchema>;

/**
 * Row shape produced by the `/api/lockers/[id]/stock` proxy: a stock entry
 * enriched with the item name and reference so the table can render without
 * a second client-side fetch per row.
 */
export const enrichedStockRowSchema = stockEntrySchema.extend({
	item_name: z.string(),
	item_reference: z.string(),
});
export const enrichedStockListSchema = z.array(enrichedStockRowSchema);
export type EnrichedStockRowDTO = z.infer<typeof enrichedStockRowSchema>;
