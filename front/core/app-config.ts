/**
 * App paths and routes for Shell (browser).
 * Mirrors scripts/fixture-apps.config.cjs — keep in sync when adding apps.
 */

const API_APPS_BASE = "/@root/DISK_C/Program Files";

const APP_KEYS = ["explorer", "image-viewer", "media-player", "internet-explorer"] as const;

const APP_NAMES: Record<(typeof APP_KEYS)[number], string> = {
  explorer: "Explorer",
  "image-viewer": "Image Viewer",
  "media-player": "Media Player",
  "internet-explorer": "Internet Explorer",
};

export const APP_PATHS: Record<string, string> = Object.fromEntries(
  APP_KEYS.map((k) => [k, `${API_APPS_BASE}/${APP_NAMES[k]}/`])
);

export const APP_ROUTES: Record<string, string> = Object.fromEntries(
  APP_KEYS.map((k) => [k, `/apps/${k}/`])
);

export const EXPLORER_ROUTE = "/apps/explorer";
export const EXPLORER_PATH_SUBSTR = "Program Files/Explorer";
