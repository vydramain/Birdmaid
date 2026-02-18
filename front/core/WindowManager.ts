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

export interface WindowRecord {
  id: string;
  title: string;
  state: WindowState;
  bounds: WindowBounds;
  src?: string;
}

const DEFAULT_WIDTH = 400;
const DEFAULT_HEIGHT = 300;
const DEFAULT_X = 100;
const DEFAULT_Y = 80;
const MIN_WIDTH = 200;
const MIN_HEIGHT = 150;

let nextId = 1;

function genId(): string {
  return `win-${nextId++}`;
}

export class WindowManager {
  private windows: Map<string, WindowRecord> = new Map();
  private zOrder: string[] = [];
  private activeId: string | null = null;

  createWindow(opts: { id?: string; src?: string; title?: string }): WindowRecord {
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
    this.zOrder = this.zOrder.filter((x) => x !== id);
    if (this.activeId === id) this.activeId = null;
  }

  minimize(id: string): void {
    const w = this.windows.get(id);
    if (!w || w.state === "minimized") return;
    w.state = "minimized";
    analytics.window_minimize(id);
  }

  maximize(id: string): void {
    const w = this.windows.get(id);
    if (!w || w.state === "maximized") return;
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
    if (bounds.x !== undefined) w.bounds.x = bounds.x;
    if (bounds.y !== undefined) w.bounds.y = bounds.y;
    if (bounds.width !== undefined) w.bounds.width = Math.max(MIN_WIDTH, bounds.width);
    if (bounds.height !== undefined) w.bounds.height = Math.max(MIN_HEIGHT, bounds.height);
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
