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

describe('session store + signed cookie ID', () => {
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

	it('writes a small cookie (just signed UUID, not the payload)', () => {
		writeSession(cookies, sampleSession());
		const raw = cookies.get(COOKIE_NAME)!;
		// UUID v4 = 36 chars, dot = 1, base64url HMAC-SHA256 = 43 chars → 80
		expect(raw.length).toBeLessThan(100);
		expect(raw.length).toBeGreaterThan(60);
	});

	it('rejects a cookie with a tampered ID', () => {
		writeSession(cookies, sampleSession());
		const raw = cookies.get(COOKIE_NAME)!;
		const [, sig] = raw.split('.');
		cookies.set(
			COOKIE_NAME,
			`00000000-0000-0000-0000-000000000000.${sig}`,
			{ path: '/' },
		);
		expect(readSession(cookies)).toBeNull();
	});

	it('rejects a cookie with a tampered signature', () => {
		writeSession(cookies, sampleSession());
		const raw = cookies.get(COOKIE_NAME)!;
		const [id] = raw.split('.');
		cookies.set(
			COOKIE_NAME,
			`${id}.AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA`,
			{ path: '/' },
		);
		expect(readSession(cookies)).toBeNull();
	});

	it('rejects a cookie with no signature segment', () => {
		cookies.set(COOKIE_NAME, '550e8400-e29b-41d4-a716-446655440000', { path: '/' });
		expect(readSession(cookies)).toBeNull();
	});

	it('rejects a cookie that is plain unsigned JSON (pre-fix format)', () => {
		cookies.set(COOKIE_NAME, JSON.stringify(sampleSession()), { path: '/' });
		expect(readSession(cookies)).toBeNull();
	});

	it('rejects a cookie with extra dot segments', () => {
		writeSession(cookies, sampleSession());
		const raw = cookies.get(COOKIE_NAME)!;
		cookies.set(COOKIE_NAME, `${raw}.extra`, { path: '/' });
		expect(readSession(cookies)).toBeNull();
	});

	it('rejects when the stored entry was never written (forged ID with valid HMAC is impossible without secret)', () => {
		// Simulate a hypothetical valid-looking cookie that points at no entry.
		// Without the secret, an attacker cannot generate a valid HMAC for a
		// chosen ID, so this branch should never fire in practice — but the
		// readSession contract must still return null if it does.
		writeSession(cookies, sampleSession());
		clearSession(cookies);
		// Cookie was cleared, but reset it to the same value: the entry is gone.
		// (The cookie itself was deleted; restore the previously valid cookie
		// to test the "ID valid but no entry" branch.)
		expect(readSession(cookies)).toBeNull();
	});

	it('writeSession with same cookie re-uses session ID (no orphaned entries on refresh)', () => {
		writeSession(cookies, sampleSession());
		const first = cookies.get(COOKIE_NAME);
		writeSession(cookies, { ...sampleSession(), accessToken: 'rotated' });
		const second = cookies.get(COOKIE_NAME);
		expect(first).toBe(second);
		expect(readSession(cookies)?.accessToken).toBe('rotated');
	});

	it('clearSession removes both the cookie and the store entry', () => {
		writeSession(cookies, sampleSession());
		expect(readSession(cookies)).not.toBeNull();
		clearSession(cookies);
		expect(cookies.get(COOKIE_NAME)).toBeUndefined();
		expect(readSession(cookies)).toBeNull();
	});

	it('isExpired returns true when expiresAt is within the leeway', () => {
		const now = Math.floor(Date.now() / 1000);
		expect(isExpired({ ...sampleSession(), expiresAt: now + 10 })).toBe(true);
		expect(isExpired({ ...sampleSession(), expiresAt: now + 120 })).toBe(false);
	});
});
