import { isHigherTier } from './tiers';
import type { Action, PermissionLevel, Tier, UserContext } from './types';

const LEVEL_RANK: Record<PermissionLevel, number> = {
	none: 0,
	view: 1,
	open: 2,
	edit: 3,
};

export function permissionAtLeast(actual: PermissionLevel, required: PermissionLevel): boolean {
	return LEVEL_RANK[actual] >= LEVEL_RANK[required];
}

export function highestTier(user: UserContext): Tier {
	if (user.roles.length === 0) return 'T5';
	return user.roles.reduce<Tier>((acc, r) => (isHigherTier(r.tier, acc) ? r.tier : acc), 'T5');
}

export function hasFlag(
	user: UserContext,
	flag: 'manager' | 'role_admin' | 'audit_viewer',
): boolean {
	return user.roles.some((r) => r[flag]);
}

export function requireFlag(
	user: UserContext,
	flag: 'manager' | 'role_admin' | 'audit_viewer',
): boolean {
	return hasFlag(user, flag);
}

export function requireTier(user: UserContext, minimum: Tier): boolean {
	return isHigherTier(highestTier(user), minimum);
}

function armoireLevel(user: UserContext, armoireId: number): PermissionLevel {
	return user.armoirePermissions.find((p) => p.armoire_id === armoireId)?.level ?? 'none';
}

export function can(user: UserContext | null, action: Action): boolean {
	if (!user) return false;

	switch (action.type) {
		case 'view_armoire':
			return permissionAtLeast(armoireLevel(user, action.armoireId), 'view');
		case 'open_armoire':
			return permissionAtLeast(armoireLevel(user, action.armoireId), 'open');
		case 'edit_armoire':
			return permissionAtLeast(armoireLevel(user, action.armoireId), 'edit');
		case 'view_users':
			return hasFlag(user, 'manager') || hasFlag(user, 'role_admin');
		case 'manage_users':
			return hasFlag(user, 'manager');
		case 'view_roles':
			return hasFlag(user, 'role_admin') || hasFlag(user, 'manager');
		case 'manage_roles':
			return hasFlag(user, 'role_admin');
		case 'view_logs':
			return requireTier(user, 'T0') || hasFlag(user, 'audit_viewer');
		case 'export_logs':
			return requireTier(user, 'T0') || hasFlag(user, 'audit_viewer');
	}
}
