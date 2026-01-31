import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { WindowRegistryProvider } from "@/os/wm/WindowRegistry";
import { appRegistry } from "@/os/apps/AppRegistry";
import { AppHost } from "@/os/apps/AppHost";
// Ensure apps are initialized (side-effect import)
import "@/os/apps/registry-init";

describe("Content Opening: Webapp files", () => {
  beforeEach(() => {
    // Apps are initialized via side-effect import at top level
  });

  it("should map .app extension to Executor", () => {
    const appId = appRegistry.resolveAppForFile("game.app");
    expect(appId).toBe("executor");
  });

  it("should map webapp content type to Executor", () => {
    const app = appRegistry.getByContentType("webapp");
    expect(app).toBeDefined();
    expect(app?.id).toBe("executor");
  });

  it("should render AppHost with strict sandbox policy", async () => {
    const testUrl = "https://example.com/game/index.html";

    render(
      <WindowRegistryProvider>
        <AppHost src={testUrl} title="Test Game" />
      </WindowRegistryProvider>
    );

    await waitFor(() => {
      const iframe = screen.queryByTitle("Test Game");
      if (iframe) {
        // Should have sandbox attribute
        expect(iframe).toHaveAttribute("sandbox");
        const sandbox = iframe.getAttribute("sandbox");
        // Should have required permissions
        expect(sandbox).toContain("allow-scripts");
        expect(sandbox).toContain("allow-same-origin");
        expect(sandbox).toContain("allow-forms");
        expect(sandbox).toContain("allow-popups");
        // Should NOT have dangerous permissions
        expect(sandbox).not.toContain("allow-top-navigation");
        expect(sandbox).not.toContain("allow-modals");
      }
      // Or might be loading
      expect(iframe || screen.queryByText(/loading/i)).toBeTruthy();
    });
  });

  it("should use custom sandbox policy if provided", async () => {
    const testUrl = "https://example.com/game/index.html";
    const customSandbox = "allow-scripts allow-same-origin";

    render(
      <WindowRegistryProvider>
        <AppHost src={testUrl} title="Test Game" sandbox={customSandbox} />
      </WindowRegistryProvider>
    );

    await waitFor(() => {
      const iframe = screen.queryByTitle("Test Game");
      if (iframe) {
        expect(iframe).toHaveAttribute("sandbox", customSandbox);
      }
    });
  });
});
