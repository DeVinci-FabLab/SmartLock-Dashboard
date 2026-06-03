import { expect, test } from '@playwright/test';

// These smoke tests are mode-tolerant: they pass under both dev-bypass
// (auth'd as the fake T0 user, `/` redirects to `/armoires`) AND real
// Keycloak when no session exists (`/` renders the public landing). They
// only check that `/` doesn't bounce off-host to the IDP, which would
// indicate that the public landing route is broken.

test('root renders something local — never bounces straight to Keycloak', async ({ page }) => {
	await page.goto('/');
	// URL must stay on localhost. Either the landing (path `/`) or the
	// dashboard home `/armoires` is acceptable.
	const url = new URL(page.url());
	expect(url.host).toBe('localhost:5173');
	expect(['/', '/armoires']).toContain(url.pathname);
});

test('/health returns 200 with status: ok, unauthenticated', async ({ request }) => {
	// Liveness probe consumed by Docker healthcheck. Must stay public and
	// 200 forever — any regression here will silently break orchestration.
	const res = await request.get('/health');
	expect(res.status()).toBe(200);
	expect(await res.json()).toEqual({ status: 'ok' });
});

test('root shows either the landing CTA or the Armoires dashboard', async ({ page }) => {
	await page.goto('/');
	const url = new URL(page.url());
	if (url.pathname === '/') {
		// Public landing
		await expect(page.getByRole('heading', { name: /Tableau de bord SmartLock/ })).toBeVisible();
		await expect(page.getByRole('link', { name: /Se connecter/i }).first()).toBeVisible();
	} else {
		// Authenticated dashboard
		await expect(page.getByRole('heading', { name: 'Armoires', level: 1 })).toBeVisible();
	}
});
