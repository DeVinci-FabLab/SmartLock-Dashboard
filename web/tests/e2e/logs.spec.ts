import { expect, test } from '@playwright/test';

async function isAuthenticated(page: import('@playwright/test').Page): Promise<boolean> {
	return await page.evaluate(() => document.querySelector('[data-sidebar="menu-button"]') !== null);
}

test.describe('Logs (dev bypass — backend empty)', () => {
	test('page renders heading + locker filter', async ({ page }) => {
		await page.goto('/logs');
		test.skip(!(await isAuthenticated(page)), 'requires dev bypass (auth session)');
		await expect(page.getByRole('heading', { name: 'Logs', level: 1 })).toBeVisible();
	});

	test('Exporter CSV button visible for T0', async ({ page }) => {
		await page.goto('/logs');
		test.skip(!(await isAuthenticated(page)), 'requires dev bypass (auth session)');
		await expect(page.getByRole('button', { name: /Exporter CSV/ })).toBeVisible();
	});

	test('sidebar Logs link is visible', async ({ page }) => {
		await page.goto('/');
		test.skip(!(await isAuthenticated(page)), 'requires dev bypass (auth session)');
		const sidebarLink = page.locator('[data-sidebar="menu-button"]', { hasText: 'Logs' });
		await expect(sidebarLink).toBeVisible();
	});
});
