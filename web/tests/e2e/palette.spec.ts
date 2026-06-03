import { expect, test } from '@playwright/test';

// The keyboard shortcut listener runs at the document level; Playwright's
// keyboard.press requires a focusable target, and Chrome intercepts Ctrl+K
// for quick-find. Inject a synthetic keydown via the page runtime instead.
async function triggerPalette(page: import('@playwright/test').Page) {
	await page.evaluate(() => {
		document.dispatchEvent(
			new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true }),
		);
	});
}

async function isAuthenticated(page: import('@playwright/test').Page): Promise<boolean> {
	// The palette is mounted inside the auth-only layout branch; if it's not
	// in the DOM the test environment is in real-Keycloak mode without a
	// session and there's nothing to assert.
	return await page.evaluate(() => document.querySelector('[data-sidebar="menu-button"]') !== null);
}

test.describe('Command palette (auth dev bypass)', () => {
	test('opens on synthetic ⌘K and lists Armoires + Items', async ({ page }) => {
		await page.goto('/');
		test.skip(!(await isAuthenticated(page)), 'requires dev bypass (auth session)');
		await triggerPalette(page);
		await expect(page.getByPlaceholder('Naviguer ou rechercher…')).toBeVisible();
		await expect(page.getByRole('option', { name: 'Armoires' })).toBeVisible();
		await expect(page.getByRole('option', { name: 'Items' })).toBeVisible();
	});

	test('selecting Armoires navigates', async ({ page }) => {
		await page.goto('/');
		test.skip(!(await isAuthenticated(page)), 'requires dev bypass (auth session)');
		await triggerPalette(page);
		await expect(page.getByPlaceholder('Naviguer ou rechercher…')).toBeVisible();
		await page.getByRole('option', { name: 'Armoires' }).click();
		await expect(page).toHaveURL(/\/armoires$/);
	});
});
