# Chicago95 UI Contract

**Version:** 1.0  
**Created:** 2026-01-22  
**Purpose:** UI contract for Chicago95-like Windows 95 experience  
**Status:** Design Phase (FP7)  
**Source:** Visual analysis, WIN95_SPEC.md, WIN95_TOKENS_RULES.md

> **⚠️ OPEN-SOURCE CONSTRAINT:** This contract is built from measurements and observations of Windows 95 screenshots and open-source references. **NO Windows assets, source code, or ripped resources are used.** All fonts, icons, and visual elements must be open-source alternatives or custom implementations.

## Inspiration (OSS + Visual References)

We do not copy Windows assets or source code. We implement our own tokens, mixins, and components.

| Reference | URL | Purpose |
|-----------|-----|---------|
| **98.css** | https://jdan.github.io/98.css/ | **Mandatory** for FP7 — Win98 design system, canonical reference |
| [DESIGN_SYSTEM_98.css.md](./DESIGN_SYSTEM_98.css.md) | — | FP7 design system, 98.css ↔ Birdmaid mapping |
| GuidebookGallery Win95 GUI | https://guidebookgallery.org/guis/windows/win95 | Historical reference |
| GuidebookGallery Win95 Tutorial | https://guidebookgallery.org/tutorials/windows95 | Historical reference |
| GuidebookGallery Win95 Screenshots | https://guidebookgallery.org/screenshots/win95 | Historical reference |

**Chicago95:** This contract describes a "Chicago95-like" experience. Chicago95 is optional inspiration; we do not bundle it. We implement our own tokens and components.

## Overview

This contract defines the complete UI specification for achieving a Chicago95-like Windows 95 experience. The contract is applicable to both the style guide and real window implementations. It specifies tokens, metrics, state rules, "No-Web rules", and "OS illusion rules" that must be followed to create an authentic Windows 95 aesthetic.

## 1. Tokens

### 1.1 Colors

