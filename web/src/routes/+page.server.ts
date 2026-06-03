import type { PageServerLoad } from './$types';

/**
 * Authenticated users get the home overview rendered by +page.svelte;
 * unauthenticated visitors get the landing block in the same file.
 * No redirect — the layout already conditionally renders chrome based
 * on whether `data.user` is set upstream.
 */
export const load: PageServerLoad = async () => {
	return {};
};
