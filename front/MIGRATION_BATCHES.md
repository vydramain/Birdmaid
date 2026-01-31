# Migration Batches Plan

**Date:** 2024-12-19  
**Strategy:** Incremental migration by subsystem, starting with easiest wins  
**Goal:** Remove all inline styles except whitelisted computed geometry

---

## Batch 1: Viewers (Easy Win)

**Priority:** High  
**Complexity:** Low  
**Files:** 4  
**Estimated Effort:** 2-3 hours

### Files
- `front/src/os/apps/ImageViewer.tsx`
- `front/src/os/apps/VideoViewer.tsx`
- `front/src/os/apps/Notepad.tsx`
- `front/src/os/apps/InternetExplorer.tsx`

### Changes
- Create CSS classes for loading/error/empty states
- Create CSS classes for container layouts
- Create CSS classes for media elements (img, video, iframe, textarea)

### CSS Classes to Create
```css
/* ImageViewer, VideoViewer, Notepad, InternetExplorer */
.viewer-container { width: 100%; height: 100%; display: flex; justify-content: center; align-items: center; }
.viewer-loading { background-color: var(--win-white); }
.viewer-error { padding: 20px; color: var(--win-red); background-color: var(--win-white); }
.viewer-empty { padding: 20px; color: var(--win-gray-dark); background-color: var(--win-white); }
.viewer-content { width: 100%; height: 100%; display: flex; justify-content: center; align-items: center; }
.viewer-image-container { background-color: var(--win-gray); overflow: auto; padding: 8px; }
.viewer-video-container { background-color: var(--win-black); padding: 8px; }
.viewer-image { max-width: 100%; max-height: 100%; object-fit: contain; }
.viewer-video { max-width: 100%; max-height: 100%; width: 100%; height: 100%; object-fit: contain; }
.viewer-iframe { width: 100%; height: 100%; border: none; }
.notepad-container { width: 100%; height: 100%; display: flex; flex-direction: column; background-color: var(--win-white); }
.notepad-preview { flex: 1; padding: 8px; overflow: auto; font-family: var(--win-font); font-size: 12px; line-height: 1.5; color: var(--win-text); }
.notepad-textarea { flex: 1; padding: 8px; border: none; outline: none; font-family: var(--win-font-mono, 'Courier New', monospace); font-size: 12px; line-height: 1.5; color: var(--win-text); background-color: var(--win-white); resize: none; overflow: auto; }
```

### PR Title
`refactor(style): migrate viewers to CSS classes (Batch 1)`

---

## Batch 2: Simple Components (Easy Win)

**Priority:** High  
**Complexity:** Low  
**Files:** 3  
**Estimated Effort:** 1-2 hours

### Files
- `front/src/components/GameWindow.tsx`
- `front/src/components/HelpWindow.tsx`
- `front/src/components/LandingWindow.tsx`

### Changes
- Create CSS classes for loading/error states
- Create CSS classes for content containers
- Create CSS classes for typography (h1, h2, p)

### CSS Classes to Create
```css
/* GameWindow, HelpWindow, LandingWindow */
.window-loading { display: flex; justify-content: center; padding: 20px; }
.window-error-container { padding: 12px; }
.window-error-text { color: var(--win-red); }
.window-empty-container { padding: 12px; }
.game-container { width: 100%; height: 600px; }
.help-content { padding: 12px; font-family: monospace; font-size: 12px; white-space: pre-wrap; background-color: var(--win-white); min-height: 200px; }
.landing-content { padding: 12px; font-size: 12px; }
.help-h1 { font-size: 16px; font-weight: bold; margin: 8px 0; }
.help-h2 { font-size: 14px; font-weight: bold; margin: 6px 0; }
.help-p { margin: 4px 0; font-size: 12px; }
.landing-h2 { margin-top: 0; font-size: 16px; font-weight: bold; }
.landing-link { color: var(--win-blue); }
.landing-button-spacing { margin-top: 8px; }
.landing-button-spacing-lg { margin-top: 12px; }
```

### PR Title
`refactor(style): migrate simple components to CSS classes (Batch 2)`

