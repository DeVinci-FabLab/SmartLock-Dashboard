import { userListResponseSchema, userSchema } from '$lib/schemas/user';
import type { ApiClient } from './client';

export const usersApi = (client: ApiClient) => ({
	list: () => client.get('/users', userListResponseSchema),
	get: (id: string) => client.get(`/users/${id}`, userSchema),
});
