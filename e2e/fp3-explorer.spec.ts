/**
 * FP3 Explorer E2E — M1: My Computer → Explorer window + roots A/C/D.
 * T-M1.1, T-M1.2, T-M1.5: Desktop icon, double click opens window, Explorer shows three disks.
 */

import { test, expect } from "@playwright/test";

test.describe("FP3 Explorer — M1: My Computer", () => {
  test("T-M1.1/T-M1.2 — Desktop has My Computer icon; double click opens Explorer window", async ({
    page,
  }) => {
    await page.goto("/");
    const myComputer = page.getByRole("button", { name: /my computer/i });
    await expect(myComputer).toBeVisible();
    await myComputer.dblclick();

    const explorerWindow = page.locator("[data-testid='window-chrome'], .wm-window").filter({
      has: page.locator("iframe[src*='/apps/explorer']"),
    });
    await expect(explorerWindow).toBeVisible({ timeout: 5000 });
  });

  test("T-M1.2 — Explorer iframe src is /apps/explorer/ (same-origin)", async ({ page }) => {
    await page.goto("/");
    const myComputer = page.getByRole("button", { name: /my computer/i });
    await myComputer.dblclick();

    const iframe = page.locator("iframe[src*='/apps/explorer']");
    await expect(iframe).toBeVisible({ timeout: 5000 });
    const src = await iframe.getAttribute("src");
    expect(src).toMatch(/\/apps\/explorer/);
  });

  test("T-M1.5 — Explorer renders three disk icons (A:, C:, D:)", async ({ page }) => {
    await page.goto("/");
    const myComputer = page.getByRole("button", { name: /my computer/i });
    await myComputer.dblclick();

    const iframe = page.locator("iframe[src*='/apps/explorer']");
    await expect(iframe).toBeVisible({ timeout: 5000 });

    const frame = await iframe.contentFrame();
    expect(frame).toBeTruthy();
    // Explorer shows A:, C:, D: (data-testid explorer-roots contains root-disk_a, root-disk_c, root-disk_d)
    await expect(frame!.getByTestId("explorer-roots")).toBeVisible({ timeout: 10000 });
    await expect(frame!.getByTestId("root-disk_a")).toContainText(/A:|Floppy/i);
    await expect(frame!.getByTestId("root-disk_c")).toBeVisible();
    await expect(frame!.getByTestId("root-disk_d")).toBeVisible();
  });
});

