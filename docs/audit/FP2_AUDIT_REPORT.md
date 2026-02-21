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
| pnpm lint           | **PASS** | exit 0 (container)                 |
| pnpm format:check   | **FAIL** | exit 1; 4 files need Prettier     |
| ./infra/test-api.sh | **PASS** | exit 0; 46 passed                  |
| AC/DoD evidence     | **PASS** | FP2 released; evidence in FP2.md  |

---

## 2. Commands Table

| Command                  | Expected exit | Actual exit   | Evidence                 |
| ------------------------ | ------------- | ------------- | ------------------------ |
| `git status --porcelain` | 0 (empty)     | 0 (not empty) | 5 modified, 1 untracked  |
| `./infra/smoke.sh`       | 0             | 0             | PLATFORM OK              |
| `pnpm lint` (container)  | 0             | 0             | Style guardrails OK      |
| `pnpm format:check`      | 0             | 1             | 4 files need Prettier    |
| `./infra/test-api.sh`    | 0             | 0             | 46 passed (FP2+FP3)      |

---

## 3. Test Accounting

| Suite          | Passed | Failed | Skipped | In FP scope                |
| -------------- | ------ | ------ | ------- | -------------------------- |
| test:api (FP2) | 16     | 0      | 0       | api-fs: 16/16 pass         |
| test:api (FP3) | 30     | 0      | 0       | FP3 integration: 30/30 pass |

**Skipped interpretation:** None. FP2 gate (test:api) passes.

---

## 4. AC/DoD Checklist

| Item              | Evidence                            | Status |
| ----------------- | ----------------------------------- | ------ |
| A1–A3 Gateway     | api-fs.integration.test.ts          | ✓      |
| B1–B3 FS Contract | api-fs.integration.test.ts          | ✓      |
| C1–C3 open-url    | open-url-viewer.integration.test.ts | ✓      |
| D1–D2 roots       | roots.integration.test.ts           | ✓      |
| E1–E2 CORS        | CORS_SIGNED_URLS.md, fixtures       | ✓      |
| F1–F2 Error model | api-fs.integration.test.ts           | ✓      |

---

## 5. Final Verdict

**REJECT**

**P0 blockers:**

1. **Clean-state:** `git status --porcelain` not empty.
2. **format:check:** 4 files need `pnpm format`.
