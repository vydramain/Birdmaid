/**
 * WindowManager — create/minimize/maximize/close, z-order, focus.
 * FP1 AC B1, transitions, z-order, focus. Single source of truth.
 */

import { analytics } from "./analytics";

export type WindowState = "normal" | "minimized" | "maximized" | "closed";

export interface WindowBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface OpenFilePayload {
  initialPath: string;
  initialUrl: string;
  playlist: Array<{ path: string; url: string }>;
}

export interface WindowRecord {
  id: string;
  title: string;
  state: WindowState;
  bounds: WindowBounds;
  src?: string;
  openFilePayload?: OpenFilePayload;
  /** FP4.1: per-app min size (optional). */
  minWidth?: number;
  minHeight?: number;
}

const DEFAULT_WIDTH = 400;
const DEFAULT_HEIGHT = 300;
const DEFAULT_X = 100;
const DEFAULT_Y = 80;
/** FP4.1: default min size for iframe windows. */
export const DEFAULT_MIN_WIDTH = 320;
export const DEFAULT_MIN_HEIGHT = 240;
const MIN_WIDTH = DEFAULT_MIN_WIDTH;
const MIN_HEIGHT = DEFAULT_MIN_HEIGHT;

let nextId = 1;

function genId(): string {
  return `win-${nextId++}`;
}

export interface Viewport {
  width: number;
  height: number;
  x?: number;
  y?: number;
}

export class WindowManager {
  private windows: Map<string, WindowRecord> = new Map();
  private zOrder: string[] = [];
  private activeId: string | null = null;
  private prevBounds: Map<string, WindowBounds> = new Map();

  createWindow(opts: {
    id?: string;
    src?: string;
    title?: string;
    openFilePayload?: OpenFilePayload;
    minWidth?: number;
    minHeight?: number;
  }): WindowRecord {
    const id = opts.id ?? genId();
    if (this.windows.has(id)) {
      throw new Error(`Window ${id} already exists`);
    }
    const win: WindowRecord = {
      id,
      title: opts.title ?? "Untitled",
      state: "normal",
      bounds: {
        x: DEFAULT_X + (this.windows.size % 3) * 30,
        y: DEFAULT_Y + (this.windows.size % 3) * 30,
        width: DEFAULT_WIDTH,
        height: DEFAULT_HEIGHT,
      },
      src: opts.src,
      openFilePayload: opts.openFilePayload,
      minWidth: opts.minWidth,
      minHeight: opts.minHeight,
    };
    this.windows.set(id, win);
    this.zOrder.push(id);
    analytics.window_open(id);
    return win;
  }

  close(id: string): void {
    if (!this.windows.has(id)) return;
    analytics.window_close(id);
    this.windows.delete(id);
    this.prevBounds.delete(id);
    this.zOrder = this.zOrder.filter((x) => x !== id);
    if (this.activeId === id) this.activeId = null;
  }

  minimize(id: string): void {
    const w = this.windows.get(id);
    if (!w || w.state === "minimized") return;
    w.state = "minimized";
    analytics.window_minimize(id);
  }

  maximize(id: string, viewport: Viewport): void {
    const w = this.windows.get(id);
    if (!w || w.state === "maximized") return;
    this.prevBounds.set(id, { ...w.bounds });
    w.bounds = {
      x: viewport.x ?? 0,
      y: viewport.y ?? 0,
      width: viewport.width,
      height: viewport.height,
    };
    w.state = "maximized";
    analytics.window_maximize(id);
  }

  restore(id: string): void {
    const w = this.windows.get(id);
    if (!w) return;
    if (w.state === "minimized") {
      w.state = "normal";
      analytics.window_restore(id);
    }
  }

  unmaximize(id: string): void {
    const w = this.windows.get(id);
    if (!w) return;
    if (w.state === "maximized") {
      const prev = this.prevBounds.get(id);
      if (prev) {
        const minW = w.minWidth ?? MIN_WIDTH;
        const minH = w.minHeight ?? MIN_HEIGHT;
        w.bounds = {
          ...prev,
          width: Math.max(minW, prev.width),
          height: Math.max(minH, prev.height),
        };
        this.prevBounds.delete(id);
      }
      w.state = "normal";
      analytics.window_unmaximize(id);
    }
  }

  focus(id: string): void {
    if (!this.windows.has(id)) return;
    this.activeId = id;
    this.bringToTop(id);
    analytics.window_focus(id);
  }

  focusDesktop(): void {
    this.activeId = null;
  }

  bringToTop(id: string): void {
    this.zOrder = [...this.zOrder.filter((x) => x !== id), id];
  }

  getWindows(): WindowRecord[] {
    return Array.from(this.windows.values());
  }

  getActiveId(): string | null {
    return this.activeId;
  }

  getZOrder(): string[] {
    return [...this.zOrder];
  }

  updateBounds(id: string, bounds: Partial<WindowBounds>): void {
    const w = this.windows.get(id);
    if (!w) return;
    if (w.state === "maximized") return;
    if (bounds.x !== undefined) w.bounds.x = bounds.x;
    if (bounds.y !== undefined) w.bounds.y = bounds.y;
    const minW = w.minWidth ?? MIN_WIDTH;
    const minH = w.minHeight ?? MIN_HEIGHT;
    if (bounds.width !== undefined) w.bounds.width = Math.max(minW, bounds.width);
    if (bounds.height !== undefined) w.bounds.height = Math.max(minH, bounds.height);
  }

  updateTitle(id: string, title: string): void {
    const w = this.windows.get(id);
    if (w) w.title = title;
  }

  getWindow(id: string): WindowRecord | undefined {
    return this.windows.get(id);
  }

  onTaskbarItemClick(id: string): void {
    const w = this.windows.get(id);
    if (!w) return;
    analytics.taskbar_click(id);
    if (w.state === "minimized") {
      this.restore(id);
      this.focus(id);
    } else if (this.activeId === id) {
      this.minimize(id);
    } else {
      this.focus(id);
    }
  }
}
