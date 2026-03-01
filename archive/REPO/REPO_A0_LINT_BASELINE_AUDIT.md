# REPO A0 — Lint Baseline Audit (Stylelint)

**Date:** 2026-03-01  
**Scope:** Stylelint errors in `front/index.css`, `front/shared/fs-tile.css`  
**Mode:** A0 (audit only, no fixes)

---

## 0. Commands Table

| #   | Command                                         | Exit | Notes               |
| --- | ----------------------------------------------- | ---- | ------------------- |
| 1   | `git restore .stylelintrc.json front/index.css` | 0    | Restore clean state |
| 2   | `pnpm lint`                                     | 2    | 27 stylelint errors |

---

## 1. Context

- `pnpm lint` **fails** (exit 2) with **27 stylelint errors** in `front/index.css` and `front/shared/fs-tile.css`.
- `.stylelintignore` does not exclude these files (only `infra/minio/fixtures/**`).
- This audit captures the full list for A1/A2 patch planning.

---

## 2. How to Reproduce

```bash
pnpm exec stylelint "front/index.css" "front/shared/fs-tile.css" --ignore-path /dev/null --formatter verbose
```

---

## 3. Files with Errors

| File                       | Error count |
| -------------------------- | ----------- |
| `front/index.css`          | 24          |
| `front/shared/fs-tile.css` | 3           |

---

## 4. Grouped Rule Violations

### 4.1 Config-level (Unknown rules)

**Rule IDs:** `color-hex-case`, `indentation`, `string-quotes`  
**Cause:** Stylelint 16 removed these stylistic rules from core; they were deprecated in 15.0.0 and moved to `stylelint-stylistic`.  
**Location:** Reported at `1:1` in both files (config-level, not file-specific).  
**Count:** 2 per file × 2 files = **4** (but effectively 3 distinct rules).

| Rule ID        | File                     | Line | Notes        |
| -------------- | ------------------------ | ---- | ------------ |
| color-hex-case | front/index.css          | 1:1  | Unknown rule |
| indentation    | front/index.css          | 1:1  | Unknown rule |
| string-quotes  | front/index.css          | 1:1  | Unknown rule |
| color-hex-case | front/shared/fs-tile.css | 1:1  | Unknown rule |
| indentation    | front/shared/fs-tile.css | 1:1  | Unknown rule |
| string-quotes  | front/shared/fs-tile.css | 1:1  | Unknown rule |

**Fix:** Add `stylelint-stylistic` plugin and migrate config, or remove these rules from `.stylelintrc.json`. Config change required before file-level fixes.

---

### 4.2 Disallowed units (`unit-disallowed-list`)

**Rule:** `unit-disallowed-list: ["px","pt","pc","in","cm","mm","q","Q"]`  
**Violation:** Use of `px` (13 occurrences in `front/index.css` only).

| File            | Line | Column | Value          |
| --------------- | ---- | ------ | -------------- |
| front/index.css | 3    | 32     | `28px`         |
| front/index.css | 4    | 28     | `2px`          |
| front/index.css | 5    | 31     | `32px`         |
| front/index.css | 6    | 21     | `4px`          |
| front/index.css | 7    | 21     | `8px`          |
| front/index.css | 8    | 25     | `4px`          |
| front/index.css | 9    | 25     | `8px`          |
| front/index.css | 10   | 26     | `12px`         |
| front/index.css | 23   | 19     | `2px`          |
| front/index.css | 23   | 23     | `8px`          |
| front/index.css | 133  | 12     | `1px` (border) |
| front/index.css | 160  | 35     | `2px`          |
| front/index.css | 160  | 39     | `8px`          |

**Auto-fix:** No. Requires manual conversion `px` → `rem` (or other allowed units) with design decisions.

---

### 4.3 Color function notation (`color-function-notation`)

**Violation:** `rgba()` → expected modern `color()` notation.

| File            | Line | Snippet                    |
| --------------- | ---- | -------------------------- |
| front/index.css | 23   | `rgba(0, 0, 0, 0.15)`      |
| front/index.css | 72   | `rgba(0, 0, 0, 0.05)`      |
| front/index.css | 146  | `rgba(255, 255, 255, 0.3)` |
| front/index.css | 160  | `rgba(0, 0, 0, 0.15)`      |

**Auto-fix:** Yes (`--fix`).

---

### 4.4 Alpha value notation (`alpha-value-notation`)

**Violation:** `0.15` → expected `15%`, etc.

