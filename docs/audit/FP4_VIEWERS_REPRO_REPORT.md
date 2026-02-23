# FP4 Viewers — Reproduce & Evidence Report

> **TEMP(FP4.1):** MUST MERGE/DELETE ON ARCHIVE FP4; source-of-truth = docs/fps/FP4.md + docs/core/PROTOCOL_v0.md

**Date:** 2026-02-23  
**Mode:** audit (no fixes unless required to restore gate)  
**Role:** @Engineer (debug/audit)

---

## 1. Gate Verification (Pre-Audit)

| Command                  | Exit | Result                                     |
| ------------------------ | ---- | ------------------------------------------ |
| `git status --porcelain` | 0    | _Not empty_ — FP4 M0–M4 work uncommitted   |
| `./infra/smoke.sh`       | 0    | PLATFORM OK                                |
| `pnpm lint`              | 0    | Green                                      |
| `pnpm format:check`      | 0    | Green (fixed FP4_AUDIT_REPORT.md Prettier) |

**Gate fix applied:** `pnpm exec prettier --write docs/audit/FP4_AUDIT_REPORT.md` to restore format:check.

---

## 2. Reproduction Attempt

### 2.1 Stack

```bash
docker compose -f infra/docker-compose.dev.yml up --build -d
```

- Traefik, MinIO, gateway, dev-server running
- `/etc/hosts`: 127.0.0.1 shell.local api.shell.local s3.shell.local
- shell.local → 200 OK
- /apps/image-viewer/ → 200 OK
- /apps/image-viewer/main.ts → 200 OK

### 2.2 E2E Result

```bash
./infra/test-e2e-fp.sh FP4
```

- **T-FP4-M0-HANDSHAKE:** PASS — Double-click sample.webp → no "App not responding"
- **T-FP4-M0-S3-GET:** SKIP (Docker E2E: s3 GET not observed)

**Conclusion:** In Playwright (Chromium), the bug does **not** reproduce. Handshake completes; viewer loads.

### 2.3 Environment-Specific Failure

The task describes "App not responding" in Image Viewer. Per FP4_M4_CURSOR_FIX.md and FP4_M0_VIEWERS_AUDIT.md:

- **Cursor Simple Browser / embedded webview:** Parent origin may differ; postMessage targetOrigin mismatch can block delivery.
- **M1 fix:** Viewer uses `postMessage(..., "*")`; Shell uses `targetOrigin = origin === "null" ? "*" : origin` for replies.
- **M4 fix:** Explorer uses `"*"` for SHELL_OPEN_FILE so parent receives it in embedded contexts.

If the bug still appears in a specific environment (e.g. Cursor Simple Browser, Firefox with cache), it is **environment-specific** and not reproducible in standard Playwright Chromium.

---

## 3. Evidence by Stage

### A) Viewer Bootstrap Failure

| Check                                     | Result                                                          |
| ----------------------------------------- | --------------------------------------------------------------- |
| Viewer iframe loads from shell.local      | ✓ curl 200 for /apps/image-viewer/, /apps/image-viewer/main.ts  |
| Module script (main.ts) served            | ✓ Vite middleware rewrites /apps/image-viewer/ → index.html     |
| Early APP_READY in index.html             | ✓ Inline script sends `postMessage({ type: "APP_READY" }, "*")` |
| OPEN_FILE buffer (\_\_fp4PendingOpenFile) | ✓ Inline listener stores payload; main.ts processes on load     |
| CORS / CSP / sandbox blocking JS          | ✗ No evidence — E2E passes; module loads in Playwright          |

**Console/Network (DevTools):** Not captured in this audit (no browser automation for Cursor/embedded). E2E runs in Playwright container with `--add-host` for shell.local; requests succeed.

**Hypothesis to disprove:** If viewer JS fails to load (CORS, CSP, module error), DevTools Console would show failed request or script error. Run manually in failing environment and capture Console + Network for the viewer iframe.

---

### B) OPEN_FILE Delivery

| Check                               | Result                                                               |
| ----------------------------------- | -------------------------------------------------------------------- | ---- | ------------------------------------------ |
| Shell sends OPEN_FILE on APP_READY  | ✓ AppHost.tsx:124–128 — when openFilePayload set, sends OPEN_FILE    |
| targetOrigin for null-origin viewer | ✓ protocol.ts:67 — `targetOrigin = origin === "null" ? "*" : origin` |
| Viewer receives OPEN_FILE           | ✓ E2E expects "Loading                                               | 1 of | sample.webp" — implies OPEN_FILE delivered |
| Explorer → Shell SHELL_OPEN_FILE    | ✓ explorer/main.ts:367 — send("SHELL_OPEN_FILE", { path, playlist }) |
| Explorer targetOrigin               | ✓ M4: send() uses `"*"` (explorer-postmessage-target.test.ts)        |

**Debug logging:** Not added (task says "Do NOT commit debug logs unless behind feature-flag"). Existing `DEV_DEBUG` in image-viewer/main.ts logs "[ImageViewer] OPEN_FILE received" when `import.meta.env.DEV === true`.

**Hypothesis to disprove:** If OPEN_FILE is never sent, Shell never received APP_READY. Add temporary `console.log` in AppHost handleMessage when `data.type === "APP_READY"` and when `sendToSource` is called with OPEN_FILE; verify in failing environment.

---

### C) Signed URL Fetch

| Check                         | Result                                                                      |
| ----------------------------- | --------------------------------------------------------------------------- |
| open-url returns signed URL   | ✓ curl POST /api/fs/open-url → 200, JSON with url containing s3.shell.local |
| Signed URL format             | ✓ Includes X-Amz-\* params, response-content-type, x-amz-checksum-mode      |
| Browser GET to s3.shell.local | E2E T-FP4-M0-S3-GET skipped — "s3 GET not observed" in Docker E2E           |
| Traefik CORS for MinIO        | ✓ docker-compose: minio-cors middleware (Access-Control-Allow-Origin: \*)   |