test.describe("FP3 Explorer — M2: Navigate C:/", () => {
  test("T-M2.1/T-M2.2 — Double click C: renders C:/ items and address bar shows C:/", async ({
    page,
  }) => {
    await page.goto("/");
    const myComputer = page.getByRole("button", { name: /my computer/i });
    await myComputer.dblclick();

    const iframe = page.locator("iframe[src*='/apps/explorer']");
    await expect(iframe).toBeVisible({ timeout: 5000 });
    const frame = await iframe.contentFrame();
    expect(frame).toBeTruthy();

    await expect(frame!.getByTestId("root-disk_c")).toBeVisible();
    await frame!.getByTestId("root-disk_c").dblclick();

    await expect(frame!.getByTestId("explorer-list")).toBeVisible({ timeout: 5000 });
    await expect(frame!.getByTestId("address-bar")).toContainText(/C:\//);
    await expect(
      frame!.locator("text=/WINDOWS|Program Files|My Documents/i").first()
    ).toBeVisible();
  });
});

test.describe("FP3 Explorer — M3: App-dir run", () => {
  test("T-M3.3 — Double click app-dir opens new Shell window with app iframe", async ({ page }) => {
    await page.goto("/");
    const myComputer = page.getByRole("button", { name: /my computer/i });
    await myComputer.dblclick();

    const iframe = page.locator("iframe[src*='/apps/explorer']");
    await expect(iframe).toBeVisible({ timeout: 5000 });
    const frame = await iframe.contentFrame();
    expect(frame).toBeTruthy();

    await frame!.getByTestId("root-disk_c").dblclick();
    await expect(frame!.getByTestId("explorer-list")).toBeVisible({ timeout: 5000 });

    await frame!.getByTestId("item-My-Documents").dblclick();
    await expect(frame!.getByTestId("explorer-list")).toBeVisible({ timeout: 3000 });

    await frame!.getByTestId("item-sample-app").dblclick();

    // App window: iframe with src != Explorer (signed URL or s3.shell.local)
    const appIframe = page.locator("iframe[src]:not([src*='/apps/explorer'])").first();
    await expect(appIframe).toBeVisible({ timeout: 8000 });
    const src = await appIframe.getAttribute("src");
    expect(src).toBeTruthy();
    expect(src).toMatch(/index\.html|s3\.shell\.local|X-Amz-/);
    const appFrame = await appIframe.contentFrame();
    expect(appFrame).toBeTruthy();
    // Full AC (iframe content) requires 127.0.0.1 s3.shell.local in /etc/hosts (DEV_DOMAIN.md)
  });
});

test.describe("FP3 Explorer — M4: Image viewer", () => {
  test("T-M4.1 — Double click image opens viewer window and loads image", async ({ page }) => {
    await page.goto("/");
    const myComputer = page.getByRole("button", { name: /my computer/i });
    await myComputer.dblclick();

    const iframe = page.locator("iframe[src*='/apps/explorer']");
    await expect(iframe).toBeVisible({ timeout: 5000 });
    const frame = await iframe.contentFrame();
    expect(frame).toBeTruthy();

    await frame!.getByTestId("root-disk_c").dblclick();
    await expect(frame!.getByTestId("explorer-list")).toBeVisible({ timeout: 5000 });

    await frame!.getByTestId("item-My-Documents").dblclick();
    await expect(frame!.getByTestId("explorer-list")).toBeVisible({ timeout: 3000 });

    // sample-image.png requires fixture (infra/minio/fixtures/DISK_C/My Documents/sample-image.png)
    const imageItem = frame!
      .getByTestId("item-sample-image.png")
      .or(frame!.getByText("sample-image.png"));
    await expect(imageItem).toBeVisible({ timeout: 5000 });
    await imageItem.dblclick();

    // Viewer window: iframe with src containing /viewers/image
    const viewerIframe = page.locator("iframe[src*='/viewers/image']").first();
    await expect(viewerIframe).toBeVisible({ timeout: 8000 });
    const viewerFrame = await viewerIframe.contentFrame();
    expect(viewerFrame).toBeTruthy();
    const img = viewerFrame!.getByTestId("viewer-image");
    await expect(img).toHaveAttribute("src", /s3\.shell\.local|X-Amz-/);
    // Image loads only if s3.shell.local resolves (docs/dev/DEV_DOMAIN.md)
  });
});

test.describe("FP3 Explorer — M5: Context menus + write ops", () => {
  test("T-M5.1 — Right click blank shows context menu (New Folder, Upload File, Upload Zip App)", async ({
    page,
  }) => {
    await page.goto("/");
    const myComputer = page.getByRole("button", { name: /my computer/i });
    await myComputer.dblclick();

    const iframe = page.locator("iframe[src*='/apps/explorer']");
    await expect(iframe).toBeVisible({ timeout: 5000 });
    const frame = await iframe.contentFrame();
    expect(frame).toBeTruthy();

    await frame!.getByTestId("root-disk_c").dblclick();
    await frame!.getByTestId("item-My-Documents").dblclick();
    await expect(frame!.getByTestId("explorer-list")).toBeVisible({ timeout: 3000 });

    await frame!.getByTestId("explorer-list").click({ button: "right" });
    await expect(frame!.getByTestId("context-menu")).toBeVisible({ timeout: 2000 });
    await expect(frame!.getByRole("menuitem", { name: /new folder/i })).toBeVisible();
    await expect(frame!.getByRole("menuitem", { name: /upload file/i })).toBeVisible();
    await expect(frame!.getByRole("menuitem", { name: /upload zip app/i })).toBeVisible();
  });

  test("T-M5.2 — Right click item shows Delete, Rename", async ({ page }) => {
    await page.goto("/");
    const myComputer = page.getByRole("button", { name: /my computer/i });
    await myComputer.dblclick();

    const iframe = page.locator("iframe[src*='/apps/explorer']");
    await expect(iframe).toBeVisible({ timeout: 5000 });
    const frame = await iframe.contentFrame();
    expect(frame).toBeTruthy();

    await frame!.getByTestId("root-disk_c").dblclick();
    await frame!.getByTestId("item-My-Documents").dblclick();
    await expect(frame!.getByTestId("explorer-list")).toBeVisible({ timeout: 3000 });

    const sampleTxt = frame!
      .getByTestId("item-sample-image.png")
      .or(frame!.getByText("sample-image.png"));
    await expect(sampleTxt).toBeVisible({ timeout: 5000 });
    await sampleTxt.click({ button: "right" });
    await expect(frame!.getByTestId("context-menu")).toBeVisible({ timeout: 2000 });
    await expect(frame!.getByRole("menuitem", { name: /delete/i })).toBeVisible();
    await expect(frame!.getByRole("menuitem", { name: /rename/i })).toBeVisible();
  });

  test("T-M5.3 — New Folder: right click blank, New Folder, enter name, folder appears", async ({
    page,
  }) => {
    await page.goto("/");
    const myComputer = page.getByRole("button", { name: /my computer/i });
    await myComputer.dblclick();

    const iframe = page.locator("iframe[src*='/apps/explorer']");
    await expect(iframe).toBeVisible({ timeout: 5000 });
    const frame = await iframe.contentFrame();
    expect(frame).toBeTruthy();

    await frame!.getByTestId("root-disk_c").dblclick();
    await frame!.getByTestId("item-My-Documents").dblclick();
    await expect(frame!.getByTestId("explorer-list")).toBeVisible({ timeout: 3000 });

    const folderName = "e2e-new-folder-" + Date.now();
    page.on("dialog", (d) => d.accept(folderName));

    await frame!.getByTestId("explorer-list").click({ button: "right" });
    await frame!.getByRole("menuitem", { name: /new folder/i }).click();

    await expect(frame!.getByTestId(`item-${folderName}`)).toBeVisible({ timeout: 5000 });
  });
});

test.describe("FP3 Explorer — M6: Security (user app deny)", () => {
  test("T-M6.1 — User app fetch api.shell.local -> denied (403)", async ({ page }) => {
    const responsePromise = page.waitForResponse(
      (r) => r.url().includes("api.shell.local") && r.status() === 403,
      { timeout: 15000 }
    );

    await page.goto("/");
    const myComputer = page.getByRole("button", { name: /my computer/i });
    await myComputer.dblclick();

    const iframe = page.locator("iframe[src*='/apps/explorer']");
    await expect(iframe).toBeVisible({ timeout: 5000 });
    const frame = await iframe.contentFrame();
    expect(frame).toBeTruthy();

    await frame!.getByTestId("root-disk_c").dblclick();
    await frame!.getByTestId("item-My-Documents").dblclick();
    await expect(frame!.getByTestId("explorer-list")).toBeVisible({ timeout: 3000 });

    const userAppItem = frame!
      .getByTestId("item-user-app-deny")
      .or(frame!.getByText("user-app-deny"));
    await expect(userAppItem).toBeVisible({ timeout: 5000 });
    await userAppItem.dblclick();

    const res = await responsePromise;
    expect(res.status()).toBe(403);
  });
});
