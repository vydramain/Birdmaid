# FP3.2 Audit Report — M7_FINAL_GATE

**Purpose:** Audit FP3.2 against M7_FINAL_GATE (PASS only when all green).
**Scope:** FP3.2 Explorer UX + Shell maximize per docs/fps/FP3_2.md.
**Date:** 2025-02-22
**Mode:** audit
**Milestone:** M7_FINAL_GATE

---

## 1. Gate Summary

| Check                        | Result   | Notes                                  |
| ---------------------------- | -------- | -------------------------------------- |
| `git status --porcelain`     | **FAIL** | Not empty (modified + untracked)       |
| `./infra/smoke.sh`           | **PASS** | PLATFORM OK                            |
| `pnpm lint`                  | **PASS** | exit 0                                 |
| `pnpm format:check`          | **PASS** | exit 0                                 |
| `./infra/test-api.sh`        | **FAIL** | exit 1; 2 failed (T-A8, T-M4-open-url) |
| `pnpm test:e2e`              | **FAIL** | exit 1; EACCES test-results on host    |
| `./infra/test-e2e-fp.sh FP3` | **FAIL** | exit 1; 2 failed (T-M5.3, T-A6)        |

---

## 2. Commands Table (M7_FINAL_GATE)

| Command                      | Expected exit | Actual exit | Evidence                                                       |
| ---------------------------- | ------------- | ----------- | -------------------------------------------------------------- |
| `git status --porcelain`     | 0 (empty)     | 0           | Not empty: 15 M, 4 ?? (Shell.tsx, explorer, fs.ts, e2e, docs…) |
| `./infra/smoke.sh`           | 0             | 0           | PLATFORM OK                                                    |
| `pnpm lint`                  | 0             | 0           | OK                                                             |
| `pnpm format:check`          | 0             | 0           | OK                                                             |
| `./infra/test-api.sh`        | 0             | 1           | 2 failed: T-A8 (rename dir 403), T-M4-open-url (404)           |
| `pnpm test:e2e`              | 0             | 1           | EACCES: permission denied test-results/.last-run.json          |
| `./infra/test-e2e-fp.sh FP3` | 0             | 1           | 2 failed: T-M5.3 (New Folder), T-A6 (path persists)            |

---

## 3. Test Failures Detail

### API (test-api.sh)

| Test ID       | Error              | Cause                                                       |
| ------------- | ------------------ | ----------------------------------------------------------- |
| T-A8          | expected 403 → 200 | rename dir "Новая Папка 3" → "Новая Папка 343"; backend 403 |
| T-M4-open-url | expected 404 → 200 | POST open-url sample-image.png → 404; fixture/path mismatch |

### E2E (test-e2e-fp FP3)

| Test ID | Error                                         | Cause                                                           |
| ------- | --------------------------------------------- | --------------------------------------------------------------- |
| T-M5.3  | New Folder: right click blank, folder appears | (intercept/pointer)                                             |
| T-A6    | Two Explorer: path persists on focus switch   | iframe intercepts pointer events; dblclick fails on root-disk_c |

---

## 4. Evidence (Gate Run)

```
git status --porcelain
 M back/__tests__/fp3/api-fs-write.integration.test.ts
 M back/src/fs.ts
 M docs/README.md
 M docs/core/UX_MAP.md
 M docs/fps/FP3.md
 M e2e/fp1-shell.spec.ts
 M e2e/fp3-explorer.spec.ts
 M front/Shell.tsx
 M front/__tests__/fp1/WindowManager.test.ts
 M front/apps/explorer/main.ts
 M front/core/AppHost.tsx
 M front/core/WindowManager.ts
 M front/shared/fs-tile.css
 M front/ui/TaskbarItemView.tsx
 M front/ui/WindowChromeView.tsx
?? docs/core/FS_BEHAVIOR_FP3_2.md
?? docs/dev/FP3_2_SECURITY_DOD.md
?? docs/fps/FP3_2.md
?? docs/tests/FP3_2_TESTS.md
```

---

## 5. Fixes Applied During Audit

| File              | Change                                                                  |
| ----------------- | ----------------------------------------------------------------------- |
| `front/Shell.tsx` | Removed unused `lastRes` (lint)                                         |
| `back/src/fs.ts`  | renameItem: use toS3Prefix for dirs (trailing slash); CopySource encode |
| (format)          | `pnpm format` on 4 files                                                |

---

## 6. Final Verdict

**REJECT**

PASS requires all gate checks green. Current state:

- `git status` not empty
- `./infra/test-api.sh` exit 1 (T-A8, T-M4-open-url)
- `pnpm test:e2e` exit 1 (EACCES)
- `./infra/test-e2e-fp.sh FP3` exit 1 (T-M5.3, T-A6)
