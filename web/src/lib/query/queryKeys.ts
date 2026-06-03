import type { UserListParams } from '$lib/schemas/user';

export const queryKeys = {
	users: {
		all: () => ['users'] as const,
		list: (params: UserListParams) => ['users', 'list', params] as const,
		detail: (id: string) => ['users', 'detail', id] as const,
	},
	groups: {
		all: () => ['groups'] as const,
	},
	roles: {
		all: () => ['roles'] as const,
		list: () => ['roles', 'list'] as const,
		detail: (name: string) => ['roles', 'detail', name] as const,
		permissions: (name: string) => ['roles', 'detail', name, 'permissions'] as const,
	},
	armoires: {
		all: () => ['armoires'] as const,
		list: () => ['armoires', 'list'] as const,
	},
};
