import type { Cookies } from '@sveltejs/kit';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('$lib/config', () => ({
	config: { sessionSecret: 'test-secret-must-be-at-least-32-chars-long' },
}));

import { clearSession, isExpired, readSession, writeSession, type Session } from './session';

const COOKIE_NAME = 'smartlock_session';

function mockCookies(): Cookies {
	const store = new Map<string, string>();
	return {
		get: (name: string) => store.get(name),
		getAll: () =>
			Array.from(store.entries()).map(([name, value]) => ({ name, value })),
		set: (name: string, value: string) => {
			store.set(name, value);
		},
		delete: (name: string) => {
			store.delete(name);
		},
		serialize: () => '',
	} as unknown as Cookies;
}

function sampleSession(): Session {
	return {
		accessToken: 'access-token-stub',
		refreshToken: 'refresh-token-stub',
		idToken: 'id-token-stub',
		expiresAt: 9_999_999_999,
		user: {
			id: 'u-1',
			username: 'morgan',
			displayName: 'Morgan',
			email: 'm@x',
			enabled: true,
			roles: [],
			armoirePermissions: [],
		},
	};
}

describe('session cookie integrity', () => {
	let cookies: Cookies;

	beforeEach(() => {
		cookies = mockCookies();
	});

	it('round-trips a written session', () => {
		const original = sampleSession();
		writeSession(cookies, original);
		const recovered = readSession(cookies);
		expect(recovered).toEqual(original);
	});

	it('returns null when no cookie is present', () => {
		expect(readSession(cookies)).toBeNull();
	});

	it('rejects a cookie whose payload was tampered with', () => {
		writeSession(cookies, sampleSession());
		const raw = cookies.get(COOKIE_NAME)!;
		const [payloadB64, sig] = raw.split('.');
		const tamperedPayload = Buffer.from(
			JSON.stringify({ ...sampleSession(), accessToken: 'forged-token' }),
			'utf8',
		).toString('base64url');
		cookies.set(COOKIE_NAME, `${tamperedPayload}.${sig}`, { path: '/' });
		expect(readSession(cookies)).toBeNull();
		expect(payloadB64).not.toEqual(tamperedPayload);
	});

	it('rejects a cookie whose signature was tampered with', () => {
		writeSession(cookies, sampleSession());
		const raw = cookies.get(COOKIE_NAME)!;
		const [payloadB64] = raw.split('.');
		// Flip a character in the signature (still valid base64url length)
		cookies.set(
			COOKIE_NAME,
			`${payloadB64}.AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA`,
			{ path: '/' },
		);
		expect(readSession(cookies)).toBeNull();
	});

	it('rejects a cookie with no signature segment', () => {
		const payload = Buffer.from(JSON.stringify(sampleSession()), 'utf8').toString(
			'base64url',
		);
		cookies.set(COOKIE_NAME, payload, { path: '/' });
		expect(readSession(cookies)).toBeNull();
	});

	it('rejects a cookie that is plain unsigned JSON (pre-fix format)', () => {
		// Simulates an old session cookie from before HMAC signing was added.
		cookies.set(COOKIE_NAME, JSON.stringify(sampleSession()), { path: '/' });
		expect(readSession(cookies)).toBeNull();
	});

	it('rejects a cookie with malformed base64 payload', () => {
		cookies.set(COOKIE_NAME, '!!!not-base64!!!.AAAA', { path: '/' });
		expect(readSession(cookies)).toBeNull();
	});

	it('rejects a cookie with extra dot segments (forgery via concatenation)', () => {
		writeSession(cookies, sampleSession());
		const raw = cookies.get(COOKIE_NAME)!;
		cookies.set(COOKIE_NAME, `${raw}.extra`, { path: '/' });
		expect(readSession(cookies)).toBeNull();
	});

	it('clearSession removes the cookie', () => {
		writeSession(cookies, sampleSession());
		expect(cookies.get(COOKIE_NAME)).toBeDefined();
		clearSession(cookies);
		expect(cookies.get(COOKIE_NAME)).toBeUndefined();
	});

	it('isExpired returns true when expiresAt is within the leeway', () => {
		const now = Math.floor(Date.now() / 1000);
		expect(isExpired({ ...sampleSession(), expiresAt: now + 10 })).toBe(true);
		expect(isExpired({ ...sampleSession(), expiresAt: now + 120 })).toBe(false);
	});
});
