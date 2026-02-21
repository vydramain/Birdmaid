# FP3 Audit Report — Gate Semantics (ALL_FPS_GATES)

**Purpose:** Audit FP3 against Gate Semantics (PASS only when all green).
**Scope:** FP3 Explorer + Shell per docs/fps/FP3.md (M6 + patchset M5–M9).
**Date:** 2025-02-21
**Mode:** audit (ALL_FPS_GATES).

---

## 1. Gate Summary

| Check               | Result   | Notes                                     |
| ------------------- | -------- | ----------------------------------------- |
| Clean-state         | **PASS** | `git status --porcelain` empty            |
| Stack (smoke.sh)    | **PASS** | PLATFORM OK                               |
| pnpm lint           | **PASS** | exit 0 (container)                        |
| pnpm format:check   | **FAIL** | exit 1; 5 files need Prettier             |
| ./infra/test-api.sh | **PASS** | exit 0; 46 passed (FP3 upload/write OK)   |
| pnpm test:e2e       | **FAIL** | exit 1; Chromium libnspr4.so in container |
| AC/DoD evidence     | **PASS** | Evidence in FP3.md                        |

---

## 2. Commands Table

| Command                     | Expected exit | Actual exit | Evidence                          |
| --------------------------- | ------------- | ----------- | --------------------------------- |
| `git status --porcelain`    | 0 (empty)     | 0           | empty                             |
| `./infra/smoke.sh`          | 0             | 0           | PLATFORM OK                       |
| `pnpm lint` (container)     | 0             | 0           | Style guardrails OK               |
| `pnpm format:check`         | 0             | 1           | 5 files need Prettier             |
| `./infra/test-api.sh`       | 0             | 0           | 46 passed (FP3 upload/write)      |
| `pnpm test:e2e` (container) | 0             | 1           | 39 failed: libnspr4.so in node:22 |

---

## 3. Test Accounting

### test:api

| Suite                                      | Passed | Failed | Skipped | In FP scope      |
| ------------------------------------------ | ------ | ------ | ------- | ---------------- |
| api-fs-upload                              | 5      | 0      | 0       | Yes (FP3 M7, M8) |
| api-fs-write                               | 6      | 0      | 0       | Yes (FP3 M5)     |
| security, roots, list, isapp, write-denied | 22     | 0      | 0       | Yes              |
| FP2 api-fs                                 | 16     | 0      | 0       | No               |

**FP3 test:api:** 33 passed, 0 failed.

### test:e2e

| Status    | Cause                                             |
| --------- | ------------------------------------------------- |
| 39 failed | Container: Chromium libnspr4.so missing (node:22) |

**Skipped interpretation:** E2E did not execute; Chromium launch failed. FP3 upload tests (T-M7-U1, T-M7-U2, T-M8-Z1) no longer skipped per FP3_TESTS.md.

---

## 4. AC/DoD Checklist

| Item           | Evidence                                  | Status |
| -------------- | ----------------------------------------- | ------ |
| M6 Security    | security.integration.test.ts, T-M6.1 E2E  | ✓      |
| M5 Write       | api-fs-write.integration.test.ts          | ✓      |
| M7 Upload file | api-fs-upload.integration.test.ts         | ✓      |
| M8 Upload zip  | api-fs-upload.integration.test.ts T-M8-Z1 | ✓      |
| M9 State       | T-D1.1 E2E                                | ✓      |
| Patchset A1–D1 | FP3.md, FP3_TESTS.md                      | ✓      |

---

## 5. Final Verdict

**REJECT**

**P0 blockers:**

1. **format:check:** 5 files need `pnpm format`.
2. **test:e2e:** Container Chromium fails (libnspr4.so). Use Playwright image or host.
