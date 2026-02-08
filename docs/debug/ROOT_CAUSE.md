# FP7 Hotfix Wave: Root Cause Analysis

**Date:** 2026-02-09  
**Agent:** A (Investigation Lead)  
**Scope:** Double-click regression + Context menu not showing

---

## 0.1 Repro Checklist — Evidence

### Tests
```bash
cd front && npm test __tests__/fp7/*explorer* __tests__/fp7/*desktop* __tests__/fp7/*context*
```
**Result:** 41 passed, 1 skipped (explorer.tree-grid-navigation.test.tsx double-click test passes)

### Lint
```bash
cd front && npm run lint
```
**Result:** Pass (0 errors, 29 warnings)

### Manual repro (expected)
- Double-click folder in Explorer grid → should navigate/open
- Double-click desktop icon → should open relevant window
- Right-click Desktop surface → menu should appear
- Right-click Explorer grid container → menu should appear

---

## 0.2 Double-Click Regression — Root Cause

### Category: **DC-B (handler missing)** + **DC-C (wrong action)** for Desktop

| Layer | Finding |
|-------|---------|
| **Explorer** | `onDoubleClick` present on grid items (L248), `handleOpen` correct. Tests pass. Code appears correct. |
| **Desktop** | `DesktopIcon` has **only** `onClick` → `handleIconClick`. No `onDoubleClick`. Single-click opens instead of double-click. |
| **FP7 contract** | docs/fps/FP7.md L49: "Desktop Icons и Explorer Grid используют double-click для открытия, single-click для selection" |

**Root cause DC-B (Desktop):** `onDoubleClick` handler missing on DesktopIcon; only `onClick` wired.  
**Root cause DC-C (Desktop):** `onClick` currently opens on single-click; should only select. Open must be on double-click.

### Files to touch
- `front/src/components/DesktopIcon.tsx` — add `onDoubleClick` prop, keep `onContextMenu`
- `front/src/pages/DesktopPage.tsx` — single-click → select (optional visual feedback); double-click → open via `handleIconClick`

---

## 0.3 Context Menu Not Showing — Root Cause

### Category: **CM-C (invisible)**

| Check | Finding |
|------|---------|
| **Handlers** | `onContextMenu` attached to desktop-root (L203), explorer-grid (L234). `preventDefault()` called. ✅ |
| **Provider** | `ContextMenuProvider` wraps ShellRoot in main.tsx. ✅ |
| **Portal** | `createPortal(menuContent, document.body)` — menu renders to body. ✅ |
| **CSS** | **CRITICAL:** Classes `win95-context-overlay`, `win95-context-menu-wrapper`, `win95-context-menu`, `win95-context-menu-item`, etc. are **not defined** in any SCSS file. Menu DOM exists (tests pass) but elements have no visible styling (no position, background, z-index). |
| **Positioning** | `--cm-x`, `--cm-y` set via `setProperty` with `px` (violates NO px rule). CSS rule that consumes these vars is also missing. |

**Root cause CM-C:** Context menu CSS classes are missing from `front/src/styles/_components.scss`. Menu renders in DOM but is invisible.

**Secondary:** ContextMenu.tsx uses `px` in setProperty (user requires `rem`). Need rem conversion: `xRem = clientX / rootFontSize`, set `--cm-x` as `${xRem}rem`.

### Files to touch
- `front/src/styles/_components.scss` — add `.win95-context-overlay`, `.win95-context-menu-wrapper`, `.win95-context-menu`, `.win95-context-menu-item`, `.win95-context-menu-separator` with positioning via `var(--cm-x)`, `var(--cm-y)` in rem
- `front/src/os/ui/ContextMenu/ContextMenu.tsx` — convert px to rem for `--cm-x`/`--cm-y` (read root font-size, compute rem values)

---

## 0.4 Minimal Fix Plan

| # | File | Change |
|---|------|--------|
| 1 | `DesktopIcon.tsx` | Add `onDoubleClick?: () => void` prop; wire it; keep onClick for selection-only (or remove if selection not needed) |
| 2 | `DesktopPage.tsx` | `onClick` → select (optional, may be no-op); `onDoubleClick` → `handleIconClick` |
| 3 | `_components.scss` | Add Win95 context menu block: overlay (position:fixed, inset:0, pointer-events:none), wrapper (position:fixed, left:var(--cm-x), top:var(--cm-y), z-index above taskbar), menu list, items, separator |
| 4 | `ContextMenu.tsx` | Read `document.documentElement.style.fontSize` or `getComputedStyle(document.documentElement).fontSize`; convert clientX/clientY to rem; `setProperty('--cm-x', xRem + 'rem')` |

### Verification
- `npm run lint` — pass
- `npm test __tests__/fp7/*` — pass
- Manual: double-click Desktop icon → opens; double-click Explorer folder → navigates; right-click Desktop → menu visible; right-click Explorer grid → menu visible

---

## Summary

| Issue | Root Cause | Category |
|-------|------------|----------|
| Double-click Desktop | onClick opens; onDoubleClick missing | DC-B, DC-C |
| Double-click Explorer | Code correct; tests pass | N/A (or DC-D if runtime fails) |
| Context menu not showing | CSS classes missing; menu invisible | CM-C |
| Context menu px | setProperty uses px | Style violation |
