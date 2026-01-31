# Inline Styles Inventory

**Date:** 2024-12-19  
**Scope:** All `.tsx` and `.jsx` files in `front/src/`  
**Total Files with Inline Styles:** 25  
**Total Inline Style Occurrences:** ~281

## Classification System

- **Type A:** Layout/Spacing (display, flex, grid, gap, padding, margin, width, height)
- **Type B:** Colors/Borders/Typography (backgroundColor, color, border, fontSize, fontWeight)
- **Type C:** Z-index/Position Fixed/Absolute (position, zIndex, fixed/absolute positioning)
- **Type D:** Computed Geometry (drag/resize) → **WHITELIST CANDIDATE**

---

## Subsystem: Windowing

### `front/src/os/wm/WindowFrame.tsx`
**Component:** WindowFrame  
**Lines:** 71-84, 89, 109

| Line | Type | Style Properties | Notes |
|------|------|-----------------|-------|
| 71-84 | C+D | `position: absolute`, `left: 0`, `top: 0`, `transform: translate3d(${state.x}px, ${state.y}px, 0)`, `zIndex`, `width`, `display: flex`, `flexDirection: column`, `minWidth`, `maxWidth`, `maxHeight`, `boxShadow` | **WHITELIST:** transform for drag |
| 89 | C | `cursor: grabbing/grab`, `touchAction: none` | Dynamic cursor |
| 109 | A | `padding: "0"`, `flex: 1`, `overflow: hidden`, `display: flex`, `flexDirection: column` | Content container |

**Migration Priority:** Medium (whitelist transform, migrate rest)

---

### `front/src/os/wm/WindowManager.tsx`
**Component:** WindowManager  
**Lines:** 19-28, 54

| Line | Type | Style Properties | Notes |
|------|------|-----------------|-------|
| 19-28 | C | `position: fixed`, `top: 0`, `left: 0`, `right: 0`, `bottom: 0`, `zIndex: 9999`, `backgroundColor: transparent`, `pointerEvents: auto` | Drag overlay - **WHITELIST CANDIDATE** |
| 54 | A | `padding: isGame ? 0 : '12px'`, `height: '100%'`, `overflow: hidden`, `display: flex`, `flexDirection: column` | Content wrapper |

**Migration Priority:** Low (overlay can stay, migrate content wrapper)

---

## Subsystem: Explorer

### `front/src/components/ExplorerWindow.tsx`
**Component:** ExplorerWindow  
**Lines:** 33-43, 46, 48, 156, 161-168, 180, 182-184, 190-191, 215-221, 223-224, 232

| Line | Type | Style Properties | Notes |
|------|------|-----------------|-------|
| 33-43 | A+B | `padding`, `paddingLeft: ${4 + level * 16}px`, `cursor`, `backgroundColor`, `color`, `fontSize`, `display: flex`, `alignItems`, `gap` | Tree item - **computed paddingLeft** |
| 46 | B | `fontSize: '10px'` | Expand icon |
| 48 | A | `width: '10px'` | Spacer |
| 156 | A | `display: 'flex'`, `height: '100%'`, `gap: '4px'` | Main container |
| 161-168 | A+B | `width: '200px'`, `minWidth`, `backgroundColor`, `overflow`, `padding`, `border` | Tree panel |
| 180 | A | `display: 'flex'`, `flexDirection: column`, `flex: 1`, `gap: '4px'` | Grid container |
| 182 | A+B | `display: 'flex'`, `gap`, `padding`, `backgroundColor` | Toolbar |
| 183 | A | `minWidth: '30px'` | Up button |
| 184 | A+B | `flex: 1`, `padding`, `border` | Path display |
| 190-191 | A+B | `flex: 1`, `backgroundColor`, `overflow`, `padding` | Grid view container |
| 191 | A | `display: 'grid'`, `gridTemplateColumns: 'repeat(auto-fill, minmax(64px, 1fr))'`, `gap` | Grid layout |
| 215-221 | A | `display: 'flex'`, `flexDirection: column`, `alignItems: center`, `cursor`, `textAlign` | Grid item |
| 223 | B | `fontSize: '24px'`, `marginBottom` | Icon |
| 224 | B | `fontSize: '11px'`, `wordBreak` | Filename |
| 232 | A+B | `marginTop`, `fontSize`, `color` | Status bar |

