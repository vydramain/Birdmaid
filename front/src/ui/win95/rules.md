# Windows 95 UI Component Rules

**Version:** 1.0  
**Created:** 2026-01-22  
**Purpose:** Component implementation rules and anti-patterns for Windows 95 UI  
**Source:** `front/src/ui/win95/tokens.ts`  
**Reference:** `docs/fps/FP7.md` (UX Rules Desktop Win95)

## Overview

This document defines **how to use** the Windows 95 UI tokens from `tokens.ts` and **what NOT to do** when implementing Win95 components. All components must follow these rules to maintain authentic Windows 95 aesthetic.

## Design Principles

1. **Authentic Windows 95 Look:** Neutral gray surfaces, pixel-aligned layout, hard edges
2. **3D Bevels:** Raised/sunken borders (no modern flat UI)
3. **Pixel-Perfect:** Compact spacing, bitmap-like typography feeling
4. **Consistency:** All components use the same tokens from `tokens.ts`
5. **No "Modern" Effects:** No rounded corners, blur, glassmorphism, smooth animations

## Component Rules

### Window Frame

**Title Bar:**
- **Height:** Always `20px` (use `windowTitleBar.height`)
- **Padding:** `2px 4px` (use `windowTitleBar.padding`)
- **Font:** Bold, 12px, letter-spacing 0.5px (use `windowTitleBar.fontSize`, `windowTitleBar.fontWeight`, `windowTitleBar.letterSpacing`)
- **Background:** Linear gradient from `blue` to `blueLight` (use `windowTitleBar.background`)
- **Color:** White text (use `windowTitleBar.color`)
- **Margin:** `2px` from window edge (use `windowTitleBar.margin`)

**Control Buttons (Minimize/Maximize/Close):**
- **Size:** `18x18px` (use `windowControls.size`)
- **Gap:** `2px` between buttons (use `windowControls.gap`)
- **Style:** Use `windowControls.button` for default state
- **Active State:** Use `windowControls.buttonActive` when pressed
- **Close Hover:** Optional red tint (use `windowControls.closeHover`)

**Window Border:**
- **Style:** Use `borders.window` (3D bevel with outer black border)
- **Never:** Rounded corners, modern drop shadows

### Desktop Icons

**Grid Layout:**
- **Column Gap:** `8px` (use `desktopIcons.grid.columnGap`)
- **Row Gap:** `16px` (use `desktopIcons.grid.rowGap`)
- **Padding:** `8px` from desktop edges (use `desktopIcons.grid.padding`)

**Icon Container:**
- **Size:** `48x48px` (use `desktopIcons.icon.width` and `desktopIcons.icon.height`)
- **Background:** Gray (use `desktopIcons.icon.backgroundColor`)
- **Border:** `2px outset grayLight` (use `desktopIcons.icon.border`)
- **Margin Bottom:** `4px` gap to label (use `desktopIcons.icon.marginBottom`)

**Icon Label:**
- **Font Size:** `11px` (use `desktopIcons.label.fontSize`)
- **Text Align:** Center (use `desktopIcons.label.textAlign`)
- **Max Width:** `64px` (use `desktopIcons.label.maxWidth`)
- **Color:** Black text (use `desktopIcons.label.color`)

**Spacing (Clickable Area):**
- **Padding:** `8px` around icon+label (use `desktopIcons.spacing.padding`)
- **Cursor:** Pointer (use `desktopIcons.spacing.cursor`)

**Selected State (Optional):**
- **Background:** Blue (use `desktopIcons.selected.backgroundColor`)
- **Color:** White text (use `desktopIcons.selected.color`)

### Explorer (Tree + Grid View)

**Split Pane:**
- **Divider Width:** `4px` (use `explorer.divider.width`)
- **Divider Background:** Gray (use `explorer.divider.backgroundColor`)
- **Cursor:** `col-resize` for divider (use `explorer.divider.cursor`)

