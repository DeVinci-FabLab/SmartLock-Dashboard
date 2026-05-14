import { stockEntrySchema, stockListResponseSchema } from '$lib/schemas/stock';
import type { ApiClient } from './client';

export const stocksApi = (client: ApiClient) => ({
	list: () => client.get('/stock/', stockListResponseSchema),
	get: (id: number) => client.get(`/stock/${id}`, stockEntrySchema),
	byLocker: (lockerId: number) =>
		client.get(`/lockers/${lockerId}/stock`, stockListResponseSchema),
});
