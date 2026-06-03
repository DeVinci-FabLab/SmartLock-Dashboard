import {
	categorySchema,
	itemListResponseSchema,
	itemSchema,
	lowStockAlertListSchema,
	type CategoryCreatePayload,
	type CategoryUpdatePayload,
	type ItemCreatePayload,
	type ItemUpdatePayload,
} from '$lib/schemas/item';
import { z } from 'zod';
import type { ApiClient } from './client';

const categoryListSchema = z.array(categorySchema);

export const itemsApi = (client: ApiClient) => ({
	list: (params: { skip?: number; limit?: number } = {}) => {
		const qs = new URLSearchParams();
		if (params.skip !== undefined) qs.set('skip', String(params.skip));
		if (params.limit !== undefined) qs.set('limit', String(params.limit));
		const suffix = qs.toString() ? `?${qs.toString()}` : '';
		return client.get(`/items/${suffix}`, itemListResponseSchema);
	},
	get: (id: number) => client.get(`/items/${id}`, itemSchema),
	create: (body: ItemCreatePayload) => client.post('/items/', body, itemSchema),
	update: (id: number, body: ItemUpdatePayload) =>
		client.put(`/items/${id}`, body, itemSchema),
	delete: (id: number) => client.delete(`/items/${id}`),
	lowStock: () => client.get('/items/alerts/low-stock', lowStockAlertListSchema),
	listCategories: () => client.get('/categories/', categoryListSchema),
	createCategory: (body: CategoryCreatePayload) =>
		client.post('/categories/', body, categorySchema),
	updateCategory: (id: number, body: CategoryUpdatePayload) =>
		client.put(`/categories/${id}`, body, categorySchema),
	deleteCategory: (id: number) => client.delete(`/categories/${id}`),
});
