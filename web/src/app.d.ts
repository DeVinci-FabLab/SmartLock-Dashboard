import type { UserContext } from '$lib/auth/types';

declare global {
	namespace App {
		interface Error {
			code?: string;
		}
		interface Locals {
			user: UserContext | null;
			accessToken: string | null;
		}
		interface PageData {
			user: UserContext | null;
			authBypass?: boolean;
		}
	}
}

export {};
