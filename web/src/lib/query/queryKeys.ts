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
		detail: (id: number) => ['armoires', 'detail', id] as const,
		stock: (id: number) => ['armoires', 'detail', id, 'stock'] as const,
		permissions: (id: number) => ['armoires', 'detail', id, 'permissions'] as const,
		logs: (id: number) => ['armoires', 'detail', id, 'logs'] as const,
	},
	items: {
		all: () => ['items'] as const,
		list: (params: { search?: string; category_id?: number; skip?: number }) =>
			['items', 'list', params] as const,
		detail: (id: number) => ['items', 'detail', id] as const,
		stockSpread: (id: number) => ['items', 'detail', id, 'stocks'] as const,
		lowStock: () => ['items', 'low-stock'] as const,
	},
	categories: {
		all: () => ['categories'] as const,
		list: () => ['categories', 'list'] as const,
	},
	stocks: {
		all: () => ['stocks'] as const,
		list: (params: { search?: string; locker_id?: number; category_id?: number }) =>
			['stocks', 'list', params] as const,
	},
	logs: {
		all: () => ['logs'] as const,
		list: (params: { skip?: number; limit?: number; locker_id?: number }) =>
			['logs', 'list', params] as const,
	},
	home: {
		all: () => ['home'] as const,
		recentActivity: () => ['home', 'recent-activity'] as const,
		anomalies: () => ['home', 'anomalies'] as const,
		usersToAttribute: () => ['home', 'users-to-attribute'] as const,
	},
};
