# Windows 95 UI Specification

**Version:** 1.0  
**Created:** 2026-01-22  
**Purpose:** Complete specification for Windows 95 UI implementation  
**Status:** Design Phase (FP7)  
**Source:** Visual references from `docs/design/references/screenshots/` and open-source research

> **⚠️ OPEN-SOURCE CONSTRAINT:** This specification is built from measurements and observations of Windows 95 screenshots and open-source references. **NO Windows assets, source code, or ripped resources are used.** All fonts, icons, and visual elements must be open-source alternatives or custom implementations.

## Overview

This specification defines the complete design system for Windows 95-style UI, including typography, colors, metrics, states, and component rules. All values are derived from visual analysis of reference screenshots and open-source research, not from Windows source code.

## Rendering

### Image Rendering

**Pixelated Assets (Icons, Pixel Art):**
- `image-rendering: pixelated` (or `crisp-edges` for browser compatibility)
- Applied to `.icon` class and `.pixelated-asset` class
- See: `front/src/styles/_icons.scss`

**Regular Images:**
- `image-rendering: auto` — for photos and regular images
- See: `front/src/styles/_components.scss` (`.viewer-image`)

### Text Rendering

**Font Smoothing:**
- `-webkit-font-smoothing: none` — disable anti-aliasing for pixel-perfect look
- `font-smooth: never` — disable font smoothing
- `text-rendering: optimizeSpeed` — pixelated appearance, but not globally aggressive to preserve readability
- Applied to `body` element in `front/src/styles/index.scss`

**Note:** Font rendering settings are applied globally but can be overridden if readability issues occur in specific browsers. Test in Chrome, Firefox, and Safari.

## Typography

### Font Stack

**Primary Font Stack (OSS-first approach):**
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
- `"Courier New", monospace` — for monospace contexts

**Font Rendering:**
- `-webkit-font-smoothing: none` (disable anti-aliasing for pixel-perfect look)
- `font-smooth: never` (disable font smoothing)
- `text-rendering: optimizeSpeed` (pixelated appearance, but not globally aggressive to preserve readability)
- Applied to `body` element, but can be overridden if readability issues occur in specific browsers

### Font Sizes

| Size | Value | Usage |
|------|-------|-------|
| Small | 10px (0.625rem) | Tooltips, small labels, tree expand icons |
| Normal | 11px (0.688rem) | Default text, buttons, inputs, desktop icon labels |
| Medium | 12px (0.75rem) | Title bar, menu items, status bar |
| Large | 14px (0.875rem) | Headings (if needed) |

### Font Weights

- **Normal:** `normal` (400) — default text
- **Bold:** `bold` (700) — title bar, emphasis

### Line Heights

- **Tight:** 1.2 — icons, compact layouts
- **Normal:** 1.4 — default text
- **Relaxed:** 1.6 — readable text (Notepad, long content)

### Letter Spacing

- **Title Bar:** 0.5px (0.0313rem) — for bold text in title bar
- **Default:** 0 — normal text

**Implementation:**
- CSS variables: `--letter-spacing-default: 0`, `--letter-spacing-titlebar: 0.0313rem`
- See: `front/src/styles/themes/_win95-default.scss`

## Color Tokens

### Base Grays (Chicago95 Palette)

| Token | Value | Usage |
|-------|-------|-------|
| `gray` | `#c0c0c0` | Main window background |
| `grayLight` | `#dfdfdf` | Top/left borders (raised), highlights |
| `grayDark` | `#808080` | Bottom/right borders (sunken), shadows |
| `grayDarker` | `#404040` | Deepest shadows, inner borders |

### System Colors

| Token | Value | Usage |
|-------|-------|-------|
| `white` | `#ffffff` | Text on dark, top/left highlights, input backgrounds |
| `black` | `#000000` | Text, outer borders, shadows |

### Accent Colors

| Token | Value | Usage |
|-------|-------|-------|
| `blue` | `#000080` | Title bar background (start gradient) |
| `blueLight` | `#1084d0` | Title bar background (end gradient) |
| `teal` | `#008080` | Desktop background (classic dithered pattern) |
| `red` | `#ff0000` | Error states, close button hover |
| `yellow` | `#ffff00` | Tooltips, highlights |

### Text Colors

| Token | Value | Usage |
|-------|-------|-------|
| `text` | `#000000` | Default text on light backgrounds |
| `textInverse` | `#ffffff` | Text on dark backgrounds (title bar, selected items) |
| `textDisabled` | `#808080` | Disabled text (with text-shadow for "engraved" effect) |

### Selection Colors

| Token | Value | Usage |
|-------|-------|-------|
| `selection` | `#000080` (blue) | Selected items background (tree, list, desktop icons) |
| `selectionText` | `#ffffff` (white) | Selected items text |

### Title Bar Colors (Active/Inactive)

| State | Background | Text |
|-------|-----------|------|
| **Active** | Linear gradient: `#000080` → `#1084d0` | `#ffffff` |
| **Inactive** | `#c0c0c0` (gray) | `#000000` |

## Metrics

### Window Dimensions

