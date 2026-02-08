/**
 * Explorer context menu tests.
 * Target path comes from ExplorerWindow.currentPath.
 * @see docs/fps/FP7.md — Context Menu
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen, fireEvent, waitFor, within } from "@testing-library/react";
import { renderWithContextMenu } from "@/test/utils";
import { ExplorerWindow } from "@/components/ExplorerWindow";
import { vfs } from "@/os/fs/VirtualFileSystem";
import { resetVFSForTest } from "@/test/utils/vfs-test-utils";
import { mockApi } from "@/test/mocks/mockApi";

vi.mock("@/os/wm/WindowRegistry", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/os/wm/WindowRegistry")>();
  return {
    ...actual,
    useWindowRegistry: () => ({ openWindow: vi.fn(), closeWindow: vi.fn(), focusWindow: vi.fn() }),
  };
});

describe("Explorer context menu", () => {
  beforeEach(() => {
    resetVFSForTest();
    if (mockApi && typeof mockApi.reset === "function") {
      mockApi.reset();
      mockApi.setupDefaults?.();
    }
    mockApi.authMe({ role: "Organizer" });
    mockApi.vfsList({
      '/': [{ name: 'Disk A', type: 'dir' }, { name: 'Disk B', type: 'dir' }, { name: 'Disk C', type: 'dir' }],
      '/Disk C': [{ name: 'desktop', type: 'dir' }, { name: 'documents', type: 'dir' }],
      '/Disk C/documents': [],
    });
    mockApi.vfsRead({});
    vfs.setUserRole("Organizer");
  });

  it("right-click on grid background opens menu with targetPath from current path", async () => {
    renderWithContextMenu(<ExplorerWindow />);

    await waitFor(() => {
      expect(screen.getByTestId("explorer-grid-item-/Disk C")).toBeInTheDocument();
    });

    fireEvent.click(within(screen.getByTestId("explorer-tree")).getByTestId("tree-item-/Disk C"));
    await waitFor(() => {
      expect(screen.getByTestId("explorer-grid-item-/Disk C/documents")).toBeInTheDocument();
    });

    fireEvent.contextMenu(screen.getByTestId("explorer-grid"));

    await waitFor(() => {
      const menu = screen.getByTestId("context-menu");
      expect(menu).toBeInTheDocument();
      expect(menu.closest('[data-target-path]')).toHaveAttribute("data-target-path", "/Disk C");
    });
  });
});