**Base Grays (Chicago95 Palette):**
- `gray` (#c0c0c0): Main window background
- `grayLight` (#dfdfdf): Top/left borders (raised), highlights
- `grayDark` (#808080): Bottom/right borders (sunken), shadows
- `grayDarker` (#404040): Deepest shadows, inner borders

**System Colors:**
- `white` (#ffffff): Text on dark, top/left highlights, input backgrounds
- `black` (#000000): Text, outer borders, shadows

**Accent Colors:**
- `blue` (#000080): Title bar background (start gradient)
- `blueLight` (#1084d0): Title bar background (end gradient)
- `teal` (#008080): Desktop background (classic dithered pattern)
- `red` (#ff0000): Error states, close button hover
- `yellow` (#ffff00): Tooltips, highlights

**Text Colors:**
- `text` (#000000): Default text on light backgrounds
- `textInverse` (#ffffff): Text on dark backgrounds (title bar, selected items)
- `textDisabled` (#808080): Disabled text (with text-shadow for "engraved" effect)

### 1.2 System Edges (3D Bevels)

**Inset (Sunken Panel):**
- Top: `1px solid grayDark` (#808080)
- Left: `1px solid grayDark` (#808080)
- Right: `1px solid white` (#ffffff)
- Bottom: `1px solid white` (#ffffff)
- Inner shadow: `inset 1px 1px 0 black`
- **Usage:** Input fields, sunken panels, explorer tree/grid containers

**Outset (Raised Panel):**
- Top: `1px solid white` (#ffffff)
- Left: `1px solid white` (#ffffff)
- Right: `1px solid grayDark` (#808080)
- Bottom: `1px solid grayDark` (#808080)
- Outer shadow: `1px 1px 0 black`
- **Usage:** Buttons, desktop icons, raised panels

**Window Frame (3D Window):**
- Outer border: `1px solid black`
- Inner bevel:
  - Top/left: `1px solid grayLight` (#dfdfdf)
  - Bottom/right: `1px solid grayDark` (#808080)
- Shadow: `1px 1px 0 black, inset 1px 1px white, inset -1px -1px grayDarker`
- **Usage:** Window borders

### 1.3 Selection

**Focused Selection:**
- Background: `blue` (#000080)
- Text: `textInverse` (#ffffff)
- Border: None (or subtle outline)

**Unfocused Selection:**
- Background: `blue` (#000080) — same as focused (Win95 behavior)
- Text: `textInverse` (#ffffff) — same as focused (Win95 behavior)
- **Note:** Windows 95 typically shows selection in blue even when unfocused, but some contexts (like desktop icons) show gray selection when unfocused.

### 1.4 Titlebar Active/Inactive

**Active Window:**
- Background: Linear gradient from `blue` (#000080) to `blueLight` (#1084d0)
- Text: `textInverse` (#ffffff)
- Font: Bold, 12px, letter-spacing 0.5px
- Z-index: 20 (higher than inactive windows)

**Inactive Window:**
- Background: `gray` (#c0c0c0)
- Text: `text` (#000000)
- Font: Bold, 12px, letter-spacing 0.5px
- Z-index: 10 (lower than active windows)

## 2. Metrics

### 2.1 Titlebar

- **Height:** 20px (1.25rem)
- **Padding:** 2px 4px (0.125rem 0.25rem)
- **Margin:** 2px (0.125rem) from window edge
- **Font Size:** 12px (0.75rem)
- **Font Weight:** bold
- **Letter Spacing:** 0.5px (0.0313rem)

### 2.2 Borders

- **Thickness:** 1px (0.0625rem) for all borders
- **Window Frame:** Outer black (1px) + inner 3D bevel (1px each side)

### 2.3 Caption Buttons (Window Controls)

- **Size:** 18x18px (1.125rem)
- **Gap:** 2px (0.125rem) between buttons
- **Font Size:** 12px (0.75rem)
- **Line Height:** 18px (1.125rem)

### 2.4 Menus

- **Menu Bar Height:** 20px (1.25rem) — if implemented
- **Menu Item Padding:** 4px 8px (0.25rem 0.5rem)
- **Menu Item Font Size:** 12px (0.75rem)

### 2.5 Statusbar

- **Height:** 20px (1.25rem)
- **Padding:** 2px 4px (0.125rem 0.25rem)
- **Font Size:** 11px (0.688rem)

### 2.6 Icon Grid

**Desktop Icons:**
- **Icon Size:** 48x48px (3rem)
- **Icon Label Max Width:** 64px (4rem)
- **Grid Column Gap:** 8px (0.5rem)
- **Grid Row Gap:** 16px (1rem)
- **Icon Padding:** 8px (0.5rem) around icon+label

**Explorer Grid:**
- **Grid Item Width:** 64px (4rem)
- **Grid Item Icon Size:** 32px (2rem)
- **Grid Gap:** 16px (1rem)

### 2.7 Taskbar

- **Height:** 40px (2.5rem)
- **Padding:** 0 8px (0 0.5rem)
- **Tray Gap:** 8px (0.5rem) between tray items
- **Tray Icon Size:** 24x24px (1.5rem)

### 2.8 Scrollbar

- **Width:** 16px (1rem)
- **Thumb Min Height:** 20px (1.25rem)
- **Button Size:** 16x16px (1rem)

## 3. State Rules

### 3.1 Active/Inactive Window

**Active Window:**
- Title bar: Blue gradient (`#000080` → `#1084d0`), white text
- Border: 3D bevel (top/left light, bottom/right dark)
- Z-index: 20 (higher than inactive)
- Shadow: Optional `4px 4px 10px rgba(0,0,0,0.5)` when focused/elevated

**Inactive Window:**
- Title bar: Gray (`#c0c0c0`), black text
- Border: 3D bevel (same as active, but less prominent)
- Z-index: 10 (lower than active)
- Shadow: None or minimal

### 3.2 Selection Focus/Unfocus

**Focused Selection:**
- Background: `blue` (#000080)
- Text: `textInverse` (#ffffff)
- Border: None

**Unfocused Selection:**
- Background: `blue` (#000080) — same as focused (Win95 behavior)
- Text: `textInverse` (#ffffff) — same as focused (Win95 behavior)
- **Exception:** Desktop icons may show gray selection when unfocused

### 3.3 Pressed/Disabled

**Pressed State (Buttons, Icons, Controls):**
- Border: Inverted (top/left `black`, bottom/right `white`)
- Shadow: None
- Transform: `translate(1px, 1px)` (pressed effect)
- Background: `gray` (#c0c0c0)

**Disabled State:**
- Color: `textDisabled` (#808080)
- Text Shadow: `1px 1px white` (engraved effect)
- Cursor: `not-allowed`
- Border: Same as default, but muted

### 3.4 Input Focus

**Default (Inset):**
- Border: Top/left `grayDark`, bottom/right `white`
- Shadow: `inset 1px 1px 0 black`
- Background: `white` (#ffffff)
- Text: `text` (#000000)

**Focused:**
- Border: Same as default (no visual change in Win95)
- Cursor: Text cursor
- **Note:** Windows 95 does not show visual focus indicator for input fields

**Disabled:**
- Background: `gray` (#c0c0c0)
- Text: `textDisabled` (#808080)
- Cursor: `not-allowed`

### 3.5 Scrollbar States

**Default:**
- Track: `gray` (#c0c0c0) with inset bevel
- Thumb: 3D bevel (outset)
- Buttons: 3D bevel (outset), up/down arrows

**Hover (Optional):**
- Thumb: Slightly darker gray (optional enhancement)

**Active (Dragging):**
- Thumb: Inset bevel (pressed effect)
- Transform: `translate(1px, 1px)` (if needed)

## 4. "No-Web" Rules

These rules prohibit modern web patterns that break the Windows 95 illusion.

### 4.1 Rounded Corners

**❌ Prohibited:**
- `border-radius: 4px` or any rounded corners
- `border-radius: 50%` for circular elements

**✅ Required:**
- Sharp corners, no border-radius
- `border-radius: 0` (explicit)

### 4.2 Modern Shadows

**❌ Prohibited:**
- `box-shadow: 0 4px 6px rgba(0,0,0,0.1)` (blur shadows)
- `box-shadow: 0 2px 8px rgba(0,0,0,0.15)` (soft shadows)
- Multiple layered shadows with blur

**✅ Required:**
- Simple 1px shadows: `box-shadow: 1px 1px 0 black`
- Inset shadows: `box-shadow: inset 1px 1px 0 black`
- Window shadow (optional): `box-shadow: 4px 4px 10px rgba(0,0,0,0.5)` (only for focused windows)

### 4.3 Easing/Animations

**❌ Prohibited:**
- `transition: all 0.3s ease` (smooth transitions)
- `transition: transform 0.2s cubic-bezier(...)` (easing functions)
- `animation: fadeIn 0.3s ease-in-out` (smooth animations)

**✅ Required:**
- Instant state changes (no transitions)
- Or very short transitions (< 100ms) with `linear` timing
- No easing functions (`ease`, `ease-in`, `ease-out`, `ease-in-out`, `cubic-bezier`)

### 4.4 Overscroll

**❌ Prohibited:**
- `overscroll-behavior: auto` (default web behavior)
- Bounce effects on scroll boundaries

**✅ Required:**
- `overscroll-behavior: none` (no overscroll)
- Hard stop at scroll boundaries

### 4.5 Blur Effects

**❌ Prohibited:**
- `filter: blur(4px)` (blur filters)
- `backdrop-filter: blur(10px)` (backdrop blur)
- `filter: drop-shadow(...)` (drop shadows with blur)

**✅ Required:**
- No blur effects
- No backdrop filters

### 4.6 Glassmorphism

**❌ Prohibited:**
- `background: rgba(255,255,255,0.8)` with `backdrop-filter: blur()`
- Transparent backgrounds with blur effects
- Frosted glass effects

**✅ Required:**
- Solid colors: `background: #c0c0c0`
- No transparency effects (except for tooltips/overlays if needed)

### 4.7 Modern Gradients

**❌ Prohibited:**
- `background: linear-gradient(135deg, #ff6b6b, #4ecdc4)` (diagonal gradients)
- `background: radial-gradient(...)` (radial gradients)
- Complex gradient patterns

**✅ Required:**
- Title bar gradient only: `linear-gradient(90deg, #000080 0%, #1084d0 100%)`
- No other gradients

### 4.8 Modern Typography

**❌ Prohibited:**
- `font-family: 'Inter', 'Roboto', sans-serif` (modern web fonts)
- Custom web fonts (except system fonts)
- Font smoothing enabled

**✅ Required:**
- System fonts: `"MS Sans Serif", "Tahoma", sans-serif`
- Font smoothing disabled: `-webkit-font-smoothing: none`, `font-smooth: never`
- Monospace for Notepad: `"Courier New", monospace`

## 5. "OS Illusion" Rules

These rules create the illusion of an operating system, not a web application.

### 5.1 Focus Model

**Active Window:**
- Click on window → window becomes active
- Title bar changes from gray to blue gradient
- Z-index increases to 20
- Window moves to front (z-order)

**Inactive Window:**
- Title bar is gray
- Z-index is 10
- Window is behind active window

**Implementation:**
- Click handler on window → `focusWindow(id)`
- WindowRegistry manages z-index
- Visual feedback: title bar color change

### 5.2 Z-Order

**Layers:**
- Desktop: z-index 1
- Window (inactive): z-index 10
- Window (active): z-index 20
- Taskbar: z-index 10000
- Modal: z-index 10001

**Rules:**
- Only one window can be active at a time
- Active window always on top
- Taskbar always on top (except modals)

### 5.3 Taskbar Pressed

**Taskbar Button States:**
- Default: Outset bevel (top/left white, bottom/right grayDark)
- Pressed: Inset bevel (top/left grayDark, bottom/right white) + `translate(1px, 1px)`
- Active (window focused): Optional highlight

**Implementation:**
- Click on taskbar button → pressed state
- Release → return to default (or active if window is focused)

### 5.4 Single vs Double Click

**Desktop Icons:**
- Single-click: Selection (highlight)
- Double-click: Open window/app

**Explorer Grid:**
- Single-click: Selection (blue background)
- Double-click: Open file/viewer

**Implementation:**
- Use click timeout (300ms) to distinguish single vs double click
- Single-click handler: `handleSingleClick()`
- Double-click handler: `handleDoubleClick()`

### 5.5 Window Drag

**Rules:**
- Drag only from title bar
- Window cannot be dragged outside viewport (viewport boundary)
- Drag updates position in real-time (rAF-driven)
- Window maintains z-index during drag

**Implementation:**
- Pointer events on title bar only
- `windowStore.startDrag(id, x, y)`
- `windowStore.updateDrag(x, y)` in rAF loop
- `windowStore.endDrag()` on pointer up

### 5.6 Window Resize

**Rules:**
- Resize handles on window edges (if implemented)
- Window cannot be resized outside viewport
- Minimum size: title bar + minimal content

**Implementation:**
- Resize handles (if implemented)
- Boundary enforcement
- Real-time size updates

## 6. Typography

### 6.1 Font Stack

**Primary (OSS-first approach):**
- `"Liberation Sans"` (OSS, SIL OFL-1.1) — primary OSS font, metric-compatible with MS Sans Serif
- `"Noto Sans"` (OSS, OFL-1.1) — fallback OSS font
- `"MS Sans Serif"` (system font, if available)
- `"Tahoma"` (system font, if available)
- `system-ui, -apple-system, sans-serif` (modern system fallback)
- `sans-serif` (generic fallback)

**Implementation:**
- Fonts loaded via Google Fonts CDN in `front/src/styles/_fonts.scss`
- Font stack defined in CSS variable `--font-family` in theme files
- See: `front/src/styles/themes/_win95-default.scss`

**Monospace (Notepad):**
- `"Courier New", monospace`

**Font Rendering:**
- `-webkit-font-smoothing: none` (disable anti-aliasing for pixel-perfect look)
- `font-smooth: never` (disable font smoothing)
- `text-rendering: optimizeSpeed` (pixelated appearance, but not globally aggressive to preserve readability)
- Applied to `body` element in `front/src/styles/index.scss`

### 6.2 Font Sizes

- **Small:** 10px (0.625rem) — tooltips, small labels, tree expand icons
- **Normal:** 11px (0.688rem) — default text, buttons, inputs, desktop icon labels
- **Medium:** 12px (0.75rem) — title bar, menu items, status bar
- **Large:** 14px (0.875rem) — headings (if needed)

### 6.3 Font Weights

- **Normal:** `normal` (400) — default text
- **Bold:** `bold` (700) — title bar, emphasis

### 6.4 Line Heights

- **Tight:** 1.2 — icons, compact layouts
- **Normal:** 1.4 — default text
- **Relaxed:** 1.6 — readable text (Notepad, long content)

### 6.5 Letter Spacing

- **Title Bar:** 0.5px (0.0313rem) — for bold text in title bar
- **Default:** 0 — normal text

**Implementation:**
- CSS variables: `--letter-spacing-default: 0`, `--letter-spacing-titlebar: 0.0313rem`
- Used in `window-titlebar` mixin via `var(--letter-spacing-titlebar)`
- See: `front/src/styles/themes/_win95-default.scss`, `front/src/styles/_mixins.scss`

## 7. Spacing

- **XS:** 2px (0.125rem) — minimal spacing
- **SM:** 4px (0.25rem) — small spacing
- **MD:** 8px (0.5rem) — medium spacing
- **LG:** 12px (0.75rem) — large spacing
- **XL:** 16px (1rem) — extra large spacing

## 8. Z-Index Layers

- **Desktop:** 1
- **Window (inactive):** 10
- **Window (active):** 20
- **Taskbar:** 10000
- **Modal:** 10001

## 9. Open-Source Constraint

**CRITICAL:** This contract is built from visual analysis and open-source research. **NO Windows assets, source code, or ripped resources are used.**

### Allowed Sources

✅ **Allowed:**
- Visual measurements from screenshots (reference-only)
- Open-source fonts (system fonts, Tahoma fallback)
- Open-source icons (custom implementations or OSS icon sets with proper licenses)
- Custom implementations based on measurements

### Prohibited Sources

❌ **Prohibited:**
- Windows 95 source code or leaked source files
- Ripped Windows 95 fonts (MS Sans Serif original)
- Ripped Windows 95 icons/bitmaps
- Windows 95 resource files (.res, .dll resources)
- Any copyrighted Windows assets

### Font Alternatives

Since we cannot use MS Sans Serif, we use:
- **Liberation Sans** (OSS, SIL OFL-1.1) — primary OSS font, metric-compatible with MS Sans Serif, loaded via Google Fonts CDN
- **Noto Sans** (OSS, OFL-1.1) — fallback OSS font, loaded via Google Fonts CDN
- System sans-serif fonts (`system-ui, -apple-system, sans-serif`) — modern system fallback
- Tahoma (if available on system)
- Courier New for monospace (Notepad)

**Implementation:**
- Fonts loaded in `front/src/styles/_fonts.scss` via `@import url()` from Google Fonts CDN
- Font stack: `"Liberation Sans", "Noto Sans", "MS Sans Serif", "Tahoma", system-ui, -apple-system, sans-serif`
- See: `front/src/styles/themes/_win95-default.scss` for CSS variable definition

### Icon Alternatives

- Custom SVG/PNG icons designed to match Win95 style
- Open-source icon sets with Win95-style alternatives
- Bitmap-style icons created from scratch

## 10. References

- **WIN95_SPEC.md:** Complete Windows 95 UI specification
- **WIN95_TOKENS_RULES.md:** Token rules and anti-patterns
- **THEME_CONTRACT.md:** Theme system contract
- **GUIDE_STYLE.md:** Style guide rules
- **FP7.md:** Feature Pack 7 contract
- **Visual References:** `docs/design/references/screenshots/` (reference-only, not assets)

## Version History

- **v1.0 (2026-01-22):** Initial contract based on visual analysis and open-source research
