import { describe, expect, it } from 'vitest';
import type { Role, UserContext } from './types';
import {
	can,
	hasFlag,
	highestTier,
	permissionAtLeast,
	requireFlag,
	requireTier,
} from './permissions';

function role(opts: Partial<Role> & { tier: Role['tier']; name: string }): Role {
	return {
		manager: false,
		role_admin: false,
		audit_viewer: false,
		system: false,
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
	it('returns the highest-rank tier among roles', () => {
		const u = user({
			roles: [role({ name: 'a', tier: 'T3' }), role({ name: 'b', tier: 'T1' })],
		});
		expect(highestTier(u)).toBe('T1');
	});
	it('returns T5 fallback when no roles', () => {
		expect(highestTier(user({ roles: [] }))).toBe('T5');
	});
});

describe('hasFlag', () => {
	it('true when at least one role has the flag', () => {
		const u = user({
			roles: [
				role({ name: 'a', tier: 'T2', manager: false }),
				role({ name: 'b', tier: 'T1', manager: true }),
			],
		});
		expect(hasFlag(u, 'manager')).toBe(true);
	});
	it('false when no role has the flag', () => {
		const u = user({
			roles: [role({ name: 'a', tier: 'T1' })],
		});
		expect(hasFlag(u, 'role_admin')).toBe(false);
	});
});

describe('requireTier', () => {
	it('passes when user has a role at or above tier', () => {
		const u = user({ roles: [role({ name: 'a', tier: 'T1' })] });
		expect(requireTier(u, 'T2')).toBe(true);
	});
	it('fails when user is strictly below', () => {
		const u = user({ roles: [role({ name: 'a', tier: 'T3' })] });
		expect(requireTier(u, 'T2')).toBe(false);
	});
});

describe('requireFlag', () => {
	it('alias for hasFlag', () => {
		const u = user({ roles: [role({ name: 'a', tier: 'T1', manager: true })] });
		expect(requireFlag(u, 'manager')).toBe(true);
		expect(requireFlag(u, 'role_admin')).toBe(false);
	});
});

describe('permissionAtLeast', () => {
	it('view ≤ open ≤ edit ordering', () => {
		expect(permissionAtLeast('view', 'view')).toBe(true);
		expect(permissionAtLeast('open', 'view')).toBe(true);
		expect(permissionAtLeast('edit', 'open')).toBe(true);
		expect(permissionAtLeast('view', 'open')).toBe(false);
		expect(permissionAtLeast('none', 'view')).toBe(false);
	});
});

describe('can — armoire actions', () => {
	const u = user({
		roles: [role({ name: 'a', tier: 'T3' })],
		armoirePermissions: [
			{ armoire_id: 1, level: 'open' },
			{ armoire_id: 2, level: 'view' },
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
	it('manage_users requires manager flag', () => {
		const u = user({ roles: [role({ name: 'a', tier: 'T1', manager: true })] });
		expect(can(u, { type: 'manage_users' })).toBe(true);
		expect(can(user({ roles: [role({ name: 'a', tier: 'T1' })] }), { type: 'manage_users' })).toBe(
			false,
		);
	});
	it('manage_roles requires role_admin flag', () => {
		const u = user({ roles: [role({ name: 'a', tier: 'T1', role_admin: true })] });
		expect(can(u, { type: 'manage_roles' })).toBe(true);
		expect(can(user({ roles: [role({ name: 'a', tier: 'T1' })] }), { type: 'manage_roles' })).toBe(
			false,
		);
	});
	it('view_logs requires audit_viewer flag OR tier ≥ T0', () => {
		expect(can(user({ roles: [role({ name: 'a', tier: 'T0' })] }), { type: 'view_logs' })).toBe(
			true,
		);
		expect(
			can(user({ roles: [role({ name: 'a', tier: 'T2', audit_viewer: true })] }), {
				type: 'view_logs',
			}),
		).toBe(true);
		expect(can(user({ roles: [role({ name: 'a', tier: 'T2' })] }), { type: 'view_logs' })).toBe(
			false,
		);
	});
	it('view_users passes with manager OR role_admin', () => {
		expect(
			can(user({ roles: [role({ name: 'a', tier: 'T1', manager: true })] }), {
				type: 'view_users',
			}),
		).toBe(true);
		expect(
			can(user({ roles: [role({ name: 'a', tier: 'T1', role_admin: true })] }), {
				type: 'view_users',
			}),
		).toBe(true);
	});
	it('null user always denied', () => {
		expect(can(null, { type: 'view_users' })).toBe(false);
	});
});
