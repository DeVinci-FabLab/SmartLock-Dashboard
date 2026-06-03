import { expect, test } from '@playwright/test';

test.describe('Roles (dev bypass — backend empty)', () => {
	test('list page renders with both tabs', async ({ page }) => {
		await page.goto('/roles');
		await expect(page.getByRole('heading', { name: 'Roles', level: 1 })).toBeVisible();
		await expect(page.getByRole('tab', { name: /Système/ })).toBeVisible();
		await expect(page.getByRole('tab', { name: /Custom/ })).toBeVisible();
	});

	test('Système tab shows empty state without backend', async ({ page }) => {
		await page.goto('/roles');
		// Under dev bypass without backend, GET /roles returns empty array,
		// so both tabs render the EmptyState placeholder.
		await expect(page.getByText(/Aucun rôle système/i)).toBeVisible();
	});

	test('Create button is enabled for the fake T0 user', async ({ page }) => {
		await page.goto('/roles');
		const createBtn = page.getByRole('button', { name: 'Créer un rôle' });
		await expect(createBtn).toBeVisible();
		await expect(createBtn).toBeEnabled();
	});

	test('sidebar Roles link visible (is_role_admin on fake T0 user)', async ({ page }) => {
		await page.goto('/');
		await expect(page.getByRole('link', { name: 'Roles' })).toBeVisible();
	});
});