**Migration Priority:** High (many layout styles, can be migrated to CSS classes)

---

## Subsystem: Desktop

### `front/src/pages/DesktopPage.tsx`
**Component:** DesktopPage  
**Lines:** 101-108, 113-124

| Line | Type | Style Properties | Notes |
|------|------|-----------------|-------|
| 101-108 | A+B | `width: 100vw`, `height: 100vh`, `backgroundColor: #008080`, `backgroundImage`, `position: relative`, `overflow: hidden` | Desktop background |
| 113-124 | A+C | `display: grid`, `gridTemplateColumns`, `gap`, `padding`, `position: absolute`, `top: 0`, `left: 0`, `right: 0`, `bottom: 0`, `zIndex: 1` | Icons grid |

**Migration Priority:** High (desktop background and grid can use CSS)

---

### `front/src/components/DesktopIcon.tsx`
**Component:** DesktopIcon  
**Lines:** 15-22, 28-37, 41, 46-58

| Line | Type | Style Properties | Notes |
|------|------|-----------------|-------|
| 15-22 | A | `display: flex`, `flexDirection: column`, `alignItems: center`, `cursor`, `padding`, `position: relative` | Icon container |
| 28-37 | A+B | `width: 48px`, `height: 48px`, `display: flex`, `alignItems`, `justifyContent`, `backgroundColor`, `border`, `marginBottom` | Icon box |
| 41 | B | `fontSize: 11px`, `textAlign: center`, `maxWidth: 64px` | Label |
| 46-58 | A+B+C | `position: absolute`, `bottom: 100%`, `left: 50%`, `transform: translateX(-50%)`, `marginBottom`, `padding`, `backgroundColor`, `border`, `fontSize`, `whiteSpace`, `zIndex: 1000` | Tooltip - **WHITELIST CANDIDATE** (transform for centering) |

**Migration Priority:** Medium (tooltip transform can stay, rest migrate)

---

## Subsystem: Taskbar

### `front/src/os/taskbar/Taskbar.tsx`
**Component:** Taskbar  
**Lines:** 42-56, 58, 62-67, 73-89, 97-103

| Line | Type | Style Properties | Notes |
|------|------|-----------------|-------|
| 42-56 | A+B+C | `position: fixed`, `bottom: 0`, `left: 0`, `right: 0`, `height: ${taskbar.height}px`, `backgroundColor`, `borderTop`, `borderBottom`, `zIndex`, `display: flex`, `alignItems`, `padding`, `boxSizing` | Taskbar - **WHITELIST CANDIDATE** (fixed position) |
| 58 | A | `flex: 1` | Window list area |
| 62-67 | A | `display: flex`, `gap: ${taskbar.tray.gap}px`, `alignItems`, `padding` | Tray container |
| 73-89 | A+B | `width`, `height`, `cursor`, `display: flex`, `alignItems`, `justifyContent`, `backgroundColor`, `border`, `borderTopColor`, `borderLeftColor`, `borderRightColor`, `borderBottomColor`, `boxShadow`, `fontSize`, `userSelect` | User icon button |
| 97-103 | B | `fontSize`, `color`, `padding`, `fontFamily`, `userSelect` | Clock |

**Migration Priority:** Low (taskbar fixed position can stay, migrate styling)

---

## Subsystem: Viewers

### `front/src/os/apps/ImageViewer.tsx`
**Component:** ImageViewer  
**Lines:** 75-82, 90-94, 102-106, 113-122, 126-131

