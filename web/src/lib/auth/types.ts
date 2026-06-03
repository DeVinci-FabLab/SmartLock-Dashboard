/**
 * Backend role tiers are integers 0–5. 0 is highest authority (presidency,
 * admin sys); 5 is reserved for the system `membre` role. Custom roles are
 * created in the 0–4 range only.
 */
export type Tier = 0 | 1 | 2 | 3 | 4 | 5;

/**
 * Permission level on an armoire: at most one value per (role, armoire).
 * `none` is the dashboard convenience for "no row exists in the table".
 */
export type PermissionLevel = 'none' | 'can_view' | 'can_open' | 'can_edit';

/**
 * The 8 capacities a role can grant. Capacities are orthogonal to flags
 * (is_manager / is_role_admin) and to the permission matrix — they gate
 * specific dashboard actions like reading audit logs or purchasing.
 */
export type Capacity =
	| 'create_lockers'
	| 'configure_system'
	| 'audit_log_full'
	| 'purchase_orders'
	| 'manage_suppliers'
	| 'cascade_delete_role'
	| 'validate_catalog'
	| 'manage_stock_thresholds';

export interface Role {
	id?: number;
	name: string;
	label: string;
	tier: Tier;
	is_system: boolean;
	is_manager: boolean;
	is_role_admin: boolean;
	capacities: Capacity[];
}

export interface ArmoirePermission {
	armoire_id: number;
	level: PermissionLevel;
}

export interface UserContext {
	id: string;
	username: string;
	displayName: string;
	email: string;
	enabled: boolean;
	roles: Role[];
	armoirePermissions: ArmoirePermission[];
}

export type Action =
	| { type: 'view_armoire'; armoireId: number }
	| { type: 'open_armoire'; armoireId: number }
	| { type: 'edit_armoire'; armoireId: number }
	| { type: 'create_armoire' }
	| { type: 'delete_armoire' }
	| { type: 'manage_armoire_permissions' }
	| { type: 'view_users' }
	| { type: 'manage_users' }
	| { type: 'view_roles' }
	| { type: 'manage_roles' }
	| { type: 'view_logs' }
	| { type: 'export_logs' };
