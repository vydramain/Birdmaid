import { useState, useEffect } from "react";
import { Launcher } from "./Launcher";
import { MobileViewer } from "./viewers/MobileViewer";
import { vfs } from "@/os/fs/VirtualFileSystem";
import { appRegistry } from "@/os/apps/AppRegistry";
import { VFSNode } from "@/os/fs/VirtualFileSystem";
import { initVFS } from "@/os/fs/vfs-init";
import { initApps } from "@/os/apps/registry-init";

// Initialize apps and VFS
initApps();
initVFS();

/**
 * MobileApp - Windows Mobile 6.0 styled mobile application.
 * 
 * Features:
 * - Launcher screen with app list
 * - Content opening in mobile viewers
 * - Same VFS/API/auth as desktop
 */
export function MobileApp() {
  const [currentView, setCurrentView] = useState<'launcher' | 'viewer'>('launcher');
  const [viewerContent, setViewerContent] = useState<VFSNode | null>(null);
  const [apps, setApps] = useState<Array<{ id: string; name: string; icon: string; path: string }>>([]);

  // Load apps from Desktop folder (VFS)
  useEffect(() => {
    const updateApps = () => {
      try {
        // Read from VFS (same as desktop)
        const nodes = vfs.readDir('/Disk C/desktop');
        
        const appList = nodes
          .filter(node => node.type === 'file')
          .map(node => {
            let icon = '📄';
            let name = node.name;
            
            // Check for .url files (links)
            if (node.name.endsWith('.url')) {
              try {
                const data = JSON.parse(node.content as string);
                icon = data.icon || '🔗';
                name = data.label || node.name;
              } catch (e) {
                // Not a valid JSON link
              }
            } else {
              // Resolve app by extension
              const appId = appRegistry.resolveAppForFile(node.name);
              const app = appId ? appRegistry.get(appId) : null;
              if (app) {
                icon = app.icon;
              }
              // Remove extension for display
              name = node.name.replace(/\.[^/.]+$/, '');
            }
            
            return {
              id: node.name,
              name,
              icon,
              path: `/Disk C/desktop/${node.name}`,
            };
          });

        setApps(appList);
      } catch (error) {
        console.error('Failed to load apps:', error);
      }
    };

    updateApps();
    
    // Subscribe to VFS changes
    const unsubscribe = vfs.subscribe('/Disk C/desktop', () => updateApps());
    
    return () => {
      unsubscribe();
    };
  }, []);

  const handleOpenContent = (path: string) => {
    try {
      // Get file node from VFS (same as desktop)
      const node = vfs.stat(path);
      if (node && node.type === 'file') {
        setViewerContent(node);
        setCurrentView('viewer');
      } else {
        console.error('File not found in VFS:', path);
      }
    } catch (error) {
      console.error('Failed to open content:', error);
    }
  };

  const handleBack = () => {
    setCurrentView('launcher');
    setViewerContent(null);
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      backgroundColor: '#C0C0C0', // WM6 gray background
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'Tahoma, Arial, sans-serif',
      overflow: 'hidden',
    }}>
      {currentView === 'launcher' ? (
        <Launcher apps={apps} onOpenContent={handleOpenContent} />
      ) : (
        <MobileViewer content={viewerContent} onBack={handleBack} />
      )}
    </div>
  );
}
