/**
 * Context menu provider — global API for opening/closing platform context menu.
 * targetPath берётся ТОЛЬКО из ContextMenuContext. Запрещено использовать "global current directory".
 *
 * @see docs/fps/FP7.md — Context Menu (Right-Click) Product Contract
 * @see docs/style/GUIDE_STYLE.md — backend-only VFS rule
 */

import React, { createContext, useCallback, useContext, useState, ReactNode } from "react";
import { ContextMenu } from "./ContextMenu";
import type { ContextMenuItem } from "./ContextMenu";
import { getBoundsRect } from "./context-menu-utils";
import { useAuth } from "../../../contexts/AuthContext";
import { vfs } from "../../../os/fs/VirtualFileSystem";
import { MkdirDialog } from "./MkdirDialog";
import { vfsApiClient, notifyVfsChanged } from "../../../os/fs/VfsApiClient";

export type ContextMenuContext =
  | { owner: "desktop"; kind: "background"; targetPath: string }
  | { owner: "desktop"; kind: "item"; targetPath: string; itemPath: string }
  | { owner: "explorer"; kind: "grid-background"; windowId: string; targetPath: string }
  | {
      owner: "explorer";
      kind: "grid-item";
      windowId: string;
      targetPath: string;
      itemPath: string;
      itemType?: "file" | "dir";
    };

type ContextMenuState = {
  open: boolean;
  context: ContextMenuContext | null;
  x: number;
  y: number;
};

type ContextMenuContextType = {
  openContextMenu: (context: ContextMenuContext, x: number, y: number) => void;
  closeContextMenu: () => void;
};

const SYSTEM_ROOTS = ["/Disk A", "/Disk B", "/Disk C"];

const SYSTEM_DESKTOP_ENTRIES = ["/Disk C/desktop/my-computer", "/Disk C/desktop/help.txt", "/Disk C/desktop/admin_help.txt"];

function isSystemRoot(path: string): boolean {
  return SYSTEM_ROOTS.includes(path);
}

function isSystemDesktopEntry(path: string): boolean {
  return SYSTEM_DESKTOP_ENTRIES.includes(path);
}

const ContextMenuStateContext = createContext<ContextMenuContextType | undefined>(undefined);

function buildContextMenuItems(
  context: ContextMenuContext | null,
  role: "Guest" | "Participant" | "Organizer",
  openMkdirDialog: (targetPath: string) => void
): ContextMenuItem[] {
  const isOrganizer = role === "Organizer";

  if (!context) return [];

  if (context.owner === "desktop") {
    if (context.kind === "background") {
      const items: ContextMenuItem[] = [];
      if (isOrganizer) {
        items.push({
          id: "new-folder",
          label: "Create folder",
          onSelect: () => openMkdirDialog(context.targetPath),
        });
        items.push({ id: "upload", label: "Upload file", onSelect: () => {} });
      }
      items.push({ id: "refresh", label: "Refresh", onSelect: () => {} });
      return items;
    }
    if (context.kind === "item") {
      const items: ContextMenuItem[] = [];
      if (isOrganizer && !isSystemRoot(context.itemPath) && !isSystemDesktopEntry(context.itemPath)) {
        items.push({ id: "delete", label: "Delete", onSelect: () => {} });
        items.push({ id: "rename", label: "Rename", onSelect: () => {} });
        items.push({ id: "move", label: "Move", onSelect: () => {} });
      }
      items.push({ id: "refresh", label: "Refresh", onSelect: () => {} });
      return items;
    }
  }

  if (context.owner === "explorer") {
    if (context.kind === "grid-background") {
      const items: ContextMenuItem[] = [];
      if (isOrganizer) {
        items.push({
          id: "new-folder",
          label: "Create folder",
          onSelect: () => openMkdirDialog(context.targetPath),
        });
        items.push({ id: "upload", label: "Upload file", onSelect: () => {} });
      }
      items.push({ id: "refresh", label: "Refresh", onSelect: () => {} });
      return items;
    }

    if (context.kind === "grid-item") {
      const items: ContextMenuItem[] = [];
      if (isOrganizer && !isSystemRoot(context.itemPath)) {
        items.push({ id: "delete", label: "Delete", onSelect: () => {} });
        items.push({ id: "rename", label: "Rename", onSelect: () => {} });
        items.push({ id: "move", label: "Move", onSelect: () => {} });
      }
      items.push({ id: "refresh", label: "Refresh", onSelect: () => {} });
      return items;
    }
  }

  return [];
}

export function ContextMenuProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const role = (user?.role ?? vfs.getUserRole() ?? "Guest") as "Guest" | "Participant" | "Organizer";

  const [state, setState] = useState<ContextMenuState>({
    open: false,
    context: null,
    x: 0,
    y: 0,
  });

  const [mkdirDialogOpen, setMkdirDialogOpen] = useState(false);
  const [mkdirDialogTargetPath, setMkdirDialogTargetPath] = useState("");

  const openContextMenu = useCallback((context: ContextMenuContext, x: number, y: number) => {
    setState({ open: true, context, x, y });
  }, []);

  const closeContextMenu = useCallback(() => {
    setState((prev) => ({ ...prev, open: false }));
  }, []);

  const openMkdirDialog = useCallback((targetPath: string) => {
    closeContextMenu();
    setMkdirDialogTargetPath(targetPath === "My Computer" ? "/" : targetPath);
    setMkdirDialogOpen(true);
  }, [closeContextMenu]);

  const handleMkdirConfirm = useCallback(async (fullPath: string) => {
    await vfsApiClient.mkdir(fullPath);
    const parentPath = fullPath.replace(/\/[^/]+$/, "") || "/";
    notifyVfsChanged(parentPath);
    window.dispatchEvent(new CustomEvent("vfs:invalidated", { detail: { path: parentPath } }));
  }, []);

  const items = buildContextMenuItems(state.context, role, openMkdirDialog);
  const containerRect = state.open ? getBoundsRect() : null;

  const contextForMenu: import("./ContextMenu").ContextMenuContextLike | null =
    state.context
      ? state.context.owner === "desktop"
        ? (state.context.kind === "item"
            ? { owner: "desktop", kind: "item", targetPath: state.context.targetPath, itemPath: state.context.itemPath }
            : { owner: "desktop", kind: "background", targetPath: state.context.targetPath })
        : (state.context.kind === "grid-item"
            ? { owner: "explorer", kind: "grid-item", targetPath: state.context.targetPath, itemPath: state.context.itemPath }
            : { owner: "explorer", kind: "grid-background", targetPath: state.context.targetPath })
      : null;

  return (
    <ContextMenuStateContext.Provider value={{ openContextMenu, closeContextMenu }}>
      {children}
      <ContextMenu
        open={state.open}
        clientX={state.x}
        clientY={state.y}
        containerRect={containerRect}
        onClose={closeContextMenu}
        items={items}
        context={contextForMenu}
      />
      <MkdirDialog
        open={mkdirDialogOpen}
        targetPath={mkdirDialogTargetPath}
        onConfirm={handleMkdirConfirm}
        onCancel={() => setMkdirDialogOpen(false)}
      />
    </ContextMenuStateContext.Provider>
  );
}

export function useContextMenu(): ContextMenuContextType {
  const ctx = useContext(ContextMenuStateContext);
  if (!ctx) {
    throw new Error("useContextMenu must be used within ContextMenuProvider");
  }
  return ctx;
}
