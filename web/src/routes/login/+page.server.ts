import { redirect } from '@sveltejs/kit';
import * as oidc from 'openid-client';
import { buildAuthorizationUrl } from '$lib/auth/keycloak';
import { clearSession, writeSession } from '$lib/auth/session';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies, locals }) => {
	if (locals.user) throw redirect(303, '/');

	// Every "Se connecter" click starts from a clean server-side state. Any
	// half-broken Map entry from a previous attempt is dropped here; otherwise
	// it could carry old tokens or oauthState/codeVerifier that confuse the
	// next callback.
	clearSession(cookies);

	const state = oidc.randomState();
	const codeVerifier = oidc.randomPKCECodeVerifier();
	const authUrl = await buildAuthorizationUrl(state, codeVerifier);

	writeSession(cookies, {
		accessToken: '',
		refreshToken: '',
		idToken: '',
		expiresAt: 0,
		oauthState: state,
		codeVerifier,
	});

	throw redirect(303, authUrl.toString());
};
