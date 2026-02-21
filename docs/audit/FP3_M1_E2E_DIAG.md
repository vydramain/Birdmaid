# FP3 M1 E2E Diagnosis — M1_FP3_E2E_DIAG

**Purpose:** Reproduce 3 E2E failures, identify root causes, propose minimal fixes.  
**Milestone:** M1_FP3_E2E_DIAG  
**Date:** 2025-02-22

---

## A) Evidence

### Commands (canonical)

```bash
cd /home/vydra/Repositories/vydramain/Birdmaid_v2

./infra/smoke.sh
# Result: PLATFORM OK (exit 0)

./infra/test-e2e-fp.sh FP3
# Result: exit 1; 27 passed, 3 failed
```

### Smoke output (excerpt)

```
==> Bringing up dev stack (traefik, minio, minio-init, gateway)...
==> Waiting for gateway /health...
==> Checking /health...
{"status":"ok"}
==> Checking /api/fs/roots...
{"roots":[{"id":"DISK_A","label":"Floppy (A:)"},{"id":"DISK_C","label":"(C:)"},{"id":"DISK_D","label":"(D:)"}]}
PLATFORM OK
```

### E2E failures (3)

#### 1) T-M5-NF3 — Placeholder+spinner behavior correct

```
Error: expect(locator).toBeVisible() failed
Locator: locator('iframe[src*='/apps/explorer']').contentFrame().getByTestId('item-Новая-Папка').locator('.fs-tile-spinner')
Expected: visible
Timeout: 2500ms
Error: element(s) not found

  at e2e/fp3-explorer.spec.ts:340:27
```

**Exact selector:** `frame.getByTestId("item-Новая-Папка").locator(".fs-tile-spinner")`  
**Expectation:** Spinner visible within 2500ms.

#### 2) T-B1.1c — Simulated failure: revert to old name

*(Not reproduced in this run — passed. Audit lists it as flaky.)*

**Exact selector:** `frame.getByTestId("rename-spinner")`  
**Expectation:** Spinner visible within 2000ms before revert.

#### 3) T-M6.1 — User app fetch api.shell.local -> denied (403)

```
Test timeout of 30000ms exceeded.
Error: page.waitForFunction: Test timeout of 30000ms exceeded.

  at e2e/fp3-explorer.spec.ts:900:16
  await page.waitForFunction(
    () => (window as unknown as { __lastFetchStatus?: number }).__lastFetchStatus === 403,
    { timeout: 15000 }
  );
```

**Exact expectation:** `window.__lastFetchStatus === 403` on main page within 15s.

### Files to change (planned)

| File | Change |
|------|--------|
| `e2e/fp3-explorer.spec.ts` | T-M5-NF3: use `new-folder-spinner` + increase mock delay; T-B1.1c: add mock delay for rename 403; T-M6.1: CORS fix or test scope |
| `back/src/index.ts` | T-M6.1: add CORS headers to 403 origin-reject response so user-app can read status |
| `front/apps/explorer/main.ts` | (optional) T-M5-NF3: set stable testid on placeholder from start |

---

## B) Root Causes

### T-M5-NF3

- **Selector mismatch:** Placeholder uses `data-testid="item-newfolder-{idx}"` until API returns; test expects `item-Новая-Папка`. After API returns, testid is updated to `item-Новая-Папка` and `spinner.remove()` runs in the same block. By the time the test can find `item-Новая-Папка`, the spinner is already removed.
- **Race:** Mock delay 2s; test waits for placeholder (wrong id) then spinner. Either the first assert never finds the right element, or the second assert runs after the spinner is gone.
- **Root cause:** Test uses wrong selector for pending state; timing is too tight.

### T-B1.1c

- **Too fast response:** Rename mock returns 403 immediately. Spinner is shown, then removed in the same tick or within a few ms. Test may never see it.
- **Root cause:** No controlled delay in mock; spinner visibility is non-deterministic.

### T-M6.1

- **CORS:** `onRequest` hook rejects requests with disallowed origin (e.g. `s3.shell.local`) and sends 403 without CORS headers. Browser blocks the response; fetch fails with network error. User-app `.catch` runs and posts `status: 0`, not 403.
- **Alternative:** AppHost only handles FETCH_RESULT when `iframeRef.current?.contentWindow === source`. User-app runs in a Shell window iframe; that condition holds. So postMessage routing is correct. The problem is the fetch never yields 403 to the script.
- **Root cause:** Gateway 403 for bad origin lacks CORS headers; user-app cannot read the response and reports 0 instead of 403.

---

## C) Fix Plan

### T-M5-NF3 (2 steps)

1. **Test:** Use `frame.getByTestId("new-folder-spinner")` instead of `placeholder.locator(".fs-tile-spinner")`. Spinner has `data-testid="new-folder-spinner"` and is unique during create.
2. **Test:** Increase mock delay from 2000ms to 3000ms so the spinner is visible for at least 3s and the assert is deterministic.

**Rationale:** AC requires spinner during pending; we assert the spinner directly with a controlled delay. No weakening.

### T-B1.1c (1 step)

1. **Test:** Add 500–800ms delay to the rename mock before fulfilling 403. Ensures spinner is visible long enough for the assert.

**Rationale:** AC requires spinner on failure path; controlled delay makes the test deterministic.

### T-M6.1 (2 steps)

1. **Backend:** In `onRequest`, when replying with 403 for bad origin, add `Access-Control-Allow-Origin: <request origin>` (and optionally `Access-Control-Allow-Methods`) so the browser exposes the 403 to the user-app script. The request is still denied; we only allow reading the error response.
2. **Test:** Optionally increase `waitForFunction` timeout to 20s if app load is slow; no change to AC.

**Rationale:** AC requires user-app fetch → 403. CORS fix lets the script read 403 and post it; no weakening.

---

## D) Next

- **M2 (spinner cases):** T-M5-NF3 and T-B1.1c are both spinner-related. Apply the test changes above first; no code changes needed for these.
- **M3 (FETCH_RESULT):** T-M6.1 requires the backend CORS fix. After that, the existing postMessage flow should work.

**Recommendation:** Implement fixes in this order:

1. T-M5-NF3 + T-B1.1c (test-only, deterministic)
2. T-M6.1 (backend CORS + optional test timeout)

Then re-run `./infra/test-e2e-fp.sh FP3` to verify.
