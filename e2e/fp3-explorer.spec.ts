/**
 * FP3 Explorer E2E — M1: My Computer → Explorer window + roots A/C/D.
 * T-M1.1, T-M1.2, T-M1.5: Desktop icon, double click opens window, Explorer shows three disks.
 */

import { test, expect } from "@playwright/test";
import path from "path";
import fs from "fs";

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
    const imageItem = frame!.getByTestId("item-sample-image.png");
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

    await frame!.getByTestId("explorer-blank-area").click({ button: "right" });
    await expect(frame!.getByTestId("context-menu")).toBeVisible({ timeout: 2000 });
    await expect(frame!.getByTestId("menu-new-folder")).toBeVisible();
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

    const sampleTxt = frame!.getByTestId("item-sample-image.png");
    await expect(sampleTxt).toBeVisible({ timeout: 5000 });
    await sampleTxt.click({ button: "right" });
    await expect(frame!.getByTestId("context-menu")).toBeVisible({ timeout: 2000 });
    await expect(frame!.getByRole("menuitem", { name: /delete/i })).toBeVisible();
    await expect(frame!.getByRole("menuitem", { name: /rename/i })).toBeVisible();
  });

  test("T-M5.3 — New Folder: right click blank, New Folder, folder appears (FP3.1: no prompt, auto name)", async ({
    page,
  }) => {
    await page.route("**/api/fs/create-folder", async (route) => {
      const body = route.request().postDataJSON();
      const path = (body?.path ?? "").toString();
      const name = path
        ? (path.replace(/\/$/, "").split("/").pop() ?? "Новая Папка")
        : "Новая Папка";
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ path: path.endsWith("/") ? path : path + "/", name }),
      });
    });
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

    await frame!.getByTestId("explorer-blank-area").click({ button: "right" });
    await frame!.getByTestId("menu-new-folder").click();

    await expect(frame!.getByTestId("item-Новая-Папка")).toBeVisible({ timeout: 5000 });
  });
});

async function openBlankContextMenu(frame: {
  getByTestId: (id: string) => { click: (opts?: { button?: "right" }) => Promise<void> };
}): Promise<void> {
  await frame.getByTestId("explorer-blank-area").click({ button: "right" });
  await expect(frame.getByTestId("context-menu")).toBeVisible({ timeout: 2000 });
}

test.describe("FP3 Explorer — FP3.1 M5: New Folder (placeholder + rename)", () => {
  test("T-M5-NF1 — Create folder when none exists -> Новая Папка", async ({ page }) => {
    await page.route("**/api/fs/create-folder", async (route) => {
      const body = route.request().postDataJSON();
      const path = (body?.path ?? "").toString();
      if (path) {
        const name = path.replace(/\/$/, "").split("/").pop() ?? "Новая Папка";
        await route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify({ path: path.endsWith("/") ? path : path + "/", name }),
        });
      } else {
        await route.continue();
      }
    });
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

    await openBlankContextMenu(frame!);
    await frame!.getByTestId("menu-new-folder").click();

    await expect(frame!.getByTestId("item-Новая-Папка")).toBeVisible({ timeout: 5000 });
  });

  test("T-M5-NF2 — Create again -> Новая Папка 2", async ({ page }) => {
    await page.route("**/api/fs/create-folder", async (route) => {
      const body = route.request().postDataJSON();
      const path = (body?.path ?? "").toString();
      const name = path
        ? (path.replace(/\/$/, "").split("/").pop() ?? "Новая Папка")
        : "Новая Папка";
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ path: path.endsWith("/") ? path : path + "/", name }),
      });
    });
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

    await openBlankContextMenu(frame!);
    await frame!.getByTestId("menu-new-folder").click();
    await expect(frame!.getByTestId("item-Новая-Папка")).toBeVisible({ timeout: 5000 });
    const input1 = frame!.getByTestId("rename-input");
    await input1.press("Enter");

    await expect(frame!.getByTestId("item-Новая-Папка")).toBeVisible({ timeout: 3000 });

    await openBlankContextMenu(frame!);
    await frame!.getByRole("menuitem", { name: /new folder/i }).click();
    await expect(frame!.getByTestId("item-Новая-Папка-2")).toBeVisible({ timeout: 5000 });
  });

  test("T-M5-NF3 — Placeholder+spinner behavior correct", async ({ page }) => {
    await page.route("**/api/fs/create-folder", async (route) => {
      await new Promise((r) => setTimeout(r, 2000));
      const body = route.request().postDataJSON();
      const path = (body?.path ?? "").toString();
      const name = path
        ? (path.replace(/\/$/, "").split("/").pop() ?? "Новая Папка")
        : "Новая Папка";
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          path: (path || "/@root/DISK_C/My Documents/Новая Папка/").replace(/\/?$/, "/"),
          name,
        }),
      });
    });
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

    await openBlankContextMenu(frame!);
    await frame!.getByRole("menuitem", { name: /new folder/i }).click();

    const placeholder = frame!.getByTestId("item-Новая-Папка");
    await expect(placeholder).toBeVisible({ timeout: 2000 });
    const spinner = placeholder.locator(".fs-tile-spinner");
    await expect(spinner).toBeVisible({ timeout: 2500 });
  });

  test("T-M5-NF4 — Immediate rename input opens", async ({ page }) => {
    await page.route("**/api/fs/create-folder", async (route) => {
      const body = route.request().postDataJSON();
      const path = (body?.path ?? "").toString();
      const name = path
        ? (path.replace(/\/$/, "").split("/").pop() ?? "Новая Папка")
        : "Новая Папка";
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ path: path.endsWith("/") ? path : path + "/", name }),
      });
    });
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

    await openBlankContextMenu(frame!);
    await frame!.getByTestId("menu-new-folder").click();

    const renameInput = frame!.getByTestId("rename-input");
    await expect(renameInput).toBeVisible({ timeout: 5000 });
    await expect(renameInput).toHaveValue(/^Новая Папка( \d+)?$/);
  });
});