---

## Batch 3: Explorer (Moderate)

**Priority:** High  
**Complexity:** Medium  
**Files:** 1  
**Estimated Effort:** 3-4 hours

### Files
- `front/src/components/ExplorerWindow.tsx`

### Changes
- Create CSS classes for tree view
- Create CSS classes for grid view
- Create CSS classes for toolbar
- Handle computed `paddingLeft` for tree indentation (CSS variable or class-based)

### CSS Classes to Create
```css
/* ExplorerWindow */
.explorer-container { display: flex; height: 100%; gap: 4px; }
.explorer-tree { width: 200px; min-width: 150px; background-color: var(--win-gray); overflow: auto; padding: 4px; border: 1px inset var(--win-gray-dark); }
.tree-item { padding: 2px 4px; cursor: pointer; font-size: 11px; display: flex; align-items: center; gap: 4px; }
.tree-item-selected { background-color: var(--win-blue); color: var(--win-white); }
.tree-item-unselected { background-color: transparent; color: var(--win-text); }
.tree-expand-icon { font-size: 10px; }
.tree-spacer { width: 10px; }
.explorer-grid-container { display: flex; flex-direction: column; flex: 1; gap: 4px; }
.explorer-toolbar { display: flex; gap: 4px; padding: 4px; background-color: var(--win-white); }
.explorer-up-button { min-width: 30px; }
.explorer-path { flex: 1; padding: 2px 4px; border: 1px solid var(--win-gray-dark); }
.explorer-grid-view { flex: 1; background-color: var(--win-white); overflow: auto; padding: 8px; }
.explorer-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(64px, 1fr)); gap: 16px; }
.explorer-grid-item { display: flex; flex-direction: column; align-items: center; cursor: pointer; text-align: center; }
.explorer-icon { font-size: 24px; margin-bottom: 4px; }
.explorer-filename { font-size: 11px; word-break: break-word; }
.explorer-status { margin-top: 4px; font-size: 11px; color: var(--win-gray-dark); }
```

### Special Handling
- Tree indentation: Use CSS variable `--tree-level` or class-based approach (`.tree-level-0`, `.tree-level-1`, etc.)

### PR Title
`refactor(style): migrate ExplorerWindow to CSS classes (Batch 3)`

---

## Batch 4: Desktop (Moderate)

**Priority:** High  
**Complexity:** Medium  
**Files:** 2  
**Estimated Effort:** 2-3 hours

### Files
- `front/src/pages/DesktopPage.tsx`
- `front/src/components/DesktopIcon.tsx`

### Changes
- Create CSS classes for desktop background
- Create CSS classes for icons grid
- Create CSS classes for desktop icon and tooltip
- Keep tooltip `transform: translateX(-50%)` inline (acceptable)

### CSS Classes to Create
```css
/* DesktopPage */
.desktop-background { width: 100vw; height: 100vh; background-color: #008080; background-image: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,.03) 2px, rgba(0,0,0,.03) 4px); position: relative; overflow: hidden; }
.desktop-icons-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap: 16px; padding: 16px; position: absolute; top: 0; left: 0; right: 0; bottom: 0; z-index: 1; }

/* DesktopIcon */
.desktop-icon-container { display: flex; flex-direction: column; align-items: center; cursor: pointer; padding: 8px; position: relative; }
.desktop-icon-box { width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; background-color: var(--win-gray); border: 2px outset var(--win-gray-light); margin-bottom: 4px; }
.desktop-icon-label { font-size: 11px; text-align: center; max-width: 64px; }
.desktop-icon-tooltip { position: absolute; bottom: 100%; left: 50%; margin-bottom: 4px; padding: 4px 8px; background-color: var(--win-yellow); border: 1px solid var(--win-gray-dark); font-size: 10px; white-space: nowrap; z-index: 1000; }
/* Note: transform: translateX(-50%) stays inline for centering */
```

### PR Title
`refactor(style): migrate Desktop to CSS classes (Batch 4)`

---

## Batch 5: AppHost & HourglassLoader (Moderate)

