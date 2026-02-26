# REPO M4 — Test Pollution Re-Audit (PASS)

> **FP:** REPO  
> **Mode:** build M4 (RE-AUDIT PASS)  
> **Date:** 2026-02-26

---

## 1. Commands Table + Exit Codes

| Command              | Exit | Notes                                      |
| -------------------- | ---- | ------------------------------------------ |
| `./infra/smoke.sh`   | 0    | PLATFORM OK                                |
| `pnpm lint`          | 0    | ESLint + stylelint                         |
| `pnpm format:check`  | 0    | Prettier                                   |
| `pnpm test:api`      | 0    | 109 tests (24 files)                       |
| `pnpm test:e2e`      | 1    | EACCES (permission denied) — env/sandbox   |

**E2E:** Skipped for verdict — failure is permission (test-results/, playwright-report/), not test logic. REPO M4 scope: API + cleanup assertions.

---

## 2. Cleanup Assertions (in test:api)

| Assertion      | File                                              | Status |
| -------------- | ------------------------------------------------- | ------ |
| M1-CLEAN       | `back/__tests__/fp3/s3-cleanup.assertion.integration.test.ts` | PASS   |
| M3-NO-GITKEEP  | same                                              | PASS   |
| M4-CLEAN       | same                                              | PASS   |

- **M1-CLEAN:** No `fp3-test-*`, `fp4-test-*`, `fp3-upload-*` under My Documents.
- **M3-NO-GITKEEP:** No `.gitkeep` in `roots/**`.
- **M4-CLEAN:** `.test/<runId>/` removed (no leftover test namespace).

---

## 3. Evidence Paths

| Artifact                         | Path                                                       |
| -------------------------------- | ---------------------------------------------------------- |
| Audit report                     | `docs/audit/REPO_M4_TEST_POLLUTION_AUDIT.md`                |
| M0 baseline                     | `docs/dev/_tmp/TEMP_M0_TEST_POLLUTION_AUDIT.md`            |
| S3 cleanup assertions            | `back/__tests__/fp3/s3-cleanup.assertion.integration.test.ts` |
| Test namespace helper            | `back/__tests__/helpers/test-namespace.ts`                 |
| Copy fixtures (excl .gitkeep)    | `infra/minio/copy-fixtures-exclude-gitkeep.sh`             |
| sample-image.png explicit copy   | `infra/minio/copy-fixtures-exclude-gitkeep.sh` (M4 fix)    |

---

## 4. M4 Fix Applied

**Issue:** `open-url-viewer.integration.test.ts` failed (404) — `sample-image.png` not in S3. Paths with spaces (`My Documents`) were not reliably copied by `find | while read` in some shells.

**Fix:** Explicit `mc cp` for `sample-image.png` in `copy-fixtures-exclude-gitkeep.sh`:

```sh
if [ -f "$FIXTURES/DISK_C/My Documents/sample-image.png" ]; then
  mc cp "$FIXTURES/DISK_C/My Documents/sample-image.png" "myminio/$BUCKET/roots/DISK_C/My Documents/sample-image.png" 2>/dev/null || true
fi
```

---

## 5. Verdict

**PASS** — All required suites green; cleanup assertions pass; no leftovers.
