import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { windowStore } from "./WindowStore";
import { appRegistry } from "../apps/AppRegistry";
import { vfs } from "../fs/VirtualFileSystem";

// Import apps and VFS
import "../apps/registry-init";
import "../fs/vfs-init";

// Initialize VFS content
import { initVFS } from "../fs/vfs-init";
// Call initVFS once
let vfsInitialized = false;
if (!vfsInitialized) {
  initVFS();
  vfsInitialized = true;
}

export type WindowContent = Record<string, unknown>;

export type WindowMeta = {
  id: string;
  appId: string;
  title: string;
  zIndex: number;
  content?: WindowContent;
};

type WindowRegistryContextType = {
  windows: WindowMeta[];
  openWindow: (appId: string, content?: WindowContent) => string;
  closeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
};

const WindowRegistryContext = createContext<WindowRegistryContextType | undefined>(undefined);

export function WindowRegistryProvider({ children }: { children: ReactNode }) {
  const [windows, setWindows] = useState<WindowMeta[]>([]);
  const [maxZIndex, setMaxZIndex] = useState(1000);

  const closeWindow = useCallback((id: string) => {
    setWindows((prev) => prev.filter((w) => w.id !== id));
    windowStore.unregister(id);
  }, []);

  const focusWindow = useCallback((id: string) => {
    setWindows((prev) => {
      const target = prev.find((w) => w.id === id);
      if (!target) return prev;
      
      // If already top, don't update to avoid render
      const maxZ = Math.max(...prev.map((w) => w.zIndex));
      if (target.zIndex === maxZ) return prev;

      const newZ = maxZ + 1;
      setMaxZIndex(newZ);
      
      // Update store zIndex as well
      windowStore.update(id, { zIndex: newZ });

      return prev.map((w) => (w.id === id ? { ...w, zIndex: newZ } : w));
    });
  }, []);

  const openWindow = useCallback((appId: string, content?: WindowContent) => {
    const app = appRegistry.get(appId);
    if (!app) {
      console.error(`App not found: ${appId}`);
      return "";
    }
    if (app.singleton) {
      const existing = windows.find((w) => w.appId === appId);
      if (existing) {
        focusWindow(existing.id);
        return existing.id;
      }
    }
    const id = `${appId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newZIndex = maxZIndex + 1;
    let title = app.name;
    if (content?.title) title = content.title as string;
    windowStore.register(id, {
      x: 100 + (windows.length % 5) * 30,
      y: 100 + (windows.length % 5) * 30,
      width: app.defaultWidth || 600,
      height: app.defaultHeight || 400,
      zIndex: newZIndex,
    });
    setWindows((prev) => {
      let next = prev;
      if (prev.length >= 10) {
        const oldest = [...prev].sort((a, b) => a.zIndex - b.zIndex)[0];
        windowStore.unregister(oldest.id);
        next = prev.filter((w) => w.id !== oldest.id);
      }
      return [...next, { id, appId, title, zIndex: newZIndex, content }];
    });
    setMaxZIndex(newZIndex);
    return id;
  }, [maxZIndex, windows, focusWindow]);

  // Expose system API for smoke tests
  useEffect(() => {
    (window as Window & { sys?: unknown }).sys = {
      open: openWindow,
      close: closeWindow,
      store: windowStore,
      vfs: vfs,
    };
    return () => {
      delete (window as Window & { sys?: unknown }).sys;
    };
  }, [openWindow, closeWindow]);

  return (
    <WindowRegistryContext.Provider value={{ windows, openWindow, closeWindow, focusWindow }}>
      {children}
    </WindowRegistryContext.Provider>
  );
}

export function useWindowRegistry() {
  const context = useContext(WindowRegistryContext);
  if (!context) {
    throw new Error("useWindowRegistry must be used within WindowRegistryProvider");
  }
  return context;
}
