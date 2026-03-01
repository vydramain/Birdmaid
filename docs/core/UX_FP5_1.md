<!-- TEMP(FP5.1): MUST MERGE/DELETE ON ARCHIVE FP5; source-of-truth = docs/fps/FP5.md + canonical docs/core/PROTOCOL_v0.md -->

# FP5.1 UX — Failure States

**Purpose:** Controlled error states for user app launch and runtime. Designer + Analyst.

---

## 1. Failure State Matrix

| State                     | Trigger                                           | Shell behavior                          | User sees                                  | Logged |
| ------------------------- | ------------------------------------------------- | --------------------------------------- | ------------------------------------------ | ------ |
| **launch_failed**         | Shell cannot create window (e.g. invalid path)    | Do not create window; optional toast    | "Unable to launch app" (or silent)         | Yes    |
| **invalid_package**       | No index.html at package root; 404 from route     | Window created; iframe shows error view | "App package invalid. Missing index.html." | Yes    |
| **asset_load_denied**     | Path traversal attempt; 403 from route            | App receives 403; may show own error    | App-dependent (e.g. broken image)          | Yes    |
| **path_traversal_denied** | Request for `../` or outside root                 | 403; content not served                 | Same as asset_load_denied                  | Yes    |
| **broken_html**           | index.html exists but malformed / CSP blocks boot | Handshake timeout or load error         | "App failed to load."                      | Yes    |

---

## 2. Shell Guarantees

| Guarantee                  | Description                                                   |
| -------------------------- | ------------------------------------------------------------- |
| **Shell does not crash**   | Any user app error is contained; Shell process stable         |
| **No infinite hang**       | Handshake timeout 2000ms → "App not responding" (same as FP1) |
| **Controlled error state** | User sees explicit message, not blank or spinner forever      |
| **Error logged**           | Structured log with state, path, windowId                     |

---

## 3. Error View Content (Shell-controlled)

When iframe fails to load or handshake times out:

- **Placeholder text:** "App failed to load." or "App not responding."
- **Optional:** Retry button (non-goal for MVP; can defer)
- **Style:** Consistent with FP1 "App not responding" placeholder

---

## 4. App-Side Errors

If app loads but asset fails (404/403):

- App receives failed fetch/load
- App may send ERROR postMessage to Shell
- Shell logs; may update window title or show subtle indicator (MVP: log only)

---

## 5. CTA → State Mapping (FP5 delta)

| CTA                     | State                 | Page                         |
| ----------------------- | --------------------- | ---------------------------- |
| run_app (user app)      | ui.app_launching      | Shell                        |
| run_app success         | ui.app_ready          | User app window              |
| run_app invalid_package | ui.app_error          | Shell (error view in window) |
| run_app timeout         | ui.app_not_responding | Shell (same as FP1)          |
