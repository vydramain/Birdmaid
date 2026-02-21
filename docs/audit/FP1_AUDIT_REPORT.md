# FP1 Audit Report — Gate Semantics (ALL_FPS_GATES)

**Purpose:** Audit FP1 against Gate Semantics (PASS only when all green).  
**Scope:** FP1 Shell MVP per docs/fps/FP1.md.  
**Date:** 2025-02-21  
**Mode:** audit (ALL_FPS_GATES).

---

## 1. Gate Summary

| Check             | Result   | Notes                                            |
| ----------------- | -------- | ------------------------------------------------ |
| Clean-state       | **FAIL** | `git status --porcelain` not empty               |
| Stack (smoke.sh)  | **PASS** | PLATFORM OK                                      |
| pnpm lint         | **PASS** | exit 0                                           |
| pnpm format:check | **FAIL** | exit 1; 9 files need Prettier                    |
| pnpm test (unit)  | **FAIL** | Host: rollup MODULE_NOT_FOUND; container not run |
| pnpm test:e2e     | **PASS** | 10 passed (fp1-shell.spec.ts)                    |
| AC/DoD evidence   | **PASS** | FP1 released; evidence in FP1.md                 |

---

## 2. Commands Table

| Command                  | Expected exit | Actual exit   | Evidence                                             |
| ------------------------ | ------------- | ------------- | ---------------------------------------------------- |
| `git status --porcelain` | 0 (empty)     | 0 (not empty) | 28 modified, 6 untracked                             |
| `./infra/smoke.sh`       | 0             | 0             | PLATFORM OK                                          |
| `pnpm lint`              | 0             | 0             | Style guardrails OK, ESLint OK                       |
| `pnpm format:check`      | 0             | 1             | 9 files: docs/\*, infra/README.md                    |
| `pnpm test`              | 0             | 1             | rollup @rollup/rollup-linux-x64-gnu MODULE_NOT_FOUND |
| `pnpm test:e2e`          | 0             | 0             | 10 passed (fp1-shell.spec.ts)                        |

---

## 3. Test Accounting

| Suite            | Passed | Failed | Skipped | In FP scope                |
| ---------------- | ------ | ------ | ------- | -------------------------- |
| pnpm test (unit) | —      | —      | —       | Host fails to run (rollup) |
| pnpm test:e2e    | 10     | 0      | 0       | FP1: 10/10 pass            |

**Skipped interpretation:** None. FP1 E2E has no skipped tests.

---

## 4. AC/DoD Checklist

| Item            | Evidence   | Status |
| --------------- | ---------- | ------ |
| A1 shell.local  | e2e-fp1-a1 | ✓      |
| A2 /health      | e2e-fp1-a2 | ✓      |
| B1 createWindow | unit-wm-b1 | ✓      |
| B2 close        | e2e-fp1-b2 | ✓      |
| C1 drag clamp   | e2e-fp1-c1 | ✓      |
| D1 focus        | e2e-fp1-d1 | ✓      |
| E1 taskbar      | e2e-fp1-e1 | ✓      |
| F1 APP_READY    | e2e-fp1-f1 | ✓      |
| F2 WINDOW_TITLE | e2e-fp1-f2 | ✓      |

---

## 5. Final Verdict

**REJECT**

**P0 blockers:**

1. **Clean-state:** `git status --porcelain` not empty. Fix: commit or stash changes.
2. **format:check:** 9 files need `pnpm format`. Fix: `pnpm format`.
3. **pnpm test (unit):** Host fails with rollup MODULE_NOT_FOUND. Fix: run in container or `rm -rf node_modules && pnpm install`.

**How to reproduce:**

```bash
git status --porcelain   # expect empty
pnpm format:check        # expect exit 0
pnpm test                # expect exit 0 (or use container)
```
