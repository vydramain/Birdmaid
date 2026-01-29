# Windows 95 UI Tokens & Rules

**Version:** 1.0  
**Created:** 2026-01-22  
**Purpose:** Design tokens and rules for Windows 95 UI implementation  
**Source:** `front/src/ui/win95/tokens.ts`

## Overview

This document defines the design tokens and rules for implementing Windows 95-style UI components. All tokens are defined in `front/src/ui/win95/tokens.ts` and should be used consistently across all Win95 components.

## Design Principles

1. **Authentic Windows 95 Look:** Neutral gray surfaces, pixel-aligned layout, hard edges
2. **3D Bevels:** Raised/sunken borders (no modern flat UI)
3. **Pixel-Perfect:** Compact spacing, bitmap-like typography feeling
4. **Consistency:** All components use the same tokens from `tokens.ts`

## Tokens Reference

### Colors

**Base Grays (Chicago95 Palette):**
- `gray` (#c0c0c0): Main window background
- `grayLight` (#dfdfdf): Top/left borders (raised)
- `grayDark` (#808080): Bottom/right borders (sunken)
- `grayDarker` (#404040): Deepest shadows

**System Colors:**
- `white` (#ffffff): Text on dark, top/left highlights
- `black` (#000000): Text, outer borders

**Accent Colors:**
- `blue` (#000080): Title bar background (start)
- `blueLight` (#1084d0): Title bar background (end gradient)
- `teal` (#008080): Desktop background (classic dithered)
- `red` (#ff0000): Error states, close button hover
- `yellow` (#ffff00): Tooltips, highlights

**Text Colors:**
- `text` (#000000): Default text
- `textInverse` (#ffffff): Text on dark backgrounds (title bar)
- `textDisabled` (#808080): Disabled text (with text-shadow)

### Borders (3D Bevels)

**Inset (Sunken Panel):**
- Top/left: dark (`grayDark`)
- Bottom/right: light (`white`)
- Inner shadow: `inset 1px 1px 0 black`

**Outset (Raised Panel):**
- Top/left: light (`white`)
- Bottom/right: dark (`grayDark`)
- Outer shadow: `1px 1px 0 black`

**Window Frame:**
- Outer: black border
- Inner: 3D bevel (top/left light, bottom/right dark)
- Shadow: `1px 1px 0 black, inset 1px 1px white, inset -1px -1px grayDarker`

### Window Title Bar

- **Height:** 20px (including padding)
- **Padding:** 2px 4px
- **Font Size:** 12px
- **Font Weight:** bold
- **Letter Spacing:** 0.5px
- **Background:** Linear gradient from `blue` to `blueLight`
- **Color:** `textInverse` (white)
- **Margin:** 2px from window edge

### Window Control Buttons

**Size:** 18x18px  
**Gap:** 2px between buttons

**Button Style:**
- Border: 1px solid black (top/left white, bottom/right black)
- Shadow: `1px 1px 0 black, inset -1px -1px 0 grayDark`
- Background: `gray`
- Font size: 12px
- Text align: center

**Active State (Pressed):**
- Border inverted (top/left black, bottom/right white)
- Shadow: none
- Transform: `translate(1px, 1px)`

**Close Button Hover (Optional):**
- Background: `red`
- Color: `white`

### Desktop Icons

**Grid Layout:**
- Column gap: 8px
- Row gap: 16px
- Padding: 8px from desktop edges

**Icon Container:**
- Size: 48x48px
- Background: `gray`
- Border: `2px outset grayLight`
- Margin bottom: 4px (gap to label)

**Icon Label:**
- Font size: 11px
- Text align: center
- Max width: 64px
- Color: `text`

**Spacing:**
- Padding: 8px around icon+label
- Cursor: pointer

**Selected State (Optional):**
- Background: `blue`
- Color: `textInverse`

### Buttons

**Default Button:**
- Padding: 4px 12px
- Font size: 11px
- Min width: 20px
- Border: 1px solid black (top/left white, bottom/right black)
- Shadow: `1px 1px 0 black, inset -1px -1px 0 grayDark`
- Background: `gray`
- Color: `text`

**Active State (Pressed):**
- Border inverted
- Shadow: none
- Transform: `translate(1px, 1px)`

**Disabled State:**
- Color: `textDisabled`
- Text shadow: `1px 1px white`
- Cursor: not-allowed

### Input Fields

**Text Input (Inset):**
- Padding: 4px 6px
- Font size: 11px
- Background: `white`
- Border: inset (top/left dark, bottom/right light)
- Shadow: `inset 1px 1px 0 black`

**Textarea (Inset):**
- Same as text input
- Font family: inherit

### Taskbar

**Dimensions:**
- Height: 40px
- Background: `gray`
- Border top: `2px solid white`
- Border bottom: `2px solid grayDark`
- Padding: 0 8px
- Z-index: 10000 (always on top)

**Tray Area (Right Side):**
- Gap: 8px between tray items
- Padding: 0 4px around tray items

**Tray Icon:**
- Size: 24x24px
- Cursor: pointer

**Clock:**
- Font size: 11px
- Color: `text`
- Padding: 0 4px

### Typography

**Font Family:**
- Primary: "MS Sans Serif"
- Fallback: "Tahoma"
- Final fallback: `sans-serif`

**Font Sizes:**
- Small: 10px (tooltips, small labels)
- Normal: 11px (default text, buttons, inputs)
- Medium: 12px (title bar, menu items)
- Large: 14px (headings, if needed)

**Font Weights:**
- Normal: `normal`
- Bold: `bold` (title bar, emphasis)

**Line Heights:**
- Tight: 1.2 (icons, compact)
- Normal: 1.4 (default)
- Relaxed: 1.6 (readable text)

### Spacing

- XS: 2px (minimal spacing)
- SM: 4px (small spacing)
- MD: 8px (medium spacing)
- LG: 12px (large spacing)
- XL: 16px (extra large spacing)

### Shadows (Win95 Style Only)

- **Window:** `4px 4px 10px rgba(0,0,0,0.5)` (when focused/elevated)
- **Button:** `1px 1px 0 black, inset -1px -1px 0 grayDark` (outset)
- **Inset:** `inset 1px 1px 0 black` (sunken)
- **Outset:** `1px 1px 0 black` (raised)

## Component Rules

### Window Frame

1. **Title Bar:**
   - Always use `windowTitleBar` tokens
   - Gradient from `blue` to `blueLight`
   - White text, bold, 12px

2. **Control Buttons:**
   - Minimize/Maximize/Close: 18x18px
   - 2px gap between buttons
   - Use `windowControls.button` style
   - Active state: `windowControls.buttonActive`

3. **Window Border:**
   - Use `borderWindow` tokens
   - Outer black border + 3D bevel

### Desktop Icons

1. **Grid:**
   - Use `desktopIcons.grid` for layout
   - Column gap: 8px, row gap: 16px

2. **Icon:**
   - 48x48px container
   - `2px outset grayLight` border
   - 4px margin bottom to label

3. **Label:**
   - 11px font size
   - Center aligned
   - Max width: 64px

### Buttons

1. **Default:**
   - Use `buttons.default` tokens
   - Always include active state: `buttons.active`

2. **Disabled:**
   - Use `buttons.disabled` tokens
   - Text shadow for "engraved" effect

### Input Fields

1. **Text Input:**
   - Use `inputs.text` tokens
   - Always inset border

2. **Textarea:**
   - Use `inputs.textarea` tokens
   - Same as text input

### Taskbar

1. **Height:**
   - Always 40px (use `taskbar.height`)

2. **Tray Area:**
   - Right side, 8px gap between items
   - Tray icons: 24x24px

3. **Clock:**
   - 11px font size
   - Local time display

## Anti-Patterns (DO NOT USE)

### ❌ Rounded Corners
- **Why:** Windows 95 has hard edges, no rounded corners
- **Example:** `border-radius: 4px` ❌
- **Correct:** Sharp corners, no border-radius ✅

### ❌ Modern Drop Shadows
- **Why:** Windows 95 uses simple 1px shadows, not blur
- **Example:** `box-shadow: 0 4px 6px rgba(0,0,0,0.1)` ❌
- **Correct:** `box-shadow: 1px 1px 0 black` ✅

### ❌ Blur Effects
- **Why:** No blur in Windows 95
- **Example:** `filter: blur(4px)`, `backdrop-filter: blur(10px)` ❌
- **Correct:** No blur effects ✅

### ❌ Glassmorphism
- **Why:** Windows 95 has solid backgrounds, no transparency effects
- **Example:** `background: rgba(255,255,255,0.8)`, `backdrop-filter: blur()` ❌
- **Correct:** Solid colors: `background: #c0c0c0` ✅

### ❌ Modern Gradients
- **Why:** Windows 95 only uses simple linear gradients for title bar
- **Example:** `background: linear-gradient(135deg, #ff6b6b, #4ecdc4)` ❌
- **Correct:** Title bar gradient: `linear-gradient(90deg, #000080 0%, #1084d0 100%)` ✅

### ❌ Smooth Animations
- **Why:** Windows 95 has instant state changes, no smooth transitions
- **Example:** `transition: all 0.3s ease` ❌
- **Correct:** Instant state changes, or very short transitions (< 100ms) ✅

### ❌ Modern Typography
- **Why:** Windows 95 uses system fonts, no custom web fonts (except MS Sans Serif)
- **Example:** `font-family: 'Inter', 'Roboto', sans-serif` ❌
- **Correct:** `font-family: "MS Sans Serif", "Tahoma", sans-serif` ✅

### ❌ Flexbox/Grid Modern Layouts
- **Why:** Windows 95 uses pixel-perfect positioning, not modern flexbox patterns
- **Example:** `display: flex; justify-content: space-between; align-items: center` (if overused) ❌
- **Correct:** Use flexbox for layout, but maintain pixel-perfect spacing from tokens ✅

### ❌ CSS Variables for Dynamic Theming
- **Why:** Windows 95 has fixed colors, no theme switching
- **Example:** `--primary-color: var(--user-theme)` ❌
- **Correct:** Use tokens from `tokens.ts` directly ✅

### ❌ Modern Icons (SVG with paths)
- **Why:** Windows 95 uses bitmap icons, not vector
- **Example:** Modern SVG icons with smooth curves ❌
- **Correct:** Use bitmap-style icons from `design/icons/` ✅

## Usage Examples

### Importing Tokens

```typescript
import { win95Tokens } from '@/ui/win95/tokens';

// Use colors
const backgroundColor = win95Tokens.colors.gray;

// Use borders
const insetStyle = win95Tokens.borders.inset;

// Use window controls
const buttonSize = win95Tokens.windowControls.size;
```

### Component Implementation

```typescript
// ✅ Correct: Using tokens
<div style={{
  backgroundColor: win95Tokens.colors.gray,
  ...win95Tokens.borders.outset,
  padding: `${win95Tokens.spacing.md}px`,
}}>
  Content
</div>

// ❌ Wrong: Hardcoded values
<div style={{
  backgroundColor: '#c0c0c0',
  borderRadius: '4px',
  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
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
- **retro.css:** Existing CSS variables (legacy, migrate to tokens.ts)

## Migration Notes

1. **From retro.css to tokens.ts:**
   - CSS variables (`--win-gray`, etc.) are still valid for CSS
   - TypeScript components should use `tokens.ts` for type safety
   - Both can coexist during migration

2. **Component Updates:**
   - Update components to import from `tokens.ts`
   - Remove hardcoded values
   - Use token values consistently

3. **Testing:**
   - Ensure all components use tokens
   - Verify no anti-patterns are introduced
   - Check pixel-perfect alignment

## Version History

- **v1.0 (2026-01-22):** Initial tokens and rules document