**Tree View (Left Pane):**
- **Default Width:** `200px` (use `explorer.tree.width`)
- **Min Width:** `150px` (use `explorer.tree.minWidth`)
- **Max Width:** `400px` (use `explorer.tree.maxWidth`)
- **Background:** Gray (use `explorer.tree.backgroundColor`)
- **Padding:** `4px` (use `explorer.tree.padding`)
- **Border:** Inset (use `explorer.tree` includes `borderInset`)

**Tree Item:**
- **Font Size:** `11px` (use `explorer.treeItem.fontSize`)
- **Padding:** `2px 4px` (use `explorer.treeItem.padding`)
- **Cursor:** Pointer (use `explorer.treeItem.cursor`)
- **Color:** Black text (use `explorer.treeItem.color`)

**Tree Item Selected:**
- **Background:** Blue (use `explorer.treeItemSelected.backgroundColor`)
- **Color:** White text (use `explorer.treeItemSelected.color`)

**Grid View (Right Pane):**
- **Background:** White (use `explorer.grid.backgroundColor`)
- **Padding:** `8px` (use `explorer.grid.padding`)
- **Border:** Inset (use `explorer.grid` includes `borderInset`)

**Grid Item (File/Folder Icon):**
- **Width:** `64px` per item (use `explorer.gridItem.width`)
- **Padding:** `4px` (use `explorer.gridItem.padding`)
- **Cursor:** Pointer (use `explorer.gridItem.cursor`)
- **Text Align:** Center (use `explorer.gridItem.textAlign`)

**Grid Item Icon:**
- **Size:** `32x32px` (use `explorer.gridItemIcon.width` and `explorer.gridItemIcon.height`)
- **Margin Bottom:** `2px` gap to label (use `explorer.gridItemIcon.marginBottom`)

**Grid Item Label:**
- **Font Size:** `11px` (use `explorer.gridItemLabel.fontSize`)
- **Color:** Black text (use `explorer.gridItemLabel.color`)
- **Word Break:** Break word (use `explorer.gridItemLabel.wordBreak`)
- **Line Height:** `1.2` (use `explorer.gridItemLabel.lineHeight`)

**Grid Item Selected:**
- **Background:** Blue (use `explorer.gridItemSelected.backgroundColor`)
- **Color:** White text (use `explorer.gridItemSelected.color`)

### Buttons

**Default Button:**
- **Padding:** `4px 12px` (use `buttons.default.padding`)
- **Font Size:** `11px` (use `buttons.default.fontSize`)
- **Min Width:** `20px` (use `buttons.default.minWidth`)
- **Border:** Outset style (use `buttons.default.border` and `buttons.default.boxShadow`)
- **Background:** Gray (use `buttons.default.background`)
- **Color:** Black text (use `buttons.default.color`)
- **Cursor:** Pointer (use `buttons.default.cursor`)

**Button Active (Pressed):**
- **Border:** Inverted (use `buttons.active`)
- **Transform:** `translate(1px, 1px)` (use `buttons.active.transform`)

**Button Disabled:**
- **Color:** Gray text (use `buttons.disabled.color`)
- **Text Shadow:** `1px 1px white` for "engraved" effect (use `buttons.disabled.textShadow`)
- **Cursor:** Not-allowed (use `buttons.disabled.cursor`)

### Input Fields

**Text Input:**
- **Padding:** `4px 6px` (use `inputs.text.padding`)
- **Font Size:** `11px` (use `inputs.text.fontSize`)
- **Background:** White (use `inputs.text.background`)
- **Border:** Inset (use `inputs.text` includes `borderInset`)
- **Color:** Black text (use `inputs.text.color`)

**Textarea:**
- Same as text input (use `inputs.textarea`)

### Taskbar

