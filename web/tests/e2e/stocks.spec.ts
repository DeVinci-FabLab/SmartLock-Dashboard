import { expect, test } from '@playwright/test';

test.describe('Stocks (dev bypass — backend empty)', () => {
	test('flat view renders with filters', async ({ page }) => {
		await page.goto('/stocks');
		await expect(page.getByRole('heading', { name: 'Stocks', level: 1 })).toBeVisible();
		await expect(page.getByPlaceholder(/Rechercher par item/)).toBeVisible();
	});

	test('Exporter CSV button is visible for T0', async ({ page }) => {
		await page.goto('/stocks');
		await expect(page.getByRole('button', { name: /Exporter CSV/ })).toBeVisible();
	});

	test('sidebar Stocks link is visible', async ({ page }) => {
		await page.goto('/');
		const sidebarLink = page.locator('[data-sidebar="menu-button"]', { hasText: 'Stocks' });
		await expect(sidebarLink).toBeVisible();
	});
});
