import { z } from 'zod';

export const categorySchema = z.object({
	id: z.number().int().positive(),
	name: z.string(),
	created_at: z.string().nullable().optional(),
	updated_at: z.string().nullable().optional(),
});

export const purchaseRefSchema = z.object({
	supplier: z.string().min(1).max(255),
	url: z.string().min(1).max(500),
	price_indicative: z.number().nonnegative().nullable().optional(),
});

export type PurchaseRefDTO = z.infer<typeof purchaseRefSchema>;

export const itemSchema = z.object({
	id: z.number().int().positive(),
	name: z.string(),
	reference: z.string(),
	description: z.string().nullable().optional(),
	category_id: z.number().int().positive(),
	low_stock_threshold: z.number().int().nonnegative().nullable().optional(),
	purchase_refs: z.array(purchaseRefSchema).nullable().optional(),
	photo: z.string().max(500).nullable().optional(),
	created_at: z.string().nullable().optional(),
	updated_at: z.string().nullable().optional(),
});

export const itemListResponseSchema = z.array(itemSchema);

export type ItemDTO = z.infer<typeof itemSchema>;
export type CategoryDTO = z.infer<typeof categorySchema>;

export const lowStockAlertSchema = z.object({
	item_id: z.number().int().positive(),
	name: z.string(),
	threshold: z.number().int().nonnegative(),
	total_quantity: z.number().int().nonnegative(),
});

export const lowStockAlertListSchema = z.array(lowStockAlertSchema);

export type LowStockAlertDTO = z.infer<typeof lowStockAlertSchema>;

export const itemCreateSchema = z.object({
	name: z.string().min(1).max(255),
	reference: z.string().min(1).max(50),
	description: z.string().nullable().optional(),
	category_id: z.number().int().positive(),
	low_stock_threshold: z.number().int().nonnegative().nullable().optional(),
	purchase_refs: z.array(purchaseRefSchema).nullable().optional(),
	photo: z.string().max(500).nullable().optional(),
});
export type ItemCreatePayload = z.infer<typeof itemCreateSchema>;

export const itemUpdateSchema = z.object({
	name: z.string().min(1).max(255).optional(),
	reference: z.string().min(1).max(50).optional(),
	description: z.string().nullable().optional(),
	category_id: z.number().int().positive().optional(),
	low_stock_threshold: z.number().int().nonnegative().nullable().optional(),
	purchase_refs: z.array(purchaseRefSchema).nullable().optional(),
	photo: z.string().max(500).nullable().optional(),
});
export type ItemUpdatePayload = z.infer<typeof itemUpdateSchema>;

export const categoryCreateSchema = z.object({
	name: z.string().min(1).max(100),
});
export type CategoryCreatePayload = z.infer<typeof categoryCreateSchema>;

export const categoryUpdateSchema = z.object({
	name: z.string().min(1).max(100).optional(),
});
export type CategoryUpdatePayload = z.infer<typeof categoryUpdateSchema>;

/**
 * Row shape produced by the `/api/stocks` proxy: a stock entry enriched
 * with the item and locker labels so the flat table can render without
 * extra fetches per row.
 */
export const enrichedFlatStockRowSchema = z.object({
	id: z.number().int().positive(),
	item_id: z.number().int().positive(),
	locker_id: z.number().int().positive(),
	quantity: z.number().int().nonnegative(),
	unit_measure: z.string(),
	item_name: z.string(),
	item_reference: z.string(),
	category_id: z.number().int().positive(),
	locker_type: z.string(),
});
export const enrichedFlatStockListSchema = z.array(enrichedFlatStockRowSchema);
export type EnrichedFlatStockRowDTO = z.infer<typeof enrichedFlatStockRowSchema>;

/**
 * Row shape produced by `/api/items/[id]/stocks`: stock entries scoped
 * to a single item, joined with the locker label.
 */
export const stockSpreadRowSchema = z.object({
	id: z.number().int().positive(),
	locker_id: z.number().int().positive(),
	locker_type: z.string(),
	quantity: z.number().int().nonnegative(),
	unit_measure: z.string(),
});
export const stockSpreadListSchema = z.array(stockSpreadRowSchema);
export type StockSpreadRowDTO = z.infer<typeof stockSpreadRowSchema>;
