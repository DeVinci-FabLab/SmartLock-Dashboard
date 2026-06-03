import {
	lockerPermissionListResponseSchema,
	lockerPermissionSchema,
	type BackendPermissionLevel,
	type LockerPermissionDTO,
} from '$lib/schemas/permission';
import type { ApiClient } from './client';

export interface CreatePermissionBody {
	locker_id: number;
	role_name: string;
	permission_level: BackendPermissionLevel;
	valid_until?: string | null;
}

export interface UpdatePermissionBody {
	permission_level?: BackendPermissionLevel;
	valid_until?: string | null;
}

export const permissionsApi = (client: ApiClient) => ({
	listForLocker: (lockerId: number) =>
		client.get(`/lockers/${lockerId}/permissions`, lockerPermissionListResponseSchema),
	create: (lockerId: number, body: CreatePermissionBody) =>
		client.post(`/lockers/${lockerId}/permissions`, body, lockerPermissionSchema),
	update: (permissionId: number, body: UpdatePermissionBody) =>
		client.put(`/lockers/permissions/${permissionId}`, body, lockerPermissionSchema),
	delete: (permissionId: number) => client.delete(`/lockers/permissions/${permissionId}`),
});

/**
 * Find the row in `rows` that targets `roleName`. The backend stores at
 * most one row per (role_name, locker_id) pair, so this returns 0 or 1
 * row, never more.
 */
export function findRolePermission(
	rows: LockerPermissionDTO[],
	roleName: string,
): LockerPermissionDTO | undefined {
	return rows.find((p) => p.role_name === roleName);
}
