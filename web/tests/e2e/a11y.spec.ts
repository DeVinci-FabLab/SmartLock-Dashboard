import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

async function isAuthenticated(page: import('@playwright/test').Page): Promise<boolean> {
	return await page.evaluate(() => document.querySelector('[data-sidebar="menu-button"]') !== null);
}

const PUBLIC_ROUTES = ['/'];
const AUTH_ROUTES = ['/armoires', '/items', '/stocks', '/roles', '/logs', '/me'];

for (const path of PUBLIC_ROUTES) {
	test(`a11y smoke — ${path} (public)`, async ({ page }) => {
		await page.goto(path);
		const results = await new AxeBuilder({ page })
			.disableRules(['color-contrast'])
			.analyze();
		const critical = results.violations.filter((v) => v.impact === 'critical');
		if (critical.length > 0) console.log('Critical a11y violations:', JSON.stringify(critical, null, 2));
		expect(critical).toEqual([]);
	});
}

for (const path of AUTH_ROUTES) {
	test(`a11y smoke — ${path}`, async ({ page }) => {
		await page.goto(path);
		test.skip(!(await isAuthenticated(page)), 'requires dev bypass (auth session)');
		const results = await new AxeBuilder({ page })
			.disableRules(['color-contrast'])
			.analyze();
		const critical = results.violations.filter((v) => v.impact === 'critical');
		if (critical.length > 0) console.log('Critical a11y violations:', JSON.stringify(critical, null, 2));
		expect(critical).toEqual([]);
	});
}
