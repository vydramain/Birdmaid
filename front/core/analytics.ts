/**
 * FP1 analytics — events (buffer).
 * Events: window_*, drag_end, resize_end, taskbar_click, app_ready, handshake_timeout, message_rejected.
 */

export type ShellEvent =
  | { type: "window_open"; windowId: string }
  | { type: "window_close"; windowId: string }
  | { type: "window_minimize"; windowId: string }
  | { type: "window_restore"; windowId: string }
  | { type: "window_maximize"; windowId: string }
  | { type: "window_unmaximize"; windowId: string }
  | { type: "window_focus"; windowId: string }
  | { type: "drag_end"; windowId: string }
  | { type: "resize_end"; windowId: string }
  | { type: "taskbar_click"; windowId: string }
  | { type: "app_ready"; windowId: string }
  | { type: "handshake_timeout"; windowId: string }
  | { type: "message_rejected"; reason: string; origin?: string };

const buffer: ShellEvent[] = [];
const MAX_BUFFER = 200;

function emit(event: ShellEvent): void {
  buffer.push(event);
  if (buffer.length > MAX_BUFFER) buffer.shift();
  if (import.meta.env.DEV && typeof console?.debug === "function") {
    console.debug("[Shell]", event.type, event);
  }
}

export const analytics = {
  emit,
  getBuffer: (): readonly ShellEvent[] => buffer,
  clearBuffer: (): void => {
    buffer.splice(0, buffer.length);
  },

  window_open: (windowId: string) => emit({ type: "window_open", windowId }),
  window_close: (windowId: string) => emit({ type: "window_close", windowId }),
  window_minimize: (windowId: string) => emit({ type: "window_minimize", windowId }),
  window_restore: (windowId: string) => emit({ type: "window_restore", windowId }),
  window_maximize: (windowId: string) => emit({ type: "window_maximize", windowId }),
  window_unmaximize: (windowId: string) => emit({ type: "window_unmaximize", windowId }),
  window_focus: (windowId: string) => emit({ type: "window_focus", windowId }),
  drag_end: (windowId: string) => emit({ type: "drag_end", windowId }),
  resize_end: (windowId: string) => emit({ type: "resize_end", windowId }),
  taskbar_click: (windowId: string) => emit({ type: "taskbar_click", windowId }),
  app_ready: (windowId: string) => emit({ type: "app_ready", windowId }),
  handshake_timeout: (windowId: string) => emit({ type: "handshake_timeout", windowId }),
  message_rejected: (reason: string, origin?: string) =>
    emit({ type: "message_rejected", reason, origin }),
};

declare global {
  interface Window {
    __shellAnalytics?: typeof analytics;
  }
}

if (typeof window !== "undefined") {
  window.__shellAnalytics = analytics;
}
