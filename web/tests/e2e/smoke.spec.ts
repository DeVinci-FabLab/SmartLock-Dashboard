import { expect, test } from '@playwright/test';

// These smoke tests run under the dev bypass (no Keycloak issuer), so the
// fake T0 user is always authenticated. The original P0 expectation that
// `/` and `/armoires` redirect to `/login` no longer holds — in this mode
// `/` redirects to `/armoires`, and `/armoires` renders the real page.

test('root redirects to /armoires under dev bypass', async ({ page }) => {
	await page.goto('/');
	await expect(page).toHaveURL(/\/armoires$/);
});

test('/armoires renders without redirecting away', async ({ page }) => {
	await page.goto('/armoires');
	await expect(page).toHaveURL(/\/armoires$/);
	await expect(page.getByRole('heading', { name: 'Armoires', level: 1 })).toBeVisible();
});