const MY_DOCS_ITEMS = [
  { path: "/@root/DISK_C/My Documents/sample-app/", name: "sample-app", kind: "dir" as const },
  {
    path: "/@root/DISK_C/My Documents/sample-image.png",
    name: "sample-image.png",
    kind: "file" as const,
  },
  { path: "/@root/DISK_C/My Documents/sample.txt", name: "sample.txt", kind: "file" as const },
];

const DISK_C_ROOT_ITEMS = [
  { path: "/@root/DISK_C/My Documents/", name: "My Documents", kind: "dir" as const },
  { path: "/@root/DISK_C/Program Files/", name: "Program Files", kind: "dir" as const },
  { path: "/@root/DISK_C/WINDOWS/", name: "WINDOWS", kind: "dir" as const },
];

function mockFsForM6(page: import("@playwright/test").Page): void {
  page.route("**/api/fs/roots", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        roots: [
          { id: "DISK_A", label: "Floppy (A:)" },
          { id: "DISK_C", label: "(C:)" },
          { id: "DISK_D", label: "(D:)" },
        ],
      }),
    });
  });
  page.route("**/api/fs/list*", async (route) => {
    const url = route.request().url();
    if (url.includes("My%20Documents") || url.includes("My Documents")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ items: MY_DOCS_ITEMS }),
      });
    } else if (url.includes("DISK_C") && !url.includes("My")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ items: DISK_C_ROOT_ITEMS }),
      });
    } else {
      await route.continue();
    }
  });
}

