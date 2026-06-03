import { error } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { getServerApi } from '$lib/api/server';
import { itemsApi } from '$lib/api/items';
import { ApiError } from '$lib/api/client';
import { config } from '$lib/config';
import { can } from '$lib/auth/permissions';
import type { PageServerLoad } from './$types';

const DEFAULT_LIMIT = 50;

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) throw error(401, 'Non authentifié');
	if (!can(locals.user, { type: 'view_items' })) throw error(403, 'Accès refusé');

	const page = url.searchParams.has('page') ? Number(url.searchParams.get('page')) : 0;
	const skip = page * DEFAULT_LIMIT;
	const search = url.searchParams.get('q') ?? undefined;
	const categoryId = url.searchParams.get('category')
		? Number(url.searchParams.get('category'))
		: undefined;

	try {
		const api = getServerApi(locals.accessToken);
		const [items, categories] = await Promise.all([
			itemsApi(api).list({ skip, limit: DEFAULT_LIMIT }),
			itemsApi(api).listCategories(),
		]);
		return {
			items,
			categories,
			params: { search, category_id: categoryId },
			page,
			pageSize: DEFAULT_LIMIT,
		};
	} catch (e) {
		if (dev && !config.keycloak.issuer) {
			return {
				items: [],
				categories: [],
				params: { search, category_id: categoryId },
				page,
				pageSize: DEFAULT_LIMIT,
			};
		}
		if (e instanceof ApiError) throw error(e.status, e.detail);
		throw e;
	}
};
