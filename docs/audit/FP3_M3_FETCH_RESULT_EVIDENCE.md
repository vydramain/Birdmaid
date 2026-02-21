# FP3 M3 E2E FETCH_RESULT Fix — Evidence

**Milestone:** M3_FP3_E2E_FETCH_RESULT_FIX  
**Date:** 2025-02-22  
**Scope:** T-M6.1 (user app fetch → 403 → FETCH_RESULT → __lastFetchStatus)

---

## Evidence

### Changed files

| File | Change |
|------|--------|
| `back/src/index.ts` | Add `Access-Control-Allow-Origin: origin` to 403 response in onRequest (bad origin) |
| `front/core/protocol.ts` | Add `http://s3.shell.local`, `http://s3.shell.local:80` to ALLOWED_ORIGINS |
| `front/core/AppHost.tsx` | Add console.info for FETCH_RESULT (dev only) |

### Commands

```bash
./infra/smoke.sh
# PLATFORM OK

./infra/test-e2e-fp.sh FP3
# 28 passed, 2 failed (T-M5.3, T-M5-NF1 — strict mode, unrelated)
```

### Proof: T-M6.1

**Before:** `waitForFunction(__lastFetchStatus === 403)` timeout 15s.

**After:** T-M6.1 **PASS** — not in failed list; 28 passed includes T-M6.1.

---

## Root cause

1. **Gateway CORS:** `onRequest` returned 403 for bad origin (s3.shell.local) without CORS headers. Browser blocked the response; fetch failed with network error. User-app `.catch` ran and posted `status: 0`, not 403.

2. **Protocol origin:** AppHost rejected postMessage from s3.shell.local because it was not in ALLOWED_ORIGINS. FETCH_RESULT never reached the handler.

---

## Fix mapping

| Root cause | Fix |
|------------|-----|
| 403 response not readable (CORS) | `reply.header("Access-Control-Allow-Origin", origin)` before 403 send |
| postMessage rejected (origin) | Add s3.shell.local to protocol ALLOWED_ORIGINS |

---

## Security (unchanged)

- FETCH_RESULT accepted only when `event.source === iframeRef.current?.contentWindow` (own iframe)
- s3.shell.local in allowlist only allows receiving status from our iframe; no token or rights
- Gateway still returns 403; CORS only allows reading the error response

---

## DoD

- [x] T-M6.1 green via `./infra/test-e2e-fp.sh FP3`
