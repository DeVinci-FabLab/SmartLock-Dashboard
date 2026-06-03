import { isHigherTier } from './tiers';
import type { Action, Capacity, PermissionLevel, Tier, UserContext } from './types';

const LEVEL_RANK: Record<PermissionLevel, number> = {
	none: 0,
	can_view: 1,
	can_open: 2,
	can_edit: 3,
};

export function permissionAtLeast(actual: PermissionLevel, required: PermissionLevel): boolean {
	return LEVEL_RANK[actual] >= LEVEL_RANK[required];
}

export function highestTier(user: UserContext): Tier {
	if (user.roles.length === 0) return 5;
	return user.roles.reduce<Tier>((acc, r) => (isHigherTier(r.tier, acc) ? r.tier : acc), 5);
}

export function hasFlag(user: UserContext, flag: 'is_manager' | 'is_role_admin'): boolean {
	return user.roles.some((r) => r[flag]);
}

export function requireFlag(user: UserContext, flag: 'is_manager' | 'is_role_admin'): boolean {
	return hasFlag(user, flag);
}

export function requireTier(user: UserContext, minimum: Tier): boolean {
	return isHigherTier(highestTier(user), minimum);
}

export function hasCapacity(user: UserContext, capacity: Capacity): boolean {
	return user.roles.some((r) => r.capacities.includes(capacity));
}

function armoireLevel(user: UserContext, armoireId: number): PermissionLevel {
	return user.armoirePermissions.find((p) => p.armoire_id === armoireId)?.level ?? 'none';
}

export function can(user: UserContext | null, action: Action): boolean {
	if (!user) return false;

	switch (action.type) {
		case 'view_armoire':
			return permissionAtLeast(armoireLevel(user, action.armoireId), 'can_view');
		case 'open_armoire':
			return permissionAtLeast(armoireLevel(user, action.armoireId), 'can_open');
		case 'edit_armoire':
			return permissionAtLeast(armoireLevel(user, action.armoireId), 'can_edit');
		case 'create_armoire':
			return hasCapacity(user, 'create_lockers');
		case 'delete_armoire':
			return hasCapacity(user, 'create_lockers');
		case 'manage_armoire_permissions':
			return hasFlag(user, 'is_role_admin');
		case 'view_users':
			return hasFlag(user, 'is_manager') || hasFlag(user, 'is_role_admin');
		case 'manage_users':
			return hasFlag(user, 'is_manager');
		case 'view_roles':
			return hasFlag(user, 'is_role_admin') || hasFlag(user, 'is_manager');
		case 'manage_roles':
			return hasFlag(user, 'is_role_admin');
		case 'view_logs':
		case 'export_logs':
			return hasCapacity(user, 'audit_log_full') || requireTier(user, 0);
	}
}