| Line | Type | Style Properties | Notes |
|------|------|-----------------|-------|
| 75-82 | A+B | `width: 100%`, `height: 100%`, `display: flex`, `justifyContent: center`, `alignItems: center`, `backgroundColor` | Loading state |
| 90-94 | A+B | `padding`, `color`, `backgroundColor` | Error state |
| 102-106 | A+B | `padding`, `color`, `backgroundColor` | Empty state |
| 113-122 | A+B | `width: 100%`, `height: 100%`, `display: flex`, `justifyContent: center`, `alignItems: center`, `backgroundColor`, `overflow`, `padding` | Image container |
| 126-131 | A | `maxWidth: 100%`, `maxHeight: 100%`, `objectFit: contain`, `imageRendering` | Image element |

**Migration Priority:** High (all can be migrated to CSS classes)

---

### `front/src/os/apps/VideoViewer.tsx`
**Component:** VideoViewer  
**Lines:** 74-81, 89-93, 101-105, 112-120, 124-130

| Line | Type | Style Properties | Notes |
|------|------|-----------------|-------|
| 74-81 | A+B | `width: 100%`, `height: 100%`, `display: flex`, `justifyContent: center`, `alignItems: center`, `backgroundColor` | Loading state |
| 89-93 | A+B | `padding`, `color`, `backgroundColor` | Error state |
| 101-105 | A+B | `padding`, `color`, `backgroundColor` | Empty state |
| 112-120 | A+B | `width: 100%`, `height: 100%`, `display: flex`, `justifyContent: center`, `alignItems: center`, `backgroundColor`, `padding` | Video container |
| 124-130 | A | `maxWidth: 100%`, `maxHeight: 100%`, `width: 100%`, `height: 100%`, `objectFit: contain` | Video element |

**Migration Priority:** High (all can be migrated to CSS classes)

---

### `front/src/os/apps/Notepad.tsx`
**Component:** Notepad  
**Lines:** 126-133, 141-145, 152-158, 162-170, 179-191

| Line | Type | Style Properties | Notes |
|------|------|-----------------|-------|
| 126-133 | A+B | `width: 100%`, `height: 100%`, `display: flex`, `justifyContent: center`, `alignItems: center`, `backgroundColor` | Loading state |
| 141-145 | A+B | `padding`, `color`, `backgroundColor` | Error state |
| 152-158 | A+B | `width: 100%`, `height: 100%`, `display: flex`, `flexDirection: column`, `backgroundColor` | Container |
| 162-170 | A+B | `flex: 1`, `padding`, `overflow`, `fontFamily`, `fontSize`, `lineHeight`, `color` | Markdown preview |
| 179-191 | A+B | `flex: 1`, `padding`, `border: none`, `outline: none`, `fontFamily`, `fontSize`, `lineHeight`, `color`, `backgroundColor`, `resize`, `overflow` | Textarea |

**Migration Priority:** High (all can be migrated to CSS classes)

---

### `front/src/os/apps/InternetExplorer.tsx`
**Component:** InternetExplorer  
**Lines:** 81-88, 96-100, 108-112, 128-133, 138-143

| Line | Type | Style Properties | Notes |
|------|------|-----------------|-------|
| 81-88 | A+B | `width: 100%`, `height: 100%`, `display: flex`, `justifyContent: center`, `alignItems: center`, `backgroundColor` | Loading state |
| 96-100 | A+B | `padding`, `color`, `backgroundColor` | Error state |
| 108-112 | A+B | `padding`, `color`, `backgroundColor` | Empty state |
| 128-133 | A+B | `width: 100%`, `height: 100%`, `position: relative`, `backgroundColor` | Container |
| 138-143 | A | `width: 100%`, `height: 100%`, `border: none`, `display` | Iframe |

**Migration Priority:** High (all can be migrated to CSS classes)

---

### `front/src/os/apps/AppHost.tsx`
**Component:** AppHost  
**Lines:** 24, 27-38, 45, 53-59

