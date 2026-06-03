import { error, redirect } from '@sveltejs/kit';
import { exchangeCodeForTokens } from '$lib/auth/keycloak';
import { fetchMe } from '$lib/auth/fetchMe';
import { readSession, writeSession } from '$lib/auth/session';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, cookies }) => {
	const session = readSession(cookies);
	if (!session?.oauthState || !session.codeVerifier) {
		throw error(400, 'Session OAuth manquante. Recommencez la connexion.');
	}

	let tokens;
	try {
		tokens = await exchangeCodeForTokens(url, session.oauthState, session.codeVerifier);
	} catch (e) {
		throw error(400, `Échec de l'échange OIDC : ${(e as Error).message}`);
	}

	const accessToken = tokens.access_token!;
	const me = await fetchMe(accessToken);

	writeSession(cookies, {
		accessToken,
		refreshToken: tokens.refresh_token ?? '',
		idToken: tokens.id_token ?? '',
		expiresAt: Math.floor(Date.now() / 1000) + (tokens.expires_in ?? 60),
		user: me ?? undefined,
	});

	throw redirect(303, '/');
};