**Priority:** Medium  
**Complexity:** Low  
**Files:** 2  
**Estimated Effort:** 1-2 hours

### Files
- `front/src/os/apps/AppHost.tsx`
- `front/src/components/win95/HourglassLoader.tsx`

### Changes
- Create CSS classes for AppHost container and loading overlay
- Create CSS classes for HourglassLoader

### CSS Classes to Create
```css
/* AppHost */
.apphost-container { width: 100%; height: 100%; position: relative; display: flex; flex-direction: column; }
.apphost-loading-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; justify-content: center; align-items: center; background-color: var(--win-white); z-index: 1; }
.apphost-error { padding: 20px; color: var(--win-red); }
.apphost-iframe { flex: 1; border: none; width: 100%; height: 100%; }

/* HourglassLoader */
.hourglass-container { display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; background: #c0c0c0; border: 2px solid var(--win-black); position: absolute; top: 0; left: 0; z-index: 10; }
.hourglass-box { width: 48px; height: 48px; position: relative; background: #c0c0c0; border: 2px inset; display: flex; align-items: center; justify-content: center; }
.hourglass-svg { position: relative; z-index: 1; }
.hourglass-text { margin-top: 12px; font-size: 12px; color: var(--win-black); font-weight: normal; }
```

### PR Title
`refactor(style): migrate AppHost & HourglassLoader to CSS classes (Batch 5)`

---

## Batch 6: UserPanelApp (Moderate)

**Priority:** Medium  
**Complexity:** Medium  
**Files:** 1  
**Estimated Effort:** 2 hours

### Files
- `front/src/os/apps/UserPanelApp.tsx`

### Changes
- Create CSS classes for user panel layout
- Create CSS classes for user info section
- Note: Uses spread from `buttons.default` - keep button styles inline or create button classes

### CSS Classes to Create
```css
/* UserPanelApp */
.user-panel-container { display: flex; flex-direction: column; gap: var(--spacing-md); padding: var(--spacing-md); min-height: 200px; }
.user-panel-info { display: flex; flex-direction: column; gap: var(--spacing-sm); padding: var(--spacing-md); border-top: 1px solid var(--win-gray-dark); border-left: 1px solid var(--win-gray-dark); border-right: 1px solid var(--win-white); border-bottom: 1px solid var(--win-white); box-shadow: inset 1px 1px 0 var(--win-black); background-color: var(--win-white); }
.user-panel-title { font-size: var(--font-size-normal); font-weight: var(--font-weight-bold); }
.user-panel-field { font-size: var(--font-size-normal); }
.user-panel-disabled { font-size: var(--font-size-normal); color: var(--text-disabled); }
.user-panel-actions { display: flex; flex-direction: column; gap: var(--spacing-sm); }
.user-panel-button { align-self: flex-start; }
/* Note: Button styles from tokens - consider creating .win-btn-default class */
```

### PR Title
`refactor(style): migrate UserPanelApp to CSS classes (Batch 6)`

---

## Batch 7: Mobile (Low Priority)

**Priority:** Low  
**Complexity:** Medium  
**Files:** 2  
**Estimated Effort:** 2-3 hours

### Files
- `front/src/pages/MobilePage.tsx`
- `front/src/os/MobileShell.tsx` (stub, skip or minimal)

### Changes
- Create CSS classes for mobile layout
- Create CSS classes for mobile header and menu

### CSS Classes to Create
```css
/* MobilePage */
.mobile-container { width: 100vw; height: 100vh; background-color: #008080; display: flex; flex-direction: column; position: relative; }
.mobile-header { background-color: var(--win-gray); border-bottom: 2px solid var(--win-gray-dark); padding: 8px; display: flex; justify-content: space-between; align-items: center; }
.mobile-date { font-size: 12px; font-weight: bold; }
.mobile-menu-button { padding: 4px 8px; }
.mobile-menu { position: absolute; top: 40px; right: 8px; background-color: var(--win-gray); border: 2px outset var(--win-gray-light); z-index: 1000; min-width: 150px; }
.mobile-menu-item { display: block; width: 100%; text-align: left; padding: 8px; }
.mobile-icons-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; padding: 16px; flex: 1; overflow: auto; }
.mobile-window-container { flex: 1; position: relative; }

/* MobileShell - stub, minimal or skip */
```

