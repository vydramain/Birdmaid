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
      style={{
        position: "absolute",
        left: win.bounds.x,
        top: win.bounds.y,
        width: win.bounds.width,
        height: win.bounds.height,
        minWidth: "var(--wm-window-min-width, 200px)",
        minHeight: "var(--wm-window-min-height, 150px)",
        border: "var(--wm-border-width, 2px) solid var(--wm-border, #ccc)",
        borderRadius: "4px",
        boxShadow: "var(--wm-shadow, 0 2px 8px rgba(0,0,0,0.15))",
        background: "var(--wm-bg, #fff)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
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
        style={{
          height: "var(--wm-titlebar-height, 28px)",
          minHeight: "var(--wm-titlebar-height, 28px)",
          background: "var(--wm-accent, #0078d4)",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingLeft: "var(--wm-padding-2, 8px)",
          paddingRight: "var(--wm-gap-1, 4px)",
          cursor: "move",
          flexShrink: 0,
        }}
      >
        <span
          data-testid="window-title"
          className="wm-window-title"
          style={{ fontSize: "var(--wm-font-size, 12px)", fontFamily: "var(--wm-font-family)" }}
        >
          {win.title}
        </span>
        <div style={{ display: "flex", gap: "var(--wm-gap-1, 4px)" }}>
          <button
            type="button"
            aria-label="Minimize"
            onClick={(e) => {
              e.stopPropagation();
              actions.onMinimize();
            }}
            style={{ width: 20, height: 20, fontSize: 14, lineHeight: 1, cursor: "pointer" }}
          >
            −
          </button>
          <button
            type="button"
            aria-label="Maximize"
            onClick={(e) => {
              e.stopPropagation();
              actions.onMaximize();
            }}
            style={{ width: 20, height: 20, fontSize: 14, lineHeight: 1, cursor: "pointer" }}
          >
            □
          </button>
          <button
            type="button"
            aria-label="Close"
            onClick={(e) => {
              e.stopPropagation();
              actions.onClose();
            }}
            style={{ width: 20, height: 20, fontSize: 14, lineHeight: 1, cursor: "pointer" }}
          >
            ×
          </button>
        </div>
      </div>
      <div
        style={{
          flex: 1,
          overflow: "hidden",
          position: "relative",
        }}
      >
        {win.placeholder ? (
          <div
            style={{
              padding: "var(--wm-padding-2, 8px)",
              color: "var(--wm-fg, #333)",
              fontSize: "var(--wm-font-size, 12px)",
            }}
          >
            {win.placeholder}
          </div>
        ) : (
          children
        )}
      </div>
      {RESIZE_EDGES.map((edge) => (
        <div
          key={edge}
          data-resize-edge={edge}
          onMouseDown={(e) => {
            e.stopPropagation();
            actions.onResizeStart(edge, e);
          }}
          style={{
            position: "absolute",
            ...getResizeEdgeStyle(edge),
          }}
        />
      ))}
    </div>
  );
}

function getResizeEdgeStyle(edge: ResizeEdge): React.CSSProperties {
  const size = 8;
  const base: React.CSSProperties = {
    cursor: getCursor(edge),
    zIndex: 10,
  };
  switch (edge) {
    case "n":
      return { ...base, top: 0, left: size, right: size, height: size };
    case "s":
      return { ...base, bottom: 0, left: size, right: size, height: size };
    case "e":
      return { ...base, right: 0, top: size, bottom: size, width: size };
    case "w":
      return { ...base, left: 0, top: size, bottom: size, width: size };
    case "ne":
      return { ...base, top: 0, right: 0, width: size, height: size };
    case "nw":
      return { ...base, top: 0, left: 0, width: size, height: size };
    case "se":
      return { ...base, bottom: 0, right: 0, width: size, height: size };
    case "sw":
      return { ...base, bottom: 0, left: 0, width: size, height: size };
  }
}

function getCursor(edge: ResizeEdge): string {
  const map: Record<ResizeEdge, string> = {
    n: "n-resize",
    s: "s-resize",
    e: "e-resize",
    w: "w-resize",
    ne: "ne-resize",
    nw: "nw-resize",
    se: "se-resize",
    sw: "sw-resize",
  };
  return map[edge];
}