| Line | Type | Style Properties | Notes |
|------|------|-----------------|-------|
| 24 | A | `width: 100%`, `height: 100%`, `position: relative`, `display: flex`, `flexDirection: column` | Container |
| 27-38 | A+B+C | `position: absolute`, `top: 0`, `left: 0`, `width: 100%`, `height: 100%`, `display: flex`, `justifyContent: center`, `alignItems: center`, `backgroundColor`, `zIndex: 1` | Loading overlay |
| 45 | A+B | `padding`, `color` | Error state |
| 53-59 | A | `flex: 1`, `border: none`, `width: 100%`, `height: 100%`, `display` | Iframe |

**Migration Priority:** High (all can be migrated to CSS classes)

---

## Subsystem: Auth/Tray/User Panel

### `front/src/os/apps/UserPanelApp.tsx`
**Component:** UserPanelApp  
**Lines:** 35-41, 45-58, 60, 65, 68, 72, 78, 86-90, 97-100, 111-114

| Line | Type | Style Properties | Notes |
|------|------|-----------------|-------|
| 35-41 | A | `display: flex`, `flexDirection: column`, `gap`, `padding`, `minHeight` | Container |
| 45-58 | A+B | `display: flex`, `flexDirection: column`, `gap`, `padding`, `borderTop`, `borderLeft`, `borderRight`, `borderBottom`, `boxShadow`, `backgroundColor` | User info section |
| 60 | B | `fontSize`, `fontWeight` | Title |
| 65, 68, 72 | B | `fontSize` | User info fields |
| 78 | B | `fontSize`, `color` | Not logged in |
| 86-90 | A | `display: flex`, `flexDirection: column`, `gap` | Actions section |
| 97-100, 111-114 | A | `...buttons.default`, `alignSelf` | Buttons (spread from tokens) |

**Migration Priority:** Medium (uses tokens, can migrate to CSS classes)

---

### `front/src/components/Header.tsx`
**Component:** Header  
**Lines:** 14-26, 28, 30, 34, 39-48, 57, 71

| Line | Type | Style Properties | Notes |
|------|------|-----------------|-------|
| 14-26 | A+B+C | `position: fixed`, `top: 0`, `left: 0`, `right: 0`, `zIndex: 100`, `backgroundColor`, `borderBottom`, `padding`, `display: flex`, `justifyContent`, `alignItems` | Header - **WHITELIST CANDIDATE** (fixed position) |
| 28 | A | `display: flex`, `gap`, `alignItems` | Button container |
| 30 | A+C | `position: relative` | User menu container |
| 34 | A | `minWidth` | Button |
| 39-48 | A+C | `position: absolute`, `top: 100%`, `left: 0`, `marginTop`, `minWidth`, `zIndex` | Dropdown menu |
| 57 | A | `width: 100%` | Logout button |
| 71 | A | `height: 40px` | Spacer |

**Migration Priority:** Low (fixed header can stay, migrate styling)

---

## Subsystem: Mobile

### `front/src/pages/MobilePage.tsx`
**Component:** MobilePage  
**Lines:** 38-45, 49-56, 58, 65, 74-82, 93, 104-111, 127

| Line | Type | Style Properties | Notes |
|------|------|-----------------|-------|
| 38-45 | A+B | `width: 100vw`, `height: 100vh`, `backgroundColor`, `display: flex`, `flexDirection: column`, `position: relative` | Container |
| 49-56 | A+B | `backgroundColor`, `borderBottom`, `padding`, `display: flex`, `justifyContent`, `alignItems` | Header |
| 58 | B | `fontSize`, `fontWeight` | Date |
| 65 | A | `padding` | Menu button |
| 74-82 | A+B+C | `position: absolute`, `top: 40px`, `right: 8px`, `backgroundColor`, `border`, `zIndex: 1000`, `minWidth` | Burger menu |
| 93 | A+B | `display: block`, `width: 100%`, `textAlign: left`, `padding` | Menu item |
| 104-111 | A | `display: grid`, `gridTemplateColumns: repeat(3, 1fr)`, `gap`, `padding`, `flex: 1`, `overflow` | Icons grid |
| 127 | A | `flex: 1`, `position: relative` | Window container |

**Migration Priority:** Medium (mobile-specific, can migrate to CSS classes)

---

### `front/src/os/MobileShell.tsx`
**Component:** MobileShell  
**Lines:** 11

