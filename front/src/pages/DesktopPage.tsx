import { useEffect, useState } from "react";
import { useWindowRegistry } from "../os/wm/WindowRegistry";
import { DesktopIcon } from "../components/DesktopIcon";
import { WindowManager } from "../os/wm/WindowManager";
import { vfs, VFSNode } from "../os/fs/VirtualFileSystem";
import { appRegistry } from "../os/apps/AppRegistry";

type DesktopIconData = {
  id: string;
  label: string;
  icon: string;
  target?: string;
};

export function DesktopPage() {
  const { openWindow } = useWindowRegistry();
  const [icons, setIcons] = useState<DesktopIconData[]>([]);

  // VFS Sync - Desktop Icons читаются строго из /Disk C/desktop
  useEffect(() => {
    const updateIcons = () => {
      const nodes = vfs.readDir('/Disk C/desktop');
      const newIcons = nodes.map(node => {
        let icon = '📄';
        let target = '';
        let label = node.name;

        if (node.name.endsWith('.url')) {
          // Parse link file
          try {
            const data = JSON.parse(node.content as string);
            icon = data.icon || '🔗';
            target = data.target;
            label = data.label || node.name;
          } catch (e) {
            console.error('Failed to parse link:', node.name);
          }
        } else if (node.name.endsWith('.txt') || node.name.endsWith('.md')) {
          icon = '📝';
        }

        return {
          id: node.name,
          label,
          icon,
          target
        };
      });
      setIcons(newIcons);
    };

    updateIcons();
    return vfs.subscribe('/Disk C/desktop', updateIcons);
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
      const nodes = vfs.readDir('/Disk C/desktop');
      const node = nodes.find(n => n.name === icon.id);
      
      if (node && node.type === 'file') {
        // Resolve app for file using AppRegistry
        const appId = appRegistry.resolveAppForFile(node.name);
        if (appId) {
          const fullPath = `/Disk C/desktop/${node.name}`;
          // Pass node and path to the viewer
          openWindow(appId, {
            content: {
              node: node,
              path: fullPath
            },
            title: node.name
          });
        } else {
          console.warn(`No app registered for file: ${node.name}`);
          // Fallback to explorer
          openWindow('explorer');
        }
      } else {
        // Not a file or not found - fallback to explorer
        openWindow('explorer');
      }
    }
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        backgroundColor: "#008080",
        backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,.03) 2px, rgba(0,0,0,.03) 4px)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Desktop icons grid */}
      <div
        data-testid="desktop-icons"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))",
          gap: "16px",
          padding: "16px",
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1,
        }}
      >
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
