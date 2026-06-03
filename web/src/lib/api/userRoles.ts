import { z } from 'zod';
import type { ApiClient } from './client';

/**
 * GET /users/{user_id}/roles returns a list of role names (Keycloak realm
 * role names directly assigned to the user). The dashboard cross-references
 * these with rolesApi.list() metadata to display tier / label / flags.
 */
export const userRoleNamesSchema = z.array(z.string());

export const userRolesApi = (client: ApiClient) => ({
	list: (userId: string) =>
		client.get(`/users/${encodeURIComponent(userId)}/roles`, userRoleNamesSchema),
});
