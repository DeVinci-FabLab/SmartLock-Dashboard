import { error } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { getServerApi } from '$lib/api/server';
import { itemsApi } from '$lib/api/items';
import { ApiError } from '$lib/api/client';
import { config } from '$lib/config';
import { can } from '$lib/auth/permissions';
import type { LayoutServerLoad } from './$types';
import type { CategoryDTO, ItemDTO } from '$lib/schemas/item';

export const load: LayoutServerLoad = async ({ locals, params, depends }) => {
	if (!locals.user) throw error(401, 'Non authentifié');
	if (!can(locals.user, { type: 'view_items' })) throw error(403, 'Accès refusé');
	const id = Number(params.id);
	if (!Number.isInteger(id) || id < 1) throw error(400, 'item id invalide');

	depends(`items:${id}`);

	const api = getServerApi(locals.accessToken);
	let item: ItemDTO | undefined;
	let categories: CategoryDTO[] = [];
	try {
		[item, categories] = await Promise.all([itemsApi(api).get(id), itemsApi(api).listCategories()]);
	} catch (e) {
		if (dev && !config.keycloak.issuer) {
			item = {
				id,
				name: `Item #${id}`,
				reference: `REF-${id}`,
				category_id: 0,
			};
		} else if (e instanceof ApiError) {
			throw error(e.status, e.detail);
		} else {
			throw e;
		}
	}

	return { item: item!, categories };
};
