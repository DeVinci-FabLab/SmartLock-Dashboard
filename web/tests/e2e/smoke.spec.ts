import { expect, test } from '@playwright/test';

test('unauthenticated user is redirected to /login', async ({ page }) => {
	await page.goto('/');
	await expect(page).toHaveURL(/\/login/);
});

test('placeholder pages also redirect to /login when unauthenticated', async ({ page }) => {
	await page.goto('/armoires');
	await expect(page).toHaveURL(/\/login/);
});