| Line | Type | Style Properties | Notes |
|------|------|-----------------|-------|
| 11 | A+B | `padding: 20`, `textAlign: center`, `color: white`, `background: #000`, `height: 100vh` | Stub component |

**Migration Priority:** Low (stub, will be replaced in FP8)

---

## Subsystem: Components

### `front/src/components/GameWindow.tsx`
**Component:** GameWindow  
**Lines:** 48, 56, 57, 64, 71

| Line | Type | Style Properties | Notes |
|------|------|-----------------|-------|
| 48 | A | `display: flex`, `justifyContent: center`, `padding` | Loading state |
| 56 | A | `padding` | Error container |
| 57 | B | `color` | Error text |
| 64 | A | `padding` | Empty state |
| 71 | A | `width: 100%`, `height: 600px` | Game container |

**Migration Priority:** High (all can be migrated to CSS classes)

---

### `front/src/components/HelpWindow.tsx`
**Component:** HelpWindow  
**Lines:** 29, 37, 38, 49, 51, 55, 62-69

| Line | Type | Style Properties | Notes |
|------|------|-----------------|-------|
| 29 | A | `display: flex`, `justifyContent: center`, `padding` | Loading state |
| 37 | A | `padding` | Error container |
| 38 | B | `color` | Error text |
| 49 | B | `fontSize`, `fontWeight`, `margin` | H1 |
| 51 | B | `fontSize`, `fontWeight`, `margin` | H2 |
| 55 | B | `margin`, `fontSize` | P |
| 62-69 | A+B | `padding`, `fontFamily`, `fontSize`, `whiteSpace`, `backgroundColor`, `minHeight` | Content container |

**Migration Priority:** High (all can be migrated to CSS classes)

---

### `front/src/components/LandingWindow.tsx`
**Component:** LandingWindow  
**Lines:** 46, 54, 55, 56, 65, 67, 75, 76, 84, 89, 90, 95

| Line | Type | Style Properties | Notes |
|------|------|-----------------|-------|
| 46 | A | `display: flex`, `justifyContent: center`, `padding` | Loading state |
| 54 | A | `padding` | Error container |
| 55 | B | `color` | Error text |
| 56 | A | `marginTop` | Close button |
| 65 | A | `padding` | Empty state |
| 67 | A | `marginTop` | Close button |
| 75 | A+B | `padding`, `fontSize` | Content container |
| 76 | B | `marginTop: 0`, `fontSize`, `fontWeight` | H2 |
| 84 | A | `marginTop` | Description container |
| 89 | A | `marginTop` | Registration container |
| 90 | B | `color` | Link |
| 95 | A | `marginTop` | Close button |

**Migration Priority:** High (all can be migrated to CSS classes)

---

### `front/src/components/win95/Win95Modal.tsx`
**Component:** Win95Modal  
**Lines:** 94-105, 115-119, 126, 138

| Line | Type | Style Properties | Notes |
|------|------|-----------------|-------|
| 94-105 | A+B+C | `position: fixed`, `top: 0`, `left: 0`, `right: 0`, `bottom: 0`, `backgroundColor`, `zIndex: 1000`, `display: flex`, `alignItems`, `justifyContent` | Overlay - **WHITELIST CANDIDATE** (fixed position) |
| 115-119 | C+D | `position: absolute`, `left: ${position.x}px`, `top: ${position.y}px`, `...modalStyles` | Modal - **WHITELIST CANDIDATE** (computed position for drag) |
| 126 | C | `cursor: grabbing/grab` | Titlebar |
| 138 | A | `...contentStyles` | Content (spread from computed styles) |

**Migration Priority:** Low (computed position for drag can stay, migrate styling)

---

### `front/src/components/win95/HourglassLoader.tsx`
**Component:** HourglassLoader  
**Lines:** 19-32, 35-44, 47, 61

