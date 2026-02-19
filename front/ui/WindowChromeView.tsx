import type { WindowState, WindowActions, ResizeEdge } from "../core/types";

interface WindowChromeViewProps {
  window: WindowState;
  isActive: boolean;
  actions: WindowActions;
  theme: { fontFamily: string };
  scale: number;
  zIndex?: number;
  children?: React.ReactNode;
}

const RESIZE_EDGES: ResizeEdge[] = ["n", "s", "e", "w", "ne", "nw", "se", "sw"];

export function WindowChromeView({
  window: win,
  isActive,
  actions,
  children,
  zIndex = 100,
}: WindowChromeViewProps) {
  const isMinimized = win.state === "minimized";
  if (isMinimized) return null;

  return (
    <div
      data-testid="window-chrome"
      className="wm-window"
      data-active={isActive ? "true" : undefined}
      // inline-style: allowed (reason: drag/resize; why: bounds from WindowManager state; revisit: FP7)
      style={{
        left: win.bounds.x,
        top: win.bounds.y,
        width: win.bounds.width,
        height: win.bounds.height,
        zIndex,
      }}
    >
      <div
        data-testid="window-titlebar"
        className="wm-titlebar"
        data-draggable
        onMouseDown={(e) => {
          if ((e.target as HTMLElement).closest("button")) return;
          actions.onFocus();
          actions.onDragStart(e);
        }}
      >
        <span data-testid="window-title" className="wm-window-title">
          {win.title}
        </span>
        <div className="wm-titlebar-actions">
          <button
            type="button"
            className="wm-titlebar-btn"
            aria-label="Minimize"
            onClick={(e) => {
              e.stopPropagation();
              actions.onMinimize();
            }}
          >
            −
          </button>
          <button
            type="button"
            className="wm-titlebar-btn"
            aria-label="Maximize"
            onClick={(e) => {
              e.stopPropagation();
              actions.onMaximize();
            }}
          >
            □
          </button>
          <button
            type="button"
            className="wm-titlebar-btn"
            aria-label="Close"
            onClick={(e) => {
              e.stopPropagation();
              actions.onClose();
            }}
          >
            ×
          </button>
        </div>
      </div>
      <div className="wm-window-body">
        {win.placeholder ? (
          <div className="wm-window-placeholder">{win.placeholder}</div>
        ) : (
          children
        )}
      </div>
      {RESIZE_EDGES.map((edge) => (
        <div
          key={edge}
          className="wm-resize-edge"
          data-resize-edge={edge}
          onMouseDown={(e) => {
            e.stopPropagation();
            actions.onResizeStart(edge, e);
          }}
        />
      ))}
    </div>
  );
}
