import * as oidc from 'openid-client';
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose';
import { config } from '$lib/config';

let cachedConfig: oidc.Configuration | null = null;
let cachedJwks: ReturnType<typeof createRemoteJWKSet> | null = null;

export async function getKeycloakConfig(): Promise<oidc.Configuration> {
	if (cachedConfig) return cachedConfig;
	if (!config.keycloak.issuer || !config.keycloak.clientId) {
		throw new Error(
			"Keycloak n'est pas configuré. Copie web/.env.example vers web/.env et remplis KEYCLOAK_ISSUER, KEYCLOAK_CLIENT_ID, KEYCLOAK_CLIENT_SECRET, KEYCLOAK_REDIRECT_URI, KEYCLOAK_POST_LOGOUT_URI.",
		);
	}
	cachedConfig = await oidc.discovery(
		new URL(config.keycloak.issuer),
		config.keycloak.clientId,
		config.keycloak.clientSecret,
	);
	return cachedConfig;
}

async function getJwks(): Promise<ReturnType<typeof createRemoteJWKSet>> {
	if (cachedJwks) return cachedJwks;
	const kc = await getKeycloakConfig();
	const metadata = kc.serverMetadata();
	if (!metadata.jwks_uri) {
		throw new Error('Keycloak discovery did not return a jwks_uri.');
	}
	cachedJwks = createRemoteJWKSet(new URL(metadata.jwks_uri));
	return cachedJwks;
}

/**
 * Verifies the access token signature against Keycloak's JWKS and validates
 * the issuer + `azp` (authorized party) claims. Returns the parsed payload
 * on success, throws otherwise. Token expiry is enforced by
 * Session.expiresAt; we still let `jwtVerify` check `exp` and `iat` as
 * defence-in-depth.
 *
 * `aud` is intentionally not validated: Keycloak's default access token
 * carries `aud: "account"` (the built-in account-management client) unless
 * an explicit Audience mapper is configured on the client, which would
 * cause `jwtVerify` to reject every legitimate token. The backend takes
 * the same stance (`verify_aud=False` in `core/keycloak.py`).
 *
 * Pinning `azp` does the real work of blocking tokens issued by other
 * clients in the same realm (`smartlock-api`, `smartlock-lockers`,
 * `nfc-scanner`). `azp` is set by Keycloak to the client_id that
 * obtained the token, independent of audience mapper config.
 */
export async function verifyAccessToken(token: string): Promise<JWTPayload> {
	const jwks = await getJwks();
	const { payload } = await jwtVerify(token, jwks, {
		issuer: config.keycloak.issuer,
	});
	if (payload.azp !== config.keycloak.clientId) {
		throw new Error(
			`Token azp mismatch: expected ${config.keycloak.clientId}, got ${String(payload.azp)}`,
		);
	}
	return payload;
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
