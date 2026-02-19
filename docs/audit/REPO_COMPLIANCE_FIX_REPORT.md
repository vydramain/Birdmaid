# REPO_COMPLIANCE_FIX_REPORT — Compliance Gate

**Mode:** build (full repo audit + fix)  
**Sources:** REPO_COMPLIANCE_REVIEW.md, GUARDRAILS.md, STYLE_GUIDE.md, GUIDE_STYLE.md, REPO_HYGIENE_PLAN.md

---

## Executive Summary

| Area                     | Status   | Blocker |
| ------------------------ | -------- | ------- |
| C-01 Front inline styles | CLOSED   | P0      |
| C-02 index.css px/rem    | DEFERRED | P2/FP7  |
| C-03 pre-commit blind    | CLOSED   | P0      |
| C-04 CI check:styles     | CLOSED   | P0      |
| C-05 .env.example        | CLOSED   | P1      |
| C-06 CODE_REVIEW         | CLOSED   | P1      |
| C-07 eslint-plugin       | DEFERRED | P2      |

---

## Findings List

| ID   | Finding                                    | Severity | Status   | Fix Applied                                        |
| ---- | ------------------------------------------ | -------- | -------- | -------------------------------------------------- |
| C-01 | Front inline styles (5 files)              | P0       | CLOSED   | CSS classes; WindowChromeView allow-tag for bounds |
| C-02 | index.css stylelint ignore + px            | P2/FP7   | DEFERRED | FP7 milestone in REPO_HYGIENE_PLAN                 |
| C-03 | pre-commit staged-only blind spot          | P0       | CLOSED   | pnpm check:styles in lint-staged (full scan)       |
| C-04 | CI does not run check-inline-styles        | P0       | CLOSED   | pnpm check:styles in CI lint job                   |
| C-05 | .env.example missing                       | P1       | CLOSED   | Added .env.example, SECURITY.md updated            |
| C-06 | CODE_REVIEW checklist missing check:styles | P1       | CLOSED   | Added check:styles to CODE_REVIEW.md               |
| C-07 | eslint-plugin-style-guardrails             | P2       | DEFERRED | TODO in GUARDRAILS                                 |

---

## Fix Plan

1. **C-03/C-04 first:** Extend `check-inline-styles.cjs` to accept directories (front, e2e, back). Add `check:styles` script. Update lint-staged and CI.
2. **C-01:** Remove inline styles from App, DesktopView, TaskbarView, TaskbarItemView. WindowChromeView: allow-tag + minimal inline for bounds; extend script for `.bounds` runtime.
3. **C-05:** Add .env.example.
4. **C-06:** Update CODE_REVIEW.md.
5. **C-02:** Document FP7 in REPO_HYGIENE_PLAN.
6. **C-07:** Add TODO to GUARDRAILS.

---

## Evidence

| Action  | Path                                                                    |
| ------- | ----------------------------------------------------------------------- |
| UPDATED | scripts/check-inline-styles.cjs (dir support, .bounds runtime)          |
| UPDATED | package.json (check:styles, lint includes check:styles)                 |
| UPDATED | .lintstagedrc.json (pnpm check:styles)                                  |
| UPDATED | .github/workflows/ci.yml (pnpm check:styles)                            |
| UPDATED | front/App.tsx, ui/DesktopView.tsx, TaskbarView.tsx, TaskbarItemView.tsx |
| UPDATED | front/ui/WindowChromeView.tsx (allow-tag, CSS classes)                  |
| UPDATED | front/index.css (app-root, wm-desktop, wm-taskbar, wm-window, etc.)     |
| ADDED   | .env.example                                                            |
| UPDATED | docs/dev/SECURITY.md, CODE_REVIEW.md, GUARDRAILS.md                     |
| UPDATED | docs/dev/REPO_HYGIENE_PLAN.md (FP7 milestone)                           |

---

## Verification

| Command           | Result      |
| ----------------- | ----------- |
| pnpm check:styles | PASS        |
| pnpm lint         | PASS        |
| pnpm format:check | PASS        |
| pnpm test         | PASS (14)   |
| ./infra/smoke.sh  | PLATFORM OK |

---

## DoD Checklist

- [x] check-inline-styles PASS (full scan)
- [x] pnpm lint PASS
- [x] pnpm format:check PASS
- [x] pnpm test PASS
- [x] smoke PASS
- [x] .env.example added (no secrets)
- [x] docs updated (CODE_REVIEW, GUARDRAILS)
- [x] No new hygiene violations (Target Tree preserved)

---

## Remaining TODO (FP7)

- Remove .stylelintignore for front/index.css; migrate px→rem in :root
