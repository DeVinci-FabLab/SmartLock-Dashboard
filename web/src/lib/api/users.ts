import { userListResponseSchema, userSchema, type UserListParams } from '$lib/schemas/user';
import { z } from 'zod';
import type { ApiClient } from './client';

function toQueryString(params: UserListParams): string {
	const qs = new URLSearchParams();
	if (params.search) qs.set('search', params.search);
	if (params.first !== undefined) qs.set('first', String(params.first));
	if (params.max_results !== undefined) qs.set('max_results', String(params.max_results));
	const s = qs.toString();
	return s ? `?${s}` : '';
}

export const usersApi = (client: ApiClient) => ({
	list: (params: UserListParams = {}) =>
		client.get(`/users${toQueryString(params)}`, userListResponseSchema),
	get: (id: string) => client.get(`/users/${id}`, userSchema),
	assignRole: (userId: string, roleName: string) =>
		client.post(`/users/${userId}/roles/${encodeURIComponent(roleName)}`, {}, z.unknown()),
	revokeRole: (userId: string, roleName: string) =>
		client.delete(`/users/${userId}/roles/${encodeURIComponent(roleName)}`),
});