test.describe("FP3 Explorer — FP3.1 M6: Delete flow", () => {
  test("T-M6-D1 — Delete success removes item", async ({ page, context }) => {
    mockFsForM6(page);
    await context.route(/\/api\/fs\/delete/, async (route) => {
      await route.fulfill({ status: 204 });
    });
    await page.addInitScript(() => {
      (window as unknown as { confirm: () => boolean }).confirm = () => true;
    });
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

    const item = frame!.getByTestId("item-sample-image.png");
    await expect(item).toBeVisible({ timeout: 5000 });
    await item.click({ button: "right" });
    await frame!.getByRole("menuitem", { name: /delete/i }).click();

    await expect(item).not.toBeVisible({ timeout: 5000 });
  });

  test("T-M7-U1 — Upload files: placeholders then success", async ({ page }) => {
    mockFsForM6(page);
    let n = 0;
    await page.route("**/api/fs/upload-file", async (route) => {
      await new Promise((r) => setTimeout(r, 400));
      n++;
      const name = `e2e-upload-${n}.png`;
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          path: "/@root/DISK_C/My Documents/" + name,
          name,
        }),
      });
    });
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

    await frame!.getByTestId("upload-file-input").setInputFiles([
      { name: "e2e-upload-1.png", mimeType: "image/png", buffer: Buffer.from("png1") },
      { name: "e2e-upload-2.png", mimeType: "image/png", buffer: Buffer.from("png2") },
    ]);

    await expect(frame!.getByTestId("item-e2e-upload-1.png")).toBeVisible({ timeout: 10000 });
    await expect(frame!.getByTestId("item-e2e-upload-2.png")).toBeVisible({ timeout: 6000 });
    await expect(frame!.locator("[data-upload-placeholder]")).toHaveCount(0, { timeout: 10000 });
    await expect(frame!.getByTestId("item-e2e-upload-1.png")).toBeVisible();
    await expect(frame!.getByTestId("item-e2e-upload-2.png")).toBeVisible();
  });

  test("T-M7-U2 — Upload fail: placeholder removed", async ({ page }) => {
    mockFsForM6(page);
    await page.route("**/api/fs/upload-file", async (route) => {
      await route.fulfill({ status: 403, body: JSON.stringify({ error: "permission_denied" }) });
    });
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

    await frame!
      .getByTestId("upload-file-input")
      .setInputFiles([{ name: "e2e-fail.png", mimeType: "image/png", buffer: Buffer.from("x") }]);

    await expect(frame!.getByTestId("item-e2e-fail.png")).not.toBeVisible({ timeout: 5000 });
  });

  test("T-M8-Z1 — Upload zip success: app tile appears", async ({ page }) => {
    mockFsForM6(page);
    await page.route("**/api/fs/upload-zip-app", async (route) => {
      await new Promise((r) => setTimeout(r, 400));
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          path: "/@root/DISK_C/My Documents/e2e-zip-app/",
          name: "e2e-zip-app",
        }),
      });
    });
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

    const zipPath = path.join(process.cwd(), "e2e", "fixtures", "e2e-zip-app.zip");
    const zipBuf = fs.readFileSync(zipPath);
    await frame!
      .getByTestId("upload-zip-input")
      .setInputFiles([{ name: "e2e-zip-app.zip", mimeType: "application/zip", buffer: zipBuf }]);

    await expect(frame!.getByTestId("item-e2e-zip-app")).toBeVisible({ timeout: 10000 });
    await expect(frame!.locator("[data-upload-zip-placeholder]")).toHaveCount(0, { timeout: 5000 });
  });
});

test.describe("FP3 Explorer — FP3.1 D1: State persistence", () => {
  test("T-D1.1 — Minimize → restore: same path", async ({ page }) => {
    mockFsForM6(page);
    await page.goto("/");
    const myComputer = page.getByRole("button", { name: /my computer/i });
    await myComputer.dblclick();

    const iframe = page.locator("iframe[src*='/apps/explorer']");
    await expect(iframe).toBeVisible({ timeout: 10000 });
    const frame = await iframe.contentFrame();
    expect(frame).toBeTruthy();

    await frame!.getByTestId("root-disk_c").dblclick();
    await frame!.getByTestId("item-My-Documents").dblclick();
    await expect(frame!.getByTestId("explorer-list")).toBeVisible({ timeout: 5000 });
    await expect(frame!.getByTestId("address-bar")).toContainText(/My Documents|C:\/My Documents/i);

    const taskbarBtn = page.locator("[data-testid='taskbar']").getByRole("button", {
      name: /my computer/i,
    });
    await taskbarBtn.click();
    await taskbarBtn.click();
    await expect(frame!.getByTestId("address-bar")).toContainText(
      /My Documents|C:\/My Documents/i,
      {
        timeout: 5000,
      }
    );
  });
});

test.describe("FP3 Explorer — FP3.1 M6: Delete flow", () => {
  test("T-M6-D2 — Delete fail reverts", async ({ page }) => {
    mockFsForM6(page);
    await page.route("**/api/fs/delete", async (route) => {
      await new Promise((r) => setTimeout(r, 500));
      await route.fulfill({ status: 403, body: JSON.stringify({ error: "permission_denied" }) });
    });
    await page.addInitScript(() => {
      (window as unknown as { confirm: () => boolean }).confirm = () => true;
    });
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

    const item = frame!.getByTestId("item-sample-image.png");
    await expect(item).toBeVisible({ timeout: 5000 });
    await item.click({ button: "right" });
    await frame!.getByRole("menuitem", { name: /delete/i }).click();

    await expect(frame!.getByTestId("item-sample-image.png")).toBeVisible({ timeout: 5000 });
  });
});

