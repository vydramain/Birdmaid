# Protocol — Shell ↔ Apps postMessage

> **CANON UPDATE;** must be merged into canonical after build.

**Purpose:** Canonical message types, handshake, routing. Consolidates FP1, FP3, FP4.  
**References:** [FP1.md](../fps/FP1.md) § Protocol, [FP3.md](../fps/FP3.md), [FP4.md](../fps/FP4.md)

---

## 1. Base Protocol (FP1)

### Message types

| Direction   | Type         | Payload                      | When                                      |
| ----------- | ------------ | ---------------------------- | ----------------------------------------- |
| App → Shell | APP_READY    | —                            | App loaded, handshake start               |
| Shell → App | SHELL_CAPS   | `{ windowId, scale, theme }` | After APP_READY (Explorer: + systemToken) |
| App → Shell | WINDOW_TITLE | `{ title }`                  | Update window/taskbar title               |
| App → Shell | ERROR        | `{ message }`                | Error report                              |
| —           | PING / PONG  | (optional)                   | Keepalive                                 |

### Handshake

1. Shell creates iframe, mounts app.
2. Shell starts 2000ms timer.
3. App sends APP_READY.
4. Shell stops timer, sends SHELL_CAPS.
5. Timeout → "App not responding".

### Origin rules

- Shell validates `event.origin` allowlist (shell.local, localhost:5173).
- Use `event.origin` as targetOrigin; never `"*"`.
- Route by `event.source` (contentWindow mapping).

---

## 2. FP3 Extensions

### Explorer → Shell

| Type       | Payload                                                         | When                                          |
| ---------- | --------------------------------------------------------------- | --------------------------------------------- |
| SHELL_OPEN | `{ kind: "app", path: string, title?: string }`                 | Double click app-dir. Shell opens app window. |
| SHELL_OPEN | `{ kind: "file", path: string, mime?: string, title?: string }` | **Deprecated for FP4.** Use SHELL_OPEN_FILE.  |

### Token

- Shell sends `systemToken` in SHELL_CAPS **only** to Explorer windows.
- Viewers, user apps: **never** receive token.

---

## 3. FP4 Extensions

### Explorer → Shell (files)

| Type            | Payload                                                            | When                                                          |
| --------------- | ------------------------------------------------------------------ | ------------------------------------------------------------- |
| SHELL_OPEN_FILE | `{ path: string, playlist: Array<{ path: string, url: string }> }` | Double click file. Explorer: list + open-url, build playlist. |

**Flow:**

1. Explorer: double click file → GET list(dirname) → filter by allowlist ext → sort localeCompare → POST open-url for each → build playlist.
2. Explorer: SHELL_OPEN_FILE { path, playlist }.
3. Shell: mime.getType(basename(path)) → handler registry → appId (ImageViewer | MediaPlayer).
4. Shell: createWindow(src=shell.local/apps/<app>/, sandbox allow-scripts only).
5. Viewer: APP_READY.
6. Shell: postMessage OPEN_FILE to viewer.

### Shell → Viewer/Player

| Type      | Payload                                                                                       | When                                                              |
| --------- | --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| OPEN_FILE | `{ initialPath: string, initialUrl: string, playlist: Array<{ path: string, url: string }> }` | After APP_READY. Viewer loads initialUrl; Prev/Next use playlist. |

### Viewer → Shell

- **None.** Prev/Next — local navigation. Playlist already has URLs. No REQUEST_NEXT/PREV.

### Errors (FP4)

| Condition             | Behavior                                      |
| --------------------- | --------------------------------------------- |
| MIME not in allowlist | Shell: log "no handler", do not open window   |
| open-url fail         | Explorer: exclude from playlist or show error |
| Viewer load fail      | Viewer: show "Unable to load" (or similar)    |

### Token policy (FP4)

- **Viewers/Players:** Never receive token. Sandbox: allow-scripts only (no allow-same-origin).
- **Explorer:** Only app with token; does list + open-url; passes data via SHELL_OPEN_FILE.

---

## 4. Summary

| App type    | Receives                | Sandbox                         | Gateway |
| ----------- | ----------------------- | ------------------------------- | ------- |
| Explorer    | SHELL_CAPS (with token) | allow-scripts allow-same-origin | Full    |
| ImageViewer | OPEN_FILE (playlist)    | allow-scripts only              | None    |
| MediaPlayer | OPEN_FILE (playlist)    | allow-scripts only              | None    |
| User app    | SHELL_CAPS (no token)   | allow-scripts only              | None    |

---

## 5. References

- [FP1.md](../fps/FP1.md) § Protocol
- [FP3.md](../fps/FP3.md) § Security
- [FP4.md](../fps/FP4.md) § Protocol