**Dimensions:**
- **Height:** `40px` (use `taskbar.height`)
- **Background:** Gray (use `taskbar.backgroundColor`)
- **Border Top:** `2px solid white` (use `taskbar.borderTop`)
- **Border Bottom:** `2px solid grayDark` (use `taskbar.borderBottom`)
- **Padding:** `0 8px` (use `taskbar.padding`)
- **Z-Index:** `10000` (always on top, use `taskbar.zIndex`)

**Tray Area (Right Side):**
- **Gap:** `8px` between tray items (use `taskbar.tray.gap`)
- **Padding:** `0 4px` around tray items (use `taskbar.tray.padding`)

**Tray Icon:**
- **Size:** `24x24px` (use `taskbar.trayIcon.width` and `taskbar.trayIcon.height`)
- **Cursor:** Pointer (use `taskbar.trayIcon.cursor`)

**Clock:**
- **Font Size:** `11px` (use `taskbar.clock.fontSize`)
- **Color:** Black text (use `taskbar.clock.color`)
- **Padding:** `0 4px` (use `taskbar.clock.padding`)

### Scrollbar

**Track:**
- **Width:** `16px` (use `scrollbar.track.width`)
- **Background:** Gray (use `scrollbar.track.backgroundColor`)
- **Border:** Inset (use `scrollbar.track` includes `borderInset`)

**Thumb:**
- **Background:** Gray dark (use `scrollbar.thumb.backgroundColor`)
- **Min Height:** `20px` (use `scrollbar.thumb.minHeight`)
- **Border:** Outset (use `scrollbar.thumb` includes `borderOutset`)
- **Cursor:** Pointer (use `scrollbar.thumb.cursor`)

**Button (Up/Down Arrows):**
- **Size:** `16x16px` (use `scrollbar.button.width` and `scrollbar.button.height`)
- **Background:** Gray (use `scrollbar.button.backgroundColor`)
- **Border:** Outset (use `scrollbar.button` includes `borderOutset`)
- **Cursor:** Pointer (use `scrollbar.button.cursor`)
- **Font Size:** `8px` (use `scrollbar.button.fontSize`)

**Button Active (Pressed):**
- **Border:** Inset (use `scrollbar.buttonActive`)
- **Transform:** `translate(1px, 1px)` (use `scrollbar.buttonActive.transform`)

### Desktop (Wallpaper)

**Wallpaper:**
- **Background:** Teal (classic dithered, use `desktop.wallpaper.backgroundColor`)
- **Note:** Can be replaced with image URL if needed

**Padding:**
- **From Edges:** `8px` (use `desktop.padding`)

## Typography Rules

**Font Family:**
- **Primary:** `"MS Sans Serif"` (use `typography.fontFamily`)
- **Fallback:** `"Tahoma"`, then `sans-serif`

**Font Sizes:**
- **Small:** `10px` for tooltips, small labels (use `typography.fontSize.small`)
- **Normal:** `11px` for default text, buttons, inputs (use `typography.fontSize.normal`)
- **Medium:** `12px` for title bar, menu items (use `typography.fontSize.medium`)
- **Large:** `14px` for headings (if needed, use `typography.fontSize.large`)

**Font Weights:**
- **Normal:** `normal` (use `typography.fontWeight.normal`)
- **Bold:** `bold` for title bar, emphasis (use `typography.fontWeight.bold`)

**Line Heights:**
- **Tight:** `1.2` for icons, compact (use `typography.lineHeight.tight`)
- **Normal:** `1.4` for default (use `typography.lineHeight.normal`)
- **Relaxed:** `1.6` for readable text (use `typography.lineHeight.relaxed`)

## Spacing Rules

Always use spacing tokens from `spacing`:
- **XS:** `2px` - minimal spacing (use `spacing.xs`)
- **SM:** `4px` - small spacing (use `spacing.sm`)
- **MD:** `8px` - medium spacing (use `spacing.md`)
- **LG:** `12px` - large spacing (use `spacing.lg`)
- **XL:** `16px` - extra large spacing (use `spacing.xl`)

## Border Rules

