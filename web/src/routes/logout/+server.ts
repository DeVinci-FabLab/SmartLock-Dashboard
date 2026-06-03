import { redirect } from '@sveltejs/kit';
import { buildLogoutUrl } from '$lib/auth/keycloak';
import { clearSession, readSession } from '$lib/auth/session';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ cookies }) => {
	const session = readSession(cookies);
	clearSession(cookies);

	if (!session?.idToken) {
		throw redirect(303, '/login');
	}

	const url = await buildLogoutUrl(session.idToken);
	throw redirect(303, url.toString());
};
