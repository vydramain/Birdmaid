import { useEffect, useState } from "react";
import { useWindowRegistry } from "../os/wm/WindowRegistry";
import { DesktopIcon } from "../components/DesktopIcon";
import { WindowManager } from "../os/wm/WindowManager";
import { vfs, VFSNode } from "../os/fs/VirtualFileSystem";
import { appRegistry } from "../os/apps/AppRegistry";
import { resolveIconForVFSNode, resolveIconForApp } from "../ui/icons";
import type { IconType } from "../ui/icons";

type DesktopIconData = {
  id: string;
  label: string;
  icon: IconType;
  target?: string;
};

export function DesktopPage() {
  const { openWindow } = useWindowRegistry();
  const [icons, setIcons] = useState<DesktopIconData[]>([]);

  // VFS Sync - Desktop Icons читаются строго из /Disk C/desktop
  useEffect(() => {
    const updateIcons = () => {
      const nodes = vfs.readDir("/Disk C/desktop");
      const newIcons = nodes.map((node) => {
        let icon: IconType = resolveIconForVFSNode(node);
        let target = "";
        let label = node.name;

        if (node.name.endsWith(".url")) {
          // Parse link file
          try {
            const data = JSON.parse(node.content as string);
            // If link has target app, use app icon
            if (data.target) {
              icon = resolveIconForApp(data.target);
            } else {
              icon = "link";
            }
            target = data.target;
            label = data.label || node.name;
          } catch (e) {
            console.error("Failed to parse link:", node.name);
          }
        }

        return {
          id: node.name,
          label,
          icon,
          target,
        };
      });
      setIcons(newIcons);
    };

    updateIcons();
    return vfs.subscribe("/Disk C/desktop", updateIcons);
  }, []);

  useEffect(() => {
    // Check if landing window was already seen
    const seen = localStorage.getItem("birdmaid_landing_seen");
    if (!seen) {
      // Open landing window automatically
      openWindow("landing");
    }
  }, [openWindow]);

  const handleIconClick = (icon: DesktopIconData) => {
    if (icon.target) {
      // Link file - open target
      openWindow(icon.target as any);
    } else {
      // Regular file - find node and open with appropriate viewer
      const nodes = vfs.readDir("/Disk C/desktop");
      const node = nodes.find((n) => n.name === icon.id);

      if (node && node.type === "file") {
        // Resolve app for file using AppRegistry
        const appId = appRegistry.resolveAppForFile(node.name);
        if (appId) {
          const fullPath = `/Disk C/desktop/${node.name}`;
          // Pass node and path to the viewer
          openWindow(appId, {
            content: {
              node: node,
              path: fullPath,
            },
            title: node.name,
          });
        } else {
          console.warn(`No app registered for file: ${node.name}`);
          // Fallback to explorer
          openWindow("explorer");
        }
      } else {
        // Not a file or not found - fallback to explorer
        openWindow("explorer");
      }
    }
  };

  return (
    <div className="desktop-background">
      {/* Desktop icons grid */}
      <div data-testid="desktop-icons" className="desktop-icons-grid">
        {icons.map((icon) => (
          <DesktopIcon
            key={icon.id}
            icon={icon.icon}
            label={icon.label}
            onClick={() => handleIconClick(icon)}
            tooltip={icon.label}
          />
        ))}
      </div>

      {/* Window Manager */}
      <WindowManager />
    </div>
  );
}
