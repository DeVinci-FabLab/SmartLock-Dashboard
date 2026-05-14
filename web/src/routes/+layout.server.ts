import { dev } from '$app/environment';
import { config } from '$lib/config';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	return {
		user: locals.user,
		authBypass: dev && !config.keycloak.issuer,
	};
};
