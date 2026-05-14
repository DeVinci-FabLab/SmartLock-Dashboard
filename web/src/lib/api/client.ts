import type { ZodType } from 'zod';

export class ApiError extends Error {
	constructor(
		public status: number,
		public detail: string,
		public code?: string,
	) {
		super(`API ${status}: ${detail}`);
		this.name = 'ApiError';
	}
}

export interface ApiClientOptions {
	baseUrl: string;
	fetchFn?: typeof fetch;
	getToken?: () => string | null | undefined;
}

export interface ApiClient {
	get<T>(path: string, schema: ZodType<T>): Promise<T>;
	post<T>(path: string, body: unknown, schema: ZodType<T>): Promise<T>;
	put<T>(path: string, body: unknown, schema: ZodType<T>): Promise<T>;
	patch<T>(path: string, body: unknown, schema: ZodType<T>): Promise<T>;
	delete(path: string): Promise<void>;
}

export function createApiClient(opts: ApiClientOptions): ApiClient {
	const fetchFn = opts.fetchFn ?? fetch;

	async function request<T>(
		method: string,
		path: string,
		body: unknown,
		schema: ZodType<T> | null,
	): Promise<T | void> {
		const headers = new Headers({ 'content-type': 'application/json' });
		const token = opts.getToken?.();
		if (token) headers.set('authorization', `Bearer ${token}`);

		const res = await fetchFn(`${opts.baseUrl}${path}`, {
			method,
			headers,
			body: body !== undefined ? JSON.stringify(body) : undefined,
		});

		if (!res.ok) {
			let detail = res.statusText;
			let code: string | undefined;
			try {
				const errBody = await res.json();
				detail = errBody.detail ?? detail;
				code = errBody.code;
			} catch {
				/* not json */
			}
			throw new ApiError(res.status, detail, code);
		}

		if (res.status === 204 || !schema) return undefined as unknown as T;

		const json = await res.json();
		const parsed = schema.safeParse(json);
		if (!parsed.success) {
			throw new ApiError(
				200,
				`Schema validation failed: ${parsed.error.message}`,
				'schema_mismatch',
			);
		}
		return parsed.data;
	}

	return {
		get: (path, schema) => request('GET', path, undefined, schema) as Promise<unknown>,
		post: (path, body, schema) => request('POST', path, body, schema) as Promise<unknown>,
		put: (path, body, schema) => request('PUT', path, body, schema) as Promise<unknown>,
		patch: (path, body, schema) => request('PATCH', path, body, schema) as Promise<unknown>,
		delete: (path) => request('DELETE', path, undefined, null) as Promise<void>,
	} as ApiClient;
}
