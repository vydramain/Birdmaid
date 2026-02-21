# FP1 Audit Report — Gate Semantics (ALL_FPS_GATES)

**Purpose:** Audit FP1 against Gate Semantics (PASS only when all green).
**Scope:** FP1 Shell MVP per docs/fps/FP1.md.
**Date:** 2025-02-21
**Mode:** audit (ALL_FPS_GATES).

---

## 1. Gate Summary

| Check             | Result   | Notes                                     |
| ----------------- | -------- | ----------------------------------------- |
| Clean-state       | **PASS** | `git status --porcelain` empty            |
| Stack (smoke.sh)  | **PASS** | PLATFORM OK                               |
| pnpm lint         | **PASS** | exit 0 (container)                        |
| pnpm format:check | **FAIL** | exit 1; 5 files need Prettier             |
| pnpm test (unit)  | **PASS** | exit 0 (container); 14 passed             |
| pnpm test:e2e     | **FAIL** | exit 1; Chromium libnspr4.so in container |
| AC/DoD evidence   | **PASS** | FP1 released; evidence in FP1.md          |

---

## 2. Commands Table

| Command                     | Expected exit | Actual exit | Evidence                                                   |
| --------------------------- | ------------- | ----------- | ---------------------------------------------------------- |
| `git status --porcelain`    | 0 (empty)     | 0           | empty                                                      |
| `./infra/smoke.sh`          | 0             | 0           | PLATFORM OK                                                |
| `pnpm lint` (container)     | 0             | 0           | Style guardrails OK, ESLint OK                             |
| `pnpm format:check`         | 0             | 1           | 5 files: FP1/FP2/FP3_AUDIT_REPORT, FP3_TESTS, package.json |
| `pnpm test` (container)     | 0             | 0           | 14 passed (WindowManager)                                  |
| `pnpm test:e2e` (container) | 0             | 1           | 39 failed: libnspr4.so missing in node:22                  |

---

## 3. Test Accounting

| Suite            | Passed | Failed | Skipped | In FP scope     |
| ---------------- | ------ | ------ | ------- | --------------- |
| pnpm test (unit) | 14     | 0      | 0       | FP1: 14/14 pass |
| pnpm test:e2e    | —      | 39     | 0       | Container env   |

**Skipped interpretation:** None. E2E did not run (Chromium launch failed in container).

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

1. **format:check:** 5 files need `pnpm format`.
2. **test:e2e:** Container Chromium fails (libnspr4.so). Use Playwright image or host.
