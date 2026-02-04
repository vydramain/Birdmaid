# Visual Regression Testing Guide

**Version:** 1.1  
**Created:** 2026-01-22  
**Updated:** 2026-02-05  
**Purpose:** Guide for visual regression testing of Win95 UI components  
**Status:** Design Phase (FP7)

## Overview

Visual regression tests ensure that UI components maintain their visual appearance across changes. This document describes how to set up and run visual tests for the Win95 UI style guide.

## Explorer Baseline

The Explorer window has a dedicated visual baseline test. See [EXPLORER_UI_CONTRACT.md](./EXPLORER_UI_CONTRACT.md) for the contract.

**Test file:** `front/__tests__/visual/explorer.spec.ts`  
**Baseline page:** `front/visual-test.html` (renders Explorer in isolation)  
**Baseline screenshot:** `front/__tests__/visual/__screenshots__/chromium/explorer_win95_baseline.png`

**To update baseline intentionally:**
```bash
cd front
npm run test:visual -- --update-snapshots
```

## Test Structure

### Basic Smoke Tests

Basic smoke tests are located in `front/__tests__/style-guide/visual.test.tsx`. These tests verify that components render correctly but do not check visual appearance.

**Run basic tests:**
```bash
cd front
npm run test __tests__/style-guide/visual.test.tsx
```

### Visual Regression Tests (Recommended)

For full visual regression testing with screenshots, we recommend using **Playwright** or similar tools.

## Setting Up Playwright (Optional)

### Installation

```bash
cd front
npm install --save-dev @playwright/test
npx playwright install
```

### Configuration

Create `playwright.config.ts`:

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './__tests__/visual',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

### Visual Test Example

Create `front/__tests__/visual/style-guide.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Style Guide Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to style guide (open via app registry)
    await page.goto('/');
    // Open style guide app (implementation depends on app registry)
    // await page.click('[data-app-id="styleguide"]');
  });

  test('style guide renders correctly', async ({ page }) => {
    await expect(page).toHaveScreenshot('style-guide-full.png', {
      fullPage: true,
    });
  });

  test('window states render correctly', async ({ page }) => {
    const windowSection = page.locator('[data-section="window-states"]');
    await expect(windowSection).toHaveScreenshot('window-states.png');
  });

  test('button states render correctly', async ({ page }) => {
    const buttonSection = page.locator('[data-section="button-states"]');
    await expect(buttonSection).toHaveScreenshot('button-states.png');
  });
});
```

### Running Visual Tests

```bash
# Run visual tests
npx playwright test

# Update baseline screenshots
npx playwright test --update-snapshots

# View test results
npx playwright show-report
```

## Baseline Screenshots

Baseline screenshots are stored in `front/__tests__/visual/screenshots/` (if using Playwright) or a similar directory.

### Creating Baseline Screenshots

1. **Ensure Style Guide is accessible:**
   - Open Style Guide app via AppRegistry (id: `styleguide`)
   - Or navigate directly if route is available

2. **Take baseline screenshots:**
   ```bash
   npx playwright test --update-snapshots
   ```

3. **Commit baseline screenshots:**
   - Commit screenshots to version control
   - Use as reference for future changes

### Updating Baseline Screenshots

When intentional visual changes are made:

1. **Review changes:**
   ```bash
   npx playwright test
   ```

2. **Update baselines:**
   ```bash
   npx playwright test --update-snapshots
   ```

3. **Commit updated screenshots:**
   - Review diff of screenshots
   - Commit if changes are intentional

## Manual Visual Testing

For manual visual testing:

1. **Open Style Guide:**
   - Open Style Guide app via AppRegistry
   - Or navigate to style guide route (if available)

2. **Check each section:**
   - Window States (active/inactive)
   - Button States (default, active, disabled, hover)
   - Input Fields (default, focused, disabled)
   - List Selection (focused/unfocused)
   - Status Bar
   - Scrollbar Sample
   - Desktop Icons Sample

3. **Compare with reference:**
   - Compare with screenshots in `docs/design/references/screenshots/`
   - Verify Win95-accurate appearance

## CI Integration

### GitHub Actions Example

```yaml
name: Visual Tests

on: [push, pull_request]

jobs:
  visual-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: |
          cd front
          npm ci
      - name: Install Playwright
        run: |
          cd front
          npx playwright install --with-deps
      - name: Run visual tests
        run: |
          cd front
          npx playwright test
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: front/playwright-report/
```

## Troubleshooting

### Screenshots differ slightly

- **Font rendering:** Different OS/browsers may render fonts slightly differently
- **Anti-aliasing:** Disable font smoothing for pixel-perfect rendering
- **Viewport size:** Ensure consistent viewport size across tests

### Tests fail on CI

- **Install system dependencies:** `npx playwright install --with-deps`
- **Use consistent browser:** Specify browser in CI config
- **Set viewport size:** Use fixed viewport size in tests

## References

- **Style Guide App:** `front/src/os/apps/StyleGuideApp.tsx`
- **Style Guide Styles:** `front/src/styles/style-guide.scss`
- **Win95 Spec:** `docs/style/WIN95_SPEC.md`
- **Visual References:** `docs/design/references/screenshots/`
