# FP3 Audit Report — Gate Semantics (ALL_FPS_GATES)

**Purpose:** Audit FP3 against Gate Semantics (PASS only when all green).
**Scope:** FP3 Explorer + Shell per docs/fps/FP3.md (M6 + patchset M5–M9).
**Date:** 2025-02-22
**Mode:** audit (ALL_FPS_GATES).
**M2_FIX_FP3_E2E:** Applied scoped selectors, stable-id, FETCH_RESULT signal.

---

## 1. Gate Summary

| Check                      | Result   | Notes                              |
| -------------------------- | -------- | ---------------------------------- |
| Clean-state                | **FAIL** | `git status --porcelain` not empty |
| Stack (smoke.sh)           | **PASS** | PLATFORM OK                        |
| ./infra/test-lint.sh       | **PASS** | exit 0 (lint + format:check)       |
| ./infra/test-api-fp.sh FP3 | **PASS** | exit 0; 46 passed (fp2+fp3)        |
| ./infra/test-e2e-fp.sh FP3 | TBD      | Run after M2 fixes; see §7         |
| AC/DoD evidence            | **PASS** | Evidence in FP3.md                 |

---

## 2. Commands Table

| Command                      | Expected exit | Actual exit | Evidence                       |
| ---------------------------- | ------------- | ----------- | ------------------------------ |
| `git status --porcelain`     | 0 (empty)     | —           | —                              |
| `./infra/smoke.sh`           | 0             | 0           | PLATFORM OK                    |
| `./infra/test-lint.sh`       | 0             | 0           | Style guardrails OK, format OK |
| `./infra/test-api-fp.sh FP3` | 0             | 0           | 46 passed (10 files)           |
| `./infra/test-e2e-fp.sh FP3` | 0             | TBD         | See §7                         |

---

## 3. Test Accounting (pre-M2)

### test:api (FP3 scoped)

| Suite     | Passed | Failed | In FP scope |
| --------- | ------ | ------ | ----------- |
| fp2       | 16     | 0      | Base        |
| fp3       | 30     | 0      | FP3         |
| **Total** | 46     | 0      | —           |

### test:e2e (pre-M2, 8 failed)

| Status    | Passed | Failed | Cause                                                               |
| --------- | ------ | ------ | ------------------------------------------------------------------- |
| FP3 scope | 32     | 8      | Strict mode (locators match multiple elements), timeout, T-M6.1 403 |

---

## 4. M2 Root Causes and Fixes

| #   | Test      | Root cause (before)                          | Fix (after)                                                                                   |
| --- | --------- | -------------------------------------------- | --------------------------------------------------------------------------------------------- |
| 1   | T-M5.1    | Right click at (10,10) hit tile, not blank   | `explorer-blank-area` + `menu-new-folder` testid; click on blank area                         |
| 2   | T-M5.3    | `[data-testid^='item-Новая-Папка']` → 4 elts | Stable id from API path: `item-${pathToStableId(result.path)}`                                |
| 3–6 | T-B1.1a–d | `item-sample-image.png` timeout              | mockFsForM6 for deterministic fixtures; pathToStableId for tiles                              |
| 7   | T-A2.1    | `.or()` matched 2 elements (strict mode)     | Single selector: `item-VeryLongFolderNameThatExceedsThreeLinesWhenRenderedInTile`             |
| 8   | T-M6.1    | waitForResponse 403 never observed           | user-app-deny postMessage FETCH_RESULT; AppHost sets \_\_lastFetchStatus; e2e waitForFunction |

---

## 5. Exact Reproduction Commands

```bash
cd /path/to/Birdmaid_v2

# Prerequisite
docker compose -f infra/docker-compose.dev.yml up -d

# FP3 gate (scoped e2e)
./infra/gate.sh FP3

# Or e2e only
./infra/test-e2e-fp.sh FP3
```

---

## 6. P0 Blockers (pre-M2)

| #   | Blocker     | Cause                | Fix path (M2)                                              |
| --- | ----------- | -------------------- | ---------------------------------------------------------- |
| 1   | Clean-state | Modified files       | `git add` + commit, or restore                             |
| 2   | test-e2e    | 8 FP3 e2e tests fail | M2 fixes applied; verify with `./infra/test-e2e-fp.sh FP3` |

---

## 7. M2 Evidence (files changed)

| File                                                | Changes                                                                                                              |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `front/apps/explorer/main.ts`                       | explorer-blank-area, menu-new-folder/upload-file/upload-zip/delete/rename, pathToStableId, stable item-<id> from API |
| `e2e/fp3-explorer.spec.ts`                          | explorer-blank-area, menu-new-folder, mockFsForM6 for B1, single tile selector, waitForFunction \_\_lastFetchStatus  |
| `infra/minio/fixtures/.../user-app-deny/index.html` | postMessage FETCH_RESULT to parent on fetch complete                                                                 |
| `front/core/AppHost.tsx`                            | Handle FETCH_RESULT, set window.\_\_lastFetchStatus                                                                  |

---

## 8. Final Verdict

**TBD** — Run `./infra/test-e2e-fp.sh FP3` after M2 fixes. PASS when exit 0.
