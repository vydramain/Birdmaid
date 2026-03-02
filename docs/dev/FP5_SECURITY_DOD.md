<!-- TEMP(FP5.1): MUST MERGE/DELETE ON ARCHIVE FP5; source-of-truth = docs/fps/FP5.md + canonical docs/core/PROTOCOL_v0.md -->

# FP5 Security DoD — Checklist

**Purpose:** Security Definition of Done for FP5. Compliance.

---

## 1. Sandbox Matrix (User App)

| Flag                  | Allowed | Rationale                                               |
| --------------------- | ------- | ------------------------------------------------------- |
| **allow-scripts**     | Yes     | Required for app JS                                     |
| **allow-same-origin** | **No**  | Prevents fetch to api.shell.local; avoids token leakage |
| allow-forms           | No      | Not needed                                              |
| allow-popups          | No      | Not needed                                              |
| allow-top-navigation  | No      | Would escape Shell                                      |
| allow-downloads       | No      | Not needed                                              |

**Result:** `sandbox="allow-scripts"` only.

---

## 2. allow-same-origin Impact

| With allow-same-origin                 | Without (FP5 choice)           |
| -------------------------------------- | ------------------------------ |
| Same-origin with Shell                 | Different origin (opaque/null) |
| Could fetch api.shell.local            | Cannot fetch api.shell.local   |
| Could access parent DOM                | Cannot access parent           |
| localStorage shared with Shell origin? | No — isolated                  |

**Choice:** No allow-same-origin. User app origin = null or opaque when sandboxed. Safer.

---

## 3. CSP Baseline (User App Delivery)

| Directive       | Value                              | Purpose                                       |
| --------------- | ---------------------------------- | --------------------------------------------- |
| **script-src**  | `'self' 'unsafe-inline' 'wasm-unsafe-eval'` | Scripts, inline, WebAssembly for Godot |
| **style-src**   | `'self' 'unsafe-inline'`   | Only styles from package; inline for Godot    |
| **img-src**     | `'self'`                  | Only images from package                      |
| **media-src**   | `'self'`                  | Only media from package                       |
| **frame-src**   | `'none'`                  | No nested iframes                             |
| **connect-src** | `'self'`                  | No external fetch; only same-origin (package)  |
| **default-src** | `'self'`                  | Fallback for unspecified                      |

**Note:** Godot Web export: inline `<style>`/`<script>` (`'unsafe-inline'`), WebAssembly (`'wasm-unsafe-eval'`). Documented trade-off; user apps are already untrusted.

**Default:** Deny external network. Deny nested iframes.

---

## 4. Security Checklist (Build Verification)

| #   | Item                                                                 | Status |
| --- | -------------------------------------------------------------------- | ------ |
| 1   | No token leakage to user app                                         | [x] M3 |
| 2   | No privileged bridge (SHELL_OPEN, SHELL_OPEN_FILE, etc.)             | [x] M3 |
| 3   | No path traversal (../, encoded, unicode)                            | [x] M2 |
| 4   | No cross-package reads (App A ≠ App B)                               | [x] M2 |
| 5   | No external fetch by default (CSP connect-src)                       | [x] M3 |
| 6   | No nested iframes (CSP frame-src 'none')                             | [x] M3 |
| 7   | Untrusted app cannot break Shell process model                       | [x] M3 |
| 8   | postMessage allowlist enforced (APP_READY, WINDOW_TITLE, ERROR only) | [x] M3 |

---

## 5. postMessage Validation Rules

| Rule                | Implementation                                               |
| ------------------- | ------------------------------------------------------------ |
| **event.source**    | Must map to known user app window                            |
| **target window**   | Only accept from iframe with user app src                    |
| **message type**    | Allowlist: APP_READY, WINDOW_TITLE, ERROR                    |
| **SHELL_OPEN**      | Only from Explorer windows (isExplorer); never from user app |
| **SHELL_OPEN_FILE** | Same                                                         |
| **Token**           | Never in SHELL_CAPS to user app                              |

---

## 6. References

- docs/fps/FP5.md § Security Constraints, P0 Risks
- docs/core/PROTOCOL_v0.md
- docs/core/API_FP5_DELTA.md § Path Traversal
