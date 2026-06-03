import { expect, test } from '@playwright/test';

async function isAuthenticated(page: import('@playwright/test').Page): Promise<boolean> {
	return await page.evaluate(() => document.querySelector('[data-sidebar="menu-button"]') !== null);
}

test.describe('Armoires (dev bypass — backend empty)', () => {
	test('list page renders with both tabs', async ({ page }) => {
		await page.goto('/armoires');
		test.skip(!(await isAuthenticated(page)), 'requires dev bypass (auth session)');
		await expect(page.getByRole('heading', { name: 'Armoires', level: 1 })).toBeVisible();
		await expect(page.getByRole('tab', { name: /Mes accès/ })).toBeVisible();
		await expect(page.getByRole('tab', { name: /Toutes/ })).toBeVisible();
	});

	test('Mes accès tab shows empty state without backend', async ({ page }) => {
		await page.goto('/armoires');
		test.skip(!(await isAuthenticated(page)), 'requires dev bypass (auth session)');
		await expect(page.getByText(/Aucun accès/i)).toBeVisible();
	});

	test('Create button visible for the fake T0 user', async ({ page }) => {
		await page.goto('/armoires');
		test.skip(!(await isAuthenticated(page)), 'requires dev bypass (auth session)');
		const createBtn = page.getByRole('button', { name: 'Créer une armoire' });
		await expect(createBtn).toBeVisible();
		await expect(createBtn).toBeEnabled();
	});

	test('sidebar Armoires link is visible', async ({ page }) => {
		await page.goto('/');
		test.skip(!(await isAuthenticated(page)), 'requires dev bypass (auth session)');
		const sidebarLink = page.locator('[data-sidebar="menu-button"]', { hasText: 'Armoires' });
		await expect(sidebarLink).toBeVisible();
	});
});
