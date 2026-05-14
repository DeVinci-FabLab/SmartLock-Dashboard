import { createApiClient } from '$lib/api/client';
import { meApi } from '$lib/api/me';
import { config } from '$lib/config';
import type { UserContext } from './types';

/**
 * Fetches the enriched UserContext from the API's /me endpoint using the given
 * access token. Returns null on any failure (network, 4xx, 5xx) so callers can
 * decide how to handle a missing user without crashing the request.
 */
export async function fetchMe(accessToken: string): Promise<UserContext | null> {
	try {
		const client = createApiClient({
			baseUrl: config.apiUrl,
			getToken: () => accessToken,
		});
		return await meApi(client).get();
	} catch (error) {
		console.warn('[auth] /me fetch failed:', (error as Error).message);
		return null;
	}
}
