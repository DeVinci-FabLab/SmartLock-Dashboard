import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	// Authenticated users skip the landing and go straight to the app.
	// Unauthenticated users see the landing (rendered by +page.svelte).
	if (locals.user) throw redirect(303, '/armoires');
	return {};
};
