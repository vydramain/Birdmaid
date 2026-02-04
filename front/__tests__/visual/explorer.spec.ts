import { test, expect } from "@playwright/test";

/**
 * Explorer visual baseline test.
 *
 * To run: npm run test:visual
 * To update baseline: npm run test:visual -- --update-snapshots
 *
 * Requires: dev server running (npm run dev) or Playwright will start it.
 * Navigates to /visual-test.html which renders Explorer in isolation.
 */
test.describe("Explorer Visual Baseline", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/visual-test.html");
    await page.waitForSelector('[data-section="explorer-baseline"]', {
      timeout: 20000,
    });
  });

  test("explorer baseline matches snapshot", async ({ page }) => {
    const explorerSection = page.locator('[data-section="explorer-baseline"]');
    await expect(explorerSection).toBeVisible();
    await expect(explorerSection).toHaveScreenshot("explorer_win95_baseline.png");
  });
});
