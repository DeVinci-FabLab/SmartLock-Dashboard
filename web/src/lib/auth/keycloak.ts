import * as oidc from 'openid-client';
import { config } from '$lib/config';

let cachedConfig: oidc.Configuration | null = null;

export async function getKeycloakConfig(): Promise<oidc.Configuration> {
	if (cachedConfig) return cachedConfig;
	if (!config.keycloak.issuer || !config.keycloak.clientId) {
		throw new Error(
			'Keycloak n\'est pas configuré. Copie web/.env.example vers web/.env et remplis KEYCLOAK_ISSUER, KEYCLOAK_CLIENT_ID, KEYCLOAK_CLIENT_SECRET, KEYCLOAK_REDIRECT_URI, KEYCLOAK_POST_LOGOUT_URI.',
		);
	}
	cachedConfig = await oidc.discovery(
		new URL(config.keycloak.issuer),
		config.keycloak.clientId,
		config.keycloak.clientSecret,
	);
	return cachedConfig;
}

export async function buildAuthorizationUrl(state: string, codeVerifier: string): Promise<URL> {
	const kc = await getKeycloakConfig();
	const codeChallenge = await oidc.calculatePKCECodeChallenge(codeVerifier);
	return oidc.buildAuthorizationUrl(kc, {
		redirect_uri: config.keycloak.redirectUri,
		scope: 'openid profile email',
		state,
		code_challenge: codeChallenge,
		code_challenge_method: 'S256',
	});
}

export async function exchangeCodeForTokens(
	currentUrl: URL,
	state: string,
	codeVerifier: string,
): Promise<oidc.TokenEndpointResponse> {
	const kc = await getKeycloakConfig();
	return oidc.authorizationCodeGrant(kc, currentUrl, {
		expectedState: state,
		pkceCodeVerifier: codeVerifier,
	});
}

export async function refreshAccessToken(
	refreshToken: string,
): Promise<oidc.TokenEndpointResponse> {
	const kc = await getKeycloakConfig();
	return oidc.refreshTokenGrant(kc, refreshToken);
}

export async function buildLogoutUrl(idTokenHint: string): Promise<URL> {
	const kc = await getKeycloakConfig();
	return oidc.buildEndSessionUrl(kc, {
		id_token_hint: idTokenHint,
		post_logout_redirect_uri: config.keycloak.postLogoutUri,
	});
}