**Inset (Sunken Panel):**
- Use `borders.inset` for input fields, sunken panels
- Top/left: dark (`grayDark`), bottom/right: light (`white`)
- Inner shadow: `inset 1px 1px 0 black`

**Outset (Raised Panel):**
- Use `borders.outset` for buttons, raised panels
- Top/left: light (`white`), bottom/right: dark (`grayDark`)
- Outer shadow: `1px 1px 0 black`

**Window Frame:**
- Use `borders.window` for window frames
- Outer: black border
- Inner: 3D bevel (top/left light, bottom/right dark)
- Shadow: `1px 1px 0 black, inset 1px 1px white, inset -1px -1px grayDarker`

## Anti-Patterns (DO NOT USE)

### ❌ Rounded Corners

**Why:** Windows 95 has hard edges, no rounded corners.

**Example (Wrong):**
```css
border-radius: 4px;
border-radius: 8px;
```

**Correct:**
```typescript
// Sharp corners, no border-radius
// Use borders.inset or borders.outset for 3D effect
```

### ❌ Modern Drop Shadows

**Why:** Windows 95 uses simple 1px shadows, not blur.

**Example (Wrong):**
```css
box-shadow: 0 4px 6px rgba(0,0,0,0.1);
box-shadow: 0 2px 4px rgba(0,0,0,0.2);
```

**Correct:**
```typescript
// Use shadows.outset: "1px 1px 0 black"
// Or shadows.inset: "inset 1px 1px 0 black"
```

### ❌ Blur Effects

**Why:** No blur in Windows 95.

**Example (Wrong):**
```css
filter: blur(4px);
backdrop-filter: blur(10px);
```

**Correct:**
```typescript
// No blur effects
// Use solid colors and sharp edges
```

### ❌ Glassmorphism

**Why:** Windows 95 has solid backgrounds, no transparency effects.

**Example (Wrong):**
```css
background: rgba(255,255,255,0.8);
backdrop-filter: blur(10px);
```

**Correct:**
```typescript
// Solid colors: colors.gray, colors.white, etc.
// No transparency effects
```

### ❌ Modern Gradients

**Why:** Windows 95 only uses simple linear gradients for title bar.

**Example (Wrong):**
```css
background: linear-gradient(135deg, #ff6b6b, #4ecdc4);
background: radial-gradient(circle, #fff, #000);
```

**Correct:**
```typescript
// Only title bar gradient: windowTitleBar.background
// Linear gradient from blue to blueLight (90deg)
```

### ❌ Smooth Animations

**Why:** Windows 95 has instant state changes, no smooth transitions.

**Example (Wrong):**
```css
transition: all 0.3s ease;
transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
```

**Correct:**
```typescript
// Instant state changes
// Or very short transitions (< 100ms) if absolutely necessary
```

### ❌ Modern Typography

**Why:** Windows 95 uses system fonts, no custom web fonts (except MS Sans Serif).

**Example (Wrong):**
```css
font-family: 'Inter', 'Roboto', sans-serif;
font-family: 'Open Sans', sans-serif;
```

**Correct:**
```typescript
// Use typography.fontFamily: "MS Sans Serif", "Tahoma", sans-serif
```

### ❌ Flexbox/Grid Modern Layouts (Overused)

**Why:** Windows 95 uses pixel-perfect positioning, not modern flexbox patterns everywhere.

**Example (Wrong):**
```css
display: flex;
justify-content: space-between;
align-items: center;
/* Overused for simple layouts */
```

**Correct:**
```typescript
// Use flexbox for layout, but maintain pixel-perfect spacing from tokens
// Use spacing tokens (spacing.xs, spacing.sm, etc.) for gaps
```

### ❌ CSS Variables for Dynamic Theming

**Why:** Windows 95 has fixed colors, no theme switching.

**Example (Wrong):**
```css
--primary-color: var(--user-theme);
background: var(--dynamic-bg);
```