### PR Title
`refactor(style): migrate Mobile to CSS classes (Batch 7)`

---

## Batch 8: Taskbar & Header (Low Priority - Keep Fixed Position)

**Priority:** Low  
**Complexity:** Low  
**Files:** 2  
**Estimated Effort:** 1-2 hours

### Files
- `front/src/os/taskbar/Taskbar.tsx`
- `front/src/components/Header.tsx`

### Changes
- Create CSS classes for taskbar styling (keep `position: fixed` inline)
- Create CSS classes for header styling (keep `position: fixed` inline)
- Keep z-index inline for proper stacking

### CSS Classes to Create
```css
/* Taskbar */
.taskbar { position: fixed; bottom: 0; left: 0; right: 0; background-color: var(--taskbar-bg); border-top: var(--taskbar-border-top); border-bottom: var(--taskbar-border-bottom); display: flex; align-items: center; padding: var(--taskbar-padding); box-sizing: border-box; }
.taskbar-window-list { flex: 1; }
.taskbar-tray { display: flex; gap: var(--taskbar-tray-gap); align-items: center; padding: var(--taskbar-tray-padding); }
.taskbar-icon { width: var(--taskbar-icon-width); height: var(--taskbar-icon-height); cursor: var(--taskbar-icon-cursor); display: flex; align-items: center; justify-content: center; background-color: var(--taskbar-icon-bg); border: 1px solid var(--win-black); border-top-color: var(--win-white); border-left-color: var(--win-white); border-right-color: var(--win-black); border-bottom-color: var(--win-black); box-shadow: 1px 1px 0 var(--win-black), inset -1px -1px 0 var(--win-gray-dark); font-size: 14px; user-select: none; }
.taskbar-clock { font-size: var(--taskbar-clock-font-size); color: var(--taskbar-clock-color); padding: var(--taskbar-clock-padding); font-family: monospace; user-select: none; }
/* Note: height and z-index stay inline */

/* Header */
.header { position: fixed; top: 0; left: 0; right: 0; background-color: var(--win-gray); border-bottom: 2px solid var(--win-black); padding: 4px 8px; display: flex; justify-content: space-between; align-items: center; }
.header-buttons { display: flex; gap: 8px; align-items: center; }
.header-user-menu { position: relative; }
.header-dropdown { position: absolute; top: 100%; left: 0; margin-top: 4px; min-width: 120px; }
.header-spacer { height: 40px; }
/* Note: z-index stays inline */
```

### PR Title
`refactor(style): migrate Taskbar & Header to CSS classes (Batch 8)`

---

## Batch 9: WindowManager Content Wrapper (Low Priority)

**Priority:** Low  
**Complexity:** Low  
**Files:** 1  
**Estimated Effort:** 30 minutes

### Files
- `front/src/os/wm/WindowManager.tsx`

### Changes
- Create CSS class for content wrapper
- Keep drag overlay inline (whitelist candidate)

### CSS Classes to Create
```css
/* WindowManager */
.window-content-wrapper { padding: 12px; height: 100%; overflow: hidden; display: flex; flex-direction: column; }
.window-content-wrapper-game { padding: 0; }
/* Note: Drag overlay stays inline (whitelist) */
```

### PR Title
`refactor(style): migrate WindowManager content wrapper to CSS classes (Batch 9)`

---

## Batch 10: Win95Modal (Low Priority - Keep Computed Position)

**Priority:** Low  
**Complexity:** Low  
**Files:** 1  
**Estimated Effort:** 1 hour

### Files
- `front/src/components/win95/Win95Modal.tsx`

### Changes
- Create CSS classes for overlay and modal styling
- Keep computed `left` and `top` inline (whitelist for drag)
- Keep `position: fixed` inline for overlay

