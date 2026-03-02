/**
 * Single source of truth for fixture app paths.
 * Used by: vite.config.ts, vite.apps.config.ts, copy-app-to-fixtures.cjs, eslint.config.js
 * Frontend: front/core/app-config.ts (mirrors APP_PATHS, APP_ROUTES for browser)
 */
const FIXTURE_APPS_BASE = "infra/minio/fixtures/DISK_C/Program Files";
const API_APPS_BASE = "/@root/DISK_C/Program Files";

const APP_NAMES = {
  explorer: "Explorer",
  "image-viewer": "Image Viewer",
  "media-player": "Media Player",
  "internet-explorer": "Internet Explorer",
};

const APP_KEYS = ["explorer", "image-viewer", "media-player", "internet-explorer"];

const FIXTURE_APPS = {
  explorer: `${FIXTURE_APPS_BASE}/Explorer`,
  "image-viewer": `${FIXTURE_APPS_BASE}/Image Viewer`,
  "media-player": `${FIXTURE_APPS_BASE}/Media Player`,
  "internet-explorer": `${FIXTURE_APPS_BASE}/Internet Explorer`,
};

/** API paths for FS (Shell pathToSystemAppRoute, app discovery). */
const APP_PATHS = Object.fromEntries(
  APP_KEYS.map((k) => [k, `${API_APPS_BASE}/${APP_NAMES[k]}/`])
);

/** iframe src routes (Shell SYSTEM_APP_ROUTES). */
const APP_ROUTES = Object.fromEntries(APP_KEYS.map((k) => [k, `/apps/${k}/`]));

/** For isExplorerWindow: src contains explorer route or S3 path. */
const EXPLORER_ROUTE = "/apps/explorer";
const EXPLORER_PATH_SUBSTR = "Program Files/Explorer";

function getAppDir(appKey) {
  const base = FIXTURE_APPS[appKey] ?? FIXTURE_APPS["image-viewer"];
  return `${base}/_source`;
}

function getAppDisplayName(appKey) {
  return APP_NAMES[appKey] ?? APP_NAMES["image-viewer"];
}

/** ESLint files for no-console override (Explorer + viewers log errors). */
function getEslintAppFiles() {
  return Object.values(FIXTURE_APPS).flatMap((base) => [
    `${base}/main.ts`,
    `${base}/_source/main.ts`,
  ]);
}

module.exports = {
  FIXTURE_APPS_BASE,
  API_APPS_BASE,
  APP_NAMES,
  APP_KEYS,
  FIXTURE_APPS,
  APP_PATHS,
  APP_ROUTES,
  EXPLORER_ROUTE,
  EXPLORER_PATH_SUBSTR,
  getAppDir,
  getAppDisplayName,
  getEslintAppFiles,
};