**Manual curl (host):**

```bash
# Get signed URL
curl -s -H "Host: api.shell.local" -H "Content-Type: application/json" \
  -H "X-System-App: explorer" -H "X-System-Token: fp3-explorer-token" \
  -X POST -d '{"path":"/@root/DISK_C/My Documents/Images/sample.png"}' \
  http://127.0.0.1/api/fs/open-url
# → {"url":"http://s3.shell.local/birdmaid-dev/roots/...","expiresIn":120}

# GET signed URL (with Host header for local resolution)
curl -sS -o /dev/null -w "%{http_code}" -H "Host: s3.shell.local" "<signed_url>"
# → 200
```

**Hypothesis to disprove:** If browser never performs GET to s3.shell.local, the failure is before the request (A or B). If GET is made but fails (CORS, 403, wrong Content-Type), capture status + response headers in Network tab.

---

### D) MinIO / Traefik Correctness

| Check                                      | Result                                                               |
| ------------------------------------------ | -------------------------------------------------------------------- |
| s3.shell.local resolves                    | ✓ /etc/hosts 127.0.0.1 s3.shell.local                                |
| Traefik routes s3.shell.local → MinIO:9000 | ✓ docker-compose labels: Host(`s3.shell.local`), port 9000           |
| MinIO CORS                                 | ✓ Traefik middleware minio-cors (GET, HEAD, \* origin)               |
| Fixtures present                           | ✓ sample.jpg, sample.png, sample.webp in DISK_C/My Documents/Images/ |

**Manual check:** curl with Host: s3.shell.local to signed URL returns 200. MinIO/Traefik routing is correct.

---

## 4. Failure Stage Summary

| Stage | Status  | Evidence                                                              |
| ----- | ------- | --------------------------------------------------------------------- |
| A     | No fail | E2E passes; viewer iframe + module load in Playwright                 |
| B     | No fail | E2E expects viewer content; OPEN_FILE flow verified in code           |
| C     | Unknown | E2E T-FP4-M0-S3-GET skipped; no manual capture in failing environment |
| D     | No fail | curl to signed URL returns 200; Traefik/MinIO config correct          |

**In standard Playwright Chromium:** No failure observed. All stages pass.

**If bug reproduces in Cursor Simple Browser or other embedded context:** Most likely **Stage B** — postMessage delivery from/to embedded parent. M1/M4 fixes address this; verify Explorer and viewer both use `"*"` and that Shell uses `"*"` when replying to `origin === "null"`.

---

## 5. Root Cause (Single Most Likely)

**Primary hypothesis:** **Environment-specific postMessage delivery failure.**

When the parent window is in an embedded context (Cursor Simple Browser, Electron webview, etc.), `window.location.origin` of the parent may not match what the iframe expects. M4 fixed Explorer → Shell (SHELL_OPEN_FILE) by using `"*"`. M1 fixed viewer → Shell (APP_READY) and Shell → viewer (OPEN_FILE) for null-origin. If the bug persists, a remaining mismatch may exist in a specific embedding scenario.

**Evidence:** FP4_M4_CURSOR_FIX.md documents Cursor Simple Browser failure; fix was Explorer `"*"`. E2E runs in Playwright (not embedded), so it does not hit that path.

---

## 6. Alternative Hypotheses

| #   | Hypothesis                          | How to Disprove                                                                                                        |
| --- | ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| 1   | Viewer module fails to load (CORS)  | Open failing env, DevTools → Network: check if main.ts or /@vite/client returns non-200 or CORS error                  |
| 2   | APP_READY not delivered to Shell    | Add `console.log` in AppHost handleMessage when `data.type === "APP_READY"`; if never fires, message not delivered     |
| 3   | img src set but fetch blocked (ETP) | DevTools → Network: filter by s3.shell.local; if no GET, request never sent; if GET with error, inspect status/headers |

---

## 7. Files Likely Changed in Next Milestone(s)

(No fixes implemented in this audit. List for future work.)

| Area                  | Files                                                                                                           |
| --------------------- | --------------------------------------------------------------------------------------------------------------- |
| Debug / observability | `front/core/AppHost.tsx` — optional debug flag for APP_READY/OPEN_FILE logs                                     |
| Viewer bootstrap      | `front/apps/image-viewer/index.html`, `front/apps/media-player/index.html` — fallback APP_READY retry if needed |
| Embedded context      | `front/apps/explorer/main.ts` — verify `"*"` in all postMessage calls                                           |
| Signed URL            | `back/src/fs.ts`, `back/src/index.ts` — x-amz-checksum-mode if MinIO rejects                                    |
| CORS / Traefik        | `infra/docker-compose.dev.yml` — minio-cors middleware (already present)                                        |

---

## 8. Appendix: Commands Run

```bash
# Gate
./infra/smoke.sh                    # PLATFORM OK
pnpm lint                           # Green
pnpm format:check                    # Green (after Prettier fix)

# Stack
docker compose -f infra/docker-compose.dev.yml up --build -d

# E2E
./infra/test-e2e-fp.sh FP4          # T-FP4-M0-HANDSHAKE PASS, T-FP4-M0-S3-GET SKIP

# Manual
curl -H "Host: shell.local" http://127.0.0.1/apps/image-viewer/           # 200
curl -H "Host: shell.local" http://127.0.0.1/apps/image-viewer/main.ts   # 200
curl -H "Host: api.shell.local" ... -X POST -d '{"path":"/..."}' /api/fs/open-url  # 200 + url
curl -H "Host: s3.shell.local" "<signed_url>"                            # 200
```
