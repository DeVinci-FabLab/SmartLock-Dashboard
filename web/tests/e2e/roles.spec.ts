import { expect, test } from '@playwright/test';

async function isAuthenticated(page: import('@playwright/test').Page): Promise<boolean> {
	return await page.evaluate(() => document.querySelector('[data-sidebar="menu-button"]') !== null);
}

test.describe('Roles (dev bypass — backend empty)', () => {
	test('list page renders with both tabs', async ({ page }) => {
		await page.goto('/roles');
		test.skip(!(await isAuthenticated(page)), 'requires dev bypass (auth session)');
		await expect(page.getByRole('heading', { name: 'Roles', level: 1 })).toBeVisible();
		await expect(page.getByRole('tab', { name: /Système/ })).toBeVisible();
		await expect(page.getByRole('tab', { name: /Custom/ })).toBeVisible();
	});

	test('Système tab shows empty state without backend', async ({ page }) => {
		await page.goto('/roles');
		test.skip(!(await isAuthenticated(page)), 'requires dev bypass (auth session)');
		await expect(page.getByText(/Aucun rôle système/i)).toBeVisible();
	});

	test('Create button is enabled for the fake T0 user', async ({ page }) => {
		await page.goto('/roles');
		test.skip(!(await isAuthenticated(page)), 'requires dev bypass (auth session)');
		const createBtn = page.getByRole('button', { name: 'Créer un rôle' });
		await expect(createBtn).toBeVisible();
		await expect(createBtn).toBeEnabled();
	});

	test('sidebar Roles link visible (is_role_admin on fake T0 user)', async ({ page }) => {
		await page.goto('/');
		test.skip(!(await isAuthenticated(page)), 'requires dev bypass (auth session)');
		await expect(page.getByRole('link', { name: 'Roles' })).toBeVisible();
	});
});
