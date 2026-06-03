import { config } from '$lib/config';
import type { PageServerLoad } from './$types';

/**
 * Exposes the Keycloak account console URL to the page so the client
 * never has to import `$lib/config` (which transitively imports
 * `$env/dynamic/private` and would leak server env into the browser
 * bundle, blocked by SvelteKit's prod build).
 */
export const load: PageServerLoad = async () => {
	const accountConsoleUrl = config.keycloak.issuer ? `${config.keycloak.issuer}/account/` : '';
	return { accountConsoleUrl };
};
