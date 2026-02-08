import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen, fireEvent, waitFor, within } from "@testing-library/react";
import { renderShell } from "@/test/utils";
import { DesktopPage } from "@/pages/DesktopPage";
import { vfs } from "@/os/fs/VirtualFileSystem";
import { resetVFSForTest } from "@/test/utils/vfs-test-utils";
import { mockApi } from "@/test/mocks/mockApi";
vi.mock("@/os/wm/WindowManager", () => ({
  WindowManager: () => <div>WindowManager</div>,
}));

describe("Desktop Context Menu", () => {
  beforeEach(() => {
    resetVFSForTest();
    localStorage.clear();
    if (mockApi && typeof mockApi.reset === "function") {
      mockApi.reset();
      mockApi.setupDefaults();
    }
    mockApi.authMe({ role: "Organizer" });
    mockApi.vfsList({
      '/Disk C/desktop': [
        { name: 'readme.txt', type: 'file' },
        { name: 'My Computer.url', type: 'file' },
      ],
    });
    mockApi.vfsRead({
      '/Disk C/desktop/My Computer.url': JSON.stringify({ type: "link", label: "My Computer", target: "explorer" }),
    });
    vfs.setUserRole("Organizer");
  });

  it("right-click desktop-root shows context menu", async () => {
    const tokenPayload = btoa(JSON.stringify({ userId: "123", email: "test@example.com", login: "testuser", role: "Organizer" }));
    localStorage.setItem("birdmaid_token", `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${tokenPayload}.test`);

    renderShell(<DesktopPage />);

    await waitFor(() => {
      expect(screen.getByTestId("desktop-root")).toBeInTheDocument();
    });

    const desktopRoot = screen.getByTestId("desktop-root");
    fireEvent.contextMenu(desktopRoot);

    await waitFor(() => {
      const menu = screen.getByTestId("context-menu");
      expect(menu).toBeInTheDocument();
      expect(screen.getByTestId("context-item-new-folder")).toBeInTheDocument();
      expect(screen.getByTestId("context-item-refresh")).toBeInTheDocument();
    });
  });

  it("Guest right-click desktop does not show New Folder or Upload", async () => {
    vfs.setUserRole("Guest");
    renderShell(<DesktopPage />);

    await waitFor(() => {
      expect(screen.getByTestId("desktop-root")).toBeInTheDocument();
    });

    fireEvent.contextMenu(screen.getByTestId("desktop-root"));

    await waitFor(() => {
      const menu = screen.getByTestId("context-menu");
      expect(menu).toBeInTheDocument();
      expect(screen.queryByTestId("context-item-new-folder")).not.toBeInTheDocument();
      expect(screen.queryByTestId("context-item-upload")).not.toBeInTheDocument();
      expect(screen.getByTestId("context-item-refresh")).toBeInTheDocument();
    });
  });

  it("right-click desktop icon shows item menu (Delete, Rename, Move, Refresh for Organizer)", async () => {
    const tokenPayload = btoa(JSON.stringify({ userId: "123", email: "test@example.com", login: "testuser", role: "Organizer" }));
    localStorage.setItem("birdmaid_token", `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${tokenPayload}.test`);

    renderShell(<DesktopPage />);

    await waitFor(() => {
      const icon = within(screen.getByTestId("desktop-icons")).getByTestId(
        "desktop-icon-/Disk C/desktop/readme.txt"
      );
      expect(icon).toBeInTheDocument();
    });

    const icon = within(screen.getByTestId("desktop-icons")).getByTestId(
      "desktop-icon-/Disk C/desktop/readme.txt"
    );
    fireEvent.contextMenu(icon);

    await waitFor(() => {
      const menu = screen.getByTestId("context-menu");
      expect(menu).toBeInTheDocument();
      expect(screen.getByTestId("context-item-delete")).toBeInTheDocument();
      expect(screen.getByTestId("context-item-rename")).toBeInTheDocument();
      expect(screen.getByTestId("context-item-move")).toBeInTheDocument();
      expect(screen.getByTestId("context-item-refresh")).toBeInTheDocument();
    });
  });

  it("right-click system entry (help.txt) shows only Refresh for Organizer", async () => {
    const tokenPayload = btoa(JSON.stringify({ userId: "123", email: "test@example.com", login: "testuser", role: "Organizer" }));
    localStorage.setItem("birdmaid_token", `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${tokenPayload}.test`);

    renderShell(<DesktopPage />);

    await waitFor(() => {
      const icon = within(screen.getByTestId("desktop-icons")).getByTestId(
        "desktop-icon-/Disk C/desktop/help.txt"
      );
      expect(icon).toBeInTheDocument();
    });

    const icon = within(screen.getByTestId("desktop-icons")).getByTestId(
      "desktop-icon-/Disk C/desktop/help.txt"
    );
    fireEvent.contextMenu(icon);

    await waitFor(() => {
      const menu = screen.getByTestId("context-menu");
      expect(menu).toBeInTheDocument();
      expect(screen.queryByTestId("context-item-delete")).not.toBeInTheDocument();
      expect(screen.queryByTestId("context-item-rename")).not.toBeInTheDocument();
      expect(screen.queryByTestId("context-item-move")).not.toBeInTheDocument();
      expect(screen.getByTestId("context-item-refresh")).toBeInTheDocument();
    });
  });

  it("Escape closes desktop context menu", async () => {
    renderShell(<DesktopPage />);
    fireEvent.contextMenu(screen.getByTestId("desktop-root"));

    await waitFor(() => {
      expect(screen.getByTestId("context-menu")).toBeInTheDocument();
    });

    fireEvent.keyDown(document, { key: "Escape" });

    await waitFor(() => {
      expect(screen.queryByTestId("context-menu")).not.toBeInTheDocument();
    });
  });
});
