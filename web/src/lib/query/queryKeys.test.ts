import { describe, expect, it } from 'vitest';
import { queryKeys } from './queryKeys';

describe('queryKeys.users', () => {
	it('all() returns base array', () => {
		expect(queryKeys.users.all()).toEqual(['users']);
	});
	it('list() includes params for caching', () => {
		const key = queryKeys.users.list({ search: 'al', limit: 50 });
		expect(key).toEqual(['users', 'list', { search: 'al', limit: 50 }]);
	});
	it('detail() includes id', () => {
		expect(queryKeys.users.detail('u1')).toEqual(['users', 'detail', 'u1']);
	});
});

describe('queryKeys.groups', () => {
	it('all() returns base array', () => {
		expect(queryKeys.groups.all()).toEqual(['groups']);
	});
});

describe('queryKeys.roles', () => {
	it('all() returns base', () => {
		expect(queryKeys.roles.all()).toEqual(['roles']);
	});
	it('list() returns ["roles", "list"]', () => {
		expect(queryKeys.roles.list()).toEqual(['roles', 'list']);
	});
	it('detail(name) includes name', () => {
		expect(queryKeys.roles.detail('admin')).toEqual(['roles', 'detail', 'admin']);
	});
	it('permissions(name) is independent of detail', () => {
		expect(queryKeys.roles.permissions('admin')).toEqual([
			'roles',
			'detail',
			'admin',
			'permissions',
		]);
	});
});

describe('queryKeys.armoires', () => {
	it('all() returns base', () => {
		expect(queryKeys.armoires.all()).toEqual(['armoires']);
	});
	it('list() returns ["armoires", "list"]', () => {
		expect(queryKeys.armoires.list()).toEqual(['armoires', 'list']);
	});
	it('detail / stock / permissions / logs include the id', () => {
		expect(queryKeys.armoires.detail(7)).toEqual(['armoires', 'detail', 7]);
		expect(queryKeys.armoires.stock(7)).toEqual(['armoires', 'detail', 7, 'stock']);
		expect(queryKeys.armoires.permissions(7)).toEqual(['armoires', 'detail', 7, 'permissions']);
		expect(queryKeys.armoires.logs(7)).toEqual(['armoires', 'detail', 7, 'logs']);
	});
});

describe('queryKeys.items', () => {
	it('list() includes params for caching', () => {
		expect(queryKeys.items.list({ search: 'foo' })).toEqual([
			'items',
			'list',
			{ search: 'foo' },
		]);
	});
	it('detail() and stockSpread() differ by suffix', () => {
		expect(queryKeys.items.detail(7)).toEqual(['items', 'detail', 7]);
		expect(queryKeys.items.stockSpread(7)).toEqual(['items', 'detail', 7, 'stocks']);
	});
	it('lowStock() returns base key', () => {
		expect(queryKeys.items.lowStock()).toEqual(['items', 'low-stock']);
	});
});

describe('queryKeys.categories', () => {
	it('all() returns base', () => {
		expect(queryKeys.categories.all()).toEqual(['categories']);
	});
	it('list() returns ["categories", "list"]', () => {
		expect(queryKeys.categories.list()).toEqual(['categories', 'list']);
	});
});

describe('queryKeys.stocks', () => {
	it('list() includes params', () => {
		expect(queryKeys.stocks.list({ search: 'tube' })).toEqual([
			'stocks',
			'list',
			{ search: 'tube' },
		]);
	});
});

describe('queryKeys.logs', () => {
	it('all() returns base', () => {
		expect(queryKeys.logs.all()).toEqual(['logs']);
	});
	it('list() includes params for caching', () => {
		expect(queryKeys.logs.list({ skip: 0, limit: 50 })).toEqual([
			'logs',
			'list',
			{ skip: 0, limit: 50 },
		]);
	});
});

describe('queryKeys.home', () => {
	it('exposes recentActivity, anomalies, usersToAttribute', () => {
		expect(queryKeys.home.recentActivity()).toEqual(['home', 'recent-activity']);
		expect(queryKeys.home.anomalies()).toEqual(['home', 'anomalies']);
		expect(queryKeys.home.usersToAttribute()).toEqual(['home', 'users-to-attribute']);
	});
});
