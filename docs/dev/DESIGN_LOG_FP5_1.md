<!-- TEMP(FP5.1): MUST MERGE/DELETE ON ARCHIVE FP5; source-of-truth = docs/fps/FP5.md + canonical docs/core/PROTOCOL_v0.md -->

# FP5.1 Design Log

**Purpose:** Design decisions, contradictions scan, patchset. TEMP artifact for FP5 build.

---

## 1. Contradictions Scan (Product Lead + Compliance)

### FP5 vs FP1

| Aspect         | FP1                     | FP5                                          | Conflict?                                                    |
| -------------- | ----------------------- | -------------------------------------------- | ------------------------------------------------------------ |
| iframe sandbox | allow-scripts (default) | User app: allow-scripts only                 | No. FP5 stricter, aligns with FP1 baseline for untrusted     |
| Handshake      | APP_READY → SHELL_CAPS  | Same; user app gets SHELL_CAPS without token | No. PROTOCOL_v0 already states user app never receives token |
| Timeout        | 2000ms                  | Same                                         | No                                                           |

### FP5 vs FP3

| Aspect                         | FP3                         | FP5                                 | Conflict?                                                      |
| ------------------------------ | --------------------------- | ----------------------------------- | -------------------------------------------------------------- |
| App-dir detection              | dir with index.html (isApp) | Same                                | No                                                             |
| Explorer SHELL_OPEN (kind=app) | Opens app window            | FP5: user app = different boot path | No. Explorer sends path; Shell routes to user app hosted route |
| User app gateway               | Deny                        | Deny                                | No                                                             |
| Sandbox                        | User app allow-scripts      | Same                                | No                                                             |

### FP5 vs FP4

| Aspect         | FP4                                           | FP5                                       | Conflict?                     |
| -------------- | --------------------------------------------- | ----------------------------------------- | ----------------------------- |
| Viewer boot    | shell.local/apps/image-viewer/, media-player/ | User app: shell.local/apps/user/?path=... | No. Different route namespace |
| Viewer sandbox | allow-scripts only                            | User app: allow-scripts only              | No                            |
| OPEN_FILE      | Shell → Viewer                                | User app: N/A (no OPEN_FILE)              | No                            |

### FP5 vs Explorer package detection

| Aspect      | FP2/FP3                    | FP5                                      | Conflict?                                               |
| ----------- | -------------------------- | ---------------------------------------- | ------------------------------------------------------- |
| isApp       | Gateway list returns isApp | Same discovery                           | No                                                      |
| Launch path | SHELL_OPEN kind=app        | Shell creates window with user route src | No. Shell differentiates system app vs user app by path |

### Scope Lock Confirmation

- [x] No write-capabilities for user apps
- [x] No privileged bridge
- [x] No token access
- [x] No filesystem API beyond relative package asset loading
- [x] Delivery route is NOT runtime gateway API

**Verdict:** No contradictions. FP5 design-ready.

---

## 2. Design Patchset

### Before → After

| Area             | Before                        | After                                                                 |
| ---------------- | ----------------------------- | --------------------------------------------------------------------- |
| Hosted route     | TBD                           | `shell.local/apps/user/?path=<canonicalPackagePath>`                  |
| Asset resolution | TBD                           | Relative URL resolved within package root; path traversal denied      |
| Sandbox flags    | "allow-scripts" (vague)       | `allow-scripts` only; no allow-same-origin                            |
| CSP              | TBD                           | script-src 'self'; connect-src 'self'; frame-src 'none'; etc.         |
| Protocol         | User app mentioned, no detail | APP_READY, WINDOW_TITLE, ERROR; privileged types explicitly forbidden |
| Failure states   | "controlled error"            | 5 defined states with UX behavior                                     |
| Security DoD     | P0 risks listed               | 8-item checklist                                                      |

### Accepted Decisions

1. **Route shape:** `shell.local/apps/user/?path=<path>` — path = canonical S3 path (e.g. /@root/DISK_C/My Documents/MyApp/)
2. **allow-same-origin:** Denied for user app — prevents same-origin fetch to api.shell.local
3. **Path validation:** Canonical path + deny `..`, `%2e%2e`, unicode normalization edge cases
4. **CSP connect-src 'self':** Restricts fetch to same origin (hosted route) = package root only
5. **frame-src 'none':** No nested iframes

### Rejected Alternatives

| Alternative                         | Rejected because                                                      |
| ----------------------------------- | --------------------------------------------------------------------- |
| allow-same-origin for user app      | Would allow fetch to api.shell.local; token leakage risk              |
| Direct S3 signed URL for index.html | CORS complexity; no control over origin; FP5 Pre-Design: hosted route |
| READ_FILE postMessage for user app  | Scope creep; relative URLs sufficient for MVP                         |
| External fetch allowlist            | MVP: deny all external; simplify CSP                                  |
| Subdir index.html                   | Already OUT in Non-Goals                                              |

---

## 3. References

- docs/fps/FP5.md
- docs/core/PROTOCOL_v0.md
- docs/core/API_FP5_DELTA.md
- docs/core/UX_FP5_1.md
- docs/tests/FP5_TESTS.md
- docs/dev/FP5_SECURITY_DOD.md
