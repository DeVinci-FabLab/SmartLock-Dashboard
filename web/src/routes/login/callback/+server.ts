import { error, redirect } from '@sveltejs/kit';
import { exchangeCodeForTokens } from '$lib/auth/keycloak';
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

	writeSession(cookies, {
		accessToken: tokens.access_token!,
		refreshToken: tokens.refresh_token ?? '',
		idToken: tokens.id_token ?? '',
		expiresAt: Math.floor(Date.now() / 1000) + (tokens.expires_in ?? 60),
	});

	throw redirect(303, '/');
};
