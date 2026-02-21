# FP2 Audit Report — Gate Semantics (ALL_FPS_GATES)

**Purpose:** Audit FP2 against Gate Semantics (PASS only when all green).  
**Scope:** FP2 Gateway + FS per docs/fps/FP2.md.  
**Date:** 2025-02-21  
**Mode:** audit (ALL_FPS_GATES).  
**Note:** FP2 E2E not in DoD; test:api is the FP2 gate.

---

## 1. Gate Summary

| Check               | Result   | Notes                              |
| ------------------- | -------- | ---------------------------------- |
| Clean-state         | **FAIL** | `git status --porcelain` not empty |
| Stack (smoke.sh)    | **PASS** | PLATFORM OK                        |
| pnpm lint           | **PASS** | exit 0                             |
| pnpm format:check   | **FAIL** | exit 1; 9 files need Prettier      |
| ./infra/test-api.sh | **FAIL** | exit 1; 8 tests failed (FP3 scope) |
| AC/DoD evidence     | **PASS** | FP2 released; evidence in FP2.md   |

---

## 2. Commands Table

| Command                  | Expected exit | Actual exit   | Evidence                 |
| ------------------------ | ------------- | ------------- | ------------------------ |
| `git status --porcelain` | 0 (empty)     | 0 (not empty) | 28 modified, 6 untracked |
| `./infra/smoke.sh`       | 0             | 0             | PLATFORM OK              |
| `pnpm lint`              | 0             | 0             | Style guardrails OK      |
| `pnpm format:check`      | 0             | 1             | 9 files need Prettier    |
| `./infra/test-api.sh`    | 0             | 1             | 8 failed, 38 passed      |

---

## 3. Test Accounting

| Suite          | Passed | Failed | Skipped | In FP scope                                       |
| -------------- | ------ | ------ | ------- | ------------------------------------------------- |
| test:api (FP2) | 16     | 0      | 0       | FP2 api-fs.integration: 16/16 pass                |
| test:api (FP3) | 22     | 8      | 0       | FP3 failures: api-fs-upload (5), api-fs-write (3) |

**Skipped interpretation:** None. FP2 tests (16) all pass. Full suite fails due to FP3 tests.

**Note:** Gate requires `pnpm test:api` exit=0. Full suite exits 1 → REJECT.

---

## 4. AC/DoD Checklist

| Item              | Evidence                            | Status |
| ----------------- | ----------------------------------- | ------ |
| A1–A3 Gateway     | api-fs.integration.test.ts          | ✓      |
| B1–B3 FS Contract | api-fs.integration.test.ts          | ✓      |
| C1–C3 open-url    | open-url-viewer.integration.test.ts | ✓      |
| D1–D2 roots       | roots.integration.test.ts           | ✓      |
| E1–E2 CORS        | CORS_SIGNED_URLS.md, fixtures       | ✓      |
| F1–F2 Error model | api-fs.integration.test.ts          | ✓      |

---

## 5. Final Verdict

**REJECT**

**P0 blockers:**

1. **Clean-state:** `git status --porcelain` not empty.
2. **format:check:** 9 files need `pnpm format`.
3. **test:api:** Full suite exit 1 (8 FP3 tests failed). Fix: resolve FP3 upload/rename failures in gateway or MinIO setup.

**How to reproduce:**

```bash
git status --porcelain   # expect empty
pnpm format:check        # expect exit 0
./infra/test-api.sh      # expect exit 0
```
