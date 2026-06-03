import { expect, test } from '@playwright/test';

async function isAuthenticated(page: import('@playwright/test').Page): Promise<boolean> {
	return await page.evaluate(() => document.querySelector('[data-sidebar="menu-button"]') !== null);
}

test.describe('Home dashboard (auth dev bypass)', () => {
	test('auth user lands on the home overview with welcome header', async ({ page }) => {
		await page.goto('/');
		test.skip(!(await isAuthenticated(page)), 'requires dev bypass (auth session)');
		await expect(page.getByText(/Bonjour,/i)).toBeVisible();
	});

	test('home shows Mes armoires + Activité widgets', async ({ page }) => {
		await page.goto('/');
		test.skip(!(await isAuthenticated(page)), 'requires dev bypass (auth session)');
		await expect(page.getByText('Mes armoires')).toBeVisible();
		await expect(page.getByText('Activité récente')).toBeVisible();
	});
});
