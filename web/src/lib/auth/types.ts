/**
 * Tiers from the CDC ACM model. T0 is highest authority, T5 lowest.
 * Lower numeric value = higher tier.
 */
export type Tier = 'T0' | 'T1' | 'T2' | 'T3' | 'T4' | 'T5';

/**
 * Permission levels on an armoire, ordered.
 */
export type PermissionLevel = 'none' | 'view' | 'open' | 'edit';

/**
 * A role held by a user.
 */
export interface Role {
	name: string;
	tier: Tier;
	manager: boolean;
	role_admin: boolean;
	audit_viewer: boolean;
	system: boolean;
}

/**
 * Per-armoire permission for the current user.
 * Computed by the API based on the user's roles ∪ direct overrides.
 */
export interface ArmoirePermission {
	armoire_id: number;
	level: PermissionLevel;
}

/**
 * The authenticated user as exposed to client code.
 * Mirrors the JWT claims + computed effective permissions.
 */
export interface UserContext {
	id: string;
	username: string;
	displayName: string;
	email: string;
	enabled: boolean;
	roles: Role[];
	armoirePermissions: ArmoirePermission[];
}

/**
 * Actions that can be permission-checked via can().
 */
export type Action =
	| { type: 'view_armoire'; armoireId: number }
	| { type: 'open_armoire'; armoireId: number }
	| { type: 'edit_armoire'; armoireId: number }
	| { type: 'view_users' }
	| { type: 'manage_users' }
	| { type: 'view_roles' }
	| { type: 'manage_roles' }
	| { type: 'view_logs' }
	| { type: 'export_logs' };
