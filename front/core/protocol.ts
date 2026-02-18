/**
 * PROTOCOL_v0 — message types, allowlist, routing.
 */

export const ALLOWED_ORIGINS = [
  "http://shell.local",
  "http://shell.local:80",
  "http://localhost:5173",
  "http://localhost:80",
  "http://127.0.0.1:5173",
  "http://127.0.0.1",
  "null", // sandboxed same-origin iframe
];

export interface ShellMessage {
  type: string;
  payload?: Record<string, unknown>;
  timestamp?: number;
}

export function isAllowedOrigin(origin: string): boolean {
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  if (origin.startsWith("http://localhost") || origin.startsWith("http://127.0.0.1")) return true;
  return false;
}

export function createShellCaps(windowId: string, scale: number, theme: string): ShellMessage {
  return {
    type: "SHELL_CAPS",
    payload: { windowId, scale, theme },
    timestamp: Date.now(),
  };
}
