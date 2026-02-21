# FP3 Audit Report — Gate Semantics (ALL_FPS_GATES)

**Purpose:** Audit FP3 against Gate Semantics (PASS only when all green).
**Scope:** FP3 Explorer + Shell per docs/fps/FP3.md (M6 + patchset M5–M9).
**Date:** 2025-02-22
**Mode:** audit (ALL_FPS_GATES).
**Milestone:** M4_REISSUE_AUDITS_STRICT.

---

## 1. Gate Summary

| Check                        | Result   | Notes                                      |
| ---------------------------- | -------- | ------------------------------------------ |
| Clean-state                  | **PASS** | `git status --porcelain` empty (post-M3)   |
| Stack (smoke.sh)             | **PASS** | PLATFORM OK                                |
| ./infra/test-lint.sh         | **PASS** | exit 0 (lint + format:check)               |
| ./infra/test-api-fp.sh FP3   | **PASS** | exit 0; 46 passed (fp2+fp3)                |
| ./infra/test-e2e-fp.sh FP3   | **FAIL** | exit 1; 27 passed, 3 failed                 |
| AC/DoD evidence              | **PASS** | Evidence in FP3.md                         |

---

## 2. Commands Table

| Command                        | Expected exit | Actual exit | Evidence                       |
| ------------------------------ | ------------- | ----------- | ------------------------------ |
| `git status --porcelain`       | 0 (empty)     | 0           | empty (post-M3 commit)         |
| `./infra/smoke.sh`             | 0             | 0           | PLATFORM OK                    |
| `./infra/test-lint.sh`         | 0             | 0           | Style guardrails OK, format OK |
| `./infra/test-api-fp.sh FP3`   | 0             | 0           | 46 passed (10 files)            |
| `./infra/test-e2e-fp.sh FP3`   | 0             | 1           | 27 passed, 3 failed             |

---

## 3. Test Accounting

### test:api (FP3 scoped)

| Suite     | Passed | Failed | In FP scope |
| --------- | ------ | ------ | ----------- |
| fp2       | 16     | 0      | Base        |
| fp3       | 30     | 0      | FP3         |
| **Total** | 46     | 0      | —           |

### test:e2e (FP3 scoped)

| Status    | Passed | Failed | Cause                                                                 |
| --------- | ------ | ------ | --------------------------------------------------------------------- |
| FP3 scope | 27     | 3      | T-M5-NF3 (spinner timeout), T-B1.1c (rename-spinner), T-M6.1 (__lastFetchStatus) |

**Failed tests (3):**

1. **T-M5-NF3** — Placeholder+spinner: `.fs-tile-spinner` not visible within 2500ms (mock delay 2s; spinner may be removed before assert)
2. **T-B1.1c** — Simulated failure: `rename-spinner` not visible within 2000ms (403 response may be faster than spinner render)
3. **T-M6.1** — User app fetch 403: `waitForFunction(__lastFetchStatus === 403)` timeout 15s (user-app iframe may not receive 403 or postMessage not reaching Shell)

---

## 4. Exact Reproduction Commands

```bash
cd /path/to/Birdmaid_v2

# Prerequisite: clean-state, stack up
git status --porcelain   # must be empty
docker compose -f infra/docker-compose.dev.yml up -d

# FP3 gate
./infra/gate.sh FP3
# Actual: exit 1 at test-e2e-fp.sh FP3 (3 e2e failures)
```

---

## 5. P0 Blockers (REJECT)

| #   | Blocker   | Cause                                                       | Fix path                                                                 |
| --- | --------- | ----------------------------------------------------------- | ------------------------------------------------------------------------ |
| 1   | test-e2e  | 3 FP3 e2e tests fail: T-M5-NF3, T-B1.1c, T-M6.1            | Adjust timeouts/spinner asserts; fix user-app 403 + postMessage routing  |

---

## 6. Final Verdict

**REJECT**

P0 blocker: `./infra/test-e2e-fp.sh FP3` exit 1. All required commands must exit 0 for PASS.

---

## 7. Summary: FP → PASS/REJECT (M4)

| FP  | Verdict | Причина                                                       |
| --- | ------- | ------------------------------------------------------------- |
| FP1 | **PASS** | clean-state empty, smoke, lint, unit 14, e2e-fp FP1 10 — all exit 0 |
| FP2 | **PASS** | clean-state empty, smoke, lint, api-fp FP2 16, e2e-fp FP2 skip — all exit 0 |
| FP3 | **REJECT** | test-e2e-fp FP3 exit 1; 3 failed: T-M5-NF3, T-B1.1c, T-M6.1 |
