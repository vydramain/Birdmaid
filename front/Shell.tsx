/**
 * Shell — WindowManager + Desktop + Taskbar + AppHost + drag/resize.
 * UX: taskbar toggle, desktop click, titlebar clamp.
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { WindowManager } from "./core/WindowManager";
import { analytics } from "./core/analytics";
import { DesktopView } from "./ui/DesktopView";
import { WindowChromeView } from "./ui/WindowChromeView";
import { TaskbarView } from "./ui/TaskbarView";
import { AppHost } from "./core/AppHost";
import { ThemeScaleProvider } from "./core/ThemeScaleProvider";
import { THEME_PACKS, type ThemeId } from "./core/themePacks";
import type { WindowState, WindowActions, ResizeEdge } from "./core/types";
import type { WindowRecord } from "./core/WindowManager";

function themeToTokenSet(themeId: ThemeId) {
  const p = THEME_PACKS[themeId];
  return {
    bg: p["--wm-bg"],
    fg: p["--wm-fg"],
    border: p["--wm-border"],
    accent: p["--wm-accent"],
    shadow: p["--wm-shadow"],
    fontFamily: p["--wm-font-family"],
  };
}

const TITLEBAR_HEIGHT = 28;

function toWindowState(w: WindowRecord): WindowState {
  return {
    id: w.id,
    title: w.title,
    state: w.state === "closed" ? "normal" : w.state,
    bounds: { ...w.bounds },
    placeholder: undefined,
  };
}

export function Shell() {
  const [wm] = useState(() => new WindowManager());
  const [windows, setWindows] = useState<WindowRecord[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [zOrder, setZOrder] = useState<string[]>([]);
  const [themeId, setThemeId] = useState<ThemeId>("DefaultMock");
  const [scale, setScale] = useState(1.0);
  const theme = themeToTokenSet(themeId);
  const dragStateRef = useRef<{
    id: string;
    startX: number;
    startY: number;
    startBounds: { x: number; y: number };
  } | null>(null);
  const resizeStateRef = useRef<{
    id: string;
    edge: ResizeEdge;
    startX: number;
    startY: number;
    startBounds: { x: number; y: number; width: number; height: number };
  } | null>(null);

  const refresh = useCallback(() => {
    setWindows(wm.getWindows());
    setActiveId(wm.getActiveId());
    setZOrder(wm.getZOrder());
  }, [wm]);

  const createWindow = useCallback(() => {
    wm.createWindow({ src: "/testapp.html", title: "Untitled" });
    refresh();
  }, [wm, refresh]);

  const closeWindow = useCallback(
    (id: string) => {
      wm.close(id);
      refresh();
    },
    [wm, refresh]
  );

  const handleDesktopClick = useCallback(() => {
    wm.focusDesktop();
    refresh();
  }, [wm, refresh]);

  const handleTaskbarClick = useCallback(
    (id: string) => {
      wm.onTaskbarItemClick(id);
      refresh();
    },
    [wm, refresh]
  );

  const handleTitleUpdate = useCallback(
    (id: string, title: string) => {
      wm.updateTitle(id, title);
      refresh();
    },
    [wm, refresh]
  );

  const clampDrag = useCallback(
    (id: string, x: number, y: number) => {
      const w = wm.getWindow(id);
      if (!w) return { x, y };
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const th = TITLEBAR_HEIGHT;
      const minY = 0;
      const maxY = vh - th;
      const minX = -w.bounds.width + 20;
      const maxX = vw - 20;
      return {
        x: Math.max(minX, Math.min(maxX, x)),
        y: Math.max(minY, Math.min(maxY, y)),
      };
    },
    [wm]
  );

  const getActions = useCallback(
    (id: string): WindowActions => ({
      onMinimize: () => {
        wm.minimize(id);
        refresh();
      },
      onMaximize: () => {
        wm.maximize(id);
        refresh();
      },
      onClose: () => closeWindow(id),
      onFocus: () => {
        wm.focus(id);
        refresh();
      },
      onDragStart: (e) => {
        const w = wm.getWindow(id);
        if (!w) return;
        dragStateRef.current = {
          id,
          startX: e.clientX,
          startY: e.clientY,
          startBounds: { x: w.bounds.x, y: w.bounds.y },
        };
      },
      onResizeStart: (edge, e) => {
        const w = wm.getWindow(id);
        if (!w) return;
        e.preventDefault();
        resizeStateRef.current = {
          id,
          edge,
          startX: e.clientX,
          startY: e.clientY,
          startBounds: { ...w.bounds },
        };
      },
    }),
    [wm, refresh, closeWindow]
  );

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (dragStateRef.current) {
        const { id, startX, startY, startBounds } = dragStateRef.current;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        const { x, y } = clampDrag(id, startBounds.x + dx, startBounds.y + dy);
        wm.updateBounds(id, { x, y });
        refresh();
      }
      if (resizeStateRef.current) {
        const { id, edge, startX, startY, startBounds } = resizeStateRef.current;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        let { x, y, width, height } = { ...startBounds };
        if (edge.includes("e")) width = Math.max(200, startBounds.width + dx);
        if (edge.includes("w")) {
          const newWidth = Math.max(200, startBounds.width - dx);
          x = startBounds.x + startBounds.width - newWidth;
          width = newWidth;
        }
        if (edge.includes("s")) height = Math.max(150, startBounds.height + dy);
        if (edge.includes("n")) {
          const newHeight = Math.max(150, startBounds.height - dy);
          y = startBounds.y + startBounds.height - newHeight;
          height = newHeight;
        }
        wm.updateBounds(id, { x, y, width, height });
        refresh();
      }
    };
    const onMouseUp = () => {
      if (dragStateRef.current) {
        analytics.drag_end(dragStateRef.current.id);
      }
      if (resizeStateRef.current) {
        analytics.resize_end(resizeStateRef.current.id);
      }
      dragStateRef.current = null;
      resizeStateRef.current = null;
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [wm, refresh, clampDrag]);

  const taskbarItems = windows.map((w) => ({
    windowId: w.id,
    title: w.title,
    isActive: activeId === w.id,
    isMinimized: w.state === "minimized",
  }));

  const visibleOrder = zOrder.filter((id) => {
    const w = wm.getWindow(id);
    return w && w.state !== "minimized";
  });

  const cycleTheme = useCallback(() => {
    setThemeId((prev) => (prev === "DefaultMock" ? "Win98Mock" : "DefaultMock"));
  }, []);

  const cycleScale = useCallback(() => {
    setScale((prev) => (prev === 1.0 ? 1.5 : 1.0));
  }, []);

  return (
    <ThemeScaleProvider theme={themeId} scale={scale}>
      <div style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden" }}>
        <DesktopView theme={theme} scale={scale} onClick={handleDesktopClick}>
          <div
            style={{
              position: "absolute",
              top: 10,
              left: 10,
              zIndex: 50,
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                createWindow();
              }}
              style={{ padding: "8px 16px", fontSize: 14, cursor: "pointer" }}
            >
              New window
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                cycleTheme();
              }}
              style={{ padding: "8px 16px", fontSize: 14, cursor: "pointer" }}
            >
              Switch theme
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                cycleScale();
              }}
              style={{ padding: "8px 16px", fontSize: 14, cursor: "pointer" }}
            >
              Switch scale
            </button>
          </div>
        </DesktopView>

      {visibleOrder.map((id, idx) => {
        const w = wm.getWindow(id);
        if (!w || w.state === "minimized") return null;
        const winState = toWindowState(w);
        return (
          <WindowChromeView
            key={id}
            window={winState}
            zIndex={100 + idx}
            isActive={activeId === id}
            actions={getActions(id)}
            theme={theme}
            scale={scale}
          >
            {w.src ? (
              <AppHost
                windowId={id}
                src={w.src}
                scale={scale}
                theme={themeId}
                onTitleUpdate={handleTitleUpdate}
              />
            ) : null}
          </WindowChromeView>
        );
      })}

      <TaskbarView
        items={taskbarItems}
        theme={theme}
        scale={scale}
        onItemClick={handleTaskbarClick}
      />
    </div>
    </ThemeScaleProvider>
  );
}
