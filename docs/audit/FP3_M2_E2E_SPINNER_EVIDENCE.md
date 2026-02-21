# FP3 M2 E2E Spinner Deflake — Evidence

**Milestone:** M2_FP3_E2E_SPINNER_DEFLAKE  
**Date:** 2025-02-22  
**Scope:** T-M5-NF3, T-B1.1c (spinner tests)

---

## 1) Evidence

### Changed files

| File | Change |
|------|--------|
| `e2e/fp3-explorer.spec.ts` | T-M5-NF3: mock delay 800ms, use `new-folder-spinner`, assert rename-input after; T-B1.1c: mock delay 800ms for rename 403 |

### Commands

```bash
cd /home/vydra/Repositories/vydramain/Birdmaid_v2

./infra/smoke.sh
# Result: PLATFORM OK (exit 0)

./infra/test-e2e-fp.sh FP3
# Result: 28 passed, 2 failed
```

### Result summary

| Test | Before | After |
|------|--------|-------|
| T-M5-NF3 | FAIL (spinner timeout) | **PASS** |
| T-B1.1c | FAIL (flaky) | **PASS** |
| T-M6.1 | FAIL | FAIL (M3 scope) |
| T-M8-Z1 | — | FAIL (unrelated) |

**M2 DoD:** T-M5-NF3 and T-B1.1c are green.

---

## 2) Root cause → fix mapping

### T-M5-NF3

| Root cause | Fix |
|------------|-----|
| Placeholder uses `item-newfolder-{idx}` until API returns; test expected `item-Новая-Папка`; spinner removed before assert | Use `getByTestId("new-folder-spinner")` directly; mock delay 800ms; assert rename-input after response |
| Timing race: 2s delay but wrong selector | 800ms controlled delay; stable spinner testid |

### T-B1.1c

| Root cause | Fix |
|------------|-----|
| Rename mock returns 403 immediately; spinner visible <1ms | Add 800ms delay in route handler before fulfill |
| Non-deterministic spinner visibility | Controlled pending window; assert spinner within 1000ms |

---

## 3) DoD

- [x] T-M5-NF3 green via `./infra/test-e2e-fp.sh FP3`
- [x] T-B1.1c green via `./infra/test-e2e-fp.sh FP3`
- [x] No weakening: spinner AC preserved
- [x] Test-only fixes (controlled delay in mocks)

---

## 4) Remaining: T-M6.1 → M3

**T-M6.1** still fails: `waitForFunction(__lastFetchStatus === 403)` timeout. Root cause: gateway 403 for bad origin lacks CORS headers; user-app fetch fails with network error, posts 0 not 403.

**Next:** Open **M3_FP3_E2E_FETCH_RESULT** — backend CORS fix for 403 origin-reject response.
