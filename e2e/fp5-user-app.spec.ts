/**
 * FP5 M1: User app launch E2E (L1).
 * Double click user app package => Shell creates window with hosted route src.
 *
 * RED: Shell currently uses open-url (signed URL), not /apps/user/?path=
 */

import { test, expect } from "@playwright/test";

function pathToTestId(path: string): string {
  return (
    "item-" +
    path
      .replace(/\//g, "_")
      .replace(/\s/g, "_")
      .replace(/[^a-zA-Z0-9_-]/g, "_")
  );
}

test.describe("FP5 User App Launch (L1)", () => {
  test("L1: double click user app => iframe src contains /apps/user/?path=", async ({ page }) => {
    await page.goto("/");
    const myComputer = page.getByRole("button", { name: /my computer/i });
    await myComputer.dblclick();

    const iframe = page.locator("iframe[src*='/apps/explorer']");
    await expect(iframe).toBeVisible({ timeout: 5000 });
    const frame = await iframe.contentFrame();
    expect(frame).toBeTruthy();

    await frame!.getByTestId("root-disk_c").dblclick();
    await expect(frame!.getByTestId("explorer-list")).toBeVisible({ timeout: 5000 });

    await frame!.getByTestId(pathToTestId("/@root/DISK_C/My Documents/")).dblclick();
    await expect(frame!.getByTestId("explorer-list")).toBeVisible({ timeout: 3000 });

    await frame!.getByTestId(pathToTestId("/@root/DISK_C/My Documents/sample-app/")).dblclick();

    const appIframe = page.locator("iframe[src*='/apps/user/']").first();
    await expect(appIframe).toBeVisible({ timeout: 8000 });
    const src = await appIframe.getAttribute("src");
    expect(src).toBeTruthy();
    expect(src).toContain("/apps/user/");
    expect(src).toContain("path=");
  });
});
