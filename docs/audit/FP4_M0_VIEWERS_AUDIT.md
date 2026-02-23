# FP4 M0 — Viewers Audit: Reproduce + Red Tests + Evidence

> **TEMP(FP4.1):** MUST MERGE/DELETE ON ARCHIVE FP4; source-of-truth = docs/fps/FP4.md + docs/core/PROTOCOL_v0.md

**Date:** 2026-02-23  
**Mode:** audit → tests-red (no production fixes)  
**Role:** @Engineer (lead), @Analyst (evidence)

---

## 1. Bug Summary

**Symptom:** Opening image/audio/video from Explorer shows "App not responding". Gateway returns `/api/fs/open-url` OK, but viewers never load content.

**HAR evidence:** No GET requests to `s3.shell.local`. Open-url responses contain signed URLs, but the browser never fetches them.

---

## 2. Reproduction

### 2.1 Commands Run

```bash
# Start clean stack
docker compose -f infra/docker-compose.dev.yml up --build

# In another terminal: run E2E (reproduces bug)
./infra/test-e2e-fp.sh FP4
```

### 2.2 Steps

1. Open `http://shell.local/`
2. Double-click "My Computer"
3. Navigate: DISK_C → My Documents → Images
4. Double-click `sample.webp`
5. Image Viewer iframe appears but shows "App not responding"
6. No GET to `s3.shell.local` in network tab

### 2.3 Network Proof (Before Fix)

**HAR:** `shell.local_Archive [26-02-23 03-20-20].har`

- POST `/api/fs/open-url` for `sample.webp` → 200, returns signed URL with `s3.shell.local`
- **No GET requests** to `s3.shell.local` in `log.entries`
- All requests are to `shell.local` (api/fs/list, open-url, etc.)

---

## 3. Break Point Analysis

| Check                                              | Result                                                               |
| -------------------------------------------------- | -------------------------------------------------------------------- |
| Does Shell receive APP_READY from viewer iframe?   | **No** — handshake times out, placeholder shows "App not responding" |
| Does Shell send OPEN_FILE into viewer iframe?      | **No** — Shell never receives APP_READY, so OPEN_FILE is never sent  |
| Does viewer set img/audio/video src to signed URL? | N/A — viewer never receives OPEN_FILE                                |
| Does browser GET s3.shell.local?                   | **No** — HAR confirms zero s3 GETs                                   |

### Root Cause Hypothesis (Primary)

**postMessage targetOrigin mismatch:** The viewer iframe sends APP_READY with:

```javascript
window.parent.postMessage(
  { type: "APP_READY", timestamp: Date.now() },
  window.location.origin // ← "null" for sandboxed iframe
);
```

The second parameter is `targetOrigin` — the origin of the window we're sending TO. The iframe uses its own origin (`"null"` for sandboxed `allow-scripts`-only iframe). The parent Shell is at `http://shell.local`. The browser will **not deliver** the message because the target's origin (`http://shell.local`) does not match `"null"`. The message is dropped; Shell never receives APP_READY; handshake times out; OPEN_FILE is never sent; viewer never loads content.

**Evidence:** `front/apps/image-viewer/index.html` lines 93–95, `front/apps/media-player/index.html` lines 114–116. Same pattern in both viewers.

---

## 4. Tests Added (RED)

### 4.1 E2E — Fails (Expected)

| Test            | File                      | Status   | Output                                                       |
| --------------- | ------------------------- | -------- | ------------------------------------------------------------ |
| T-FP4-M0-S3-GET | `e2e/fp4-viewers.spec.ts` | **FAIL** | `expect(s3Requests.length).toBeGreaterThan(0)` — Received: 0 |

```
Error: expect(received).toBeGreaterThan(expected)
Expected: > 0
Received:  0
```

### 4.2 Unit — Pass (Contract Tests)

| Test                   | File                                                    | Status |
| ---------------------- | ------------------------------------------------------- | ------ |
| T-FP4-PROTOCOL-NULL    | `front/__tests__/fp4/protocol-null-origin.test.ts`      | PASS   |
| T-FP4-VIEWER-OPEN-FILE | `front/__tests__/fp4/viewer-open-file-sets-src.test.ts` | PASS   |

These verify: protocol accepts `"null"` origin; viewer correctly sets `img.src` when OPEN_FILE is received. They pass because they simulate the message flow directly — they bypass the broken postMessage delivery.

### 4.3 Integration — Pass

| Test          | File                                                          | Status |
| ------------- | ------------------------------------------------------------- | ------ |
| T-FP4-M0-CURL | `back/__tests__/fp4/signed-url-fetchable.integration.test.ts` | PASS   |

Open-url returns a fetchable URL; backend and signed-URL generation are correct.

---

## 5. Exact Commands for Evidence

```bash
# Unit (all pass)
./infra/test-unit.sh

# API/Integration (all pass)
./infra/test-api-fp.sh FP4

# E2E (T-FP4-M0-S3-GET fails)
./infra/test-e2e-fp.sh FP4
```

---

## 6. Console Logs (Excerpts)

When reproducing manually:

- **Shell:** Handshake timeout after 2000ms → `analytics.handshake_timeout(windowId)` → placeholder "App not responding"
- **Viewer iframe:** Sends APP_READY via `postMessage(..., "null")`; message is not delivered to parent

---

## 7. Test Files Summary

| Location               | File                                       | Purpose                                                         |
| ---------------------- | ------------------------------------------ | --------------------------------------------------------------- |
| `e2e/`                 | `fp4-viewers.spec.ts`                      | E2E: double-click sample.webp → browser must GET s3.shell.local |
| `front/__tests__/fp4/` | `protocol-null-origin.test.ts`             | Unit: `isAllowedOrigin("null")` returns true                    |
| `front/__tests__/fp4/` | `viewer-open-file-sets-src.test.ts`        | Unit: OPEN_FILE sets img#viewer-img src                         |
| `back/__tests__/fp4/`  | `signed-url-fetchable.integration.test.ts` | Integration: open-url URL is fetchable                          |

---

## 8. Exit Criteria

- [x] Reproduce bug in clean stack
- [x] Identify exact break point (APP_READY not delivered due to targetOrigin)
- [x] Root cause hypothesis with evidence (postMessage targetOrigin)
- [x] RED tests added (E2E T-FP4-M0-S3-GET fails)
- [x] Evidence document written

---

## 9. Next Steps (M1 — Fix, Out of Scope for M0)

1. Fix: In viewer `index.html` / `main.ts`, use `"*"` when sending to parent (or negotiate parent origin via protocol)
2. Re-run E2E; T-FP4-M0-S3-GET should turn green
3. Capture HAR after fix; verify s3.shell.local GETs appear
