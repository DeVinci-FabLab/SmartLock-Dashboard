import { createApiClient, type ApiClient } from './client';
import { config } from '$lib/config';

/**
 * Builds an ApiClient suitable for use inside SvelteKit server-side load
 * functions and +server.ts handlers. The provided token is attached as
 * Bearer on every call. Call once per request (caller decides scope).
 */
export function getServerApi(accessToken: string | null): ApiClient {
	return createApiClient({
		baseUrl: config.apiUrl,
		getToken: () => accessToken,
	});
}
