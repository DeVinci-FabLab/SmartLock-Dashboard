import { categorySchema, itemListResponseSchema, itemSchema } from '$lib/schemas/item';
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
	listCategories: () => client.get('/categories/', categoryListSchema),
});
