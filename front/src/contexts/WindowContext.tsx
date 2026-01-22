import { createContext, useContext, useState, ReactNode, useCallback } from "react";

export type WindowType = "games" | "explorer" | "help" | "landing" | "game" | "mobile";

export type Window = {
  id: string;
  type: WindowType;
  position: { x: number; y: number };
  zIndex: number;
  focused: boolean;
  minimized: boolean;
  content?: any; // window-specific data
};

type WindowContextType = {
  windows: Window[];
  maxZIndex: number;
  openWindow: (type: WindowType, content?: any) => string; // returns window id
  closeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  updatePosition: (id: string, position: { x: number; y: number }) => void;
  minimizeWindow: (id: string) => void;
  getWindow: (id: string) => Window | undefined;
};

const WindowContext = createContext<WindowContextType | undefined>(undefined);

export function WindowProvider({ children }: { children: ReactNode }) {
  const [windows, setWindows] = useState<Window[]>([]);
  const [maxZIndex, setMaxZIndex] = useState(1000);

  const openWindow = useCallback((type: WindowType, content?: any): string => {
    const id = `${type}-${Date.now()}-${Math.random()}`;
    const newZIndex = maxZIndex + 1;
    
    setWindows((prev) => {
      // Limit to 10 windows
      if (prev.length >= 10) {
        // Close oldest window
        const sorted = [...prev].sort((a, b) => a.zIndex - b.zIndex);
        const oldest = sorted[0];
        return prev.filter((w) => w.id !== oldest.id).concat({
          id,
          type,
          position: { x: 100 + (prev.length % 5) * 50, y: 100 + (prev.length % 5) * 50 },
          zIndex: newZIndex,
          focused: true,
          minimized: false,
          content,
        });
      }
      
      // Unfocus all other windows
      const unfocused = prev.map((w) => ({ ...w, focused: false }));
      
      return unfocused.concat({
        id,
        type,
        position: { x: 100 + (prev.length % 5) * 50, y: 100 + (prev.length % 5) * 50 },
        zIndex: newZIndex,
        focused: true,
        minimized: false,
        content,
      });
    });
    
    setMaxZIndex(newZIndex);
    return id;
  }, [maxZIndex]);

  const closeWindow = useCallback((id: string) => {
    setWindows((prev) => prev.filter((w) => w.id !== id));
  }, []);

  const focusWindow = useCallback((id: string) => {
    setWindows((prev) => {
      const newZIndex = maxZIndex + 1;
      setMaxZIndex(newZIndex);
      
      return prev.map((w) => ({
        ...w,
        focused: w.id === id,
        zIndex: w.id === id ? newZIndex : w.zIndex,
      }));
    });
  }, [maxZIndex]);

  const updatePosition = useCallback((id: string, position: { x: number; y: number }) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, position } : w))
    );
  }, []);

  const minimizeWindow = useCallback((id: string) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, minimized: !w.minimized } : w))
    );
  }, []);

  const getWindow = useCallback((id: string) => {
    return windows.find((w) => w.id === id);
  }, [windows]);

  return (
    <WindowContext.Provider
      value={{
        windows,
        maxZIndex,
        openWindow,
        closeWindow,
        focusWindow,
        updatePosition,
        minimizeWindow,
        getWindow,
      }}
    >
      {children}
    </WindowContext.Provider>
  );
}

export function useWindow() {
  const context = useContext(WindowContext);
  if (!context) {
    throw new Error("useWindow must be used within WindowProvider");
  }
  return context;
}
