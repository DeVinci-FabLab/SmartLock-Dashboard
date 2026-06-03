import {
	armoireListResponseSchema,
	armoireSchema,
	type ArmoireCreatePayload,
	type ArmoireUpdatePayload,
} from '$lib/schemas/armoire';
import {
	lockerPermissionListResponseSchema,
	lockerPermissionSchema,
} from '$lib/schemas/permission';
import { stockListResponseSchema } from '$lib/schemas/stock';
import type { ApiClient } from './client';

export const armoiresApi = (client: ApiClient) => ({
	list: () => client.get('/lockers/', armoireListResponseSchema),
	get: (id: number) => client.get(`/lockers/${id}`, armoireSchema),
	create: (body: ArmoireCreatePayload) => client.post('/lockers/', body, armoireSchema),
	update: (id: number, body: ArmoireUpdatePayload) =>
		client.put(`/lockers/${id}`, body, armoireSchema),
	delete: (id: number) => client.delete(`/lockers/${id}`),
	getStock: (id: number) => client.get(`/lockers/${id}/stock`, stockListResponseSchema),
	listPermissions: (lockerId: number) =>
		client.get(`/lockers/${lockerId}/permissions`, lockerPermissionListResponseSchema),
	upsertPermission: (lockerId: number, body: Record<string, unknown>) =>
		client.post(`/lockers/${lockerId}/permissions`, body, lockerPermissionSchema),
});
