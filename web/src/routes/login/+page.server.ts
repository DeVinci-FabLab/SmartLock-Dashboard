import { redirect } from '@sveltejs/kit';
import * as oidc from 'openid-client';
import { buildAuthorizationUrl } from '$lib/auth/keycloak';
import { readSession, writeSession } from '$lib/auth/session';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies, locals }) => {
	if (locals.user) throw redirect(303, '/');

	const state = oidc.randomState();
	const codeVerifier = oidc.randomPKCECodeVerifier();
	const authUrl = await buildAuthorizationUrl(state, codeVerifier);

	const existing = readSession(cookies);
	writeSession(cookies, {
		accessToken: existing?.accessToken ?? '',
		refreshToken: existing?.refreshToken ?? '',
		idToken: existing?.idToken ?? '',
		expiresAt: 0,
		oauthState: state,
		codeVerifier,
	});

	throw redirect(303, authUrl.toString());
};
