import { armoireListResponseSchema, armoireSchema } from '$lib/schemas/armoire';
import {
	lockerPermissionListResponseSchema,
	lockerPermissionSchema,
} from '$lib/schemas/permission';
import type { ApiClient } from './client';

export const armoiresApi = (client: ApiClient) => ({
	list: () => client.get('/lockers/', armoireListResponseSchema),
	get: (id: number) => client.get(`/lockers/${id}`, armoireSchema),
	listPermissions: (lockerId: number) =>
		client.get(`/lockers/${lockerId}/permissions`, lockerPermissionListResponseSchema),
	upsertPermission: (lockerId: number, body: Record<string, unknown>) =>
		client.post(`/lockers/${lockerId}/permissions`, body, lockerPermissionSchema),
});
