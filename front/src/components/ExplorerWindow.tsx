import React, { useState, useEffect, useCallback } from "react";
import { useWindowRegistry } from "../os/wm/WindowRegistry";
import { vfs, VFSNode } from "../os/fs/VirtualFileSystem";
import { vfsApiClient, onVfsChanged, type VfsListItem } from "../os/fs/VfsApiClient";
import { useContextMenu } from "../os/ui/ContextMenu";
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

  return (
    <div>
      <div
        onClick={handleClick}
        className={`tree-item ${isSelected ? "selected" : ""}`}
        // inline-style: allowed (reason: performance; why: CSS var for tree indent from level; revisit: FP7)
        style={{ ["--tree-level" as string]: `${level}` } as React.CSSProperties}
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

function toVfsNode(item: VfsListItem): VFSNode {
  return { name: item.name, type: item.type };
}

export function ExplorerWindow(props: { windowId?: string; content?: { initialPath?: string } }) {
  const windowId = props.windowId ?? "explorer-default";
  const initialPath = props.content?.initialPath ?? "/";
  const [currentPath, setCurrentPath] = useState(initialPath);
  const [files, setFiles] = useState<VfsListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { openWindow } = useWindowRegistry();
  const { openContextMenu } = useContextMenu();

  const fetchList = useCallback(async (path: string) => {
    setLoading(true);
    try {
      const items = await vfsApiClient.list(path);
      setFiles(items);
    } catch (e) {
      console.error("[Explorer] list failed:", e);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchList(currentPath);
  }, [currentPath, fetchList]);

  useEffect(() => {
    const handleInvalidated = (e: CustomEvent<{ path: string }>) => {
      const p = e.detail?.path;
      if (!p) return;
      if (p === currentPath || currentPath.startsWith(p + "/")) {
        void fetchList(currentPath);
      }
    };
    const unsub = onVfsChanged((path) => {
      if (path === currentPath || currentPath.startsWith(path + "/")) {
        void fetchList(currentPath);
      }
    });
    window.addEventListener("vfs:invalidated", handleInvalidated as EventListener);
    return () => {
      window.removeEventListener("vfs:invalidated", handleInvalidated as EventListener);
      unsub();
    };
  }, [currentPath, fetchList]);

  const handleNavigate = (path: string) => {
    setCurrentPath(path);
  };

  const getNodePath = (node: VfsListItem, basePath: string): string => {
    if (basePath === "/") return `/${node.name}`;
    return `${basePath}/${node.name}`;
  };

  const handleOpen = async (node: VfsListItem) => {
    if (node.type === "dir") {
      const newPath = currentPath === "/" ? `/${node.name}` : `${currentPath}/${node.name}`;
      setCurrentPath(newPath);
    } else {
      if (node.name.endsWith(".url")) {
        try {
          const key = getNodePath(node, currentPath);
          const buf = await vfsApiClient.read(key);
          const text = new TextDecoder().decode(buf);
          const data = JSON.parse(text);
          if (data.target) {
            openWindow(data.target);
          }
        } catch (e) {
          console.error("Failed to parse link:", e);
        }
      } else {
        const appId = appRegistry.resolveAppForFile(node.name);
        if (appId) {
          const fullPath = getNodePath(node, currentPath);
          const vfsNode = toVfsNode(node);
          openWindow(appId, {
            content: {
              node: vfsNode,
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

  const targetPathForMenu = currentPath;

  const handleGridBackgroundContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openContextMenu(
      {
        owner: "explorer",
        kind: "grid-background",
        windowId,
        targetPath: targetPathForMenu,
      },
      e.clientX,
      e.clientY
    );
  };

  const handleGridItemContextMenu = (e: React.MouseEvent, itemPath: string, itemType: "file" | "dir") => {
    e.preventDefault();
    e.stopPropagation();
    openContextMenu(
      {
        owner: "explorer",
        kind: "grid-item",
        windowId,
        targetPath: targetPathForMenu,
        itemPath,
        itemType,
      },
      e.clientX,
      e.clientY
    );
  };

  const rootNode = vfs.stat("/");
  if (!rootNode) {
    return <div>Error: Root not found</div>;
  }

  return (
    <div className="win-explorer" data-cm-scope="explorer" data-testid="explorer-window">
      <div data-testid="explorer-tree" className="explorer-tree">
        <TreeItem
          node={rootNode}
          path="/"
          currentPath={currentPath}
          onSelect={handleNavigate}
          level={0}
        />
      </div>

      <div className="explorer-grid-container">
        <div className="explorer-toolbar">
          <button onClick={handleUp} disabled={currentPath === "/"} className="win-btn explorer-up-button" data-testid="explorer-up-button">
            ↑
          </button>
          <div data-testid="explorer-address-input" className="explorer-path">
            {currentPath === "/" ? "My Computer" : currentPath}
          </div>
        </div>

        <div
          data-testid="explorer-grid"
          className="explorer-grid-view"
          onContextMenu={handleGridBackgroundContextMenu}
        >
          <div className="explorer-grid">
            {loading ? (
              <div className="explorer-grid-loading">Loading...</div>
            ) : (
              files.map((node) => {
                const itemPath = getNodePath(node, currentPath);
                const iconType = resolveIconForVFSNode(toVfsNode(node), currentPath);
                return (
                  <div
                    key={node.name}
                    onDoubleClick={() => handleOpen(node)}
                    onContextMenu={(e) => handleGridItemContextMenu(e, itemPath, node.type)}
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
              })
            )}
          </div>
        </div>

        <StatusBar data-testid="explorer-status">
          {files.length} item(s)
        </StatusBar>
      </div>
    </div>
  );
}
