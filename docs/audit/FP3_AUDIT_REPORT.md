# FP3 Audit Report — Gate Semantics (ALL_FPS_GATES)

**Purpose:** Audit FP3 against Gate Semantics (PASS only when all green).  
**Scope:** FP3 Explorer + Shell per docs/fps/FP3.md (M6 + patchset M5–M9).  
**Date:** 2025-02-21  
**Mode:** audit (ALL_FPS_GATES).

---

## 1. Gate Summary

| Check               | Result   | Notes                                            |
| ------------------- | -------- | ------------------------------------------------ |
| Clean-state         | **FAIL** | `git status --porcelain` not empty               |
| Stack (smoke.sh)    | **PASS** | PLATFORM OK                                      |
| pnpm lint           | **PASS** | exit 0                                           |
| pnpm format:check   | **FAIL** | exit 1; 9 files need Prettier                    |
| ./infra/test-api.sh | **FAIL** | exit 1; 8 FP3 tests failed                       |
| pnpm test:e2e       | **FAIL** | 3 skipped (T-M7-U1, T-M7-U2, T-M8-Z1) — FP scope |
| AC/DoD evidence     | **PASS** | Evidence in FP3.md                               |

---

## 2. Commands Table

| Command                  | Expected exit | Actual exit   | Evidence                         |
| ------------------------ | ------------- | ------------- | -------------------------------- |
| `git status --porcelain` | 0 (empty)     | 0 (not empty) | 28 modified, 6 untracked         |
| `./infra/smoke.sh`       | 0             | 0             | PLATFORM OK                      |
| `pnpm lint`              | 0             | 0             | Style guardrails OK              |
| `pnpm format:check`      | 0             | 1             | 9 files need Prettier            |
| `./infra/test-api.sh`    | 0             | 1             | 8 failed (FP3 upload/rename)     |
| `pnpm test:e2e`          | 0             | 0\*           | \*3 skipped in FP scope → REJECT |

---

## 3. Test Accounting

### test:api

| Suite                                      | Passed | Failed | Skipped | In FP scope      |
| ------------------------------------------ | ------ | ------ | ------- | ---------------- |
| api-fs-upload                              | 0      | 5      | 0       | Yes (FP3 M7, M8) |
| api-fs-write                               | 3      | 3      | 0       | Yes (FP3 M5)     |
| security, roots, list, isapp, write-denied | 22     | 0      | 0       | Yes              |
| FP2 api-fs                                 | 16     | 0      | 0       | No               |

**FP3 test:api:** 25 passed, 8 failed. Failures: upload-file (500), upload-zip-app (500), rename (404).

### test:e2e

| Test                  | Status  | In FP scope |
| --------------------- | ------- | ----------- |
| T-M7-U1 (Upload file) | skipped | Yes         |
| T-M7-U2 (Upload fail) | skipped | Yes         |
| T-M8-Z1 (Upload zip)  | skipped | Yes         |

**Skipped interpretation:** All 3 skipped tests belong to FP3 scope (upload). Per Gate Semantics: "если относятся к FP scope -> REJECT + P0 blocker."

---

## 4. AC/DoD Checklist

| Item           | Evidence                                  | Status     |
| -------------- | ----------------------------------------- | ---------- |
| M6 Security    | security.integration.test.ts, T-M6.1 E2E  | ✓          |
| M5 Write       | api-fs-write.integration.test.ts          | ✓ (3 fail) |
| M7 Upload file | api-fs-upload.integration.test.ts         | ✓ (5 fail) |
| M8 Upload zip  | api-fs-upload.integration.test.ts T-M8-Z1 | ✓ (fail)   |
| M9 State       | T-D1.1 E2E                                | ✓          |
| Patchset A1–D1 | FP3.md, FP3_TESTS.md                      | ✓          |

---

## 5. Final Verdict

**REJECT**

**P0 blockers:**

1. **Clean-state:** `git status --porcelain` not empty.
2. **format:check:** 9 files need `pnpm format`.
3. **test:api:** 8 FP3 tests failed (upload 500, rename 404). Fix: gateway/MinIO multipart handling, path resolution.
4. **test:e2e skipped:** T-M7-U1, T-M7-U2, T-M8-Z1 skipped — FP scope. Fix: remove skip or implement alternative (filechooser in iframe not supported by Playwright).

**How to reproduce:**

```bash
git status --porcelain   # expect empty
pnpm format:check       # expect exit 0
./infra/test-api.sh     # expect exit 0
pnpm test:e2e           # expect 0 skipped in FP scope
```
