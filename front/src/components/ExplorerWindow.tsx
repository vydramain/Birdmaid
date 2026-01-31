import { useState, useEffect } from "react";
import { useWindowRegistry } from "../os/wm/WindowRegistry";
import { vfs, VFSNode } from "../os/fs/VirtualFileSystem";
import { appRegistry } from "../os/apps/AppRegistry";

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
  const isDir = node.type === 'dir';
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
        style={{
          padding: '2px 4px',
          paddingLeft: `${4 + level * 16}px`,
          cursor: 'pointer',
          backgroundColor: isSelected ? 'var(--win-blue)' : 'transparent',
          color: isSelected ? 'var(--win-white)' : 'var(--win-text)',
          fontSize: '11px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}
      >
        {isDir && (
          <span style={{ fontSize: '10px' }}>{expanded ? '▼' : '▶'}</span>
        )}
        {!isDir && <span style={{ width: '10px' }} />}
        <span>{node.name || 'My Computer'}</span>
      </div>
      {isDir && expanded && hasChildren && (
        <div>
          {node.children!.map((child) => {
            const childPath = path === '/' ? `/${child.name}` : `${path}/${child.name}`;
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
    if (basePath === '/') {
      return `/${node.name}`;
    }
    return `${basePath}/${node.name}`;
  };

  const handleOpen = (node: VFSNode) => {
    if (node.type === 'dir') {
      // Navigate
      const newPath = currentPath === '/' ? `/${node.name}` : `${currentPath}/${node.name}`;
      setCurrentPath(newPath);
    } else {
      // Open file using AppRegistry
      if (node.name.endsWith('.url')) {
        // Special handling for .url link files
        try {
          const data = JSON.parse(node.content as string);
          if (data.target) {
            openWindow(data.target);
          }
        } catch (e) {
          console.error('Failed to parse link');
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
              path: fullPath
            },
            title: node.name
          });
        } else {
          console.warn(`No app registered for file: ${node.name}`);
          alert(`Cannot open ${node.name} - no viewer registered`);
        }
      }
    }
  };

  const handleUp = () => {
    if (currentPath === '/') return;
    const parts = currentPath.split('/').filter(p => p);
    parts.pop();
    const newPath = parts.length > 0 ? '/' + parts.join('/') : '/';
    setCurrentPath(newPath);
  };

  const rootNode = vfs.stat('/');
  if (!rootNode) {
    return <div>Error: Root not found</div>;
  }

  return (
    <div style={{ display: 'flex', height: '100%', gap: '4px' }}>
      {/* Tree View (Left) */}
      <div 
        data-testid="explorer-tree"
        className="win-inset" 
        style={{ 
          width: '200px', 
          minWidth: '150px',
          backgroundColor: 'var(--win-gray)', 
          overflow: 'auto', 
          padding: '4px',
          border: '1px inset var(--win-gray-dark)'
        }}
      >
        <TreeItem
          node={rootNode}
          path="/"
          currentPath={currentPath}
          onSelect={handleNavigate}
          level={0}
        />
      </div>

      {/* Grid View (Right) */}
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '4px' }}>
        {/* Toolbar */}
        <div className="win-inset" style={{ display: 'flex', gap: '4px', padding: '4px', backgroundColor: 'var(--win-white)' }}>
          <button onClick={handleUp} disabled={currentPath === '/'} style={{ minWidth: '30px' }}>↑</button>
          <div data-testid="explorer-path" style={{ flex: 1, padding: '2px 4px', border: '1px solid var(--win-gray-dark)' }}>
            {currentPath === '/' ? 'My Computer' : currentPath}
          </div>
        </div>

        {/* Grid View */}
        <div data-testid="explorer-grid" className="win-inset" style={{ flex: 1, backgroundColor: 'var(--win-white)', overflow: 'auto', padding: '8px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(64px, 1fr))', gap: '16px' }}>
            {files.map((node) => {
               let icon = '📄';
               if (node.type === 'dir') icon = '📁';
               else if (node.name.endsWith('.url')) icon = '🔗';
               
               // Try to get icon from metadata if link
               if (node.name.endsWith('.url')) {
                 try {
                   const data = JSON.parse(node.content as string);
                   if (data.icon) icon = data.icon;
                 } catch(e) {}
               }

               return (
                 <div 
                   key={node.name}
                   onDoubleClick={() => handleOpen(node)}
                   onClick={() => {
                     if (node.type === 'dir') {
                       const newPath = currentPath === '/' ? `/${node.name}` : `${currentPath}/${node.name}`;
                       setCurrentPath(newPath);
                     }
                   }}
                   style={{ 
                     display: 'flex', 
                     flexDirection: 'column', 
                     alignItems: 'center', 
                     cursor: 'pointer',
                     textAlign: 'center'
                   }}
                 >
                   <div style={{ fontSize: '24px', marginBottom: '4px' }}>{icon}</div>
                   <div style={{ fontSize: '11px', wordBreak: 'break-word' }}>{node.name}</div>
                 </div>
               );
            })}
          </div>
        </div>
        
        {/* Status Bar */}
        <div style={{ marginTop: '4px', fontSize: '11px', color: 'var(--win-gray-dark)' }}>
          {files.length} item(s)
        </div>
      </div>
    </div>
  );
}
