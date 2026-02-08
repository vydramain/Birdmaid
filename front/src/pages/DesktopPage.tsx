import { useEffect, useState, useCallback } from "react";
import { useWindowRegistry } from "../os/wm/WindowRegistry";
import { DesktopIcon } from "../components/DesktopIcon";
import { WindowManager } from "../os/wm/WindowManager";
import { vfs } from "../os/fs/VirtualFileSystem";
import { useContextMenu } from "../os/ui/ContextMenu";
import { vfsApiClient, onVfsChanged } from "../os/fs/VfsApiClient";
import { appRegistry } from "../os/apps/AppRegistry";
import { apiClient } from "../api/client";
import { resolveIconForVFSNode, resolveIconForApp } from "../ui/icons";
import type { IconType } from "../ui/icons";

type DesktopIconData = {
  id: string;
  label: string;
  icon: IconType;
  target?: string;
  itemType: "file" | "dir";
  isSystemEntry?: boolean;
};

const DESKTOP_PATH = "/Disk C/desktop";

export function DesktopPage() {
  const { openWindow } = useWindowRegistry();
  const { openContextMenu } = useContextMenu();
  const [icons, setIcons] = useState<DesktopIconData[]>([]);
  const [selectedIconId, setSelectedIconId] = useState<string | null>(null);

  const handleDesktopContextMenu = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-cm-scope="explorer"]')) return;
    e.preventDefault();
    openContextMenu({ owner: "desktop", kind: "background", targetPath: DESKTOP_PATH }, e.clientX, e.clientY);
  };

  const handleIconContextMenu = (e: React.MouseEvent, iconPath: string) => {
    e.preventDefault();
    e.stopPropagation();
    openContextMenu(
      { owner: "desktop", kind: "item", targetPath: DESKTOP_PATH, itemPath: iconPath },
      e.clientX,
      e.clientY
    );
  };

  const fetchDesktopIcons = useCallback(async () => {
    try {
      const userRole = vfs.getUserRole();

      const systemEntries: DesktopIconData[] = [
        { id: "my-computer", label: "My Computer", icon: "system-computer", target: "", itemType: "dir", isSystemEntry: true },
        { id: "help.txt", label: "help.txt", icon: "file-txt", target: "", itemType: "file", isSystemEntry: true },
        ...(userRole === "Organizer" ? [{ id: "admin_help.txt", label: "admin_help.txt", icon: "file-txt", target: "", itemType: "file" as const, isSystemEntry: true }] : []),
      ];

      const items = await vfsApiClient.list(DESKTOP_PATH);
      const excludeSystem = new Set(["help.txt", "admin_help.txt"]);
      const filtered = items.filter((item) => {
        if (excludeSystem.has(item.name)) return false;
        if (item.name === "admin_help.txt") return userRole === "Organizer";
        return true;
      });

      const enriched = await Promise.all(
        filtered.map(async (item) => {
          let icon: IconType = resolveIconForVFSNode({ name: item.name, type: item.type });
          let target = "";
          let label = item.name;

          if (item.name.endsWith(".url")) {
            try {
              const key = `${DESKTOP_PATH}/${item.name}`;
              const buf = await vfsApiClient.read(key);
              const data = JSON.parse(new TextDecoder().decode(buf));
              if (data.label === "My Computer") {
                icon = "system-computer";
              } else if (data.target) {
                icon = resolveIconForApp(data.target);
              }
              target = data.target ?? "";
              label = data.label ?? item.name;
            } catch {
              console.error("Failed to parse link:", item.name);
            }
          }

          return {
            id: item.name,
            label,
            icon,
            target,
            itemType: item.type,
          };
        })
      );

      setIcons([...systemEntries, ...enriched]);
    } catch (e) {
      console.error("[Desktop] list failed:", e);
      const userRole = vfs.getUserRole();
      const systemEntries: DesktopIconData[] = [
        { id: "my-computer", label: "My Computer", icon: "system-computer", target: "", itemType: "dir", isSystemEntry: true },
        { id: "help.txt", label: "help.txt", icon: "file-txt", target: "", itemType: "file", isSystemEntry: true },
        ...(userRole === "Organizer" ? [{ id: "admin_help.txt", label: "admin_help.txt", icon: "file-txt", target: "", itemType: "file" as const, isSystemEntry: true }] : []),
      ];
      setIcons(systemEntries);
    }
  }, []);

  useEffect(() => {
    void fetchDesktopIcons();
  }, [fetchDesktopIcons]);

  useEffect(() => {
    const unsub = onVfsChanged((path) => {
      if (path === DESKTOP_PATH || path.startsWith(DESKTOP_PATH + "/")) {
        void fetchDesktopIcons();
      }
    });
    const handler = (e: CustomEvent<{ path: string }>) => {
      const p = e.detail?.path;
      if (p === DESKTOP_PATH || (p && DESKTOP_PATH.startsWith(p))) {
        void fetchDesktopIcons();
      }
    };
    window.addEventListener("vfs:invalidated", handler as EventListener);
    return () => {
      window.removeEventListener("vfs:invalidated", handler as EventListener);
      unsub();
    };
  }, [fetchDesktopIcons]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const openApp = params.get("open");
    if (openApp === "styleguide") {
      openWindow("styleguide");
      return;
    }

    const seen = localStorage.getItem("birdmaid_landing_seen");
    if (!seen) {
      openWindow("landing");
    }
  }, [openWindow]);

  const handleIconClick = async (icon: DesktopIconData) => {
    if (icon.isSystemEntry) {
      if (icon.id === "my-computer") {
        openWindow("explorer", { content: { initialPath: "/" } });
        return;
      }
      if (icon.id === "help.txt") {
        try {
          const { content } = await apiClient.json<{ content: string }>("/api/help");
          openWindow("notepad", { content: { text: content }, title: "help.txt" });
        } catch (e) {
          console.error("Failed to load help:", e);
        }
        return;
      }
      if (icon.id === "admin_help.txt") {
        try {
          const { content } = await apiClient.json<{ content: string }>("/api/help/admin");
          openWindow("notepad", { content: { text: content }, title: "admin_help.txt" });
        } catch (e) {
          console.error("Failed to load admin help:", e);
        }
        return;
      }
    }
    if (icon.target) {
      openWindow(icon.target);
    } else {
      const appId = appRegistry.resolveAppForFile(icon.id);
      if (appId) {
        const fullPath = `${DESKTOP_PATH}/${icon.id}`;
        try {
          const buf = await vfsApiClient.read(fullPath);
          const content = new TextDecoder().decode(buf);
          openWindow(appId, {
            content: {
              node: { name: icon.id, type: "file", content },
              path: fullPath,
            },
            title: icon.id,
          });
        } catch (e) {
          console.error("Failed to read file:", e);
          openWindow("explorer");
        }
      } else {
        openWindow("explorer");
      }
    }
  };

  return (
    <div
      className="desktop-background"
      data-cm-scope="desktop"
      data-testid="desktop-root"
      onContextMenu={handleDesktopContextMenu}
    >
      <div data-testid="desktop-icons" className="desktop-icons-grid">
        {icons.map((icon) => {
          const iconPath = `${DESKTOP_PATH}/${icon.id}`;
          return (
            <DesktopIcon
              key={icon.id}
              icon={icon.icon}
              label={icon.label}
              onClick={() => setSelectedIconId(icon.id)}
              onDoubleClick={() => void handleIconClick(icon)}
              onContextMenu={(e) => handleIconContextMenu(e, iconPath)}
              selected={selectedIconId === icon.id}
              tooltip={icon.label}
              dataTestId={`desktop-icon-${iconPath}`}
              dataPath={iconPath}
              dataItemType={icon.itemType}
            />
          );
        })}
      </div>

      <WindowManager />
    </div>
  );
}
