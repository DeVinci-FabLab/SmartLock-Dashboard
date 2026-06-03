import { expect, test } from '@playwright/test';

async function isAuthenticated(page: import('@playwright/test').Page): Promise<boolean> {
	return await page.evaluate(() => document.querySelector('[data-sidebar="menu-button"]') !== null);
}

test.describe('Items (dev bypass — backend empty)', () => {
	test('list page renders with toolbar + filters', async ({ page }) => {
		await page.goto('/items');
		test.skip(!(await isAuthenticated(page)), 'requires dev bypass (auth session)');
		await expect(page.getByRole('heading', { name: 'Items', level: 1 })).toBeVisible();
		await expect(page.getByPlaceholder(/Rechercher par nom/)).toBeVisible();
	});

	test('empty state shows when catalog is empty', async ({ page }) => {
		await page.goto('/items');
		test.skip(!(await isAuthenticated(page)), 'requires dev bypass (auth session)');
		await expect(page.getByText(/Aucun item/i)).toBeVisible();
	});

	test('Catégories and Créer un item buttons visible for T0', async ({ page }) => {
		await page.goto('/items');
		test.skip(!(await isAuthenticated(page)), 'requires dev bypass (auth session)');
		await expect(page.getByRole('button', { name: 'Créer un item' })).toBeEnabled();
		await expect(page.getByRole('button', { name: 'Catégories', exact: true })).toBeEnabled();
	});

	test('sidebar Items link is visible', async ({ page }) => {
		await page.goto('/');
		test.skip(!(await isAuthenticated(page)), 'requires dev bypass (auth session)');
		const sidebarLink = page.locator('[data-sidebar="menu-button"]', { hasText: 'Items' });
		await expect(sidebarLink).toBeVisible();
	});
});