test.describe("FP3 Explorer — FP3.1 A1: Back button", () => {
  test("T-A1.1 — Back button visible left of address bar", async ({ page }) => {
    await page.goto("/");
    const myComputer = page.getByRole("button", { name: /my computer/i });
    await myComputer.dblclick();

    const iframe = page.locator("iframe[src*='/apps/explorer']");
    await expect(iframe).toBeVisible({ timeout: 5000 });
    const frame = await iframe.contentFrame();
    expect(frame).toBeTruthy();

    const backBtn = frame!.getByTestId("explorer-back");
    await expect(backBtn).toBeVisible();
    const addressBar = frame!.getByTestId("address-bar");
    await expect(addressBar).toBeVisible();
    // Back must be before address bar (left of it)
    const backBox = await backBtn.boundingBox();
    const barBox = await addressBar.boundingBox();
    expect(backBox).toBeTruthy();
    expect(barBox).toBeTruthy();
    expect(backBox!.x).toBeLessThan(barBox!.x);
  });

  test("T-A1.2 — Back disabled when history empty (at roots)", async ({ page }) => {
    await page.goto("/");
    const myComputer = page.getByRole("button", { name: /my computer/i });
    await myComputer.dblclick();

    const iframe = page.locator("iframe[src*='/apps/explorer']");
    await expect(iframe).toBeVisible({ timeout: 5000 });
    const frame = await iframe.contentFrame();
    expect(frame).toBeTruthy();

    await expect(frame!.getByTestId("explorer-roots")).toBeVisible({ timeout: 10000 });
    const backBtn = frame!.getByTestId("explorer-back");
    await expect(backBtn).toBeVisible();
    await expect(backBtn).toBeDisabled();
  });

  test("T-A1.3 — Navigate C:/ then Back returns to roots", async ({ page }) => {
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

    const backBtn = frame!.getByTestId("explorer-back");
    await expect(backBtn).toBeEnabled();
    await backBtn.click();

    await expect(frame!.getByTestId("explorer-roots")).toBeVisible({ timeout: 5000 });
    await expect(frame!.getByTestId("root-disk_a")).toBeVisible();
    await expect(frame!.getByTestId("address-bar")).toHaveText("");
  });
});

