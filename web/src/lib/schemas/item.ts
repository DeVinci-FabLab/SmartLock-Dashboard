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
