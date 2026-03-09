/**
 * useWindowActions — WindowManager wrapper with reactive state.
 * Drag/resize state, create/close/focus, shell open handlers.
 */

import { ref } from "vue";
import { WindowManager } from "../core/WindowManager";
import { getHandlerForMime, getMimeForPath } from "../lib/fp4/handler";
import { isUserAppPath, buildUserAppSrc } from "../lib/fp5/user-app";
import { THEME_PACKS, type ThemeId } from "../core/themePacks";
import type { WindowState, WindowActions, ResizeEdge } from "../core/types";
import type { WindowRecord } from "../core/WindowManager";
import { APP_PATHS, APP_ROUTES, EXPLORER_ROUTE, EXPLORER_PATH_SUBSTR } from "../core/app-config";

const TITLEBAR_HEIGHT = 28;

export function themeToTokenSet(themeId: ThemeId) {
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

function pathToSystemAppRoute(path: string): string | null {
  const normalized = path.replace(/\/$/, "").replace(/\/index\.html$/, "") + "/";
  for (const [appId, appPath] of Object.entries(APP_PATHS)) {
    const base = appPath.replace(/\/$/, "") + "/";
    if (normalized.startsWith(base) || normalized === base) {
      return APP_ROUTES[appId] ?? null;
    }
  }
  return null;
}

export function isExplorerWindow(src: string | undefined): boolean {
  if (!src) return false;
  return (
    src.includes(EXPLORER_ROUTE) ||
    src.includes(EXPLORER_PATH_SUBSTR) ||
    src.includes(EXPLORER_PATH_SUBSTR.replace(/ /g, "%20"))
  );
}

/** FP4: Wrap s3.shell.local signed URLs in proxy to bypass CORS */
function toProxyUrl(signedUrl: string): string {
  if (!signedUrl.includes("s3.shell.local")) return signedUrl;
  return `/api/fs/proxy?url=${encodeURIComponent(signedUrl)}`;
}

export function toWindowState(w: WindowRecord): WindowState {
  return {
    id: w.id,
    title: w.title,
    state: w.state === "closed" ? "normal" : w.state,
    bounds: { ...w.bounds },
    placeholder: undefined,
  };
}

export interface DragState {
  id: string;
  startX: number;
  startY: number;
  startBounds: { x: number; y: number };
}

export interface ResizeState {
  id: string;
  edge: ResizeEdge;
  startX: number;
  startY: number;
  startBounds: { x: number; y: number; width: number; height: number };
}

export function useWindowActions() {
  const wm = new WindowManager();
  const windows = ref<WindowRecord[]>([]);
  const activeId = ref<string | null>(null);
  const zOrder = ref<string[]>([]);

  // Imperative drag/resize state — no reactivity needed
  let dragState: DragState | null = null;
  let resizeState: ResizeState | null = null;

  function refresh() {
    windows.value = wm.getWindows();
    activeId.value = wm.getActiveId();
    zOrder.value = wm.getZOrder();
  }

  function createWindow() {
    wm.createWindow({ src: "/testapp.html", title: "Untitled" });
    refresh();
  }

  function openMyComputer() {
    wm.createWindow({ src: "/apps/explorer/", title: "My Computer" });
    refresh();
  }

  function openViewerFromPlaylist(
    path: string,
    playlist: Array<{ path: string; url: string }>,
    title: string
  ) {
    const mime = getMimeForPath(path);
    if (!mime) return;
    const handler = getHandlerForMime(mime);
    if (!handler) return;
    const initial = playlist.find((p) => p.path === path) ?? playlist[0];
    if (!initial) return;
    const appId =
      handler.appId === "image-viewer"
        ? "image-viewer"
        : handler.appId === "media-player"
          ? "media-player"
          : "internet-explorer";
    const src = APP_ROUTES[appId];
    if (!src) return;
    const proxiedPlaylist = playlist.map((p) => ({ path: p.path, url: toProxyUrl(p.url) }));
    const proxiedInitial = proxiedPlaylist.find((p) => p.path === path) ?? proxiedPlaylist[0];
    wm.createWindow({
      src,
      title,
      openFilePayload: {
        initialPath: path,
        initialUrl: proxiedInitial.url,
        playlist: proxiedPlaylist,
      },
    });
    refresh();
  }

  function handleShellOpenFile(payload: {
    path: string;
    playlist: Array<{ path: string; url: string }>;
  }) {
    const title = payload.path.split("/").pop() ?? "File";
    openViewerFromPlaylist(payload.path, payload.playlist, title);
  }

  async function handleShellOpen(payload: {
    kind: string;
    path: string;
    mime?: string;
    title?: string;
  }) {
    if (payload.kind === "app") {
      if (isUserAppPath(payload.path)) {
        const src = buildUserAppSrc(payload.path);
        const title = payload.title ?? payload.path.split("/").slice(-2, -1)[0] ?? "App";
        wm.createWindow({
          src,
          title,
          minWidth: 800,
          minHeight: 600,
        });
        refresh();
        return;
      }
      const route = pathToSystemAppRoute(payload.path);
      if (route) {
        const title = payload.title ?? payload.path.split("/").slice(-2, -1)[0] ?? "App";
        wm.createWindow({ src: route, title });
        refresh();
        return;
      }
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
  }

  function closeWindow(id: string) {
    wm.close(id);
    refresh();
  }

  function handleDesktopClick() {
    wm.focusDesktop();
    refresh();
  }

  function handleTaskbarClick(id: string) {
    wm.onTaskbarItemClick(id);
    refresh();
  }

  function handleTitleUpdate(id: string, title: string) {
    wm.updateTitle(id, title);
    refresh();
  }

  function clampDrag(id: string, x: number, y: number) {
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
  }

  function getActions(id: string): WindowActions {
    return {
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
      onDragStart: (e: MouseEvent) => {
        const w = wm.getWindow(id);
        if (!w || w.state === "maximized") return;
        dragState = {
          id,
          startX: e.clientX,
          startY: e.clientY,
          startBounds: { x: w.bounds.x, y: w.bounds.y },
        };
      },
      onResizeStart: (edge: ResizeEdge, e: MouseEvent) => {
        const w = wm.getWindow(id);
        if (!w || w.state === "maximized") return;
        e.preventDefault();
        resizeState = {
          id,
          edge,
          startX: e.clientX,
          startY: e.clientY,
          startBounds: { ...w.bounds },
        };
      },
    };
  }

  function getDragState() {
    return dragState;
  }
  function getResizeState() {
    return resizeState;
  }
  function clearDragState() {
    dragState = null;
  }
  function clearResizeState() {
    resizeState = null;
  }

  return {
    wm,
    windows,
    activeId,
    zOrder,
    refresh,
    createWindow,
    openMyComputer,
    handleShellOpen,
    handleShellOpenFile,
    closeWindow,
    handleDesktopClick,
    handleTaskbarClick,
    handleTitleUpdate,
    clampDrag,
    getActions,
    getDragState,
    getResizeState,
    clearDragState,
    clearResizeState,
  };
}
