const { test, expect } = require('@playwright/test');

const viewports = [
  { name: 'mobile', width: 375, height: 667 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 }
];

viewports.forEach(view => {
  test(`LoginPage layout looks correct on ${view.name}`, async ({ page }) => {
    await page.setViewportSize({ width: view.width, height: view.height });
    await page.goto('http://localhost:3001');
    await expect(page.locator('text=Login')).toBeVisible();
    await page.screenshot({ path: `screenshots/login-${view.name}.png` });
  });
});