| File            | Line | Current | Expected |
| --------------- | ---- | ------- | -------- |
| front/index.css | 23   | `0.15`  | `15%`    |
| front/index.css | 72   | `0.05`  | `5%`     |
| front/index.css | 146  | `0.3`   | `30%`    |
| front/index.css | 160  | `0.15`  | `15%`    |

**Auto-fix:** Yes (`--fix`).

---

### 4.5 Casing (`color-hex-case`)

**Status:** Rule unknown in current config. After adding `stylelint-stylistic`, would check hex case (lower/upper).  
**Current:** Files use lowercase hex (`#f0f0f0`, `#333`, `#ccc`, `#0078d4`, `#fff`). Likely no violations if rule is `"lower"`.

---

### 4.6 Formatting (indentation, string-quotes)

**Status:** Rules unknown in current config. After adding `stylelint-stylistic`, would check indentation (2 spaces) and double quotes.  
**Current:** Files appear to follow 2-space indentation and double quotes; manual verification needed after config fix.

---

## 5. Auto-fix vs Manual

| Group            | Rule(s)                                    | Auto-fix | Notes               |
| ---------------- | ------------------------------------------ | -------- | ------------------- |
| Config           | color-hex-case, indentation, string-quotes | N/A      | Config change first |
| Disallowed units | unit-disallowed-list                       | No       | Manual px→rem       |
| Color notation   | color-function-notation                    | Yes      | 4 fixes             |
| Alpha notation   | alpha-value-notation                       | Yes      | 4 fixes             |

**Verified:** `stylelint --fix` fixes 8 problems (4× color-function-notation, 4× alpha-value-notation). Remaining 19 after fix: config unknowns (6) + unit-disallowed-list (13).

---

## 6. Minimal Patch Plan

| Milestone | Scope             | Tasks                                                                                                                        |
| --------- | ----------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **A1**    | Config + auto-fix | 1) Add `stylelint-stylistic` and migrate rules, or remove unknown rules from config. 2) Run `stylelint --fix` on both files. |
| **A2**    | Manual fixes      | 3) Replace `px` with `rem` (or allowed units) in `front/index.css` per design tokens.                                        |

---

## 7. DoD Checklist

- [x] Full list of lint blockers collected
- [x] No fixes applied (audit only)
- [x] Grouped by rule type
- [x] Auto-fix vs manual identified
- [x] Minimal patch plan (A1/A2) defined

---

## 8. Raw Evidence (Full Violation List)

```
front/index.css
    1:1   ✖  Unknown rule color-hex-case
    1:1   ✖  Unknown rule indentation
    1:1   ✖  Unknown rule string-quotes
    3:32  ✖  Unexpected unit "px"                    unit-disallowed-list
    4:28  ✖  Unexpected unit "px"                    unit-disallowed-list
    5:31  ✖  Unexpected unit "px"                    unit-disallowed-list
    6:21  ✖  Unexpected unit "px"                    unit-disallowed-list
    7:21  ✖  Unexpected unit "px"                    unit-disallowed-list
    8:25  ✖  Unexpected unit "px"                    unit-disallowed-list
    9:25  ✖  Unexpected unit "px"                    unit-disallowed-list
   10:26  ✖  Unexpected unit "px"                    unit-disallowed-list
   23:19  ✖  Unexpected unit "px"                    unit-disallowed-list
   23:23  ✖  Unexpected unit "px"                    unit-disallowed-list
   23:26  ✖  Expected modern color-function notation  color-function-notation
   23:40  ✖  Expected "0.15" to be "15%"             alpha-value-notation
   72:15  ✖  Expected modern color-function notation  color-function-notation
   72:29  ✖  Expected "0.05" to be "5%"              alpha-value-notation
  133:12  ✖  Unexpected unit "px"                    unit-disallowed-list
  146:15  ✖  Expected modern color-function notation  color-function-notation
  146:35  ✖  Expected "0.3" to be "30%"             alpha-value-notation
  160:35  ✖  Unexpected unit "px"                    unit-disallowed-list
  160:39  ✖  Unexpected unit "px"                    unit-disallowed-list
  160:42  ✖  Expected modern color-function notation  color-function-notation
  160:56  ✖  Expected "0.15" to be "15%"             alpha-value-notation

front/shared/fs-tile.css
  1:1  ✖  Unknown rule color-hex-case
  1:1  ✖  Unknown rule indentation
  1:1  ✖  Unknown rule string-quotes

27 errors total
```
