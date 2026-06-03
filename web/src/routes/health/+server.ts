import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/**
 * Liveness probe. Returns 200 as long as the SvelteKit process can serve
 * a request. Deliberately unauthenticated (see PUBLIC_PATHS in
 * hooks.server.ts) and does not probe downstream services — that's the
 * job of a separate readiness endpoint if/when we need one.
 */
export const GET: RequestHandler = () => {
	return json({ status: 'ok' }, { headers: { 'cache-control': 'no-store' } });
};
