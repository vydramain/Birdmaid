/**
 * Protocol — message types, allowlist, routing. See docs/fps/FP1.md § Protocol.
 */

export const ALLOWED_ORIGINS = [
  "http://shell.local",
  "http://shell.local:80",
  "https://shell.local",
  "https://shell.local:443",
  "http://localhost:5173",
  "http://localhost:80",
  "http://127.0.0.1:5173",
  "http://127.0.0.1",
  "http://s3.shell.local", // FP3 M6: user-app FETCH_RESULT (source === iframe.contentWindow only)
  "http://s3.shell.local:80",
  "https://s3.shell.local",
  "https://s3.shell.local:443",
  "null", // sandboxed viewer iframe (allow-scripts only); AppHost accepts ONLY when event.source === iframe.contentWindow
];

export interface ShellMessage {
  type: string;
  payload?: Record<string, unknown>;
  timestamp?: number;
}

export function isAllowedOrigin(origin: string): boolean {
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  if (
    origin.startsWith("http://localhost") ||
    origin.startsWith("https://localhost") ||
    origin.startsWith("http://127.0.0.1") ||
    origin.startsWith("https://127.0.0.1")
  )
    return true;
  return false;
}

export function createShellCaps(
  windowId: string,
  scale: number,
  theme: string,
  isExplorer?: boolean
): ShellMessage {
  const payload: Record<string, unknown> = { windowId, scale, theme };
  if (isExplorer) {
    payload.systemToken = "fp3-explorer-token"; // Opaque token for Write API
  }
  return {
    type: "SHELL_CAPS",
    payload,
    timestamp: Date.now(),
  };
}
