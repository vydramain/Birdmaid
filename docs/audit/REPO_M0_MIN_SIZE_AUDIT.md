# REPO M0 — Min Size Single-Source-of-Truth Audit

> **FP:** REPO (repo-wide)  
> **Mode:** build M0 (audit)  
> **Date:** 2026-02-26

---

## 1. Queue-Safety (Baseline Gate)

| Check       | Result | Notes (M3)                       |
| ----------- | ------ | -------------------------------- |
| Smoke       | PASS   | `./infra/smoke.sh` → PLATFORM OK |
| Lint/format | PASS   | `./infra/test-lint.sh` exit 0    |
| Unit        | PASS   | 125 tests                        |
| API FP4     | PASS   | 57 tests                         |
| Gate FP4    | PASS   | `./infra/gate.sh FP4` exit 0     |

---

## 1.1 M1 RED → M2 GREEN → M3 Re-audit

| Test            | File                                             | Status |
| --------------- | ------------------------------------------------ | ------ |
| T-SSOT-COMPUTED | `front/__tests__/fp4/window-min-size.test.ts`    | GREEN  |
| T-SSOT-CSS-VARS | `front/__tests__/fp4/min-size-css-vars.test.tsx` | GREEN  |
| T-SSOT-GREP     | `front/__tests__/min-size-ssot-grep.test.ts`     | GREEN  |

Optional: `node scripts/check-min-size-ssot.cjs` — exit 0.

---

## 2. Evidence — All Places Defining Min Size

### 2.1 TypeScript constants

| File                                              | Symbol               | Value     | Role                         |
| ------------------------------------------------- | -------------------- | --------- | ---------------------------- |
| `front/core/WindowManager.ts`                     | `DEFAULT_MIN_WIDTH`  | 320       | Source for bounds clamping   |
| `front/core/WindowManager.ts`                     | `DEFAULT_MIN_HEIGHT` | 240       | Source for bounds clamping   |
| `front/core/WindowManager.ts`                     | `MIN_WIDTH`          | = DEFAULT | Internal use in updateBounds |
| `front/core/WindowManager.ts`                     | `MIN_HEIGHT`         | = DEFAULT | Internal use in updateBounds |
| `front/Shell.tsx`                                 | `getComputedMinSize` | imported  | Resize handler (scaled min)  |
| `front/__tests__/fp4/window-min-size.test.ts`     | local                | 320, 240  | Test expectations            |
| `front/__tests__/fp4/media-player-hotfix.test.ts` | inline               | 320, 240  | Test expectations            |

(M1: restored 320×240 per FP4.)

### 2.2 CSS (M2: no base vars)

| File              | Token                         | Value | Role                             |
| ----------------- | ----------------------------- | ----- | -------------------------------- |
| `front/index.css` | `.wm-window` min-width/height | vars  | `var(--wm-window-min-*-px)` only |

**M2:** Base vars removed. TS injects `--wm-window-min-width-px`, `--wm-window-min-height-px` on `.wm-window` via inline style.

### 2.3 Documentation (out of sync)

| File                   | Value        | Notes                          |
| ---------------------- | ------------ | ------------------------------ |
| `docs/core/THEMING.md` | 200px, 150px | Token schema — outdated        |
| `docs/fps/FP4.md`      | 320px, 240px | FP4.1 spec — matches index.css |

### 2.4 Hardcoded / magic numbers

| Location                                          | Value    | Context                   |
| ------------------------------------------------- | -------- | ------------------------- |
| `front/__tests__/fp4/window-min-size.test.ts`     | 320, 240 | Local constants, expect() |
| `front/__tests__/fp4/media-player-hotfix.test.ts` | 320, 240 | Inline in expect()        |

---

## 3. M2 SSOT Status

| Source           | Width | Height | Notes                                             |
| ---------------- | ----- | ------ | ------------------------------------------------- |
| WindowManager.ts | 320   | 240    | Single source of truth                            |
| index.css        | —     | —      | No base vars; consumes -px from TS                |
| Tests            | 320   | 240    | Assert against WindowManager / getComputedMinSize |

---

## 3.1 M3 Re-audit — Commands + Proof

### Commands table

| Command                                | Exit |
| -------------------------------------- | ---- |
| `./infra/smoke.sh`                     | 0    |
| `./infra/test-lint.sh`                 | 0    |
| `./infra/test-unit.sh`                 | 0    |
| `./infra/test-api-fp.sh FP4`           | 0    |
| `./infra/gate.sh FP4`                  | 0    |
| `node scripts/check-min-size-ssot.cjs` | 0    |

### Grep proof

**1) CSS no longer defines base min-size constants**

```bash
$ git grep -E "wm-window-min-width-base|wm-window-min-height-base" -- '*.css'
# (empty — no matches in CSS)

$ grep "320\|240" front/index.css
# No matches
```

**2) TS is only source for 320/240**

```bash
$ rg "320|240" front/ -t ts -t tsx -t css
front/core/WindowManager.ts:export const DEFAULT_MIN_WIDTH = 320;
front/core/WindowManager.ts:export const DEFAULT_MIN_HEIGHT = 240;
front/__tests__/fp4/min-size-css-vars.test.tsx:const EXPECTED_MIN_WIDTH_PX = 320;
front/__tests__/fp4/min-size-css-vars.test.tsx:const EXPECTED_MIN_HEIGHT_PX = 240;
front/__tests__/fp4/media-player-hotfix.test.ts:    it("T-FP4-HOTFIX-MIN-SIZE: default min 320×240...
front/__tests__/fp4/media-player-hotfix.test.ts:      expect(updated?.bounds.width).toBe(320);
front/__tests__/fp4/media-player-hotfix.test.ts:      expect(updated?.bounds.height).toBe(240);
front/__tests__/fp4/window-min-size.test.ts: ...
```

