/**
 * Shell — WindowManager + Desktop + Taskbar + AppHost + drag/resize.
 * UX: taskbar toggle, desktop click, titlebar clamp.
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { WindowManager, getComputedMinSize } from "./core/WindowManager";
import { getHandlerForMime, getMimeForPath } from "./lib/fp4/handler";
import { analytics } from "./core/analytics";
import { DesktopView } from "./ui/DesktopView";
import { DesktopIcon } from "./ui/DesktopIcon";
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

  const openMyComputer = useCallback(() => {
    wm.createWindow({ src: "/apps/explorer/", title: "My Computer" });
    refresh();
  }, [wm, refresh]);

  const openViewerFromPlaylist = useCallback(
    (path: string, playlist: Array<{ path: string; url: string }>, title: string) => {
      const mime = getMimeForPath(path);
      if (!mime) return;
      const handler = getHandlerForMime(mime);
      if (!handler) return;
      const initial = playlist.find((p) => p.path === path) ?? playlist[0];
      if (!initial) return;
      const appId = handler.appId === "image-viewer" ? "image-viewer" : "media-player";
      const src = `/apps/${appId}/`;
      wm.createWindow({
        src,
        title,
        openFilePayload: {
          initialPath: path,
          initialUrl: initial.url,
          playlist,
        },
      });
      refresh();
    },
    [wm, refresh]
  );

  const handleShellOpenFile = useCallback(
    (payload: { path: string; playlist: Array<{ path: string; url: string }> }) => {
      const title = payload.path.split("/").pop() ?? "File";
      openViewerFromPlaylist(payload.path, payload.playlist, title);
    },
    [openViewerFromPlaylist]
  );

  const handleShellOpen = useCallback(
    async (payload: { kind: string; path: string; mime?: string; title?: string }) => {
      if (payload.kind === "app") {
        const indexPath = payload.path.replace(/\/$/, "") + "/index.html";
        const maxAttempts = 3;
        const delayMs = 300;
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
          try {
            const res = await fetch("/api/fs/open-url", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ path: indexPath }),
            });
            if (res.ok) {
              const data = await res.json();
              const url = data.url;
              if (typeof url === "string") {
                const title = payload.title ?? indexPath.split("/").slice(-2, -1)[0] ?? "App";
                wm.createWindow({ src: url, title });
                refresh();
              }
              return;
            }
            if (res.status !== 404 || attempt === maxAttempts - 1) return;
            await new Promise((r) => setTimeout(r, delayMs));
          } catch {
            if (attempt === maxAttempts - 1) return;
            await new Promise((r) => setTimeout(r, delayMs));
          }
        }
        return;
      }
      if (payload.kind === "file") {
        const mime = payload.mime ?? getMimeForPath(payload.path);
        if (!mime) return;
        const handler = getHandlerForMime(mime);
        if (!handler) return;
        try {
          const res = await fetch("/api/fs/open-url", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ path: payload.path }),
          });
          if (!res.ok) return;
          const data = await res.json();
          const url = data.url;
          if (typeof url !== "string") return;
          const playlist = [{ path: payload.path, url }];
          const title = payload.title ?? payload.path.split("/").pop() ?? "File";
          openViewerFromPlaylist(payload.path, playlist, title);
        } catch {
          /* ignore */
        }
      }
    },
    [wm, refresh, openViewerFromPlaylist]
  );

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
        const w = wm.getWindow(id);
        if (!w) return;
        if (w.state === "maximized") {
          wm.unmaximize(id);
        } else {
          wm.maximize(id, {
            x: 0,
            y: 0,
            width: window.innerWidth,
            height: window.innerHeight,
          });
        }
        refresh();
      },
      onClose: () => closeWindow(id),
      onFocus: () => {
        wm.focus(id);
        refresh();
      },
      onDragStart: (e) => {
        const w = wm.getWindow(id);
        if (!w || w.state === "maximized") return;
        dragStateRef.current = {
          id,
          startX: e.clientX,
          startY: e.clientY,
          startBounds: { x: w.bounds.x, y: w.bounds.y },
        };
      },
      onResizeStart: (edge, e) => {
        const w = wm.getWindow(id);
        if (!w || w.state === "maximized") return;
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
        const w = wm.getWindow(id);
        const { width: minW, height: minH } = getComputedMinSize(scale, {
          minWidth: w?.minWidth,
          minHeight: w?.minHeight,
        });
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        let { x, y, width, height } = { ...startBounds };
        if (edge.includes("e")) width = Math.max(minW, startBounds.width + dx);
        if (edge.includes("w")) {
          const newWidth = Math.max(minW, startBounds.width - dx);
          x = startBounds.x + startBounds.width - newWidth;
          width = newWidth;
        }
        if (edge.includes("s")) height = Math.max(minH, startBounds.height + dy);
        if (edge.includes("n")) {
          const newHeight = Math.max(minH, startBounds.height - dy);
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
  }, [wm, refresh, clampDrag, scale]);

  const taskbarItems = windows.map((w) => ({
    windowId: w.id,
    title: w.title,
    isActive: activeId === w.id,
    isMinimized: w.state === "minimized",
  }));

  const visibleOrder = zOrder.filter((id) => {
    const w = wm.getWindow(id);
    return w && w.state !== "closed";
  });

  const cycleTheme = useCallback(() => {
    setThemeId((prev) => (prev === "DefaultMock" ? "Win98Mock" : "DefaultMock"));
  }, []);

  const cycleScale = useCallback(() => {
    setScale((prev) => (prev === 1.0 ? 1.5 : 1.0));
  }, []);

  return (
    <ThemeScaleProvider theme={themeId} scale={scale}>
      <div className="shell-root">
        <DesktopView theme={theme} scale={scale} onClick={handleDesktopClick}>
          <DesktopIcon
            label="My Computer"
            onClick={(e) => {
              e.stopPropagation();
              openMyComputer();
            }}
          />
          <div className="shell-toolbar">
            <button
              type="button"
              className="shell-btn"
              onClick={(e) => {
                e.stopPropagation();
                createWindow();
              }}
            >
              New window
            </button>
            <button
              type="button"
              className="shell-btn"
              onClick={(e) => {
                e.stopPropagation();
                cycleTheme();
              }}
            >
              Switch theme
            </button>
            <button
              type="button"
              className="shell-btn"
              onClick={(e) => {
                e.stopPropagation();
                cycleScale();
              }}
            >
              Switch scale
            </button>
          </div>
        </DesktopView>

        {visibleOrder.map((id, idx) => {
          const w = wm.getWindow(id);
          if (!w) return null;
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
              minWidth={w.minWidth}
              minHeight={w.minHeight}
            >
              {w.src ? (
                <AppHost
                  windowId={id}
                  src={
                    w.src.includes("/apps/explorer")
                      ? `${w.src}?w=${encodeURIComponent(id)}`
                      : w.src
                  }
                  scale={scale}
                  theme={themeId}
                  onTitleUpdate={handleTitleUpdate}
                  isExplorer={w.src.includes("/apps/explorer")}
                  onShellOpen={w.src.includes("/apps/explorer") ? handleShellOpen : undefined}
                  onShellOpenFile={
                    w.src.includes("/apps/explorer") ? handleShellOpenFile : undefined
                  }
                  openFilePayload={w.openFilePayload}
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
