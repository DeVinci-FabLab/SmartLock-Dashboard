import { error } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { getServerApi } from '$lib/api/server';
import { armoiresApi } from '$lib/api/armoires';
import { ApiError } from '$lib/api/client';
import { config } from '$lib/config';
import { can } from '$lib/auth/permissions';
import type { LayoutServerLoad } from './$types';
import type { ArmoireDTO } from '$lib/schemas/armoire';

export const load: LayoutServerLoad = async ({ locals, params, depends }) => {
	if (!locals.user) throw error(401, 'Non authentifié');
	const id = Number(params.id);
	if (!Number.isInteger(id) || id < 1) throw error(400, 'locker id invalide');

	const allowed =
		can(locals.user, { type: 'view_armoire', armoireId: id }) ||
		can(locals.user, { type: 'create_armoire' });
	if (!allowed) throw error(403, 'Accès armoire requis');

	depends(`armoires:${id}`);

	let armoire: ArmoireDTO | undefined;
	try {
		armoire = await armoiresApi(getServerApi(locals.accessToken)).get(id);
	} catch (e) {
		if (dev && !config.keycloak.issuer) {
			armoire = { id, locker_type: `Armoire #${id}`, is_active: true };
		} else if (e instanceof ApiError) {
			throw error(e.status, e.detail);
		} else {
			throw e;
		}
	}

	return { armoire: armoire! };
};