**Correct:**
```typescript
// Use tokens from tokens.ts directly
// colors.gray, colors.blue, etc.
```

### ❌ Modern Icons (SVG with paths)

**Why:** Windows 95 uses bitmap icons, not vector.

**Example (Wrong):**
```typescript
// Modern SVG icons with smooth curves
<svg><path d="M..." /></svg>
```

**Correct:**
```typescript
// Use bitmap-style icons from design/icons/
// Or simple pixel-art style icons
```

### ❌ Viewport Units for Sizing

**Why:** Windows 95 uses fixed pixel sizes, not responsive viewport units.

**Example (Wrong):**
```css
width: 50vw;
height: 100vh;
font-size: 2rem;
```

**Correct:**
```typescript
// Use fixed pixel sizes from tokens
// windowTitleBar.height: 20
// windowControls.size: 18
// etc.
```

### ❌ Modern Color Schemes

**Why:** Windows 95 uses specific gray palette, not modern color schemes.

**Example (Wrong):**
```css
background: #f5f5f5; /* Modern light gray */
color: #333; /* Modern dark gray */
```

**Correct:**
```typescript
// Use colors from tokens.ts
// colors.gray: '#c0c0c0'
// colors.grayLight: '#dfdfdf'
// colors.grayDark: '#808080'
```

## Usage Examples

### ✅ Correct: Using Tokens

```typescript
import { win95Tokens } from '@/ui/win95/tokens';

// Window title bar
<div style={{
  height: `${win95Tokens.windowTitleBar.height}px`,
  padding: win95Tokens.windowTitleBar.padding,
  fontSize: win95Tokens.windowTitleBar.fontSize,
  fontWeight: win95Tokens.windowTitleBar.fontWeight,
  background: win95Tokens.windowTitleBar.background,
  color: win95Tokens.windowTitleBar.color,
}}>
  Window Title
</div>

// Button
<button style={{
  ...win95Tokens.buttons.default,
}}>
  Click Me
</button>

// Desktop icon
<div style={{
  width: `${win95Tokens.desktopIcons.icon.width}px`,
  height: `${win95Tokens.desktopIcons.icon.height}px`,
  backgroundColor: win95Tokens.desktopIcons.icon.backgroundColor,
  border: win95Tokens.desktopIcons.icon.border,
  marginBottom: `${win95Tokens.desktopIcons.icon.marginBottom}px`,
}}>
  <img src="icon.png" alt="Icon" />
</div>
```

### ❌ Wrong: Hardcoded Values

```typescript
// ❌ Don't hardcode values
<div style={{
  height: '20px',
  padding: '2px 4px',
  borderRadius: '4px', // ❌ Rounded corners
  boxShadow: '0 4px 6px rgba(0,0,0,0.1)', // ❌ Modern shadow
  background: '#f5f5f5', // ❌ Modern color
}}>
  Content
</div>
```

## References

- **FP7.md:** UX Rules Desktop Win95 (section "UX Rules → Desktop (Windows 95)")
- **WIN95_UI_KIT.md:** Design requirements and component list
- **WIN95_REFERENCES.md:** Visual ground truth references
- **design/screenshots/:** Visual references for components
- **design/icons/:** Icon references for Desktop Icons
- **tokens.ts:** Source of truth for all tokens

## Migration Notes

1. **From retro.css to tokens.ts:**
   - CSS variables (`--win-gray`, etc.) are still valid for CSS
   - TypeScript components should use `tokens.ts` for type safety
   - Both can coexist during migration

2. **Component Updates:**
   - Update components to import from `tokens.ts`
   - Remove hardcoded values
   - Use token values consistently
   - Remove all anti-patterns

3. **Testing:**
   - Ensure all components use tokens
   - Verify no anti-patterns are introduced
   - Check pixel-perfect alignment
   - Compare with design/screenshots/ references

## Version History

- **v1.0 (2026-01-22):** Initial rules document with component rules and anti-patterns
