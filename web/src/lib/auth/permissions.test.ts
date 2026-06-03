import { describe, expect, it } from 'vitest';
import type { Capacity, Role, UserContext } from './types';
import {
	can,
	hasCapacity,
	hasFlag,
	highestTier,
	permissionAtLeast,
	requireFlag,
	requireTier,
} from './permissions';

function role(opts: Partial<Role> & { tier: Role['tier']; name: string }): Role {
	return {
		label: opts.name,
		is_system: false,
		is_manager: false,
		is_role_admin: false,
		capacities: [],
		...opts,
	};
}

function user(opts: Partial<UserContext> & { roles: Role[] }): UserContext {
	return {
		id: 'u1',
		username: 'alice',
		displayName: 'Alice',
		email: 'a@x',
		enabled: true,
		armoirePermissions: [],
		...opts,
	};
}

describe('highestTier', () => {
	it('returns the lowest-numeric (highest authority) tier among roles', () => {
		const u = user({
			roles: [role({ name: 'a', tier: 3 }), role({ name: 'b', tier: 1 })],
		});
		expect(highestTier(u)).toBe(1);
	});
	it('returns 5 fallback when no roles', () => {
		expect(highestTier(user({ roles: [] }))).toBe(5);
	});
});

describe('hasFlag', () => {
	it('true when at least one role has is_manager', () => {
		const u = user({
			roles: [role({ name: 'a', tier: 2 }), role({ name: 'b', tier: 1, is_manager: true })],
		});
		expect(hasFlag(u, 'is_manager')).toBe(true);
	});
	it('false when no role has is_role_admin', () => {
		const u = user({ roles: [role({ name: 'a', tier: 1 })] });
		expect(hasFlag(u, 'is_role_admin')).toBe(false);
	});
});

describe('requireTier', () => {
	it('passes when user has a role at or above tier', () => {
		const u = user({ roles: [role({ name: 'a', tier: 1 })] });
		expect(requireTier(u, 2)).toBe(true);
	});
	it('fails when user is strictly below', () => {
		const u = user({ roles: [role({ name: 'a', tier: 3 })] });
		expect(requireTier(u, 2)).toBe(false);
	});
});

describe('requireFlag', () => {
	it('alias for hasFlag', () => {
		const u = user({ roles: [role({ name: 'a', tier: 1, is_manager: true })] });
		expect(requireFlag(u, 'is_manager')).toBe(true);
		expect(requireFlag(u, 'is_role_admin')).toBe(false);
	});
});

describe('hasCapacity', () => {
	it('detects audit_log_full', () => {
		const u = user({
			roles: [role({ name: 'a', tier: 1, capacities: ['audit_log_full'] as Capacity[] })],
		});
		expect(hasCapacity(u, 'audit_log_full')).toBe(true);
		expect(hasCapacity(u, 'create_lockers')).toBe(false);
	});
});

describe('permissionAtLeast', () => {
	it('can_view ≤ can_open ≤ can_edit ordering', () => {
		expect(permissionAtLeast('can_view', 'can_view')).toBe(true);
		expect(permissionAtLeast('can_open', 'can_view')).toBe(true);
		expect(permissionAtLeast('can_edit', 'can_open')).toBe(true);
		expect(permissionAtLeast('can_view', 'can_open')).toBe(false);
		expect(permissionAtLeast('none', 'can_view')).toBe(false);
	});
});

describe('can — armoire actions', () => {
	const u = user({
		roles: [role({ name: 'a', tier: 3 })],
		armoirePermissions: [
			{ armoire_id: 1, level: 'can_open' },
			{ armoire_id: 2, level: 'can_view' },
		],
	});

	it('view_armoire passes when level ≥ view', () => {
		expect(can(u, { type: 'view_armoire', armoireId: 1 })).toBe(true);
		expect(can(u, { type: 'view_armoire', armoireId: 2 })).toBe(true);
	});
	it('view_armoire fails when no permission entry', () => {
		expect(can(u, { type: 'view_armoire', armoireId: 99 })).toBe(false);
	});
	it('open_armoire requires level ≥ open', () => {
		expect(can(u, { type: 'open_armoire', armoireId: 1 })).toBe(true);
		expect(can(u, { type: 'open_armoire', armoireId: 2 })).toBe(false);
	});
	it('edit_armoire requires level = edit', () => {
		expect(can(u, { type: 'edit_armoire', armoireId: 1 })).toBe(false);
	});
});

describe('can — governance actions', () => {
	it('manage_users requires is_manager flag', () => {
		const u = user({ roles: [role({ name: 'a', tier: 1, is_manager: true })] });
		expect(can(u, { type: 'manage_users' })).toBe(true);
		expect(can(user({ roles: [role({ name: 'a', tier: 1 })] }), { type: 'manage_users' })).toBe(
			false,
		);
	});
	it('manage_roles requires is_role_admin flag', () => {
		const u = user({ roles: [role({ name: 'a', tier: 1, is_role_admin: true })] });
		expect(can(u, { type: 'manage_roles' })).toBe(true);
		expect(can(user({ roles: [role({ name: 'a', tier: 1 })] }), { type: 'manage_roles' })).toBe(
			false,
		);
	});
	it('view_logs requires audit_log_full capacity OR tier 0', () => {
		expect(can(user({ roles: [role({ name: 'a', tier: 0 })] }), { type: 'view_logs' })).toBe(true);
		expect(
			can(
				user({
					roles: [role({ name: 'a', tier: 2, capacities: ['audit_log_full'] as Capacity[] })],
				}),
				{ type: 'view_logs' },
			),
		).toBe(true);
		expect(can(user({ roles: [role({ name: 'a', tier: 2 })] }), { type: 'view_logs' })).toBe(false);
	});
	it('view_users passes with is_manager OR is_role_admin', () => {
		expect(
			can(user({ roles: [role({ name: 'a', tier: 1, is_manager: true })] }), {
				type: 'view_users',
			}),
		).toBe(true);
		expect(
			can(user({ roles: [role({ name: 'a', tier: 1, is_role_admin: true })] }), {
				type: 'view_users',
			}),
		).toBe(true);
	});
	it('null user always denied', () => {
		expect(can(null, { type: 'view_users' })).toBe(false);
	});
});
