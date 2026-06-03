import { expect, test } from '@playwright/test';

test.describe('Armoires (dev bypass — backend empty)', () => {
	test('list page renders with both tabs', async ({ page }) => {
		await page.goto('/armoires');
		await expect(page.getByRole('heading', { name: 'Armoires', level: 1 })).toBeVisible();
		await expect(page.getByRole('tab', { name: /Mes accès/ })).toBeVisible();
		await expect(page.getByRole('tab', { name: /Toutes/ })).toBeVisible();
	});

	test('Mes accès tab shows empty state without backend', async ({ page }) => {
		await page.goto('/armoires');
		await expect(page.getByText(/Aucun accès/i)).toBeVisible();
	});

	test('Create button visible for the fake T0 user', async ({ page }) => {
		await page.goto('/armoires');
		const createBtn = page.getByRole('button', { name: 'Créer une armoire' });
		await expect(createBtn).toBeVisible();
		await expect(createBtn).toBeEnabled();
	});

	test('sidebar Armoires link is visible', async ({ page }) => {
		await page.goto('/');
		// `/` redirects to `/armoires`, so the breadcrumb also says "Armoires".
		// Scope the assertion to the actual sidebar nav link.
		const sidebarLink = page.locator('[data-sidebar="menu-button"]', { hasText: 'Armoires' });
		await expect(sidebarLink).toBeVisible();
	});
});
