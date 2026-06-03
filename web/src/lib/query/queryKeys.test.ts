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
