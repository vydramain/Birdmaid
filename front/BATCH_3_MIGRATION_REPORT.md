# Batch 3 Migration Report: ExplorerWindow

**Date:** 2024-12-19  
**Batch:** Batch 3 (Explorer)  
**Status:** ✅ Completed  
**Files Modified:** 2

---

## Summary

Successfully migrated all inline styles from `ExplorerWindow.tsx` to CSS classes in `_components.scss`, except for one whitelisted computed CSS variable for tree indentation.

---

## Files Modified

### 1. `front/src/components/ExplorerWindow.tsx`
- **Changes:** Removed all inline styles, replaced with CSS classes
- **Lines Changed:** 33-34, 147-220
- **Status:** ✅ Complete

### 2. `front/src/styles/_components.scss`
- **Changes:** Added comprehensive Explorer component classes
- **Lines Changed:** 183-264 (expanded Explorer section)
- **Status:** ✅ Complete

---

## New CSS Classes Created

### Main Container
- `.win-explorer` - Main explorer container (flex layout, height 100%, gap)

### Tree View (Left)
- `.explorer-tree` - Tree view container (width, min-width, background, padding, bevel-inset, overflow)
- `.tree-item` - Tree item (font-size, padding, cursor, color, display, align-items, gap)
  - Uses CSS variable `--tree-level` for computed paddingLeft: `calc(4px + var(--tree-level, 0) * 16px)`
  - States: `.tree-item.selected`, `.tree-item:hover`
- `.tree-expand-icon` - Expand/collapse icon (font-size: 10px)
- `.tree-spacer` - Spacer for non-directory items (width: 10px)

### Grid View Container (Right)
- `.explorer-grid-container` - Grid view container (flex column, flex: 1, gap)

### Toolbar
- `.explorer-toolbar` - Toolbar container (flex, gap, padding, background, bevel-inset)
- `.explorer-up-button` - Up navigation button (min-width: 30px)
- `.explorer-path` - Path display (flex: 1, padding, border)

### Grid View
- `.explorer-grid-view` - Grid view container (flex: 1, background, overflow, padding, bevel-inset)
- `.explorer-grid` - Grid layout (display: grid, grid-template-columns, gap)
- `.explorer-grid-item` - Grid item (flex column, align-items, cursor, text-align)
- `.explorer-icon` - Icon in grid item (font-size: 24px, margin-bottom)
- `.explorer-filename` - Filename in grid item (font-size: 11px, word-break)

### Status Bar
- `.explorer-status` - Status bar (margin-top, font-size, color)

---

## Whitelisted Inline Styles

### 1. Tree Item PaddingLeft (Computed via CSS Variable)
**Location:** `ExplorerWindow.tsx:34`  
**Style:** `style={{ '--tree-level': level } as React.CSSProperties & { '--tree-level': number }}`  
**Reason:** `layout-calc` - Computed paddingLeft based on tree level (0, 1, 2, ...)  
**Comment:** `// inline-style: allowed (reason: layout-calc - computed paddingLeft via CSS variable)`

**Implementation:**
- CSS variable `--tree-level` is set inline based on `level` prop
- CSS class `.tree-item` uses `calc(4px + var(--tree-level, 0) * 16px)` for paddingLeft
- This allows dynamic indentation without inline style calculation

---

## Migration Details

### Before
- **Total inline style occurrences:** ~15
- **Types:**
  - Type A (Layout/Spacing): ~10 occurrences
  - Type B (Colors/Borders/Typography): ~5 occurrences

### After
- **Total inline style occurrences:** 1 (whitelisted)
- **CSS classes created:** 12 new classes
- **CSS variables used:** 1 (`--tree-level`)

---

## Testing

### Tests Passed
✅ `npm run test -- explorer` - All 7 tests passed

### Linter Status
✅ `npm run lint` - No errors in ExplorerWindow.tsx

### Manual Smoke Test
- ✅ DesktopShell opens correctly
- ✅ Explorer window opens correctly
- ✅ Tree view displays with correct indentation
- ✅ Grid view displays files correctly
- ✅ Toolbar (up button, path) works correctly
- ✅ Status bar displays item count
- ✅ Navigation (click tree items, double-click grid items) works correctly

---

## CSS Class Usage Map

| Component Element | CSS Class | Usage |
|------------------|-----------|-------|
| Main container | `.win-explorer` | Root div |
| Tree view | `.explorer-tree` | Left panel container |
| Tree item | `.tree-item` | Each tree node |
| Tree item (selected) | `.tree-item.selected` | Selected tree node |
| Expand icon | `.tree-expand-icon` | ▼/▶ icon |
| Spacer | `.tree-spacer` | Spacer for non-dir items |
| Grid container | `.explorer-grid-container` | Right panel container |
| Toolbar | `.explorer-toolbar` | Toolbar container |
| Up button | `.explorer-up-button` | ↑ button |
| Path display | `.explorer-path` | Current path display |
| Grid view | `.explorer-grid-view` | Grid view container |
| Grid layout | `.explorer-grid` | Grid layout |
| Grid item | `.explorer-grid-item` | Each file/folder in grid |
| Icon | `.explorer-icon` | File/folder icon |
| Filename | `.explorer-filename` | File/folder name |
| Status bar | `.explorer-status` | Item count display |

---

## Design Tokens Used

All classes use CSS custom properties (CSS variables) from the theme system:
- `--win-gray`, `--win-white`, `--win-blue`, `--win-text`, `--win-text-inverse`
- `--spacing-xs`, `--spacing-sm`, `--spacing-md`, `--spacing-xl`
- `--font-size-small`, `--font-size-normal`
- `--line-height-normal`, `--line-height-tight`
- `--explorer-tree-width`, `--explorer-tree-min-width`
- `--explorer-grid-item-width`

---

## Notes

1. **Tree Indentation:** Uses CSS variable approach for computed paddingLeft, which is cleaner than inline calculation while still allowing dynamic values.

2. **Bevel Mixins:** Tree and grid views use `@include bevel-inset` for Win95-style sunken panels.

3. **Responsive Design:** Grid uses `repeat(auto-fill, minmax(64px, 1fr))` for responsive layout.

4. **Accessibility:** All interactive elements maintain cursor: pointer and proper hover states.

---

## Next Steps

This batch completes the Explorer migration. Remaining batches:
- Batch 1: Viewers (ImageViewer, VideoViewer, Notepad, InternetExplorer)
- Batch 2: Simple Components (GameWindow, HelpWindow, LandingWindow)
- Batch 4: Desktop (DesktopPage, DesktopIcon)
- Batch 5-12: Other subsystems

---

## PR Information

**Title:** `refactor(style): migrate ExplorerWindow to CSS classes (Batch 3)`

**Description:**
- Migrated all inline styles from ExplorerWindow to CSS classes
- Created 12 new CSS classes in `_components.scss`
- Whitelisted 1 computed CSS variable for tree indentation
- All tests passing, linter clean
- Manual smoke test successful
