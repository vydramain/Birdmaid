# FP4 M1 — Handshake Fix: Allow Origin Null Safely

> **TEMP(FP4.1):** MUST MERGE/DELETE ON ARCHIVE FP4; source-of-truth = docs/fps/FP4.md + docs/core/PROTOCOL_v0.md

**Date:** 2026-02-23  
**Mode:** implement → gate  
**Role:** @Engineer

---

## 1. What Changed

### 1.1 Viewer postMessage targetOrigin (root cause fix)

**Problem:** Sandboxed viewer iframes (`sandbox="allow-scripts"` only) have `origin === "null"`. They sent `APP_READY` with `window.location.origin` ("null") as `targetOrigin`. The parent Shell is at `http://shell.local`, so the browser did not deliver the message (target origin mismatch). Handshake timed out → "App not responding".

**Fix:** Use `"*"` when sending to parent (Shell cannot know iframe origin; `"*"` delivers regardless of target origin).

| File                                 | Change                                                      |
| ------------------------------------ | ----------------------------------------------------------- |
| `front/apps/image-viewer/index.html` | `postMessage(..., "*")` instead of `window.location.origin` |
| `front/apps/image-viewer/main.ts`    | `send()` uses `"*"` for parent                              |
| `front/apps/media-player/index.html` | Same                                                        |
| `front/apps/media-player/main.ts`    | Same                                                        |

### 1.2 Shell sendToSource for null-origin targets

**Problem:** When replying to viewer (e.g. `OPEN_FILE`), Shell used `event.origin` ("null") as `targetOrigin`. Some environments may not deliver when target has opaque origin.

**Fix:** Use `"*"` when `origin === "null"` so the message is delivered to the sandboxed iframe.

| File                     | Change                                                            |
| ------------------------ | ----------------------------------------------------------------- |
| `front/core/AppHost.tsx` | `sendToSource`: `targetOrigin = origin === "null" ? "*" : origin` |

### 1.3 Protocol documentation

| File                     | Change                                                                       |
| ------------------------ | ---------------------------------------------------------------------------- |
| `front/core/protocol.ts` | Comment: `"null"` accepted only when `event.source === iframe.contentWindow` |

### 1.4 Regression test

| File                                              | Change                                                                                        |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `front/__tests__/fp4/app-host-handshake.test.tsx` | `T-FP4-M1-REGRESS`: APP_READY from origin "null" with fake source → rejected (unknown_source) |

---

## 2. Test Outputs

### Unit (95 tests)

```
✓ front/__tests__/fp4/app-host-handshake.test.tsx (2 tests)
✓ front/__tests__/fp4/protocol-null-origin.test.ts (3 tests)
✓ front/__tests__/fp4/viewer-open-file-sets-src.test.ts (1 test)
...
Test Files  13 passed (13)
     Tests  95 passed (95)
```

### Integration (16 tests)

```
✓ back/__tests__/fp4/signed-url-fetchable.integration.test.ts (1 test)
✓ back/__tests__/fp4/open-url-viewers.integration.test.ts (6 tests)
...
Test Files  5 passed (5)
     Tests  16 passed (16)
```

### E2E

- **T-FP4-M0-HANDSHAKE:** PASS — Double-click sample.webp → no "App not responding"
- **T-FP4-M0-S3-GET:** FAIL in container — img src not set; s3 GET not observed. Handshake works; OPEN_FILE → img load flow may need further debugging in E2E environment.

### Gate

```bash
./infra/gate.sh FP4
# GATE OK
```

---

## 3. Network Proof

**Before fix:** HAR showed no GET to `s3.shell.local`; handshake timed out.

**After fix:**

- Handshake succeeds: placeholder "App not responding" no longer appears.
- Viewer shows "Loading..." or playlist status.
- Manual verification: open sample.webp → viewer loads; Network tab shows GET to `s3.shell.local` when run locally.
- E2E in Docker: handshake passes; img/src and s3 GET assertions still failing (follow-up).

---

## 4. Exit Criteria

| Criterion                                                                  | Status               |
| -------------------------------------------------------------------------- | -------------------- |
| Viewer no longer shows "App not responding" for sample.webp and sample.mp3 | ✓                    |
| M0 test suite passes (unit + integration + gate)                           | ✓                    |
| Regression: random iframe with origin null rejected                        | ✓ (T-FP4-M1-REGRESS) |
| E2E T-FP4-M0-HANDSHAKE passes                                              | ✓                    |
| E2E T-FP4-M0-S3-GET passes                                                 | ✗ (follow-up)        |

---

## 5. Security

- Origin "null" accepted only when `event.source === iframe.contentWindow` of a Shell-created window.
- `targetOrigin = "*"` used only when communicating with sandboxed viewers; Shell never sends token to viewers.
- Regression test ensures unknown sources with origin "null" are rejected.
