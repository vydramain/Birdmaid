# FP1 Audit Report — Gate Semantics (ALL_FPS_GATES)

**Purpose:** Audit FP1 against Gate Semantics (PASS only when all green).
**Scope:** FP1 Shell MVP per docs/fps/FP1.md.
**Date:** 2025-02-22
**Mode:** audit (ALL_FPS_GATES).
**Milestone:** M4_REISSUE_AUDITS_STRICT.

---

## 1. Gate Summary

| Check                      | Result   | Notes                                     |
| -------------------------- | -------- | ----------------------------------------- |
| Clean-state                | **PASS** | `git status --porcelain` empty (post-M3)  |
| Stack (smoke.sh)           | **PASS** | PLATFORM OK                               |
| ./infra/test-lint.sh       | **PASS** | exit 0 (lint + format:check)              |
| ./infra/test-unit.sh       | **PASS** | exit 0; 14 passed (WindowManager)         |
| ./infra/test-e2e-fp.sh FP1 | **PASS** | exit 0; 10 passed (e2e/fp1-shell.spec.ts) |
| AC/DoD evidence            | **PASS** | FP1 released; evidence in FP1.md          |

---

## 2. Commands Table

| Command                      | Expected exit | Actual exit | Evidence                         |
| ---------------------------- | ------------- | ----------- | -------------------------------- |
| `git status --porcelain`     | 0 (empty)     | 0           | empty (post-M3 commit)           |
| `./infra/smoke.sh`           | 0             | 0           | PLATFORM OK                      |
| `./infra/test-lint.sh`       | 0             | 0           | Style guardrails OK, format OK   |
| `./infra/test-unit.sh`       | 0             | 0           | 14 passed (front/**tests**/fp1/) |
| `./infra/test-e2e-fp.sh FP1` | 0             | 0           | 10 passed (fp1-shell)            |

---

## 3. Test Accounting

| Suite           | Passed | Failed | Skipped | In FP scope     |
| --------------- | ------ | ------ | ------- | --------------- |
| Unit (FP1)      | 14     | 0      | 0       | FP1: 14/14 pass |
| E2E (fp1-shell) | 10     | 0      | 0       | FP1: 10/10 pass |

**Scoped E2E:** Gate uses `./infra/test-e2e-fp.sh FP1` — runs only fp1-shell.spec.ts. No FP3 tests.

---

## 4. Exact Reproduction Commands

```bash
cd /path/to/Birdmaid_v2

# Prerequisite: clean-state, stack up
git status --porcelain   # must be empty
docker compose -f infra/docker-compose.dev.yml up -d

# FP1 gate
./infra/gate.sh FP1
# Expected: GATE OK
```

---

## 5. Final Verdict

**PASS**

All gate commands exit 0. No blockers.
