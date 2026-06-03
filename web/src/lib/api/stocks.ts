import {
	stockEntrySchema,
	stockListResponseSchema,
	type StockCreatePayload,
	type StockUpdatePayload,
} from '$lib/schemas/stock';
import type { ApiClient } from './client';

export const stocksApi = (client: ApiClient) => ({
	list: () => client.get('/stock/', stockListResponseSchema),
	get: (id: number) => client.get(`/stock/${id}`, stockEntrySchema),
	byLocker: (lockerId: number) =>
		client.get(`/lockers/${lockerId}/stock`, stockListResponseSchema),
	create: (body: StockCreatePayload) => client.post('/stock/', body, stockEntrySchema),
	update: (id: number, body: StockUpdatePayload) =>
		client.put(`/stock/${id}`, body, stockEntrySchema),
	delete: (id: number) => client.delete(`/stock/${id}`),
});
