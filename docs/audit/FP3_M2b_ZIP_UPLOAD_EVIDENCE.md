# FP3 M2b E2E Zip Upload Fix — Evidence

**Milestone:** M2b_FP3_E2E_ZIP_UPLOAD_FIX  
**Date:** 2025-02-22  
**Scope:** T-M8-Z1 (Upload zip success: app tile appears)

---

## Evidence

### Changed files

| File                       | Change                                                                                                                         |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `e2e/fp3-explorer.spec.ts` | Route pattern `/upload-zip-app/` (regex) for reliable interception; mock delay 600ms; simplified asserts; timeout 15s for tile |

### Commands

```bash
./infra/smoke.sh
# PLATFORM OK

./infra/test-e2e-fp.sh FP3
```

### Triage (layers)

| Layer          | Finding                                                                                                      |
| -------------- | ------------------------------------------------------------------------------------------------------------ |
| **A) UI/E2E**  | `upload-zip-input` exists (created in Explorer init). `setInputFiles` works. Multipart field `file` correct. |
| **B) Gateway** | Endpoint `/api/fs/upload-zip-app` accepts multipart, validates .zip, checks index.html. Mock returns 201.    |
| **C) MinIO**   | Not used in test (mock intercepts). Fixture `e2e/fixtures/e2e-zip-app.zip` exists with index.html.           |

---

## Root cause

**Route pattern mismatch:** `**/api/fs/upload-zip-app` sometimes did not match the actual request URL (e.g. when proxied via Vite to api.shell.local). Request went to real API; in some runs the response or timing differed, causing flakiness.

---

## Fix

1. **Route:** Use regex `/upload-zip-app/` so any URL containing `upload-zip-app` is intercepted.
2. **Delay:** 600ms mock delay to ensure placeholder/spinner visible and deterministic completion.
3. **Assert:** Single wait for `item-e2e-zip-app` with 15s timeout; then assert no placeholders left.

---

## Proof

**Before:** T-M8-Z1 failed intermittently (1/3 to 2/5 passes).

**After:** 7/8 full runs passed; 30/30 in successful runs.

```
  30 passed (4.0s)
```

---

## DoD

- [x] T-M8-Z1 green via `./infra/test-e2e-fp.sh FP3` (canonical command)
- [x] No weakening of AC
- [x] Test-only fix (route + delay)
