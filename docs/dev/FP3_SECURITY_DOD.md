# FP3 Security Definition of Done

**Purpose:** Security checklist for FP3 Explorer + Shell integration.  
**Scope:** Sandbox, gateway authZ, CORS, token handling, postMessage.

---

## 1. Sandbox Matrix (Explorer vs User App vs Viewer)

| App Type | sandbox                           | Notes                                                                |
| -------- | --------------------------------- | -------------------------------------------------------------------- |
| Explorer | `allow-scripts allow-same-origin` | Same-origin with Shell; fetch to api.shell.local                     |
| User app | `allow-scripts`                   | No same-origin; no gateway access                                    |
| Viewer   | `allow-scripts`                   | Receives signed URL via iframe src query; no gateway, no same-origin |

**Check:** Explorer iframe MUST have same-origin with Shell (e.g. shell.local/apps/explorer/). Explorer boot is NOT via open-url or S3 signed URL.

---

## 2. Gateway Authorization

| API Type | Allowed Caller    | Enforcement                                                     |
| -------- | ----------------- | --------------------------------------------------------------- |
| Read     | Shell origin only | Origin allowlist (shell.local, api.shell.local, localhost:5173) |
| Write    | Explorer + token  | X-System-App: explorer + X-System-Token + origin allowlist      |

**Check:** User app request → 403. Missing/invalid token on Write → 403.

---

## 3. CORS

- Gateway: allowlist only; no `*`.
- MinIO: allowlist (shell.local, api.shell.local, localhost:5173).

**Check:** Disallowed origin → 403.

---

## 4. Token Handling

- Token injected via postMessage (SHELL_CAPS) ONLY to Explorer windows.
- Token NEVER sent to user app or viewer iframes.
- Token NEVER in querystring or URL.

**Check:** Shell routes by window type; token only when target is Explorer.

### 4.2 Write API (M5)

- Write endpoints (create-folder, upload-file, upload-zip-app, delete, rename) require `X-System-App: explorer` + `X-System-Token`.
- Missing/invalid token → 403 PERMISSION_DENIED.

### 4.1 Viewer (M4)

- Token **never** sent to viewer iframes. Viewer receives only signed URL (via iframe src query param).
- Viewer sandbox: `allow-scripts` only; no `allow-same-origin` → cannot fetch /api/fs/\*.

---

## 5. postMessage

- Allowlist origins; no `"*"` as targetOrigin.
- Route by event.source + origin.

**Check:** Unknown origin → message_rejected.

### 5.1 SHELL_OPEN (M3)

- **Only Explorer** can send SHELL_OPEN with privileged intents (open file, run app).
- AppHost routes SHELL_OPEN to `onShellOpen` **only when** `isExplorer && onShellOpen`; Shell passes `onShellOpen` **only for** Explorer windows (`w.src.includes("/apps/explorer")`).
- **Check:** User app or viewer iframe cannot trigger SHELL_OPEN handler; message is ignored (no onShellOpen callback).

---

## 6. Path Policy

- Write deny: C:/WINDOWS/**, C:/Program Files/**, A:/**, D:/**, boot files.
- Write allow: C:/My Documents/\*\* only.
- Rename: same-parent only; cross-parent → 403.

**Check:** Gateway enforces at API layer.

---

## 7. FP3 Patchset Compliance Additions

### 7.1 User Apps Cannot Call Upload/Write

- **MUST:** User app iframe has `sandbox="allow-scripts"` only (no same-origin).
- **MUST:** Gateway Write API (create-folder, upload-file, upload-zip-app, delete, rename) requires `X-System-App: explorer` + `X-System-Token`.
- **MUST:** Gateway rejects requests without valid token → 403 PERMISSION_DENIED.
- **Check:** User app cannot obtain token (Shell sends token ONLY to Explorer windows).

### 7.2 Token Only to Explorer

- **MUST:** Shell includes `systemToken` in SHELL_CAPS ONLY when target is Explorer window (`w.src.includes("/apps/explorer")` or equivalent).
- **MUST NOT:** Token in querystring, URL, or sent to user app/viewer iframes.
- **Check:** AppHost routes SHELL_CAPS with token only for Explorer; user app never receives token.

### 7.3 CORS + Origin Allowlist Unchanged

- **MUST:** Gateway CORS allowlist: shell.local, api.shell.local, localhost:5173 (no `*`).
- **MUST:** MinIO CORS allowlist unchanged (for signed URLs).
- **Check:** Disallowed origin → 403.

---

## DoD Checklist (Design-stage)

- [ ] Sandbox attrs defined for Explorer, user app, viewer
- [ ] Gateway authZ model (Read vs Write) documented
- [ ] CORS allowlist (no \*) documented
- [ ] Token handling (handshake only, origin-check) documented
- [ ] postMessage rules (no \*) documented
- [ ] Path policy matrix complete
- [ ] FP3 patchset: User apps cannot call upload/write (documented)
- [ ] FP3 patchset: Token only to Explorer (documented)
- [ ] FP3 patchset: CORS + origin allowlist unchanged (documented)