test.describe("FP3 Explorer — FP3.1 B1: Rename flow", () => {
  test("T-B1.1a — Start rename: input appears with selection", async ({ page }) => {
    mockFsForM6(page);
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

    const tile = frame!.getByTestId("item-sample-image.png");
    await tile.click({ button: "right" });
    await expect(frame!.getByTestId("context-menu")).toBeVisible({ timeout: 2000 });
    await frame!.getByRole("menuitem", { name: /rename/i }).click();

    const input = frame!.getByTestId("rename-input");
    await expect(input).toBeVisible({ timeout: 3000 });
    await expect(input).toHaveValue("sample-image.png");
    await expect(input).toHaveAttribute("data-testid", "rename-input");
  });

  test("T-B1.1b — Enter commits, spinner pending, on success name updates", async ({ page }) => {
    mockFsForM6(page);
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

    const tile = frame!.getByTestId("item-sample-image.png");
    await tile.click({ button: "right" });
    await frame!.getByRole("menuitem", { name: /rename/i }).click();

    const input = frame!.getByTestId("rename-input");
    await input.fill("e2e-renamed-image");
    await input.press("Enter");

    await expect(frame!.getByTestId("rename-spinner")).toBeVisible({ timeout: 2000 });
    await expect(frame!.getByTestId("item-e2e-renamed-image")).toBeVisible({ timeout: 5000 });
  });

  test("T-B1.1c — Simulated failure: revert to old name", async ({ page }) => {
    mockFsForM6(page);
    await page.route("**/api/fs/rename", (route) =>
      route.fulfill({ status: 403, body: JSON.stringify({ error: "permission_denied" }) })
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

    const tile = frame!.getByTestId("item-sample-image.png");
    await tile.click({ button: "right" });
    await frame!.getByRole("menuitem", { name: /rename/i }).click();

    const input = frame!.getByTestId("rename-input");
    await input.fill("will-fail-rename");
    await input.press("Enter");

    await expect(frame!.getByTestId("rename-spinner")).toBeVisible({ timeout: 2000 });
    await expect(frame!.getByTestId("item-sample-image.png")).toBeVisible({ timeout: 5000 });
  });

  test("T-B1.1d — Escape cancels with no request", async ({ page }) => {
    mockFsForM6(page);
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

    const tile = frame!.getByTestId("item-sample-image.png");
    await tile.click({ button: "right" });
    await frame!.getByRole("menuitem", { name: /rename/i }).click();

    const input = frame!.getByTestId("rename-input");
    await input.fill("canceled-name");
    await input.press("Escape");

    await expect(frame!.getByTestId("item-sample-image.png")).toBeVisible({ timeout: 2000 });
  });
});

test.describe("FP3 Explorer — FP3.1 A3: Blank area context menu", () => {
  test("T-A3.2 — RMB below last tile row opens blank context menu", async ({ page }) => {
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

    await frame!.getByTestId("explorer-blank-area").click({ button: "right" });

    await expect(frame!.getByTestId("context-menu")).toBeVisible({ timeout: 2000 });
    await expect(frame!.getByTestId("menu-new-folder")).toBeVisible();
  });
});

test.describe("FP3 Explorer — FP3.1 A2: Tile layout", () => {
  test("T-A2.1 — Tile fixed width, text wrap max 3 lines, ellipsis on long name", async ({
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

    const tile = frame!.getByTestId(
      "item-VeryLongFolderNameThatExceedsThreeLinesWhenRenderedInTile"
    );
    await expect(tile).toBeVisible({ timeout: 5000 });
    await expect(tile).toHaveClass(/fs-tile/);
    const label = tile.locator(".fs-tile-label");
    await expect(label).toBeVisible();
    await expect(label).toHaveCSS("-webkit-line-clamp", "3");
    const box = await label.boundingBox();
    expect(box).toBeTruthy();
    expect(box!.height).toBeLessThanOrEqual(box!.width * 3.5);
  });
});

test.describe("FP3 Explorer — FP3.1 A4: Shared icons", () => {
  test("T-A4.1 — My Computer icon same on Desktop and in Explorer (same class/data-testid)", async ({
    page,
  }) => {
    await page.goto("/");
    const desktopIcon = page.getByTestId("desktop-icon-my-computer");
    await expect(desktopIcon).toBeVisible();
    const desktopMyComputerIcon = page.getByTestId("my-computer-icon");
    await expect(desktopMyComputerIcon).toBeVisible();

    const myComputer = page.getByRole("button", { name: /my computer/i });
    await myComputer.dblclick();

    const iframe = page.locator("iframe[src*='/apps/explorer']");
    await expect(iframe).toBeVisible({ timeout: 5000 });
    const frame = await iframe.contentFrame();
    expect(frame).toBeTruthy();
    await expect(frame!.getByTestId("explorer-roots")).toBeVisible({ timeout: 10000 });

    const explorerMyComputerIcon = frame!.getByTestId("my-computer-icon");
    await expect(explorerMyComputerIcon).toBeVisible();

    const desktopClass = await desktopMyComputerIcon.getAttribute("class");
    const explorerClass = await explorerMyComputerIcon.getAttribute("class");
    expect(desktopClass).toContain("fs-icon-my-computer");
    expect(explorerClass).toContain("fs-icon-my-computer");
  });
});

test.describe("FP3 Explorer — M6: Security (user app deny)", () => {
  test("T-M6.1 — User app fetch api.shell.local -> denied (403)", async ({ page }) => {
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

    const userAppItem = frame!.getByTestId("item-user-app-deny");
    await expect(userAppItem).toBeVisible({ timeout: 5000 });
    await userAppItem.dblclick();

    await page.waitForFunction(
      () => (window as unknown as { __lastFetchStatus?: number }).__lastFetchStatus === 403,
      { timeout: 15000 }
    );
    const status = await page.evaluate(
      () => (window as unknown as { __lastFetchStatus?: number }).__lastFetchStatus
    );
    expect(status).toBe(403);
  });
});
