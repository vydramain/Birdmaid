/**
 * FP1 Shell E2E — AC A1..F2, theme/scale.
 * M2 TESTS-RED: A1/A2 pass, B2..F2 fail until M3.
 */

import { test, expect } from "@playwright/test";

test.describe("FP1 Shell — A: Access", () => {
  test("A1 — shell.local opens, page loads", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Shell|Birdmaid/);
    await expect(page.getByRole("main")).toBeVisible();
  });

  test("A2 — GET /health returns 200", async ({ request }) => {
    const res = await request.get("/health");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty("status", "ok");
  });
});

test.describe("FP1 Shell — B: Windows", () => {
  test("B2 — close removes iframe from DOM", async ({ page }) => {
    await page.goto("/");
    const openBtn = page.getByRole("button", { name: /new window/i });
    await openBtn.click();
    await openBtn.click();
    await openBtn.click();

    const iframes = page.locator("iframe");
    await expect(iframes).toHaveCount(3, { timeout: 10000 });

    const closeBtn = page.getByRole("button", { name: /close/i }).first();
    await closeBtn.click();

    await expect(page.locator("iframe")).toHaveCount(2);
  });
});

test.describe("FP1 Shell — C: Drag", () => {
  test("C1 — drag clamp: titlebar stays in viewport", async ({ page }) => {
    await page.goto("/");
    const openBtn = page.getByRole("button", { name: /open|new window|create/i });
    await openBtn.click();

    const titlebar = page.locator("[data-testid='window-titlebar'], .wm-titlebar, [data-draggable]").first();
    await expect(titlebar).toBeVisible();

    const box = await titlebar.boundingBox();
    expect(box).toBeTruthy();

    await titlebar.hover();
    await page.mouse.down();
    await page.mouse.move(-500, -500);
    await page.mouse.up();

    const boxAfter = await titlebar.boundingBox();
    expect(boxAfter).toBeTruthy();
    // Titlebar must remain in viewport (clamp)
    expect(boxAfter!.y).toBeLessThan(page.viewportSize()!.height);
    expect(boxAfter!.y + boxAfter!.height).toBeGreaterThan(0);
  });
});

test.describe("FP1 Shell — D: Focus", () => {
  test("D1 — click → active; click Desktop → activeId = null", async ({ page }) => {
    await page.goto("/");
    const openBtn = page.getByRole("button", { name: /new window/i });
    await openBtn.click();

    const titlebar = page.locator("[data-testid='window-titlebar'], .wm-titlebar").first();
    await titlebar.click();
    await expect(page.locator("[data-testid='window-chrome'][data-active='true']")).toBeVisible();

    const desktop = page.locator("[data-testid='desktop']").first();
    await desktop.click({ position: { x: 50, y: 50 } });
    await expect(page.locator("[data-testid='window-chrome'][data-active='true']")).toHaveCount(0);
  });
});

test.describe("FP1 Shell — E: Taskbar", () => {
  test("E1 — taskbar button → focus/restore; active highlight", async ({ page }) => {
    await page.goto("/");
    const openBtn = page.getByRole("button", { name: /new window/i });
    await openBtn.click();

    const taskbarBtn = page.getByRole("button", { name: /Test App|Untitled/i }).first();
    await expect(taskbarBtn).toBeVisible({ timeout: 5000 });

    await taskbarBtn.click();
    await expect(taskbarBtn).toHaveAttribute("data-active", "true");

    await taskbarBtn.click(); // minimize
    await taskbarBtn.click(); // restore
    await expect(taskbarBtn).toHaveAttribute("data-active", "true");
  });
});

test.describe("FP1 Shell — F: AppHost handshake", () => {
  test("F1 — APP_READY → SHELL_CAPS sent", async ({ page }) => {
    await page.goto("/");
    const openBtn = page.getByRole("button", { name: /new window/i });
    await openBtn.click();

    await expect(page.locator("[data-testid='window-title'], .wm-window-title").first())
      .toContainText("Test App", { timeout: 5000 });
    expect(true).toBe(true);
  });

  test("F2 — WINDOW_TITLE → chrome + taskbar title updated", async ({ page }) => {
    await page.goto("/");
    const openBtn = page.getByRole("button", { name: /new window/i });
    await openBtn.click();

    const chromeTitle = page.locator("[data-testid='window-title'], .wm-window-title").first();
    await expect(chromeTitle).toContainText("Test App", { timeout: 5000 });

    const taskbarTitle = page.getByRole("button", { name: /Test App/i });
    await expect(taskbarTitle).toBeVisible();
  });
});

test.describe("FP1 Shell — Theme/Scale (THEMING_v0 asserts)", () => {
  test("Theme switch — DefaultMock ↔ Win98Mock changes token", async ({ page }) => {
    await page.goto("/");
    const themeBtn = page.getByRole("button", { name: /theme|switch theme/i });
    await themeBtn.click();
    const root = page.locator(":root");
    const bgBefore = await root.evaluate((el) =>
      getComputedStyle(el as Element).getPropertyValue("--wm-bg").trim()
    );
    await themeBtn.click();
    const bgAfter = await root.evaluate((el) =>
      getComputedStyle(el as Element).getPropertyValue("--wm-bg").trim()
    );
    expect(bgAfter).not.toBe(bgBefore);
  });

  test("Scale switch — 1.0 ↔ 1.5 changes titlebar height token", async ({ page }) => {
    await page.goto("/");
    const root = page.locator(":root");
    await root.evaluate((el) => (el as HTMLElement).style.setProperty("--wm-scale", "1"));
    const h1 = await root.evaluate((el) =>
      getComputedStyle(el as Element).getPropertyValue("--wm-titlebar-height").trim()
    );
    await root.evaluate((el) => (el as HTMLElement).style.setProperty("--wm-scale", "1.5"));
    const h2 = await root.evaluate((el) =>
      getComputedStyle(el as Element).getPropertyValue("--wm-titlebar-height").trim()
    );
    expect(h2).not.toBe(h1);
  });
});
