import { expect, test } from '@playwright/test';

test.describe('Items (dev bypass — backend empty)', () => {
	test('list page renders with toolbar + filters', async ({ page }) => {
		await page.goto('/items');
		await expect(page.getByRole('heading', { name: 'Items', level: 1 })).toBeVisible();
		await expect(page.getByPlaceholder(/Rechercher par nom/)).toBeVisible();
	});

	test('empty state shows when catalog is empty', async ({ page }) => {
		await page.goto('/items');
		await expect(page.getByText(/Aucun item/i)).toBeVisible();
	});

	test('Catégories and Créer un item buttons visible for T0', async ({ page }) => {
		await page.goto('/items');
		await expect(page.getByRole('button', { name: 'Créer un item' })).toBeEnabled();
		await expect(page.getByRole('button', { name: 'Catégories', exact: true })).toBeEnabled();
	});

	test('sidebar Items link is visible', async ({ page }) => {
		await page.goto('/');
		const sidebarLink = page.locator('[data-sidebar="menu-button"]', { hasText: 'Items' });
		await expect(sidebarLink).toBeVisible();
	});
});
