import { error } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { getServerApi } from '$lib/api/server';
import { armoiresApi } from '$lib/api/armoires';
import { rolesApi } from '$lib/api/roles';
import { can } from '$lib/auth/permissions';
import { ApiError } from '$lib/api/client';
import { config } from '$lib/config';
import type { LayoutServerLoad } from './$types';
import type { ArmoireDTO } from '$lib/schemas/armoire';
import type { RoleDTO } from '$lib/schemas/role';

export const load: LayoutServerLoad = async ({ locals, params, depends }) => {
	if (!locals.user) throw error(401, 'Non authentifié');
	if (!can(locals.user, { type: 'view_roles' })) throw error(403, 'Accès refusé');

	depends(`roles:${params.name}`);

	const api = getServerApi(locals.accessToken);

	let role: RoleDTO | undefined;
	let armoires: ArmoireDTO[] = [];

	try {
		const all = await rolesApi(api).list();
		role = all.find((r) => r.name === params.name);
	} catch (e) {
		if (!(dev && !config.keycloak.issuer)) {
			if (e instanceof ApiError) throw error(e.status, e.detail);
			throw e;
		}
	}

	if (!role) {
		// Dev bypass: synthesize a placeholder so the chrome stays browsable.
		if (dev && !config.keycloak.issuer) {
			role = {
				name: params.name,
				label: params.name,
				tier: 5,
				is_system: false,
				is_manager: false,
				is_role_admin: false,
				capacities: [],
			};
		} else {
			throw error(404, `Rôle "${params.name}" introuvable`);
		}
	}

	try {
		armoires = await armoiresApi(api).list();
	} catch (e) {
		if (!(dev && !config.keycloak.issuer)) {
			if (e instanceof ApiError) throw error(e.status, e.detail);
			throw e;
		}
	}

	return { role, armoires };
};
