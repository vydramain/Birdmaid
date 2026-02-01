import React, { useState, useEffect } from "react";
import { useWindowRegistry } from "../os/wm/WindowRegistry";
import { vfs, VFSNode } from "../os/fs/VirtualFileSystem";
import { appRegistry } from "../os/apps/AppRegistry";
import { StatusBar } from "../ui/primitives";
import { Icon } from "../ui/icons";
import { resolveIconForVFSNode } from "../ui/icons";

interface TreeItemProps {
  node: VFSNode;
  path: string;
  currentPath: string;
  onSelect: (path: string) => void;
  level: number;
}

function TreeItem({ node, path, currentPath, onSelect, level }: TreeItemProps) {
  const [expanded, setExpanded] = useState(level === 0); // Root level expanded by default
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

  return (
    <div>
      <div
        onClick={handleClick}
        className={`tree-item ${isSelected ? "selected" : ""}`}
        // inline-style: allowed (reason: layout-calc)
        style={{ "--tree-level": level } as React.CSSProperties & { "--tree-level": number }}
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
        } catch (e) {
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

  return (
    <div className="win-explorer">
      {/* Tree View (Left) */}
      <div data-testid="explorer-tree" className="explorer-tree">
        <TreeItem
          node={rootNode}
          path="/"
          currentPath={currentPath}
          onSelect={handleNavigate}
          level={0}
        />
      </div>

      {/* Grid View (Right) */}
      <div className="explorer-grid-container">
        {/* Toolbar */}
        <div className="explorer-toolbar">
          <button onClick={handleUp} disabled={currentPath === "/"} className="explorer-up-button">
            ↑
          </button>
          <div data-testid="explorer-path" className="explorer-path">
            {currentPath === "/" ? "My Computer" : currentPath}
          </div>
        </div>

        {/* Grid View */}
        <div data-testid="explorer-grid" className="explorer-grid-view">
          <div className="explorer-grid">
            {files.map((node) => {
              const itemPath = getNodePath(node, currentPath);
              const iconType = resolveIconForVFSNode(node, currentPath);
              return (
                <div
                  key={node.name}
                  onDoubleClick={() => handleOpen(node)}
                  onClick={() => {
                    if (node.type === "dir") {
                      const newPath =
                        currentPath === "/" ? `/${node.name}` : `${currentPath}/${node.name}`;
                      setCurrentPath(newPath);
                    }
                  }}
                  className="explorer-grid-item"
                  data-testid={`explorer-grid-item-${itemPath}`}
                >
                  <div className="explorer-icon">
                    <Icon type={iconType} size="32x32" />
                  </div>
                  <div className="explorer-filename">{node.name}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status Bar */}
        <StatusBar data-testid="explorer-status">
          {files.length} item(s)
        </StatusBar>
      </div>
    </div>
  );
}