### CSS Classes to Create
```css
/* Win95Modal */
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; }
.modal { position: absolute; min-width: 400px; max-width: 90vw; max-height: 90vh; }
.modal-game { min-width: 600px; width: 90vw; max-height: 90vh; }
.modal-auth { min-width: 280px; max-width: 320px; max-height: auto; }
.modal-team { min-width: 250px; max-width: 350px; max-height: auto; }
.modal-compact { max-height: auto; }
.modal-titlebar { cursor: grab; }
.modal-titlebar-dragging { cursor: grabbing; }
.modal-content { padding: 12px; overflow: auto; flex: none; display: flex; flex-direction: column; min-height: 120px; }
.modal-content-game { padding: 0; overflow: hidden; min-height: auto; }
.modal-content-compact { padding: 8px; }
/* Note: left, top, z-index stay inline */
```

### PR Title
`refactor(style): migrate Win95Modal to CSS classes (Batch 10)`

---

## Batch 11: WindowFrame (Low Priority - Keep Transform)

**Priority:** Low  
**Complexity:** Low  
**Files:** 1  
**Estimated Effort:** 1 hour

### Files
- `front/src/os/wm/WindowFrame.tsx`

### Changes
- Create CSS classes for window styling
- Keep `transform: translate3d()` inline (whitelist for drag)
- Keep `position: absolute` and `zIndex` inline

### CSS Classes to Create
```css
/* WindowFrame */
.window-frame { position: absolute; left: 0; top: 0; display: flex; flex-direction: column; min-width: 300px; max-width: 90vw; max-height: 90vh; }
.window-titlebar { cursor: grab; touch-action: none; }
.window-titlebar-dragging { cursor: grabbing; }
.window-content { padding: 0; flex: 1; overflow: hidden; display: flex; flex-direction: column; }
/* Note: transform, zIndex, width, boxShadow stay inline */
```

### PR Title
`refactor(style): migrate WindowFrame to CSS classes (Batch 11)`

---

## Batch 12: Legacy (Deprecation Strategy)

**Priority:** Very Low  
**Complexity:** High  
**Files:** 1  
**Estimated Effort:** TBD (consider deprecation)

### Files
- `front/src/legacy/pages.tsx`

### Strategy
- **Option A:** Migrate incrementally (high effort, low value)
- **Option B:** Deprecate and remove (recommended)
- **Option C:** Leave as-is until removal

### Recommendation
**Option B:** Mark as deprecated, plan removal in future FP. Do not migrate inline styles.

### PR Title
`chore(legacy): mark legacy pages as deprecated (Batch 12)`

---

## Summary

### Total Batches: 12
### Estimated Total Effort: 20-30 hours
### High Priority Batches: 1-4 (8-12 hours)
### Medium Priority Batches: 5-6 (3-4 hours)
### Low Priority Batches: 7-11 (6-10 hours)
### Legacy: 12 (deprecation)

### Migration Order
1. **Batch 1-2:** Quick wins (viewers, simple components)
2. **Batch 3-4:** High-value subsystems (Explorer, Desktop)
3. **Batch 5-6:** Supporting components (AppHost, UserPanel)
4. **Batch 7-11:** Lower priority (Mobile, Taskbar, Header, Modals, WindowFrame)
5. **Batch 12:** Legacy (deprecation)

### CSS File Organization
Create `front/src/styles/components/` directory structure:
```
styles/
  components/
    viewers.scss      (Batch 1)
    windows.scss      (Batch 2)
    explorer.scss     (Batch 3)
    desktop.scss      (Batch 4)
    apphost.scss      (Batch 5)
    userpanel.scss    (Batch 6)
    mobile.scss       (Batch 7)
    taskbar.scss      (Batch 8)
    header.scss       (Batch 8)
    windowmanager.scss (Batch 9)
    modal.scss        (Batch 10)
    windowframe.scss  (Batch 11)
```

### Testing Strategy
- After each batch: Visual regression testing
- Ensure no layout shifts
- Verify drag/resize still works (whitelisted styles)
- Check responsive behavior

### Rollback Plan
Each batch is independent - can rollback individual PRs if issues arise.
