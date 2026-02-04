# Explorer UI Contract

**Version:** 1.0  
**Created:** 2026-02-05  
**Purpose:** Win95/98 Explorer window fidelity contract for FP7  
**Status:** Active  
**Source:** [WIN95_SPEC.md](./WIN95_SPEC.md), visual references, 98.css patterns

> **LINK:** This contract extends WIN95_SPEC.md. See [WIN95_SPEC.md#Explorer](./WIN95_SPEC.md#explorer) for base Explorer metrics.

## Overview

This contract defines the exact metrics, states, and interaction rules for the Explorer window to achieve Win95/98 visual and behavioral fidelity. All values use `rem` (base 16). No `px`, no `!important`.

## 1. Tokens

### 1.1 Heights (rem)

| Token | Value | Usage |
|-------|-------|-------|
| `--explorer-menubar-height` | 1.25rem | Menu bar row height |
| `--explorer-toolbar-height` | 1.5rem | Toolbar row height |
| `--explorer-addressbar-height` | 1.5rem | Address bar row height |
| `--explorer-statusbar-height` | 1.25rem | Status bar height |

### 1.2 Paddings and Gaps (rem)

| Token | Value | Usage |
|-------|-------|-------|
| `--explorer-menubar-padding` | 0 0.25rem | Menu bar horizontal padding |
| `--explorer-menu-item-padding` | 0.25rem 0.5rem | Menu item padding |
| `--explorer-toolbar-padding` | 0.125rem 0.25rem | Toolbar padding |
| `--explorer-toolbar-gap` | 0.125rem | Gap between toolbar buttons |
| `--explorer-addressbar-padding` | 0.125rem 0.25rem | Address bar padding |
| `--explorer-addressbar-gap` | 0.25rem | Gap between icon cell and input |
| `--explorer-statusbar-padding` | 0.125rem 0.25rem | Status bar padding |

### 1.3 Icon Sizes (rem)

| Token | Value | Usage |
|-------|-------|-------|
| `--explorer-tree-icon-size` | 1rem | Tree row icon (folder/disk) |
| `--explorer-grid-icon-size` | 2rem | Content grid icon |
| `--explorer-toolbar-btn-size` | 1.5rem | Toolbar icon button (square) |

### 1.4 Content Grid (rem)

| Token | Value | Usage |
|-------|-------|-------|
| `--explorer-grid-cell-width` | 4rem | Fixed cell width (no 1fr) |
| `--explorer-grid-cell-height` | 4.5rem | Fixed cell height |
| `--explorer-grid-gap` | 0.5rem | Gap between cells (reduced from desktop) |

### 1.5 Tree (rem)

| Token | Value | Usage |
|-------|-------|-------|
| `--explorer-tree-row-height` | 1.25rem | Tree row height |
| `--explorer-tree-indent-step` | 1rem | Indent per level |
| `--explorer-tree-toggle-size` | 0.5rem | Expand/collapse triangle |

## 2. Menubar Rules

- **Height:** `--explorer-menubar-height` (1.25rem)
- **Typography:** 0.688rem (11px), no anti-aliasing
- **Hover:** Blue background (`--win-blue`), white text (`--win-text-inverse`)
- **Pressed:** On click, `bevel-inset` + `translate(0.0625rem, 0.0625rem)` until release
- **Focus:** Alt activates menubar; arrow keys navigate (if implemented). Dotted focus outline on focus-visible
- **Items:** File, Edit, View, Go, Bookmarks, Help (stubs allowed; dropdowns optional)
- **No transitions**

## 3. Toolbar Rules

- **Icon buttons:** Square `--explorer-toolbar-btn-size` (1.5rem). Extend `.win-btn` with `.win-btn--icon`
- **Hover:** Minimal or none (no web-like glow/shadows)
- **Pressed:** `bevel-inset` + `translate(0.0625rem, 0.0625rem)` (same as win-btn :active)
- **Disabled:** `@include win-engraved-text` (gray + 1px white text-shadow)
- **Separators:** Vertical 3D double-line, width ~0.125rem, gap 0.125rem between buttons
- **Spacing:** Buttons very close; `--explorer-toolbar-gap`
- **No transitions**

## 4. Address Bar Rules

- **Structure:** Panel with `bevel-inset` around entire bar
- **Left:** Icon/label cell (e.g. "Address" or folder icon), width ~1rem
- **Center:** Read-only `win-input` with current path; `bevel-inset` on input
- **Right:** Optional small dropdown/go button (optional for Phase 1)
- **Path display:** Root shows "My Computer"; otherwise full path

## 5. Split Pane Rules

- **Tree pane:** Gray background (`--win-gray`), `bevel-inset`, overflow auto, Win scrollbar
- **Content pane:** White background (`--win-white`), `bevel-inset`, overflow auto
- **Divider:** Narrow (0.25rem), gray bg, `cursor: col-resize`, 3D appearance
- **Layout:** `.explorer-main` flex row, `flex: 1`, `min-height: 0` for proper overflow

## 6. Content View Rules (Explorer Icon View)

- **NOT desktop grid:** Different metrics and selection behavior
- **Cell sizing:** Fixed `--explorer-grid-cell-width` x `--explorer-grid-cell-height`; no `1fr`
- **Grid:** `grid-template-columns: repeat(auto-fill, var(--explorer-grid-cell-width))` (fixed, no minmax with 1fr)
- **Gap:** `--explorer-grid-gap` (0.5rem)
- **Selection:** Label-only highlight. Icon background unchanged; only `.explorer-grid-item-label` (or filename) gets blue bg + white text when selected
- **Single-click:** Selects item (adds selected class)
- **Double-click:** Opens (folder navigates, file opens in viewer)
- **Icon size:** `--explorer-grid-icon-size` (2rem)

## 7. Tree View Rules

- **Row height:** `--explorer-tree-row-height` (1.25rem)
- **Indent:** `--explorer-tree-indent-step` (1rem) per level. Use class-based indent (e.g. `.tree-item[data-level="0"]`, `.tree-item[data-level="1"]`) — no inline styles
- **Toggle:** Triangle expand/collapse, size `--explorer-tree-toggle-size`
- **Icon:** 1rem x 1rem for folder/disk, left of text
- **Selection:** Full-row (blue bg + white text)
- **Hover:** Blue bg + white text (same as selection)

## 8. Interaction Rules

- **No transitions** for Win95 Explorer components
- **Focus outline:** Dotted inner ring (`win-dotted-focus` mixin) on focus-visible
- **Keyboard:** Basic support if already present; not required for Phase 1

## 9. Units Policy

- **All units:** `rem` (base 16). No `px`, no `pt`, no absolute units
- **No !important**
- **Tokens:** Define in theme files; reference via `var(--token-name)`

## 10. Test Selector Policy

- **Never** use `getByText` on ambiguous labels (e.g. "desktop" appears in both tree and grid)
- **Always** scope: `within(screen.getByTestId('explorer-tree'))` or `within(screen.getByTestId('explorer-grid'))`
- **Stable testids:** `explorer-menubar`, `explorer-toolbar`, `explorer-address`, `explorer-up-button`, `explorer-tree`, `explorer-grid`, `explorer-status`

## 11. Visual Gate Policy

- **Baseline:** Playwright screenshot of Explorer in StyleGuideApp
- **Update:** Baselines updated only intentionally via `--update-snapshots`
- **Location:** `__tests__/visual/__screenshots__/` or project convention

## References

- [WIN95_SPEC.md](./WIN95_SPEC.md) — Base metrics and colors
- [GUIDE_STYLE.md](./GUIDE_STYLE.md) — Inline style and unit policies
- [98.css](https://jdan.github.io/98.css/) — Micro-component behavior inspiration
