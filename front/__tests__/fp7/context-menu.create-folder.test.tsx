/**
 * FP7 Context Menu — Create folder flow tests.
 * @see docs/fps/FP7.md — Create folder, AC-CM7, AC-CM8
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen, fireEvent, waitFor, within } from "@testing-library/react";
import { renderShell, renderWithContextMenu } from "@/test/utils";
import { DesktopPage } from "@/pages/DesktopPage";
import { ExplorerWindow } from "@/components/ExplorerWindow";
import { vfs } from "@/os/fs/VirtualFileSystem";
import { resetVFSForTest } from "@/test/utils/vfs-test-utils";
import { mockApi } from "@/test/mocks/mockApi";

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

const desktopItems: Record<string, { name: string; type: "file" | "dir" }[]> = {
  '/Disk C/desktop': [{ name: 'help.txt', type: 'file' }],
};

describe("Create folder — opens MkdirDialog", () => {
  beforeEach(() => {
    resetVFSForTest();
    localStorage.clear();
    if (mockApi && typeof mockApi.reset === "function") {
      mockApi.reset();
      mockApi.setupDefaults();
    }
    mockApi.authMe({ role: "Organizer" });
    mockApi.vfsMkdir();
    desktopItems['/Disk C/desktop'] = [{ name: 'help.txt', type: 'file' }];
    mockApi.vfsList(desktopItems);
    mockApi.vfsRead({});
    vfs.setUserRole("Organizer");
  });

  it("Create folder from Desktop opens MkdirDialog", async () => {
    const tokenPayload = btoa(JSON.stringify({ userId: "123", email: "test@example.com", login: "testuser", role: "Organizer" }));
    localStorage.setItem("birdmaid_token", `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${tokenPayload}.test`);

    renderShell(<DesktopPage />);

    await waitFor(() => expect(screen.getByTestId("desktop-root")).toBeInTheDocument());

    fireEvent.contextMenu(screen.getByTestId("desktop-root"));

    await waitFor(() => expect(screen.getByTestId("context-menu")).toBeInTheDocument());

    fireEvent.mouseDown(screen.getByTestId("context-item-new-folder"));

    await waitFor(() => {
      expect(screen.getByTestId("mkdir-dialog")).toBeInTheDocument();
      expect(screen.getByTestId("mkdir-input")).toBeInTheDocument();
    });
  });

  it("Create folder from Explorer empty area opens MkdirDialog", async () => {
    mockApi.vfsList({
      '/': [{ name: 'Disk A', type: 'dir' }, { name: 'Disk B', type: 'dir' }, { name: 'Disk C', type: 'dir' }],
      '/Disk C': [{ name: 'desktop', type: 'dir' }, { name: 'images', type: 'dir' }, { name: 'videos', type: 'dir' }, { name: 'documents', type: 'dir' }],
      '/Disk C/documents': [{ name: 'TestFolder', type: 'dir' }],
    });
    mockApi.vfsRead({});
    vfs.setUserRole("Organizer");

    renderWithContextMenu(<ExplorerWindow />);

    await waitFor(() => expect(screen.getByTestId("explorer-address-input")).toBeInTheDocument());

    const treeView = screen.getByTestId("explorer-tree");
    fireEvent.click(within(treeView).getByTestId("tree-item-/Disk C"));
    await waitFor(() => {
      expect(screen.getByTestId("explorer-grid-item-/Disk C/documents")).toBeInTheDocument();
    });
    const documentsFolder = within(screen.getByTestId("explorer-grid")).getByTestId(
      "explorer-grid-item-/Disk C/documents"
    );
    fireEvent.doubleClick(documentsFolder);

    await waitFor(() => expect(screen.getByTestId("explorer-address-input")).toHaveTextContent("/Disk C/documents"));

    const grid = screen.getByTestId("explorer-grid");
    fireEvent.contextMenu(grid);

    await waitFor(() => expect(screen.getByTestId("context-menu")).toBeInTheDocument());

    fireEvent.mouseDown(screen.getByTestId("context-item-new-folder"));

    await waitFor(() => {
      expect(screen.getByTestId("mkdir-dialog")).toBeInTheDocument();
      expect(screen.getByTestId("mkdir-input")).toBeInTheDocument();
    });
  });
});

describe("Create folder — successful mkdir", () => {
  beforeEach(() => {
    resetVFSForTest();
    localStorage.clear();
    if (mockApi && typeof mockApi.reset === "function") {
      mockApi.reset();
      mockApi.setupDefaults();
    }
    mockApi.authMe({ role: "Organizer" });
    mockApi.vfsMkdir();
    desktopItems['/Disk C/desktop'] = [{ name: 'help.txt', type: 'file' }];
    mockApi.vfsList(desktopItems);
    mockApi.vfsRead({});
    vfs.setUserRole("Organizer");
  });

  it("successful mkdir creates folder and refreshes Desktop", async () => {
    const tokenPayload = btoa(JSON.stringify({ userId: "123", email: "test@example.com", login: "testuser", role: "Organizer" }));
    localStorage.setItem("birdmaid_token", `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${tokenPayload}.test`);

    renderShell(<DesktopPage />);

    await waitFor(() => expect(screen.getByTestId("desktop-root")).toBeInTheDocument());

    fireEvent.contextMenu(screen.getByTestId("desktop-root"));
    await waitFor(() => expect(screen.getByTestId("context-menu")).toBeInTheDocument());
    fireEvent.mouseDown(screen.getByTestId("context-item-new-folder"));

    await waitFor(() => expect(screen.getByTestId("mkdir-dialog")).toBeInTheDocument());

    const input = screen.getByTestId("mkdir-input");
    fireEvent.change(input, { target: { value: "New Folder" } });
    fireEvent.click(screen.getByTestId("mkdir-ok"));

    await waitFor(() => {
      expect(screen.queryByTestId("mkdir-dialog")).not.toBeInTheDocument();
    });

    // Backend-only: mkdir went to API; Desktop refetches and shows new folder
    desktopItems['/Disk C/desktop'].push({ name: 'New Folder', type: 'dir' });
    window.dispatchEvent(new CustomEvent('vfs:invalidated', { detail: { path: '/Disk C/desktop' } }));
    await waitFor(() => {
      expect(screen.getByTestId('desktop-icon-/Disk C/desktop/New Folder')).toBeInTheDocument();
    }, { timeout: 2000 });
  });
});

describe("Create folder — 409 shows MessageBox", () => {
  beforeEach(() => {
    resetVFSForTest();
    localStorage.clear();
    if (mockApi && typeof mockApi.reset === "function") {
      mockApi.reset();
      mockApi.setupDefaults();
    }
    mockApi.authMe({ role: "Organizer" });
    mockApi.vfsMkdir({ existingPaths: ["/Disk C/desktop/Existing"] });
    mockApi.vfsList({ '/Disk C/desktop': [{ name: 'help.txt', type: 'file' }] });
    mockApi.vfsRead({});
    vfs.setUserRole("Organizer");
  });

  it("409 conflict shows Win95 message box", async () => {
    const tokenPayload = btoa(JSON.stringify({ userId: "123", email: "test@example.com", login: "testuser", role: "Organizer" }));
    localStorage.setItem("birdmaid_token", `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${tokenPayload}.test`);

    renderShell(<DesktopPage />);

    await waitFor(() => expect(screen.getByTestId("desktop-root")).toBeInTheDocument());

    fireEvent.contextMenu(screen.getByTestId("desktop-root"));
    await waitFor(() => expect(screen.getByTestId("context-menu")).toBeInTheDocument());
    fireEvent.mouseDown(screen.getByTestId("context-item-new-folder"));

    await waitFor(() => expect(screen.getByTestId("mkdir-dialog")).toBeInTheDocument());

    const input = screen.getByTestId("mkdir-input");
    fireEvent.change(input, { target: { value: "Existing" } });
    fireEvent.click(screen.getByTestId("mkdir-ok"));

    await waitFor(() => {
      expect(screen.getByTestId("win95-message-box")).toBeInTheDocument();
      expect(screen.getByText("A file with that name already exists.")).toBeInTheDocument();
    });
  });
});

describe("Create folder — 403 shows MessageBox", () => {
  beforeEach(() => {
    resetVFSForTest();
    localStorage.clear();
    if (mockApi && typeof mockApi.reset === "function") {
      mockApi.reset();
      mockApi.setupDefaults();
    }
    mockApi.authMe({ role: "Organizer" });
    mockApi.vfsMkdir({ reject403: true });
    mockApi.vfsList({ '/Disk C/desktop': [{ name: 'help.txt', type: 'file' }] });
    mockApi.vfsRead({});
    vfs.setUserRole("Organizer");
  });

  it("403 permission shows permission message", async () => {
    const tokenPayload = btoa(JSON.stringify({ userId: "123", email: "test@example.com", login: "testuser", role: "Organizer" }));
    localStorage.setItem("birdmaid_token", `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${tokenPayload}.test`);

    renderShell(<DesktopPage />);

    await waitFor(() => expect(screen.getByTestId("desktop-root")).toBeInTheDocument());

    fireEvent.contextMenu(screen.getByTestId("desktop-root"));
    await waitFor(() => expect(screen.getByTestId("context-menu")).toBeInTheDocument());
    fireEvent.mouseDown(screen.getByTestId("context-item-new-folder"));

    await waitFor(() => expect(screen.getByTestId("mkdir-dialog")).toBeInTheDocument());

    const input = screen.getByTestId("mkdir-input");
    fireEvent.change(input, { target: { value: "New Folder" } });
    fireEvent.click(screen.getByTestId("mkdir-ok"));

    await waitFor(() => {
      expect(screen.getByTestId("win95-message-box")).toBeInTheDocument();
      expect(screen.getByText("You do not have permission to create folders here.")).toBeInTheDocument();
    });
  });
});