Canonical source: `front/core/WindowManager.ts` (DEFAULT_MIN_WIDTH=320, DEFAULT_MIN_HEIGHT=240). Tests assert against these or getComputedMinSize(1.0).

---

## 4. Target Architecture: TS as Source of Truth

**Principle:** One canonical value in TS. CSS consumes via runtime-injected vars.

### 4.1 Flow

```
WindowManager.DEFAULT_MIN_WIDTH/HEIGHT (TS)
    ↓
ThemeScaleProvider (or Shell bootstrap)
    → document.documentElement.style.setProperty("--wm-window-min-width-base", `${DEFAULT_MIN_WIDTH}px`)
    → document.documentElement.style.setProperty("--wm-window-min-height-base", `${DEFAULT_MIN_HEIGHT}px`)
    ↓
index.css: --wm-window-min-width = calc(var(--wm-window-min-width-base) * var(--wm-scale))
    ↓
.wm-window { min-width: var(--wm-window-min-width); min-height: var(--wm-window-min-height); }
```

### 4.2 Benefits

- Single source: `WindowManager.ts` constants
- Tests import from WindowManager (no local copies)
- CSS always matches TS; no drift
- Per-window override remains in TS (`createWindow({ minWidth, minHeight })`)

### 4.3 Fallbacks

- Remove `20rem`/`15rem` from `.wm-window` — vars are always set at bootstrap
- Or keep as last-resort: `var(--wm-window-min-width, 20rem)` if JS fails to load (graceful degradation)

---

## 5. Migration Plan (M1 / M2)

### M1 — Align and document (no architecture change)

1. **Decide canonical values:** 320×240 (FP4 spec) or 640×400 (current uncommitted).
2. **Align all sources:**
   - `WindowManager.ts`: set to chosen values
   - `front/index.css`: set `--wm-window-min-*-base` to same
   - `docs/core/THEMING.md`: update to 320px/240px
   - Tests: import from WindowManager instead of local constants
3. **Verification:** Run grep (see §6).

### M2 — TS as source, CSS consumes

1. **Remove base vars from `index.css`** — do not define `--wm-window-min-width-base` / `-height-base` in CSS.
2. **Inject from TS:** In `ThemeScaleProvider` (or Shell mount), call:
   ```ts
   import { DEFAULT_MIN_WIDTH, DEFAULT_MIN_HEIGHT } from "./core/WindowManager";
   root.style.setProperty("--wm-window-min-width-base", `${DEFAULT_MIN_WIDTH}px`);
   root.style.setProperty("--wm-window-min-height-base", `${DEFAULT_MIN_HEIGHT}px`);
   ```
3. **Keep scaled vars in CSS:** `--wm-window-min-width: calc(var(--wm-window-min-width-base) * var(--wm-scale))` — no change.
4. **Optional:** Add fallbacks in CSS for no-JS: `var(--wm-window-min-width-base, 320px)` if desired.
5. **Tests:** Use `DEFAULT_MIN_WIDTH`/`DEFAULT_MIN_HEIGHT` from WindowManager; remove local copies.

---

## 6. Verification Commands

```bash
# After M1/M2: ensure no stray definitions
git grep -E "wm-window-min-width-base|wm-window-min-height-base|DEFAULT_MIN_WIDTH|DEFAULT_MIN_HEIGHT|320px|240px|20rem|15rem" -- '*.ts' '*.tsx' '*.css' '*.md'

# Also check for raw 320/240 in tests (should use imported constants after M1)
git grep -E "\b320\b|\b240\b" -- 'front/__tests__/**/*.ts'
```

**Expected after M2:**

- `DEFAULT_MIN_WIDTH` / `DEFAULT_MIN_HEIGHT`: only in `WindowManager.ts` (def) + imports (Shell, tests)
- `--wm-window-min-width-base` / `-height-base`: only in ThemeScaleProvider (setProperty) + index.css (calc reference)
- `320px` / `240px`: only in docs or as fallback in CSS, if kept
- `20rem` / `15rem`: only in CSS fallback for `var(..., 20rem)` if kept

---

## 7. Minimal Patch Plan

| Step | File(s)                       | Change                                                                                |
| ---- | ----------------------------- | ------------------------------------------------------------------------------------- |
| M1.1 | `WindowManager.ts`            | Set DEFAULT_MIN_WIDTH=320, DEFAULT_MIN_HEIGHT=240 (or commit 640/400 and update spec) |
| M1.2 | `front/index.css`             | Align --wm-window-min-\*-base with TS                                                 |
| M1.3 | `docs/core/THEMING.md`        | Update to 320px/240px                                                                 |
| M1.4 | `window-min-size.test.ts`     | Import DEFAULT*MIN*\* from WindowManager; remove local constants                      |
| M1.5 | `media-player-hotfix.test.ts` | Import DEFAULT*MIN*\*; use in expect()                                                |
| M2.1 | `front/index.css`             | Remove :root definitions of --wm-window-min-\*-base                                   |
| M2.2 | `ThemeScaleProvider.tsx`      | Add setProperty for --wm-window-min-\*-base from WindowManager                        |
| M2.3 | Verify                        | Run grep + pnpm test                                                                  |

---

## 8. DoD Checklist

- [ ] Clean-state: `git status --porcelain` empty
- [ ] Smoke: `./infra/smoke.sh` → PLATFORM OK
- [ ] Lint: `./infra/test-lint.sh` exit 0
- [ ] Tests: `pnpm test` exit 0 (fix rollup first if needed)
- [ ] Grep: no duplicate definitions per §6
