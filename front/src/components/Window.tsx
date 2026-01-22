import { useRef, useEffect, useState, ReactNode } from "react";
import { useWindow, Window as WindowType } from "../contexts/WindowContext";

type WindowProps = {
  window: WindowType;
  children: ReactNode;
  title: string;
  onClose?: () => void;
};

export function Window({ window, children, title, onClose }: WindowProps) {
  const { focusWindow, updatePosition, closeWindow } = useWindow();
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const windowRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".win-titlebar")) {
      setIsDragging(true);
      if (windowRef.current) {
        const rect = windowRef.current.getBoundingClientRect();
        setDragStart({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
      focusWindow(window.id);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        updatePosition(window.id, {
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y,
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragStart, window.id, updatePosition]);

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      closeWindow(window.id);
    }
  };

  if (window.minimized) {
    return null;
  }

  return (
    <div
      ref={windowRef}
      className="win-window-base win-window"
      style={{
        position: "absolute",
        left: `${window.position.x}px`,
        top: `${window.position.y}px`,
        zIndex: window.zIndex,
        cursor: isDragging ? "grabbing" : "default",
        minWidth: "300px",
        maxWidth: "90vw",
        maxHeight: "90vh",
      }}
    >
      <header
        className="win-titlebar"
        onMouseDown={handleMouseDown}
        style={{ cursor: isDragging ? "grabbing" : "grab" }}
      >
        <div className="title">
          <span>◆</span>
          <span>{title}</span>
        </div>
        <div className="win-window-controls">
          <button className="win-btn" type="button" onClick={handleClose}>
            ×
          </button>
        </div>
      </header>
      <div className="content" style={{ padding: "12px", overflow: "auto" }}>
        {children}
      </div>
    </div>
  );
}
