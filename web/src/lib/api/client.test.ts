import { afterEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { ApiError, createApiClient } from './client';

const schema = z.object({ id: z.number() });

function mockFetch(response: { status: number; body?: unknown }) {
	return vi.fn().mockResolvedValue(
		new Response(response.body ? JSON.stringify(response.body) : null, {
			status: response.status,
			headers: { 'content-type': 'application/json' },
		}),
	);
}

afterEach(() => {
	vi.restoreAllMocks();
});

describe('createApiClient', () => {
	it('GET parses JSON via Zod schema', async () => {
		const fetchFn = mockFetch({ status: 200, body: { id: 42 } });
		const api = createApiClient({ baseUrl: 'http://x', fetchFn });
		const result = await api.get('/things/42', schema);
		expect(result).toEqual({ id: 42 });
	});

	it('GET throws ApiError on 4xx', async () => {
		const fetchFn = mockFetch({ status: 404, body: { detail: 'not found' } });
		const api = createApiClient({ baseUrl: 'http://x', fetchFn });
		await expect(api.get('/things/99', schema)).rejects.toBeInstanceOf(ApiError);
	});

	it('GET throws ApiError on schema mismatch', async () => {
		const fetchFn = mockFetch({ status: 200, body: { id: 'not-a-number' } });
		const api = createApiClient({ baseUrl: 'http://x', fetchFn });
		await expect(api.get('/things/1', schema)).rejects.toBeInstanceOf(ApiError);
	});

	it('attaches Authorization header when token provided', async () => {
		const fetchFn = mockFetch({ status: 200, body: { id: 1 } });
		const api = createApiClient({ baseUrl: 'http://x', fetchFn, getToken: () => 'tok-123' });
		await api.get('/x', schema);
		const headers = (fetchFn.mock.calls[0][1] as RequestInit).headers as Headers;
		expect(headers.get('authorization')).toBe('Bearer tok-123');
	});

	it('POST sends JSON body', async () => {
		const fetchFn = mockFetch({ status: 201, body: { id: 5 } });
		const api = createApiClient({ baseUrl: 'http://x', fetchFn });
		await api.post('/x', { name: 'a' }, schema);
		expect(fetchFn.mock.calls[0][1]).toMatchObject({ method: 'POST' });
		const body = (fetchFn.mock.calls[0][1] as RequestInit).body as string;
		expect(JSON.parse(body)).toEqual({ name: 'a' });
	});

	it('ApiError exposes status and detail', () => {
		const e = new ApiError(403, 'forbidden', 'no_permission');
		expect(e.status).toBe(403);
		expect(e.detail).toBe('forbidden');
		expect(e.code).toBe('no_permission');
	});
});