| Metric | Value | Usage |
|--------|-------|-------|
| **Title Bar Height** | 20px (1.25rem) | Window title bar |
| **Title Bar Padding** | 2px 4px (0.125rem 0.25rem) | Internal padding |
| **Title Bar Margin** | 2px (0.125rem) | Margin from window edge |
| **Border Thickness** | 1px (0.0625rem) | Window frame borders |
| **Window Control Button Size** | 18x18px (1.125rem) | Minimize, maximize, close buttons |
| **Window Control Button Gap** | 2px (0.125rem) | Gap between control buttons |

### Taskbar Dimensions

| Metric | Value | Usage |
|--------|-------|-------|
| **Taskbar Height** | 40px (2.5rem) | Taskbar bar height |
| **Taskbar Padding** | 0 8px (0 0.5rem) | Horizontal padding |
| **Tray Gap** | 8px (0.5rem) | Gap between tray items |
| **Tray Icon Size** | 24x24px (1.5rem) | Tray icon size |

### Desktop Icons

| Metric | Value | Usage |
|--------|-------|-------|
| **Icon Size** | 48x48px (3rem) | Desktop icon container |
| **Icon Label Max Width** | 64px (4rem) | Maximum label width |
| **Grid Column Gap** | 8px (0.5rem) | Horizontal gap between icons |
| **Grid Row Gap** | 16px (1rem) | Vertical gap between icons |
| **Icon Padding** | 8px (0.5rem) | Padding around icon+label |

### Menu Bar

| Metric | Value | Usage |
|--------|-------|-------|
| **Menu Bar Height** | 20px (1.25rem) | Menu bar height (if implemented) |
| **Menu Item Padding** | 4px 8px (0.25rem 0.5rem) | Menu item padding |

### Status Bar

| Metric | Value | Usage |
|--------|-------|-------|
| **Status Bar Height** | 20px (1.25rem) | Status bar height (Explorer) |
| **Status Bar Padding** | 2px 4px (0.125rem 0.25rem) | Status bar padding |

### Scrollbar

| Metric | Value | Usage |
|--------|-------|-------|
| **Scrollbar Width** | 16px (1rem) | Vertical scrollbar width |
| **Scrollbar Thumb Min Height** | 20px (1.25rem) | Minimum thumb height |
| **Scrollbar Button Size** | 16x16px (1rem) | Up/down arrow button size |

### Explorer

For full Explorer window fidelity (menubar, toolbar, address bar, split panes, content view, tree), see **[EXPLORER_UI_CONTRACT.md](./EXPLORER_UI_CONTRACT.md)**.

| Metric | Value | Usage |
|--------|-------|-------|
| **Divider Width** | 4px (0.25rem) | Divider between tree and grid |
| **Tree Width** | 200px (12.5rem) | Default tree view width |
| **Tree Min Width** | 150px (9.375rem) | Minimum tree width |
| **Tree Max Width** | 400px (25rem) | Maximum tree width |
| **Grid Item Width** | 64px (4rem) | Grid view item width |
| **Grid Item Icon Size** | 32px (2rem) | Grid view icon size |

### Buttons

| Metric | Value | Usage |
|--------|-------|-------|
| **Button Padding** | 4px 12px (0.25rem 0.75rem) | Default button padding |
| **Button Min Width** | 20px (1.25rem) | Minimum button width |
| **Button Border** | 1px (0.0625rem) | Button border thickness |

### Input Fields

| Metric | Value | Usage |
|--------|-------|-------|
| **Input Padding** | 4px 6px (0.25rem 0.375rem) | Text input padding |
| **Input Border** | 1px (0.0625rem) | Input border thickness |

### Spacing

| Token | Value | Usage |
|-------|-------|-------|
| `xs` | 2px (0.125rem) | Minimal spacing |
| `sm` | 4px (0.25rem) | Small spacing |
| `md` | 8px (0.5rem) | Medium spacing |
| `lg` | 12px (0.75rem) | Large spacing |
| `xl` | 16px (1rem) | Extra large spacing |

## State Rules

### Window States

#### Active Window

- **Title Bar:**
  - Background: Linear gradient from `#000080` to `#1084d0`
  - Text: `#ffffff` (white)
  - Font: Bold, 12px
- **Border:** 3D bevel (top/left light, bottom/right dark)
- **Z-Index:** `20` (higher than inactive windows)

#### Inactive Window

- **Title Bar:**
  - Background: `#c0c0c0` (gray)
  - Text: `#000000` (black)
  - Font: Bold, 12px
- **Border:** 3D bevel (same as active, but less prominent)
- **Z-Index:** `10` (lower than active windows)

### Button States

#### Default (Outset)

- **Border:** Top/left `#ffffff`, bottom/right `#000000`
- **Shadow:** `1px 1px 0 #000000, inset -1px -1px 0 #808080`
- **Background:** `#c0c0c0`
- **Text:** `#000000`
- **Cursor:** `pointer`

#### Active (Pressed)

- **Border:** Inverted (top/left `#000000`, bottom/right `#ffffff`)
- **Shadow:** None
- **Transform:** `translate(1px, 1px)` (pressed effect)
- **Background:** `#c0c0c0`

