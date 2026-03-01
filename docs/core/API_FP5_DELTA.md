<!-- TEMP(FP5.1): MUST MERGE/DELETE ON ARCHIVE FP5; source-of-truth = docs/fps/FP5.md + canonical docs/core/PROTOCOL_v0.md -->

# FP5 API Delta — User App Delivery Route

**Purpose:** Spec for shell.local hosted route for user app packages. Delivery route only — NOT privileged runtime API.

---

## 1. Hosted Route Shape

| Property        | Value                                                                         |
| --------------- | ----------------------------------------------------------------------------- |
| **Base URL**    | `https://shell.local/apps/user/` (or `http://shell.local/apps/user/` in dev)  |
| **Query param** | `path` — canonical package root path                                          |
| **Example**     | `shell.local/apps/user/?path=%2F%40root%2FDISK_C%2FMy%20Documents%2FMyApp%2F` |

**Path format:** Same as API.yaml — `/@root/{ROOT_ID}/path/to/package/` (trailing slash for dir).

---

## 2. Route → Package Root Mapping

| Step | Behavior                                                                               |
| ---- | -------------------------------------------------------------------------------------- |
| 1    | Shell receives SHELL_OPEN { kind: "app", path } from Explorer                          |
| 2    | Shell validates path: must be canonical, writable root (e.g. DISK_C), dir              |
| 3    | Shell constructs iframe src = `shell.local/apps/user/?path=<encodeURIComponent(path)>` |
| 4    | Delivery service (proxy/route handler) receives request                                |
| 5    | Resolve path → S3 key; fetch index.html or subpath                                     |
| 6    | Return content with appropriate Content-Type                                           |

---

## 3. Relative Asset Resolution

| Request           | Resolution                                           |
| ----------------- | ---------------------------------------------------- |
| `./app.js`        | Resolve against package root → `{packageRoot}app.js` |
| `./assets/x.png`  | `{packageRoot}assets/x.png`                          |
| `./nested/a.json` | `{packageRoot}nested/a.json`                         |
| `assets/foo.css`  | `{packageRoot}assets/foo.css` (implicit ./)          |

**Base URL for iframe:** The initial document URL (index.html) defines the base. All relative URLs resolve within package root.

---

## 4. Path Traversal — Deny Rules

| Pattern                                 | Action                                      |
| --------------------------------------- | ------------------------------------------- |
| `../`                                   | Deny — 403 or 404 (do not reveal structure) |
| `..%2f`, `%2e%2e/`                      | Deny — decode then validate                 |
| `%252e%252e/`                           | Deny — double-encoding                      |
| Unicode normalization (e.g. `％2e％2e`) | Normalize to NFC, then deny if outside root |
| Absolute path outside root              | Deny                                        |
| Symlink / junction (if applicable)      | Resolve to canonical; must stay within root |

**Validation algorithm (conceptual):**

1. Decode path (percent-encoding)
2. Normalize (NFC, collapse slashes)
3. Resolve against package root
4. Reject if result is outside package root

---

## 5. Failure States (Delivery)

| Condition                              | HTTP       | UX                                                  |
| -------------------------------------- | ---------- | --------------------------------------------------- |
| No index.html                          | 404        | Shell shows controlled error: "App package invalid" |
| index.html malformed / unreadable      | 500 or 404 | Same                                                |
| Asset not found (relative within root) | 404        | App sees 404; may show own error                    |
| Path outside package root              | 403        | Do not serve; log                                   |
| Invalid package path (bad format)      | 400        | Shell does not create window; or shows error        |
| Package path not in writable root      | 403        | Shell rejects before creating window                |

---

## 6. Two Apps Cannot Read Each Other

| Rule                                            | Enforcement                         |
| ----------------------------------------------- | ----------------------------------- |
| App A path = `/@root/DISK_C/My Documents/AppA/` | All requests scoped to AppA root    |
| App B path = `/@root/DISK_C/My Documents/AppB/` | All requests scoped to AppB root    |
| Request for `../AppB/secret.json`               | Denied — resolves outside AppA root |

Each iframe has unique `src` with its own `path`. No shared storage; no cross-origin access.

---

## 7. Implementation Note

This is a **design spec**. Build stage implements:

- Route handler (e.g. in Shell dev server or separate proxy)
- Path validation middleware
- S3/MinIO fetch via gateway or direct (server-side only)
- CSP headers on responses

Gateway API (API.yaml) unchanged. This route is part of Shell/frontend delivery, not Gateway.

**Production:** When serving the built frontend (no Vite dev server), requests to `GET /apps/user/pkg/<path>/<subpath>` must be proxied to gateway `GET /api/fs/serve-user-app?path=...&subpath=...` (e.g. via Traefik path rule or the same backend that serves static Shell). Subpath may contain slashes (e.g. `assets/logo.png`).
