import React, { useState, useEffect } from "react";
import { useWindowRegistry } from "../os/wm/WindowRegistry";
import { vfs, VFSNode } from "../os/fs/VirtualFileSystem";
import { appRegistry } from "../os/apps/AppRegistry";
import { StatusBar, MenuBar, MenuItem } from "../ui/primitives";
import { Icon } from "../ui/icons";
import { resolveIconForVFSNode } from "../ui/icons";

const MENU_ITEMS = ["File", "Edit", "View", "Go", "Bookmarks", "Help"] as const;

interface TreeItemProps {
  node: VFSNode;
  path: string;
  currentPath: string;
  onSelect: (path: string) => void;
  level: number;
}

function TreeItem({ node, path, currentPath, onSelect, level }: TreeItemProps) {
  const [expanded, setExpanded] = useState(level === 0);
  const isSelected = currentPath === path;
  const isDir = node.type === "dir";
  const hasChildren = isDir && node.children && node.children.length > 0;

  const handleClick = () => {
    if (isDir) {
      setExpanded(!expanded);
      onSelect(path);
    } else {
      onSelect(path);
    }
  };

  const levelClass = `tree-item-level-${Math.min(level, 19)}`;

  return (
    <div>
      <div
        onClick={handleClick}
        className={`tree-item ${levelClass} ${isSelected ? "selected" : ""}`}
        data-level={level}
        data-testid={`tree-item-${path}`}
      >
        {isDir && <span className="tree-expand-icon">{expanded ? "▼" : "▶"}</span>}
        {!isDir && <span className="tree-spacer" />}
        <span>{node.name || "My Computer"}</span>
      </div>
      {isDir && expanded && hasChildren && (
        <div>
          {node.children!.map((child) => {
            const childPath = path === "/" ? `/${child.name}` : `${path}/${child.name}`;
            return (
              <TreeItem
                key={child.name}
                node={child}
                path={childPath}
                currentPath={currentPath}
                onSelect={onSelect}
                level={level + 1}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

export function ExplorerWindow() {
  const [currentPath, setCurrentPath] = useState("/");
  const [files, setFiles] = useState<VFSNode[]>([]);
  const [selectedItemPath, setSelectedItemPath] = useState<string | null>(null);
  const { openWindow } = useWindowRegistry();

  useEffect(() => {
    const updateFiles = () => {
      try {
        const nodes = vfs.readDir(currentPath);
        setFiles(nodes);
      } catch (e) {
        console.error(e);
        setFiles([]);
      }
    };

    updateFiles();
    return vfs.subscribe(currentPath, updateFiles);
  }, [currentPath]);

  const handleNavigate = (path: string) => {
    setCurrentPath(path);
  };

  // Helper to get full path of a node
  const getNodePath = (node: VFSNode, basePath: string): string => {
    if (basePath === "/") {
      return `/${node.name}`;
    }
    return `${basePath}/${node.name}`;
  };

  const handleOpen = (node: VFSNode) => {
    if (node.type === "dir") {
      // Navigate
      const newPath = currentPath === "/" ? `/${node.name}` : `${currentPath}/${node.name}`;
      setCurrentPath(newPath);
    } else {
      // Open file using AppRegistry
      if (node.name.endsWith(".url")) {
        // Special handling for .url link files
        try {
          const data = JSON.parse(node.content as string);
          if (data.target) {
            openWindow(data.target);
          }
        } catch (_e) {
          console.error("Failed to parse link");
        }
      } else {
        // Resolve app for file using AppRegistry
        const appId = appRegistry.resolveAppForFile(node.name);
        if (appId) {
          const fullPath = getNodePath(node, currentPath);
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
          alert(`Cannot open ${node.name} - no viewer registered`);
        }
      }
    }
  };

  const handleUp = () => {
    if (currentPath === "/") return;
    const parts = currentPath.split("/").filter((p) => p);
    parts.pop();
    const newPath = parts.length > 0 ? "/" + parts.join("/") : "/";
    setCurrentPath(newPath);
  };

  const rootNode = vfs.stat("/");
  if (!rootNode) {
    return <div>Error: Root not found</div>;
  }

  const addressDisplay = currentPath === "/" ? "My Computer" : currentPath;

  return (
    <div className="win-explorer">
      <MenuBar data-testid="explorer-menubar" className="explorer-menubar">
        {MENU_ITEMS.map((label) => (
          <MenuItem key={label} label={label} onClick={() => {}} />
        ))}
      </MenuBar>

      <div data-testid="explorer-toolbar" className="explorer-toolbar">
        <button
          type="button"
          className="win-btn-icon explorer-toolbar-back"
          disabled
          aria-label="Back"
        >
          ←
        </button>
        <button
          type="button"
          className="win-btn-icon explorer-toolbar-forward"
          disabled
          aria-label="Forward"
        >
          →
        </button>
        <span className="explorer-toolbar-separator" aria-hidden />
        <button
          type="button"
          onClick={handleUp}
          disabled={currentPath === "/"}
          className="win-btn-icon explorer-up-button"
          data-testid="explorer-up-button"
          aria-label="Up"
        >
          ↑
        </button>
        <button
          type="button"
          className="win-btn-icon explorer-toolbar-refresh"
          aria-label="Refresh"
        >
          ↻
        </button>
      </div>

      <div data-testid="explorer-address" className="explorer-addressbar">
        <span className="explorer-addressbar-icon" aria-hidden>
          <Icon type={currentPath === "/" ? "system-computer" : "dir"} size="16x16" />
        </span>
        <input
          type="text"
          className="win-input explorer-addressbar-input"
          readOnly
          value={addressDisplay}
          aria-label="Current path"
          data-testid="explorer-address-input"
        />
      </div>

      <div className="explorer-main">
        <div data-testid="explorer-tree" className="explorer-tree">
          <TreeItem
            node={rootNode}
            path="/"
            currentPath={currentPath}
            onSelect={handleNavigate}
            level={0}
          />
        </div>

        <div className="explorer-divider" aria-hidden />

        <div className="explorer-content">
          <div className="explorer-grid-view">
            <div data-testid="explorer-grid" className="explorer-grid">
              {files.map((node) => {
                const itemPath = getNodePath(node, currentPath);
                const iconType = resolveIconForVFSNode(node, currentPath);
                const isSelected = selectedItemPath === itemPath;
                return (
                  <div
                    key={node.name}
                    onClick={() => setSelectedItemPath(itemPath)}
                    onDoubleClick={() => handleOpen(node)}
                    className={`explorer-grid-item ${isSelected ? "explorer-grid-item-selected" : ""}`}
                    data-testid={`explorer-grid-item-${itemPath}`}
                  >
                    <div className="explorer-icon">
                      <Icon type={iconType} size="32x32" />
                    </div>
                    <div className="explorer-filename">
                      {node.name}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <StatusBar data-testid="explorer-status">
            {files.length} item(s)
          </StatusBar>
        </div>
      </div>
    </div>
  );
}