| Line | Type | Style Properties | Notes |
|------|------|-----------------|-------|
| 19-32 | A+B+C | `display: flex`, `flexDirection: column`, `alignItems`, `justifyContent`, `width: 100%`, `height: 100%`, `background`, `border`, `position: absolute`, `top: 0`, `left: 0`, `zIndex: 10` | Container |
| 35-44 | A+B | `width: 48px`, `height: 48px`, `position: relative`, `background`, `border`, `display: flex`, `alignItems`, `justifyContent` | Hourglass container |
| 47 | A | `position: relative`, `zIndex: 1` | SVG |
| 61 | A+B | `marginTop`, `fontSize`, `color`, `fontWeight` | Loading text |

**Migration Priority:** Medium (can be migrated to CSS classes)

---

## Subsystem: Legacy

### `front/src/legacy/pages.tsx`
**Component:** Legacy pages  
**Lines:** 126-131, 136, 159-169, 176-178, 183-193, 200-208, 334-337, 338, 339, 343-352, 353, 366, 368, 370, 374, 381, 397, 417, 425, 441, 453, 470-476, 479, 562-565, 566, 567, 571-580, 581, 590, 592, 596, 603, 619, 647, 650, 653, 656, 663, 664, 669, 690-692, 694, ...

**Note:** Legacy file with extensive inline styles. Full inventory would be very long.

**Migration Priority:** Low (legacy code, consider deprecation)

---

## Whitelist Candidates (Type D - Computed Geometry)

These inline styles should remain as they compute dynamic geometry for drag/resize operations:

1. **`front/src/os/wm/WindowFrame.tsx:75`**
   - `transform: translate3d(${state.x}px, ${state.y}px, 0)`
   - **Reason:** Dynamic window position during drag

2. **`front/src/components/win95/Win95Modal.tsx:117-118`**
   - `left: ${position.x}px`, `top: ${position.y}px`
   - **Reason:** Dynamic modal position during drag

3. **`front/src/legacy/pages.tsx:128-129`**
   - `left: ${position.x}px`, `top: ${position.y}px`
   - **Reason:** Dynamic window position during drag (legacy)

4. **`front/src/components/DesktopIcon.tsx:50`**
   - `transform: translateX(-50%)`
   - **Reason:** Centering tooltip (can be CSS, but acceptable)

5. **`front/src/os/wm/WindowFrame.tsx:29`** (direct DOM manipulation)
   - `windowRef.current.style.transform = translate3d(...)`
   - **Reason:** rAF-optimized geometry updates

---

## Summary Statistics

### By Type
- **Type A (Layout/Spacing):** ~180 occurrences
- **Type B (Colors/Borders/Typography):** ~70 occurrences
- **Type C (Z-index/Position):** ~25 occurrences
- **Type D (Computed Geometry):** ~6 occurrences (whitelist)

### By Subsystem
- **Windowing:** 15 occurrences (3 whitelist)
- **Explorer:** 15 occurrences
- **Desktop:** 8 occurrences (1 whitelist)
- **Taskbar:** 5 occurrences (1 whitelist)
- **Viewers:** 35 occurrences
- **Auth/Tray/User Panel:** 12 occurrences (1 whitelist)
- **Mobile:** 9 occurrences
- **Components:** 25 occurrences (1 whitelist)
- **Legacy:** ~150+ occurrences

### Migration Complexity
- **High Priority (Easy):** Viewers, Components (HelpWindow, LandingWindow, GameWindow)
- **Medium Priority (Moderate):** Explorer, Desktop, UserPanelApp
- **Low Priority (Complex/Whitelist):** Windowing, Taskbar, Header, Win95Modal

---

## Notes

1. **Computed paddingLeft** in ExplorerWindow.tsx (line 35) uses dynamic calculation - consider CSS variable or class-based approach
2. **Spread operators** from tokens (UserPanelApp, Win95Modal) - these are already using design tokens, just need CSS classes
3. **Legacy code** has extensive inline styles - consider deprecation strategy
4. **Fixed/absolute positioning** for overlays and headers can stay inline if needed for z-index management
5. **Transform for centering** (translateX(-50%)) can be CSS, but acceptable to keep inline
