# Gap Report: Chicago95 UI Contract

**Version:** 1.0  
**Created:** 2026-01-22  
**Purpose:** Gap analysis between current implementation and Chicago95 UI Contract  
**Status:** Design Phase (FP7)  
**Source:** Current codebase analysis vs CHICAGO95_UI_CONTRACT.md

## Overview

This report identifies gaps between the current UI implementation and the Chicago95 UI Contract. Each gap is categorized by component/screen, with current issues, contract requirements, proposed fixes, owner (agent), and priority (P0–P2).

## Priority Levels

- **P0 (Critical):** Blocks Chicago95-like experience, must be fixed before release
- **P1 (High):** Important for authentic Windows 95 feel, should be fixed soon
- **P2 (Medium):** Nice to have, can be deferred if needed

## Gap Analysis Table

| Component/Screen | Current Issue | Required by Contract | Proposed Fix | Owner (Agent) | Priority |
|-----------------|---------------|---------------------|--------------|---------------|----------|
| **Desktop** | | | | | |
| Desktop Background | Wallpaper uses teal (#008080) but may not have dithered pattern | Contract §1.1: `teal` (#008080) with classic dithered pattern | Add `repeating-linear-gradient` for dithered pattern in `.desktop-background` | @Engineer | P1 |
| Desktop Icons | Icons use 48x48px but may not have proper pressed state | Contract §3.3: Pressed state with inset bevel + `translate(1px, 1px)` | Add `:active` state to `.desktop-icon-box` with inset bevel and transform | @Engineer | P0 |
| Desktop Icons | Single-click opens window (should be double-click) | Contract §5.4: Single-click = selection, double-click = open | Implement click timeout (300ms) to distinguish single vs double click | @Engineer | P0 |
| Desktop Icons | Selection state may not match contract (blue background) | Contract §1.3: Focused selection = blue (#000080) background, white text | Add `.desktop-icon-selected` class with blue background and white text | @Engineer | P1 |
| **Taskbar/Tray** | | | | | |
| Taskbar Height | Taskbar uses `taskbar.height` (40px) but may not be enforced | Contract §2.7: Taskbar height = 40px (2.5rem) | Ensure `.win-taskbar-fixed` uses `height: 2.5rem` | @Engineer | P0 |
| Taskbar Border | Taskbar may not have proper top/bottom borders | Contract §2.7: Border top `2px solid white`, border bottom `2px solid grayDark` | Add borders to `.win-taskbar-fixed` | @Engineer | P1 |
| Taskbar Pressed | Taskbar buttons (window list) may not have pressed state | Contract §5.3: Pressed state with inset bevel + `translate(1px, 1px)` | Add pressed state to taskbar buttons | @Engineer | P1 |
| Tray Icons | Tray icons (User Icon, Clock) may not have proper sizing | Contract §2.7: Tray icon size = 24x24px (1.5rem) | Ensure `.tray-icon` uses `width: 1.5rem; height: 1.5rem` | @Engineer | P1 |
| **WindowFrame** | | | | | |
| Titlebar Active | Titlebar may not show blue gradient for active window | Contract §1.4: Active = blue gradient (`#000080` → `#1084d0`), white text | Ensure `.win-titlebar` uses gradient for active window | @Engineer | P0 |
| Titlebar Inactive | Titlebar may not show gray for inactive window | Contract §1.4: Inactive = gray (`#c0c0c0`), black text | Add `.win-titlebar-inactive` class with gray background | @Engineer | P0 |
| Titlebar Height | Titlebar may not be exactly 20px | Contract §2.1: Titlebar height = 20px (1.25rem) | Ensure `.win-titlebar` uses `height: 1.25rem` | @Engineer | P0 |
| Titlebar Font | Titlebar may not use bold, 12px, letter-spacing 0.5px | Contract §2.1: Font = bold, 12px (0.75rem), letter-spacing 0.5px (0.0313rem) | Ensure `.win-titlebar` uses correct typography | @Engineer | P0 |
| Window Controls | Control buttons may not be 18x18px | Contract §2.3: Control button size = 18x18px (1.125rem) | Ensure `.win-window-controls .control-button` uses `width: 1.125rem; height: 1.125rem` | @Engineer | P0 |
| Window Controls | Control buttons may not have proper pressed state | Contract §3.3: Pressed = inset bevel + `translate(1px, 1px)` | Ensure `.win-window-controls .control-button:active` uses pressed state | @Engineer | P0 |
| Window Controls Gap | Control buttons may not have 2px gap | Contract §2.3: Gap = 2px (0.125rem) between buttons | Ensure `.win-window-controls` uses `gap: 0.125rem` | @Engineer | P1 |
| Window Border | Window may not have proper 3D bevel | Contract §1.2: Window frame = outer black + inner 3D bevel | Ensure `.win-window-base` uses `@include window-frame` mixin | @Engineer | P0 |
| Window Z-Index | Window z-index may not match contract (active=20, inactive=10) | Contract §5.2: Active = z-index 20, inactive = z-index 10 | Ensure WindowRegistry sets correct z-index based on focus | @Engineer | P0 |
| Window Shadow | Window may not have shadow when focused | Contract §3.1: Optional shadow `4px 4px 10px rgba(0,0,0,0.5)` for focused windows | Add shadow to active windows (optional) | @Engineer | P2 |
| **Explorer (Tree/Grid)** | | | | | |
| Tree View Bevel | Tree view may not have inset bevel | Contract §1.2: Tree view = inset bevel (sunken panel) | Ensure `.explorer-tree` uses `@include bevel-inset` | @Engineer | P0 |
| Tree View Width | Tree view may not be 200px default | Contract §2.6: Tree view width = 200px (12.5rem) default | Ensure `.explorer-tree` uses `width: 12.5rem` | @Engineer | P1 |
| Tree Item Selection | Tree item selection may not match contract (blue background) | Contract §1.3: Focused selection = blue (#000080) background, white text | Ensure `.tree-item.selected` uses blue background and white text | @Engineer | P0 |
| Grid View Bevel | Grid view may not have inset bevel | Contract §1.2: Grid view = inset bevel (sunken panel) | Ensure `.explorer-grid-view` uses `@include bevel-inset` | @Engineer | P0 |
| Grid Item Selection | Grid item selection may not match contract (blue background) | Contract §1.3: Focused selection = blue (#000080) background, white text | Ensure `.explorer-grid-item.selected` uses blue background and white text | @Engineer | P0 |
| Grid Item Size | Grid items may not be 64px width | Contract §2.6: Grid item width = 64px (4rem) | Ensure `.explorer-grid-item` uses `width: 4rem` | @Engineer | P1 |
| Grid Item Icon | Grid item icons may not be 32px | Contract §2.6: Grid item icon size = 32px (2rem) | Ensure `.explorer-icon` uses `font-size: 2rem` or `width: 2rem; height: 2rem` | @Engineer | P1 |
| Grid Single/Double Click | Grid may not distinguish single vs double click | Contract §5.4: Single-click = selection, double-click = open | Implement click timeout (300ms) to distinguish single vs double click | @Engineer | P0 |
| Divider Width | Divider may not be 4px | Contract §2.6: Divider width = 4px (0.25rem) | Ensure `.explorer-divider` uses `width: 0.25rem` | @Engineer | P1 |
| **Notepad** | | | | | |
| Notepad Window | Notepad may not use Windows 95 frame | Contract §1.2: Window frame = 3D bevel | Ensure Notepad uses `.win-window-base` with window frame | @Engineer | P0 |
| Notepad Textarea | Textarea may not have inset bevel | Contract §1.2: Input fields = inset bevel | Ensure Notepad textarea uses `@include bevel-inset` or `@include input-text` | @Engineer | P0 |
| Notepad Font | Textarea may not use monospace font | Contract §6.1: Monospace = `"Courier New", monospace` | Ensure Notepad textarea uses `font-family: "Courier New", monospace` | @Engineer | P1 |
| Notepad Font Size | Textarea may not use 11px font | Contract §6.2: Normal = 11px (0.688rem) | Ensure Notepad textarea uses `font-size: 0.688rem` | @Engineer | P1 |
| **Internet Explorer** | | | | | |
| IE Window | IE may not use Windows 95 frame | Contract §1.2: Window frame = 3D bevel | Ensure IE uses `.win-window-base` with window frame | @Engineer | P0 |
| IE Iframe | Iframe may not have proper styling | Contract §1.2: Content area = white background | Ensure IE iframe container has white background | @Engineer | P1 |
| **Media Player (VideoViewer)** | | | | | |
| VideoViewer Window | VideoViewer may not use Windows 95 frame | Contract §1.2: Window frame = 3D bevel | Ensure VideoViewer uses `.win-window-base` with window frame | @Engineer | P0 |
| VideoViewer Container | Video container may not have proper styling | Contract §1.2: Content area = appropriate background | Ensure VideoViewer container has appropriate background | @Engineer | P1 |
| **Buttons** | | | | | |
| Button Default | Buttons may not have proper outset bevel | Contract §1.2: Buttons = outset bevel (raised panel) | Ensure buttons use `@include bevel-outset` or `@include button-default` | @Engineer | P0 |
| Button Pressed | Buttons may not have proper pressed state | Contract §3.3: Pressed = inset bevel + `translate(1px, 1px)` | Ensure buttons use `@include button-active` for `:active` state | @Engineer | P0 |
| Button Disabled | Buttons may not have proper disabled state | Contract §3.3: Disabled = gray text + text-shadow | Ensure buttons use `@include button-disabled` for `:disabled` state | @Engineer | P1 |
| **Input Fields** | | | | | |
| Input Default | Input fields may not have proper inset bevel | Contract §1.2: Input fields = inset bevel (sunken panel) | Ensure inputs use `@include bevel-inset` or `@include input-text` | @Engineer | P0 |
| Input Focus | Input fields may show visual focus indicator | Contract §3.4: Focused = same as default (no visual change) | Remove visual focus indicators (outline, border change) | @Engineer | P1 |
| **Scrollbar** | | | | | |
| Scrollbar Width | Scrollbar may not be 16px | Contract §2.8: Scrollbar width = 16px (1rem) | Ensure scrollbar uses `width: 1rem` | @Engineer | P1 |
| Scrollbar Thumb | Scrollbar thumb may not have proper bevel | Contract §2.8: Scrollbar thumb = outset bevel | Ensure scrollbar thumb uses outset bevel | @Engineer | P1 |
| Scrollbar Button | Scrollbar buttons may not have proper bevel | Contract §2.8: Scrollbar button = outset bevel | Ensure scrollbar buttons use outset bevel | @Engineer | P1 |
| Scrollbar Pressed | Scrollbar buttons may not have pressed state | Contract §3.5: Active = inset bevel + `translate(1px, 1px)` | Ensure scrollbar buttons use pressed state | @Engineer | P2 |
| **Typography** | | | | | |
| Font Smoothing | Font smoothing may be enabled | Contract §4.8: Font smoothing disabled | Ensure `-webkit-font-smoothing: none` and `font-smooth: never` | @Engineer | P0 |
| Font Stack | Font stack may not match contract | Contract §6.1: `"MS Sans Serif", "Tahoma", sans-serif` | Ensure font-family matches contract | @Engineer | P0 |
| Font Sizes | Font sizes may not match contract | Contract §6.2: Small=10px, Normal=11px, Medium=12px, Large=14px | Ensure all font sizes use rem values from contract | @Engineer | P0 |
| **No-Web Rules** | | | | | |
| Rounded Corners | Components may have rounded corners | Contract §4.1: No rounded corners | Remove all `border-radius` (set to `0` explicitly) | @Engineer | P0 |
| Modern Shadows | Components may use blur shadows | Contract §4.2: Only simple 1px shadows | Replace blur shadows with simple 1px shadows | @Engineer | P0 |
| Easing/Animations | Components may have smooth transitions | Contract §4.3: No transitions or < 100ms linear | Remove or shorten transitions to < 100ms linear | @Engineer | P0 |
| Overscroll | Scrollable areas may have overscroll | Contract §4.4: No overscroll | Add `overscroll-behavior: none` to scrollable areas | @Engineer | P1 |
| Blur Effects | Components may use blur filters | Contract §4.5: No blur effects | Remove all `filter: blur()` and `backdrop-filter: blur()` | @Engineer | P0 |
| Glassmorphism | Components may use glassmorphism | Contract §4.6: No glassmorphism | Remove transparent backgrounds with blur | @Engineer | P0 |
| Modern Gradients | Components may use complex gradients | Contract §4.7: Only title bar gradient | Remove all gradients except title bar | @Engineer | P0 |
| Modern Typography | Components may use modern web fonts | Contract §4.8: Only system fonts | Remove custom web fonts, use system fonts only | @Engineer | P0 |
| **OS Illusion Rules** | | | | | |
| Focus Model | Window focus may not change title bar color | Contract §5.1: Active = blue gradient, inactive = gray | Ensure WindowRegistry updates title bar on focus change | @Engineer | P0 |
| Z-Order | Window z-index may not match contract | Contract §5.2: Active = 20, inactive = 10 | Ensure WindowRegistry sets correct z-index | @Engineer | P0 |
| Taskbar Pressed | Taskbar buttons may not have pressed state | Contract §5.3: Pressed = inset bevel + `translate(1px, 1px)` | Add pressed state to taskbar buttons | @Engineer | P1 |
| Single/Double Click | Desktop/Explorer may not distinguish single vs double click | Contract §5.4: Single = selection, double = open | Implement click timeout (300ms) | @Engineer | P0 |
| Window Drag | Window drag may not be restricted to title bar | Contract §5.5: Drag only from title bar | Ensure drag only works on title bar | @Engineer | P0 |
| Window Drag Boundary | Window may be draggable outside viewport | Contract §5.5: Window cannot be dragged outside viewport | Ensure viewport boundary enforcement | @Engineer | P0 |
| Window Resize | Window resize may not be restricted | Contract §5.6: Window cannot be resized outside viewport | Ensure resize boundary enforcement (if resize implemented) | @Engineer | P2 |

## Priority Summary

### P0 (Critical) - 35 gaps
- Focus model (active/inactive windows)
- Pressed states (all buttons, icons, controls)
- Single vs double click
- Window frame and borders
- Titlebar colors and typography
- Selection colors
- Input field bevels
- No-Web rules (rounded corners, shadows, animations, blur, glassmorphism, gradients, typography)
- OS illusion rules (focus model, z-order, drag, boundaries)

### P1 (High) - 20 gaps
- Taskbar borders and pressed states
- Explorer tree/grid sizing
- Notepad font
- Scrollbar styling
- Overscroll behavior
- Various sizing and spacing issues

### P2 (Medium) - 3 gaps
- Window shadow (optional)
- Scrollbar pressed state
- Window resize (if implemented)

## Next Steps

1. **Review gaps with @Engineer:** Prioritize P0 gaps for immediate fix
2. **Create implementation plan:** Break down P0 gaps into tasks
3. **Update components:** Fix gaps component by component
4. **Test against contract:** Verify all gaps are closed
5. **Update documentation:** Document fixes in component files

## References

- **CHICAGO95_UI_CONTRACT.md:** Complete UI contract
- **WIN95_SPEC.md:** Windows 95 UI specification
- **WIN95_TOKENS_RULES.md:** Token rules and anti-patterns
- **FP7.md:** Feature Pack 7 contract

## Version History

- **v1.0 (2026-01-22):** Initial gap report based on codebase analysis
