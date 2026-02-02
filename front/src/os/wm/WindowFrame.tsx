import React, { useRef, useEffect, useState, ReactNode } from "react";
import { windowStore } from "./WindowStore";
import { useWindowRegistry } from "./WindowRegistry";
import { CaptionButtons } from "../../ui/primitives";

type WindowFrameProps = {
  id: string;
  title: string;
  children: ReactNode;
  onClose?: () => void;
};

export function WindowFrame({ id, title, children, onClose }: WindowFrameProps) {
  const { focusWindow, closeWindow } = useWindowRegistry();
  const windowRef = useRef<HTMLDivElement>(null);

  // 1. Subscribe to React State (Registry/Meta)
  const [state, setState] = useState(() => windowStore.get(id));

  useEffect(() => {
    return windowStore.subscribe(id, (newState) => {
      setState(newState);
    });
  }, [id]);

  // 2. Subscribe to Geometry (rAF/Direct DOM)
  useEffect(() => {
    return windowStore.subscribeGeometry(id, (geom) => {
      if (windowRef.current) {
        windowRef.current.style.transform = `translate3d(${geom.x}px, ${geom.y}px, 0)`;
      }
    });
  }, [id]);

  // 3. Drag Logic with Pointer Events (Solves Iframe Issue)
  const handlePointerDown = (e: React.PointerEvent) => {
    // Only drag from titlebar
    if (!(e.target as HTMLElement).closest(".win-titlebar")) return;
    if ((e.target as HTMLElement).closest(".win-window-controls")) return;

    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    focusWindow(id);
    windowStore.startDrag(id, e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (state.isDragging) {
      windowStore.updateDrag(e.clientX, e.clientY);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (state.isDragging) {
      windowStore.endDrag();
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    }
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClose) onClose();
    else closeWindow(id);
  };

  if (state.minimized) return null;

  return (
    <div
      ref={windowRef}
      className="win-window-base win-window win-window-frame"
      // inline-style: allowed (reason: drag/resize; why: window position from drag state; revisit: FP7)
      style={{
        transform: `translate3d(${state.x}px, ${state.y}px, 0)`,
        zIndex: state.zIndex,
        width: state.width,
        boxShadow: state.zIndex > 10 ? "0.25rem 0.25rem 0.625rem rgb(0 0 0 / 50%)" : undefined,
      }}
      onMouseDown={() => focusWindow(id)}
      data-testid={`window-${id}`}
    >
      <header
        className={`win-titlebar ${state.isDragging ? "win-titlebar-dragging" : ""}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <div className="title">
          <span>◆</span>
          <span>{title}</span>
        </div>
        <CaptionButtons 
          onClose={handleClose}
          data-testid={`window-${id}-controls`}
        />
      </header>
      <div className="win-window-content">{children}</div>
    </div>
  );
}
