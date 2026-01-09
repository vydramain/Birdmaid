import { createContext, useContext, useState, ReactNode } from "react";

type WindowPositionContextType = {
  position: { x: number; y: number };
  setPosition: (pos: { x: number; y: number }) => void;
};

const WindowPositionContext = createContext<WindowPositionContextType | undefined>(undefined);

export function WindowPositionProvider({ children }: { children: ReactNode }) {
  const [position, setPosition] = useState(() => {
    const saved = localStorage.getItem("birdmaid_window_position");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return { x: 16, y: 60 };
      }
    }
    return { x: 16, y: 60 };
  });

  const updatePosition = (pos: { x: number; y: number }) => {
    setPosition(pos);
    localStorage.setItem("birdmaid_window_position", JSON.stringify(pos));
  };

  return (
    <WindowPositionContext.Provider value={{ position, setPosition: updatePosition }}>
      {children}
    </WindowPositionContext.Provider>
  );
}

export function useWindowPosition() {
  const context = useContext(WindowPositionContext);
  if (!context) {
    throw new Error("useWindowPosition must be used within WindowPositionProvider");
  }
  return context;
}

