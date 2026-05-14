import { roleListResponseSchema, roleSchema } from '$lib/schemas/role';
import type { ApiClient } from './client';

export const rolesApi = (client: ApiClient) => ({
	listRealmRoles: () => client.get('/groups', roleListResponseSchema),
	assignRole: (userId: string, roleName: string) =>
		client.post(`/users/${userId}/roles/${roleName}`, {}, roleSchema),
	revokeRole: (userId: string, roleName: string) =>
		client.delete(`/users/${userId}/roles/${roleName}`),
});
