import { useState, useEffect } from "react";
import { useWindowRegistry } from "../os/wm/WindowRegistry";
import { vfs, VFSNode } from "../os/fs/VirtualFileSystem";

export function ExplorerWindow() {
  const [currentPath, setCurrentPath] = useState("/desktop");
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

  const handleOpen = (node: VFSNode) => {
    if (node.type === 'dir') {
      // Navigate
      const newPath = currentPath === '/' ? `/${node.name}` : `${currentPath}/${node.name}`;
      setCurrentPath(newPath);
    } else {
      // Open file
      if (node.name.endsWith('.url')) {
        try {
          const data = JSON.parse(node.content as string);
          if (data.target) {
            openWindow(data.target);
          }
        } catch (e) {
          console.error('Failed to parse link');
        }
      } else if (node.name.endsWith('.txt') || node.name.endsWith('.md')) {
         openWindow('help'); // Placeholder
      } else {
        alert(`Cannot open ${node.name}`);
      }
    }
  };

  const handleUp = () => {
    if (currentPath === '/') return;
    const parts = currentPath.split('/');
    parts.pop();
    const newPath = parts.join('/') || '/';
    setCurrentPath(newPath);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Toolbar */}
      <div className="win-inset" style={{ display: 'flex', gap: '4px', padding: '4px', marginBottom: '8px', backgroundColor: 'var(--win-white)' }}>
        <button onClick={handleUp} disabled={currentPath === '/'} style={{ minWidth: '30px' }}>↑</button>
        <div style={{ flex: 1, padding: '2px 4px', border: '1px solid var(--win-gray-dark)' }}>
          {currentPath}
        </div>
      </div>

      {/* Grid View */}
      <div className="win-inset" style={{ flex: 1, backgroundColor: 'var(--win-white)', overflow: 'auto', padding: '8px' }}>
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
                 onClick={() => handleOpen(node)}
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
  );
}
