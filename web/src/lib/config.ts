import { env } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';

export const config = {
	apiUrl: publicEnv.PUBLIC_SMARTLOCK_API_URL ?? 'http://localhost:8000',
	keycloak: {
		issuer: env.KEYCLOAK_ISSUER ?? '',
		clientId: env.KEYCLOAK_CLIENT_ID ?? '',
		clientSecret: env.KEYCLOAK_CLIENT_SECRET ?? '',
		redirectUri: env.KEYCLOAK_REDIRECT_URI ?? '',
		postLogoutUri: env.KEYCLOAK_POST_LOGOUT_URI ?? '',
	},
	sessionSecret: env.SESSION_SECRET ?? '',
};
