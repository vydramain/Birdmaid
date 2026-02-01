# Chicago95 UI Contract - Priority List

**Version:** 1.0  
**Created:** 2026-01-22  
**Purpose:** Prioritized list of gaps from GAP_REPORT_CHICAGO95.md  
**Status:** Design Phase (FP7)

## Priority Summary

- **P0 (Critical):** 35 gaps — Blocks Chicago95-like experience
- **P1 (High):** 20 gaps — Important for authentic Windows 95 feel
- **P2 (Medium):** 3 gaps — Nice to have

## P0 (Critical) - Must Fix Before Release

### Focus Model & Window States
1. ✅ Titlebar Active: Blue gradient for active window
2. ✅ Titlebar Inactive: Gray for inactive window
3. ✅ Window Z-Index: Active = 20, inactive = 10
4. ✅ Focus Model: Window focus changes title bar color

### Pressed States
5. ✅ Desktop Icons: Pressed state with inset bevel + translate(1px, 1px)
6. ✅ Window Controls: Pressed state for minimize/maximize/close buttons
7. ✅ Buttons: Pressed state for all buttons
8. ✅ Taskbar Pressed: Pressed state for taskbar buttons (if implemented)

### Single vs Double Click
9. ✅ Desktop Icons: Single-click = selection, double-click = open
10. ✅ Explorer Grid: Single-click = selection, double-click = open

### Window Frame & Borders
11. ✅ Window Border: 3D bevel (outer black + inner bevel)
12. ✅ Titlebar Height: Exactly 20px (1.25rem)
13. ✅ Titlebar Font: Bold, 12px, letter-spacing 0.5px
14. ✅ Window Controls Size: 18x18px (1.125rem)
15. ✅ Window Controls Pressed: Inset bevel + translate(1px, 1px)

### Selection Colors
16. ✅ Tree Item Selection: Blue background (#000080), white text
17. ✅ Grid Item Selection: Blue background (#000080), white text
18. ✅ Desktop Icon Selection: Blue background (#000080), white text (optional)

### Input Fields
19. ✅ Input Default: Inset bevel for all input fields
20. ✅ Notepad Textarea: Inset bevel
21. ✅ Notepad Window: Windows 95 frame

### Viewers
22. ✅ IE Window: Windows 95 frame
23. ✅ VideoViewer Window: Windows 95 frame

### Buttons
24. ✅ Button Default: Outset bevel
25. ✅ Button Pressed: Inset bevel + translate(1px, 1px)

### Explorer
26. ✅ Tree View Bevel: Inset bevel
27. ✅ Grid View Bevel: Inset bevel

### No-Web Rules
28. ✅ Rounded Corners: Remove all border-radius
29. ✅ Modern Shadows: Replace with simple 1px shadows
30. ✅ Easing/Animations: Remove or < 100ms linear
31. ✅ Blur Effects: Remove all blur filters
32. ✅ Glassmorphism: Remove transparent backgrounds with blur
33. ✅ Modern Gradients: Remove all except title bar
34. ✅ Modern Typography: Remove custom web fonts
35. ✅ Font Smoothing: Disable font smoothing

### OS Illusion Rules
36. ✅ Window Drag: Only from title bar
37. ✅ Window Drag Boundary: Cannot drag outside viewport
38. ✅ Font Stack: "MS Sans Serif", "Tahoma", sans-serif
39. ✅ Font Sizes: Small=10px, Normal=11px, Medium=12px, Large=14px

## P1 (High) - Should Fix Soon

### Taskbar
1. ✅ Taskbar Height: Exactly 40px (2.5rem)
2. ✅ Taskbar Border: Top 2px white, bottom 2px grayDark
3. ✅ Tray Icons: 24x24px (1.5rem)

### Explorer
4. ✅ Tree View Width: 200px (12.5rem) default
5. ✅ Grid Item Size: 64px (4rem) width
6. ✅ Grid Item Icon: 32px (2rem)
7. ✅ Divider Width: 4px (0.25rem)

### Notepad
8. ✅ Notepad Font: "Courier New", monospace
9. ✅ Notepad Font Size: 11px (0.688rem)

### Buttons & Inputs
10. ✅ Button Disabled: Gray text + text-shadow
11. ✅ Input Focus: No visual focus indicator

### Scrollbar
12. ✅ Scrollbar Width: 16px (1rem)
13. ✅ Scrollbar Thumb: Outset bevel
14. ✅ Scrollbar Button: Outset bevel

### Desktop
15. ✅ Desktop Background: Dithered pattern
16. ✅ Desktop Icon Selection: Blue background (if implemented)

### Viewers
17. ✅ IE Iframe: White background
18. ✅ VideoViewer Container: Appropriate background

### No-Web Rules
19. ✅ Overscroll: No overscroll behavior
20. ✅ Window Controls Gap: 2px (0.125rem) between buttons

## P2 (Medium) - Nice to Have

1. ✅ Window Shadow: Optional shadow for focused windows
2. ✅ Scrollbar Pressed: Pressed state for scrollbar buttons
3. ✅ Window Resize: Resize boundary enforcement (if resize implemented)

## Implementation Order

### Phase 1: Foundation (P0)
1. Focus model (active/inactive windows)
2. Window frame and borders
3. Titlebar colors and typography
4. Pressed states (all buttons, icons, controls)
5. Selection colors

### Phase 2: Interaction (P0)
6. Single vs double click
7. Window drag (title bar only, viewport boundary)
8. Z-order management

### Phase 3: No-Web Rules (P0)
9. Remove rounded corners
10. Replace modern shadows
11. Remove/limit animations
12. Remove blur effects
13. Remove glassmorphism
14. Remove modern gradients
15. Fix typography (fonts, smoothing)

### Phase 4: Polish (P1)
16. Taskbar styling
17. Explorer sizing
18. Scrollbar styling
19. Input field focus
20. Desktop background pattern

### Phase 5: Optional (P2)
21. Window shadow
22. Scrollbar pressed state
23. Window resize (if implemented)

## Owner Assignment

All gaps are assigned to **@Engineer** for implementation, as they require code changes to components and styles.

## References

- **GAP_REPORT_CHICAGO95.md:** Complete gap analysis
- **CHICAGO95_UI_CONTRACT.md:** Complete UI contract
- **FP7.md:** Feature Pack 7 contract

## Version History

- **v1.0 (2026-01-22):** Initial priority list
