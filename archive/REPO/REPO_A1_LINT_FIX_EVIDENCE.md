# REPO A1 — Lint Baseline Fix Evidence

**Date:** 2026-03-01  
**Scope:** Stylelint baseline fix (A1)

---

## 1. Changed Files

| File                | Changes                                                                                                      |
| ------------------- | ------------------------------------------------------------------------------------------------------------ |
| `.stylelintrc.json` | Removed unknown rules: `color-hex-case`, `indentation`, `string-quotes` (not available in stylelint 16 core) |
| `front/index.css`   | px→rem, rgba→rgb() (stylelint --fix)                                                                         |

---

## 2. Commands Table

| #   | Command                                                                  | Exit | Notes                                                          |
| --- | ------------------------------------------------------------------------ | ---- | -------------------------------------------------------------- |
| 1   | `pnpm exec stylelint "front/index.css" "front/shared/fs-tile.css" --fix` | 2    | Auto-fixed color/alpha; 13 px remain                           |
| 2   | `pnpm lint`                                                              | 0    | PASS                                                           |
| 3   | `pnpm format:check`                                                      | 1    | Pre-existing issues in docs/archive/infra (not in changed CSS) |
| 4   | `prettier -c front/index.css front/shared/fs-tile.css .stylelintrc.json` | 0    | Changed files formatted OK                                     |

---

## 3. .stylelintrc.json

**Removed rules** (caused "Unknown rule" in stylelint 16):

- `color-hex-case`
- `indentation`
- `string-quotes`

**Kept:** `color-hex-length`, `unit-disallowed-list`, `declaration-no-important`

---

## 4. front/index.css

### 4.1 unit-disallowed-list (px → rem)

| Line | Before      | After               |
| ---- | ----------- | ------------------- |
| 3    | `28px`      | `1.75rem`           |
| 4    | `2px`       | `0.125rem`          |
| 5    | `32px`      | `2rem`              |
| 6    | `4px`       | `0.25rem`           |
| 7    | `8px`       | `0.5rem`            |
| 8    | `4px`       | `0.25rem`           |
| 9    | `8px`       | `0.5rem`            |
| 10   | `12px`      | `0.75rem`           |
| 23   | `0 2px 8px` | `0 0.125rem 0.5rem` |
| 133  | `1px`       | `0.0625rem`         |
| 160  | `0 2px 8px` | `0 0.125rem 0.5rem` |

### 4.2 color-function-notation + alpha-value-notation (auto-fix)

| Line | Before                     | After                    |
| ---- | -------------------------- | ------------------------ |
| 23   | `rgba(0, 0, 0, 0.15)`      | `rgb(0 0 0 / 15%)`       |
| 72   | `rgba(0, 0, 0, 0.05)`      | `rgb(0 0 0 / 5%)`        |
| 146  | `rgba(255, 255, 255, 0.3)` | `rgb(255 255 255 / 30%)` |
| 160  | `rgba(0, 0, 0, 0.15)`      | `rgb(0 0 0 / 15%)`       |

---

## 5. front/shared/fs-tile.css

No changes. File already uses `rem`; only "unknown rule" errors (fixed via config).

---

## 6. DoD

- [x] pnpm lint = 0
- [ ] pnpm format:check = 0 _(pre-existing in docs/archive/infra; changed CSS files pass)_
- [x] No ignore/suppress
- [x] No UI behavior change (equivalent rem/color replacements)
