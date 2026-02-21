# FP1 Audit Report — Gate Semantics (ALL_FPS_GATES)

**Purpose:** Audit FP1 against Gate Semantics (PASS only when all green).
**Scope:** FP1 Shell MVP per docs/fps/FP1.md.
**Date:** 2025-02-22
**Mode:** audit (ALL_FPS_GATES).

---

## 1. Gate Summary

| Check                | Result   | Notes                                      |
| -------------------- | -------- | ------------------------------------------ |
| Clean-state          | **FAIL** | `git status --porcelain` not empty (6 mod) |
| Stack (smoke.sh)     | **PASS** | PLATFORM OK                                |
| ./infra/test-lint.sh | **PASS** | exit 0 (lint + format:check)               |
| ./infra/test-unit.sh | **PASS** | exit 0; 14 passed (WindowManager)          |
| ./infra/test-e2e.sh  | **FAIL** | exit 1; 6 failed, 34 passed (FP3 tests)    |
| AC/DoD evidence      | **PASS** | FP1 released; evidence in FP1.md           |

---

## 2. Commands Table

| Command                  | Expected exit | Actual exit   | Evidence                         |
| ------------------------ | ------------- | ------------- | -------------------------------- |
| `git status --porcelain` | 0 (empty)     | 0 (not empty) | 6 modified files                 |
| `./infra/smoke.sh`       | 0             | 0             | PLATFORM OK                      |
| `./infra/test-lint.sh`   | 0             | 0             | Style guardrails OK, format OK   |
| `./infra/test-unit.sh`   | 0             | 0             | 14 passed (front/**tests**/fp1/) |
| `./infra/test-e2e.sh`    | 0             | 1             | 6 failed, 34 passed              |

---

## 3. Test Accounting

| Suite              | Passed | Failed | Skipped | In FP scope                |
| ------------------ | ------ | ------ | ------- | -------------------------- |
| Unit (FP1)         | 14     | 0      | 0       | FP1: 14/14 pass            |
| E2E (fp1-shell)    | 10     | 0      | 0       | FP1: 10/10 pass            |
| E2E (fp3-explorer) | 24     | 6      | 0       | FP3 scope; blocks FP1 gate |

**Note:** Gate runs full `./infra/test-e2e.sh` (all specs). FP1-specific e2e (fp1-shell.spec.ts) all pass. FP3 tests fail and cause gate exit 1.

---

## 4. Exact Reproduction Commands

```bash
cd /path/to/Birdmaid_v2

# 1. Clean-state
git status --porcelain
# Expected: empty. Actual: 6 modified.

# 2. Full gate
./infra/gate.sh FP1
# Fails at step 3b (test-e2e.sh) with exit 1.
```

---

## 5. P0 Blockers (REJECT)

| #   | Blocker     | Cause                                                             | Fix path                                                                 |
| --- | ----------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------ |
| 1   | Clean-state | 6 modified files (docs, infra)                                    | `git add` + commit, or `git restore` to discard                          |
| 2   | test-e2e    | 6 FP3 tests fail (strict mode, timeout); gate runs full e2e suite | Fix e2e locators in fp3-explorer.spec.ts, or add scoped e2e for FP1 gate |

---

## 6. Final Verdict

**REJECT**

No "PASS but…". All required commands must exit 0 for PASS.