#### Hover (Optional)

- **Background:** Slightly lighter gray (optional enhancement)
- **Close Button Hover:** Background `#ff0000`, text `#ffffff`

#### Disabled

- **Color:** `#808080` (gray)
- **Text Shadow:** `1px 1px #ffffff` (engraved effect)
- **Cursor:** `not-allowed`
- **Border:** Same as default, but muted

### Selection States

#### Focused Selection

- **Background:** `#000080` (blue)
- **Text:** `#ffffff` (white)
- **Border:** None (or subtle outline)

#### Unfocused Selection

- **Background:** `#c0c0c0` (gray) — or same as focused (Win95 behavior)
- **Text:** `#000000` (black) — or same as focused (Win95 behavior)

**Note:** Windows 95 typically shows selection in blue even when unfocused, but some contexts (like desktop icons) show gray selection when unfocused.

### Input Field States

#### Default (Inset)

- **Border:** Top/left `#808080`, bottom/right `#ffffff`
- **Shadow:** `inset 1px 1px 0 #000000`
- **Background:** `#ffffff`
- **Text:** `#000000`

#### Focused

- **Border:** Same as default (no visual change in Win95)
- **Cursor:** Text cursor

#### Disabled

- **Background:** `#c0c0c0` (gray)
- **Text:** `#808080` (gray)
- **Cursor:** `not-allowed`

### Scrollbar States

#### Default

- **Track:** `#c0c0c0` (gray)
- **Thumb:** 3D bevel (outset)
- **Buttons:** 3D bevel (outset), up/down arrows

#### Hover (Optional)

- **Thumb:** Slightly darker gray (optional enhancement)

#### Active (Dragging)

- **Thumb:** Inset bevel (pressed effect)

## 3D Bevel Rules

### Inset (Sunken Panel)

**Border:**
- Top: `1px solid #808080` (grayDark)
- Left: `1px solid #808080` (grayDark)
- Right: `1px solid #ffffff` (white)
- Bottom: `1px solid #ffffff` (white)

**Shadow:**
- `inset 1px 1px 0 #000000` (black inner shadow)

**Usage:** Input fields, sunken panels, explorer tree/grid containers

### Outset (Raised Panel)

**Border:**
- Top: `1px solid #ffffff` (white)
- Left: `1px solid #ffffff` (white)
- Right: `1px solid #808080` (grayDark)
- Bottom: `1px solid #808080` (grayDark)

**Shadow:**
- `1px 1px 0 #000000` (black outer shadow)

**Usage:** Buttons, desktop icons, raised panels

### Window Frame (3D Window)

**Outer Border:**
- `1px solid #000000` (black)

**Inner Bevel:**
- Top/left: `1px solid #dfdfdf` (grayLight)
- Bottom/right: `1px solid #808080` (grayDark)

**Shadow:**
- `1px 1px 0 #000000` (black outer shadow)
- `inset 1px 1px #ffffff` (white inner highlight)
- `inset -1px -1px #404040` (grayDarker inner shadow)

**Usage:** Window borders

## Z-Index Layers

| Layer | Value | Usage |
|-------|-------|-------|
| Desktop | 1 | Desktop background |
| Window | 10 | Base window z-index (inactive) |
| Window Focused | 20 | Focused window (higher) |
| Taskbar | 10000 | Taskbar (always on top) |
| Modal | 10001 | Modal overlays (above taskbar) |

## Open-Source Constraint Note

**CRITICAL:** This specification is built from visual analysis and open-source research. **NO Windows assets, source code, or ripped resources are used.**

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

### Implementation Notes

- All colors are measured from screenshots and documented
- All metrics are measured from screenshots and documented
- All states are observed from screenshots and documented
- No reverse engineering of Windows code is used

## Inspiration (OSS + Visual References)

We do not copy Windows assets or source code. We implement our own tokens, mixins, and components based on visual analysis and open-source references.

| Reference | URL | Purpose |
|-----------|-----|---------|
| 98.css | https://jdan.github.io/98.css/ | Win98-inspired CSS library — design inspiration |
| GuidebookGallery Win95 GUI | https://guidebookgallery.org/guis/windows/win95 | Historical reference |
| GuidebookGallery Win95 Tutorial | https://guidebookgallery.org/tutorials/windows95 | Historical reference |
| GuidebookGallery Win95 Screenshots | https://guidebookgallery.org/screenshots/win95 | Historical reference |

## References

- **Visual References:** `docs/design/references/screenshots/` (reference-only, not assets)
- **Token Rules:** `docs/design/WIN95_TOKENS_RULES.md`
- **UI Kit Requirements:** `docs/design/WIN95_UI_KIT.md`
- **Style Guide:** `docs/style/GUIDE_STYLE.md`
- **Explorer UI Contract:** `docs/style/EXPLORER_UI_CONTRACT.md`
- **Theme Contract:** `docs/style/THEME_CONTRACT.md`
- **FP7 Contract:** `docs/fps/FP7.md`

## Version History

- **v1.0 (2026-01-22):** Initial specification based on visual analysis and open-source research
