/**
 * FP7 Context Menu — extended tests: positioning, Tree disabled, RBAC, mkdir, system roots.
 * @see docs/fps/FP7.md — AC-CM1–AC-CM16, TC-CM1–TC-CM20
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen, fireEvent, waitFor, within } from "@testing-library/react";
import { renderWithContextMenu, renderShell } from "@/test/utils";
import { DesktopPage } from "@/pages/DesktopPage";
import { ExplorerWindow } from "@/components/ExplorerWindow";
import { vfs } from "@/os/fs/VirtualFileSystem";
import { resetVFSForTest } from "@/test/utils/vfs-test-utils";
import { mockApi } from "@/test/mocks/mockApi";
import { computeContextMenuPosition } from "@/os/ui/ContextMenu";

vi.mock("@/os/wm/WindowManager", () => ({
  WindowManager: () => <div>WindowManager</div>,
}));

vi.mock("@/os/wm/WindowRegistry", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/os/wm/WindowRegistry")>();
  return {
    ...actual,
    useWindowRegistry: () => ({ openWindow: vi.fn(), closeWindow: vi.fn(), focusWindow: vi.fn() }),
  };
});

describe("Context Menu — positioning (AC-CM1)", () => {
  it("computeContextMenuPosition flips left when overflow right", () => {
    const result = computeContextMenuPosition(900, 100, 150, 200, new DOMRect(0, 0, 1000, 800));
    expect(result.x).toBeLessThan(900);
    expect(result.x).toBe(750); // 900 - 150
  });

  it("computeContextMenuPosition flips up when overflow bottom", () => {
    const result = computeContextMenuPosition(100, 700, 150, 200, new DOMRect(0, 0, 1000, 800));
    expect(result.y).toBeLessThan(700);
    expect(result.y).toBe(500); // 700 - 200 (flip up), within bounds
  });

  it("computeContextMenuPosition stays within viewport bounds", () => {
    const result = computeContextMenuPosition(50, 50, 150, 200, new DOMRect(0, 0, 1000, 800));
    expect(result.x).toBeGreaterThanOrEqual(0);
    expect(result.y).toBeGreaterThanOrEqual(0);
    expect(result.x + 150).toBeLessThanOrEqual(1000);
    expect(result.y + 200).toBeLessThanOrEqual(800);
  });
});

describe("Context Menu — Tree view disabled (AC-CM12)", () => {
  beforeEach(() => {
    resetVFSForTest();
    if (mockApi && typeof mockApi.reset === "function") {
      mockApi.reset();
      mockApi.setupDefaults();
    }
    mockApi.authMe({ role: "Organizer" });
    mockApi.vfsList({
      '/': [{ name: 'Disk A', type: 'dir' }, { name: 'Disk B', type: 'dir' }, { name: 'Disk C', type: 'dir' }],
      '/Disk C': [{ name: 'desktop', type: 'dir' }, { name: 'documents', type: 'dir' }],
      '/Disk C/documents': [{ name: 'TestFolder', type: 'dir' }],
    });
    mockApi.vfsRead({});
    vfs.setUserRole("Organizer");
  });

  it("right-click on Tree view does not open context menu", async () => {
    renderWithContextMenu(<ExplorerWindow />);

    await waitFor(() => {
      expect(screen.getByTestId("explorer-tree")).toBeInTheDocument();
    });

    const treeView = screen.getByTestId("explorer-tree");
    const treeItem = within(treeView).getByTestId("tree-item-/Disk C");
    fireEvent.contextMenu(treeItem);

    // Menu should NOT appear (Tree view context menu is disabled)
    await waitFor(
      () => {
        expect(screen.queryByTestId("context-menu")).not.toBeInTheDocument();
      },
      { timeout: 500 }
    );
  });
});

describe("Context Menu — RBAC system roots (AC-CM10)", () => {
  beforeEach(() => {
    resetVFSForTest();
    if (mockApi && typeof mockApi.reset === "function") {
      mockApi.reset();
      mockApi.setupDefaults();
    }
    mockApi.authMe({ role: "Organizer" });
    mockApi.vfsList({
      '/': [{ name: 'Disk A', type: 'dir' }, { name: 'Disk B', type: 'dir' }, { name: 'Disk C', type: 'dir' }],
      '/Disk C': [{ name: 'desktop', type: 'dir' }, { name: 'documents', type: 'dir' }],
      '/Disk C/documents': [{ name: 'TestFolder', type: 'dir' }, { name: 'file.txt', type: 'file' }],
    });
    mockApi.vfsRead({});
    vfs.setUserRole("Organizer");
  });

  it("right-click on /Disk C in grid shows no Delete/Rename/Move (system root)", async () => {
    renderWithContextMenu(<ExplorerWindow />);

    await waitFor(() => {
      expect(screen.getByTestId("explorer-address-input")).toBeInTheDocument();
    });

    // Navigate to root (click My Computer)
    const treeView = screen.getByTestId("explorer-tree");
    fireEvent.click(within(treeView).getByTestId("tree-item-/"));

    await waitFor(() => {
      expect(screen.getByTestId("explorer-address-input")).toHaveTextContent("My Computer");
    });

    // Right-click on Disk C (system root)
    const diskCItem = within(screen.getByTestId("explorer-grid")).getByTestId(
      "explorer-grid-item-/Disk C"
    );
    fireEvent.contextMenu(diskCItem);

    await waitFor(() => {
      const menu = screen.getByTestId("context-menu");
      expect(menu).toBeInTheDocument();
      // Delete, Rename, Move should NOT be present for system root
      expect(screen.queryByTestId("context-item-delete")).not.toBeInTheDocument();
      expect(screen.queryByTestId("context-item-rename")).not.toBeInTheDocument();
      expect(screen.queryByTestId("context-item-move")).not.toBeInTheDocument();
      expect(screen.getByTestId("context-item-refresh")).toBeInTheDocument();
    });
  });

  it("right-click on subfolder shows Delete/Rename/Move (organizer)", async () => {
    renderWithContextMenu(<ExplorerWindow />);

    await waitFor(() => {
      expect(screen.getByTestId("explorer-address-input")).toBeInTheDocument();
    });

    const treeView = screen.getByTestId("explorer-tree");
    fireEvent.click(within(treeView).getByTestId("tree-item-/Disk C"));
    await waitFor(() => {
      expect(screen.getByTestId("explorer-grid-item-/Disk C/documents")).toBeInTheDocument();
    });
    const documentsFolder = within(screen.getByTestId("explorer-grid")).getByTestId(
      "explorer-grid-item-/Disk C/documents"
    );
    fireEvent.doubleClick(documentsFolder);

    await waitFor(() => {
      expect(screen.getByTestId("explorer-address-input")).toHaveTextContent("/Disk C/documents");
    });

    const testFolder = within(screen.getByTestId("explorer-grid")).getByTestId(
      "explorer-grid-item-/Disk C/documents/TestFolder"
    );
    fireEvent.contextMenu(testFolder);

    await waitFor(() => {
      expect(screen.getByTestId("context-item-delete")).toBeInTheDocument();
      expect(screen.getByTestId("context-item-rename")).toBeInTheDocument();
      expect(screen.getByTestId("context-item-move")).toBeInTheDocument();
      expect(screen.getByTestId("context-item-refresh")).toBeInTheDocument();
    });
  });
});

describe("Context Menu — click-outside (AC-CM3)", () => {
  beforeEach(() => {
    resetVFSForTest();
    if (mockApi && typeof mockApi.reset === "function") {
      mockApi.reset();
      mockApi.setupDefaults();
    }
    mockApi.authMe({ role: "Organizer" });
    mockApi.vfsList({ '/Disk C/desktop': [{ name: 'help.txt', type: 'file' }] });
    mockApi.vfsRead({});
    vfs.setUserRole("Organizer");
  });

  it("click outside closes context menu", async () => {
    const tokenPayload = btoa(
      JSON.stringify({ userId: "123", email: "test@example.com", login: "testuser", role: "Organizer" })
    );
    localStorage.setItem("birdmaid_token", `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${tokenPayload}.test`);

    renderShell(<DesktopPage />);

    await waitFor(() => {
      expect(screen.getByTestId("desktop-root")).toBeInTheDocument();
    });

    fireEvent.contextMenu(screen.getByTestId("desktop-root"));

    await waitFor(() => {
      expect(screen.getByTestId("context-menu")).toBeInTheDocument();
    });

    // Click outside (on document body)
    fireEvent.mouseDown(document.body);

    await waitFor(() => {
      expect(screen.queryByTestId("context-menu")).not.toBeInTheDocument();
    });
  });
});
