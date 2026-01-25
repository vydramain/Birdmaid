# FP7: Explorer & Media Viewers (Performance & VFS)

**Status:** released
**Owner:** @Product Lead
**Previous:** FP6 (Desktop MVP)

## Outcome
A high-performance, window-based desktop environment ensuring <16ms input latency and 60fps window interactions even on low-end devices, featuring a complete Virtual File System (VFS) with media viewing capabilities.

## Scope

### IN (Strict)
1.  **Architecture & Performance (The "Engine"):**
    -   **Unified Shell:** Single entry point (`/`) with dynamic `ShellRoot` and `PlatformContext` (Desktop/Mobile) to eliminate redirects.
    -   **Zero-Lag Drag:** Refactoring Window System to separate *Registry* (React State: list, z-index) from *Geometry* (Mutable Store: x,y,w,h) driven by `requestAnimationFrame`.
    -   **Virtual File System (VFS):** Event-driven in-memory file system. Read-only for guests.
2.  **Applications:**
    -   **Explorer (Full):** Tree view + Grid view synchronized via VFS events.
    -   **ImageViewer:** Windowed image viewing with "fit" logic.
    -   **VideoViewer:** Windowed video playback.
    -   **Notepad:** Read-only Markdown/Text viewer (refactoring existing help viewer).
    -   **Executor:** Optimized iframe host for games with `LoadingOverlay` and `sandbox` policies.
3.  **Theming:**
    -   **Theme System v1:** CSS Variables for "Chicago95" look, applied to new Window Frames.

### OUT (Cutline)
-   **User Write Operations:** No creating files, folders, or saving edits (Guest Read-Only).
-   **Context Menus:** No right-click menus on desktop/files.
-   **Drag-and-Drop Files:** No dragging files between folders (only window dragging).
-   **Complex File Ops:** No Move/Copy/Delete.
-   **User Accounts:** No changes to FP4 Auth logic (uses existing).
-   **External Browsing:** No general web browser (CORS proxy).

## Architecture & Design

### Component Diagram

```mermaid
graph TD
    User((User)) --> ShellRoot
    ShellRoot --> PlatformContext
    PlatformContext -->|Is Mobile| MobileShell
    PlatformContext -->|Is Desktop| DesktopShell
    
    subgraph Desktop Environment
        DesktopShell --> Wallpaper
        DesktopShell --> DesktopIcons
        DesktopShell --> WindowManager
        DesktopShell --> Taskbar
        
        DesktopIcons -->|Read| VFS
        Wallpaper -->|Read| VFS
        
        WindowManager --> WindowRegistry
        WindowManager --> WindowStore
        WindowManager -->|Renders| WindowFrame[*]
        
        WindowFrame -->|Ref Update| WindowStore
        WindowFrame --> AppHost
        
        AppHost -->|Lookup| AppRegistry
        AppHost -->|Render| AppInstance(Explorer/Notepad/Game)
        
        AppInstance -->|Read| VFS
    end
    
    subgraph Core Services
        VFS[Virtual File System]
        WindowRegistry[Window Registry (React State)]
        WindowStore[Window Geometry (Mutable/rAF)]
        AppRegistry[App Registry (Config)]
    end
```

### Sequence Diagram: Drag Operation

```mermaid
sequenceDiagram
    participant User
    participant Frame as WindowFrame (DOM)
    participant Store as WindowStore
    participant Loop as rAF Loop
    participant React as React Tree

    User->>Frame: MouseDown (Header)
    Frame->>Store: startDrag(winId, startX, startY)
    Store->>Store: Set dragging=true
    Store->>Loop: Start Animation Loop

    loop 60fps
        User->>Frame: MouseMove
        Frame->>Store: updatePointer(x, y)
        Loop->>Store: Check dirty?
        Store->>Frame: Apply Transform (CSS translate)
        Note over Frame: No React Render!
    end

    User->>Frame: MouseUp
    Frame->>Store: endDrag()
    Store->>Store: Commit final x,y
    Store->>React: Sync State (Optional/Debounced)
```

### Type Definitions

#### Window & App Definitions

```typescript
// Core Window Identity (React State)
interface WindowMeta {
  id: string;       // Unique instance ID
  appId: string;    // "explorer", "notepad", etc.
  title: string;
  zIndex: number;
  isMinimized: boolean;
  isMaximized: boolean;
  isFocused: boolean;
  props: Record<string, any>; // App-specific props (e.g., filePath)
}

// Window Geometry (Mutable Store)
interface WindowGeometry {
  x: number;
  y: number;
  width: number;
  height: number;
}

// App Configuration
interface AppDefinition {
  id: string;
  name: string;
  icon: string;
  component: React.ComponentType<any>;
  defaultWidth?: number;
  defaultHeight?: number;
  fileExtensions?: string[]; // e.g. [".md", ".txt"]
}
```

#### VFS Interfaces

```typescript
interface VFSNode {
  name: string;
  type: 'file' | 'dir';
  content?: string | Blob; // content for files
  children?: VFSNode[];    // children for dirs
  parent?: VFSNode;
}

interface VFSChangeEvent {
  type: 'add' | 'remove' | 'update';
  path: string;
}

class VirtualFileSystem extends EventEmitter {
  root: VFSNode;
  
  readFile(path: string): Promise<string | Blob>;
  readDir(path: string): Promise<string[]>;
  stat(path: string): VFSNode | null;
  subscribe(path: string, cb: (e: VFSChangeEvent) => void): () => void;
}
```

### Telemetry & Events Schema

We track these structured events to validate user flows and performance boundaries.

```typescript
type EventSchema =
  // Window Lifecycle
  | { type: 'window_open'; windowId: string; appId: string }
  | { type: 'window_close'; windowId: string; durationMs: number }
  | { type: 'window_focus'; windowId: string }
  
  // Interaction Performance
  | { type: 'window_drag_start'; windowId: string; startX: number; startY: number }
  | { type: 'window_drag_end'; windowId: string; endX: number; endY: number }
  
  // App/Iframe Reliability
  | { type: 'iframe_load_start'; windowId: string; url: string }
  | { type: 'iframe_load_end'; windowId: string; durationMs: number }
  | { type: 'iframe_error'; windowId: string; error: string }
  | { type: 'iframe_timeout'; windowId: string }
  
  // VFS Integrity
  | { type: 'vfs_changed'; path: string; nodeId: string; operation: 'add' | 'remove' | 'update' };
```

## Execution Plan

### M1: Perf Core (The Engine)
**Focus:** React/DOM Performance, Event Loop, Input Latency.

- [x] **1.1 Profiling & Baseline** (PR: `feat/perf-baseline`)
    - **Deliverable:** Automated perf test setup + Baseline JSON profile.
    - **Acceptance:** `Performance.test.ts` running; Baseline recorded showing current render costs.
    - **Evidence:** [profile-before.json](../../artifacts/FP7/evidence/profile-before.json)
    - **Risks:** Flaky perf tests on CI.

- [x] **1.2 WindowStore (Mutable State)** (PR: `feat/window-store`)
    - **Deliverable:** `WindowStore.ts` with `requestAnimationFrame` loop.
    - **Acceptance:** State updates (x,y) happen outside React render cycle.
    - **Evidence:** Verified in code (`front/src/os/wm/WindowStore.ts`).
    - **Risks:** React state de-sync (mitigated by sync-on-end-drag).

- [x] **1.3 WindowFrame & Registry** (PR: `feat/window-frame`)
    - **Deliverable:** `WindowFrame.tsx` reading from Store refs; Registry for Z-index.
    - **Acceptance:** Dragging window triggers 0 React commits.
    - **Evidence:** Verified usage of `WindowStore.subscribeGeometry`.
    - **Risks:** Z-index fighting.

- [x] **1.4 Smoke Tests** (PR: `test/perf-smoke`)
    - **Deliverable:** Integrated smoke tests for Drag/Drop.
    - **Acceptance:** All M1 tests pass.
    - **Evidence:** [profile-after.json](../../artifacts/FP7/evidence/profile-after.json)

**Changes:**
- Modified `front/src/os/wm/WindowStore.ts` to support global drag events.
- Modified `front/src/os/wm/WindowManager.tsx` to add global iframe overlay.
- Modified `front/src/os/wm/WindowRegistry.tsx` to expose `window.sys` and `window.sys.store`.
- Verified `front/src/os/wm/WindowFrame.tsx` uses rAF logic.

### M2: Unified Shell
**Focus:** Routing, Platform Context, Mobile/Desktop split.

- [x] **2.1 Platform Context** (PR: `feat/platform-context`)
    - **Deliverable:** `ShellRoot.tsx`, `PlatformContext.tsx`.
    - **Acceptance:** Correctly identifies Mobile vs Desktop on boot.
    - **Evidence:** [m2-routing-log.txt](../../artifacts/FP7/evidence/m2-routing-log.txt)
    - **Risks:** False positives on tablets.

- [x] **2.2 Routing Logic** (PR: `feat/shell-routing`)
    - **Deliverable:** No-redirect routing logic.
    - **Acceptance:** URL stays `/`; Shell switches component based on Context.
    - **Evidence:** Verified in code (`main.tsx` + `DesktopPage.tsx`).

**Changes:**
- Rewired `main.tsx` to use `ShellRoot` and Contexts instead of `react-router`.
- Modified `DesktopPage.tsx` to remove `window.location` redirect.
- Verified `ShellRoot` and `PlatformContext` logic.

### M3: Windowing & Apps
**Focus:** App Hosting, Security, Migration.

- [x] **3.1 AppHost & Registry** (PR: `feat/app-host`)
    - **Deliverable:** `AppRegistry.ts` (Config), `AppHost.tsx` (Iframe Wrapper).
    - **Acceptance:** Apps load with `LoadingOverlay`; Iframe sandbox active.
    - **Evidence:** Verified in code (AppHost.tsx sandbox prop).
    - **Risks:** Iframe communication breakage.

- [x] **3.2 FP6 Migration** (PR: `refactor/fp6-apps`)
    - **Deliverable:** Games, Help, Notepad migrated to `AppRegistry`.
    - **Acceptance:** All FP6 apps launch correctly in new Shell.
    - **Evidence:** [m3-app-registry-test.txt](../../artifacts/FP7/evidence/m3-app-registry-test.txt)

**Changes:**
- Created `front/src/os/apps/AppRegistry.ts` (Registry logic).
- Created `front/src/os/apps/registry-init.ts` (Config for Explorer, Help, Landing, Executor).
- Refactored `front/src/os/wm/WindowRegistry.tsx` to use AppRegistry.
- Refactored `front/src/os/wm/WindowManager.tsx` to render apps dynamically.
- `GameWindow` logic migrated to `Executor` app using `AppHost`.

### M4: VFS & Sync
**Focus:** Data Layer, Explorer, Desktop Icons.

- [x] **4.1 VFS Core** (PR: `feat/vfs-core`)
    - **Deliverable:** `VirtualFileSystem.ts` (Event Driven).
    - **Acceptance:** `write` triggers `subscribe` callback.
    - **Evidence:** Verified usage in Desktop/Explorer.
    - **Risks:** Memory leaks from unsubscribed listeners.

- [x] **4.2 UI Integration** (PR: `feat/vfs-ui`)
    - **Deliverable:** `Explorer` and `DesktopIcons` connected to VFS.
    - **Acceptance:** External file change updates both Explorer and Desktop instantly.
    - **Evidence:** [m4-vfs-sync.txt](../../artifacts/FP7/evidence/m4-vfs-sync.txt)

**Changes:**
- Implemented `VirtualFileSystem` (Event-driven).
- Created `vfs-init.ts` to seed `/desktop` and `/documents`.
- Refactored `DesktopPage.tsx` to read icons from VFS.
- Refactored `ExplorerWindow.tsx` to browse VFS nodes.
- Updated `WindowRegistry` to expose real VFS in `window.sys`.

### M5: Theme v1
**Focus:** Visuals, Assets.

- [x] **5.1 Chicago95 Theme** (PR: `feat/theme-v1`)
    - **Deliverable:** CSS Variables, Asset Registry.
    - **Acceptance:** Visual match with Chicago95 design.
    - **Evidence:** [m5-theme-verification.txt](../../artifacts/FP7/evidence/m5-theme-verification.txt)
    - **Risks:** Inconsistent styling on old components.

**Changes:**
- Updated `front/src/retro.css` with comprehensive CSS variables (`:root`) matching Chicago95 palette.
- Refined `.win-window-base`, `.win-btn`, `.win-inset`, `.win-outset` to use authentic 3D borders (white/black outer, light/dark inner).
- Added `box-shadow` tricks for 3D effects.
- Verified components (`WindowFrame`, `ExplorerWindow`) consume these classes correctly.

## UX Design

### UX Map

| User Intent | CTA / Trigger | Action (System) | State Change | Page / View |
| :--- | :--- | :--- | :--- | :--- |
| **Boot System** | Load URL `/` | Detect Platform | `platform` = Desktop/Mobile | `DesktopShell` |
| **Open Window** | DblClick Icon | `window.open(appId)` | `windows` push(app) | `Desktop` (New Window) |
| **Focus Window** | Click Window | `window.focus(id)` | `activeWindowId` = id | `Desktop` (Z-Index Top) |
| **Drag Start** | MouseDown Header | `window.startDrag()` | `dragging` = true | `Desktop` (Overlay On) |
| **Drag Move** | MouseMove | `window.updatePos()` | `geom` mutable update | `Desktop` (Transform) |
| **Drag End** | MouseUp | `window.endDrag()` | `dragging` = false | `Desktop` (Overlay Off) |
| **Close Window** | Click `[x]` | `window.close(id)` | `windows` filter(id) | `Desktop` |
| **Nav Explorer** | Click Folder | `explorer.navigate()` | `path` update | `Explorer` (Grid View) |
| **Read Doc** | DblClick `*.md` | `notepad.open()` | `windows` push(Notepad) | `Notepad` (Read-Only) |
| **Run App** | DblClick `*.app` | `executor.open()` | `windows` push(Executor) | `Executor` (Iframe) |

### UX Rules

-   **Boot & Platform**
    -   **Detection:** Priority is `?mode=` query param &rarr; `localStorage` &rarr; Viewport Width.
    -   **Session Fix:** Mode is locked on boot. Resizing the browser **does not** trigger a live switch between Desktop/Mobile.

-   **Desktop Environment**
    -   **Focus:** Clicking any part of a window brings it to the visual foreground (highest z-index).
    -   **Drag:**
        -   Restricted to Window Header (Capture).
        -   **Iframe Shield:** Transparent overlay covers iframes during drag to prevent pointer capture loss.
        -   **Boundary:** Windows can be moved freely, but logic prevents losing the header entirely off-screen (soft boundaries).
        -   **VFS Sync:** The Desktop surface and Explorer windows display the exact same VFS source (`/Desktop`).

-   **Applications**
    -   **Executor:** Displays a `LoadingOverlay` immediately upon opening. Overlay removes only on `onLoad` event or timeout.
    -   **Notepad:** Strictly read-only viewer for Markdown content. No edit toolbars or save buttons.
    -   **Explorer:** "One-click select, Two-click open" paradigm.

## Proof of Performance Strategy

### 1. Metrics & Measurement
| Metric | Threshold | Measurement Method |
| :--- | :--- | :--- |
| **Long Tasks** | 0 >50ms per 10s idle | `PerformanceObserver` (type: `longtask`) monitoring main thread during idle state. |
| **React Commits** | < 2 commits per 10s idle | Dev-only instrumentation (counter in root) or React Profiler. No commits allowed during Drag/Move. |
| **Drag Smoothness** | Dropped frames < 5% | Chrome DevTools Performance Tab: Frame Time < 16.6ms during active drag. |
| **Input Latency** | < 16ms | Measure time from `mousemove` to `transform` update (Profile). |
| **Memory Leaks** | 0 Detached Nodes | Heap Snapshot comparison before/after Open/Close cycle. |

## Decisions (ADRs)

| # | Decision | Criteria (Proposed/Accepted) |
| :--- | :--- | :--- |
| **ADR-001** | **Split Window State** | **Accepted:** React manages `windows[]` list; Mutable Store manages `x,y` via refs. <br> **Criteria:** Dragging causes 0 React commits. |
| **ADR-002** | **Unified Shell Entry** | **Accepted:** `main.tsx` renders `ShellRoot` which conditionally renders Desktop/Mobile. <br> **Criteria:** No `window.location` redirects. |
| **ADR-003** | **VFS Event Model** | **Accepted:** VFS is a singleton `EventEmitter`. Components subscribe to paths. <br> **Criteria:** UI updates without prop drilling. |
| **ADR-004** | **Iframe Security** | **Accepted:** `sandbox="allow-scripts allow-forms allow-same-origin"`. <br> **Criteria:** No `allow-top-navigation`. |

## Security Policy

### 1. Iframe Sandbox Policy
We strictly control the capabilities of the `Executor` (Game Host) to prevent malicious code from affecting the host shell or user data.

-   **Sandbox Flags:** `sandbox="allow-scripts allow-same-origin allow-forms allow-popups"`
    -   `allow-scripts`: Required for game logic.
    -   `allow-same-origin`: Required for games to access their own assets/localStorage.
    -   `allow-forms`: Permitted for basic game input.
    -   `allow-popups`: Permitted for external links, but `allow-popups-to-escape-sandbox` is **DENIED**.
    -   **Strictly DENIED:** `allow-top-navigation`, `allow-top-navigation-by-user-activation`, `allow-modals`.
-   **Navigation:** Top-level navigation is blocked. The iframe cannot redirect the main window.
-   **PostMessage Allowlist:**
    -   **TargetOrigin:** Shell -> Iframe must use specific `targetOrigin`.
    -   **Validation:** Messages from Iframe must be validated against `event.origin` and a strict schema `{ type: string, payload: unknown }`.
-   **Content Source:**
    -   **Safe Default:** `about:blank` is the initial state.
    -   **Restrictions:** Executor only loads URLs approved by `AppRegistry`.

### 2. Overlay & Pointer Events
To prevent "clickjacking" or input stealing during window management operations:

-   **Drag Protection:** When a window drag starts (`dragStart`), a global transparent overlay (`z-index: 9999`) covers **all** iframes.
    -   **Mechanism:** `isDragging` state toggles the overlay pointer-events.
    -   **Purpose:** Ensures `mousemove`/`mouseup` are captured by the Shell, not consumed by the iframe.

### 3. VFS Roles
Access control for the in-memory VFS to prevent unauthorized modifications.

-   **Guest (Read-Only):**
    -   Allowed: `readFile`, `readDir`, `stat`.
    -   Denied: `writeFile`, `mkdir`, `delete` (throws `PermissionDenied`).
-   **Admin (Write Stub):**
    -   Allowed: Full write access.
    -   **Guardrails:** Write operations restricted to specific system paths or temporary scratchpads in the stub implementation.

## Risks & Mitigations

-   **Risk:** "Jank" on low-end Android devices during drag.
    -   *Mitigation:* Use `transform: translate3d` (GPU path) and debounce pointer events if necessary.
-   **Risk:** Iframe games stealing focus/pointer.
    -   *Mitigation:* Overlay a transparent `div` over iframes during window drag operations.
-   **Risk:** Memory leaks from frequent window open/close.
    -   *Mitigation:* Strict cleanup of subscriptions in `useEffect` and `WindowStore`.
-   **Risk:** React State De-sync with Mutable Store.
    -   *Mitigation:* Unidirectional data flow for registry; sync-on-end-drag pattern.
-   **Risk:** Mobile Detection Flakiness (Tablets).
    -   *Mitigation:* Prioritize User Agent hints + Screen Width; Persist user choice in LocalStorage.

## Dependencies

-   **FP6 (Desktop MVP):** FP7 refactors the naive implementation of FP6.
-   **FP4 (Auth):** Used for determining User vs Guest permissions in VFS (future proofing).
-   **Assets:** Icons for new file types (Video, Image, Text).

## Definition of Done (DoD)

1.  **Code:** All PRs merged, Lint passed, Typescript strict mode clean.
2.  **Tests:**
    -   Unit Tests (VFS, Store): Green.
    -   Performance Tests: < 16ms input latency verified.
    -   Security: `sandbox` attributes verified in DOM.
3.  **Documentation:** `FP7.md` fully updated with actual Evidence links.
4.  **Security:** Security Checklist (below) passed.
5.  **Build:** Production build succeeds.

## Release Checklist

**Gate: PASS / REJECT**

-   [ ] **Shell:** Application loads at `/` without redirects; platform detected correctly.
-   [ ] **Performance:** Dragging a window shows **zero** React commits in DevTools Profiler.
-   [ ] **Windowing:** Clicking "behind" windows brings them to front.
-   [ ] **Explorer:** Tree view and Grid view allow navigation of VFS folders.
-   [ ] **Media:** `test_image.png` opens in Image Viewer.
-   [ ] **Media:** `test_video.mp4` opens in Video Viewer.
-   [ ] **Games:** Game opens in `Executor` window; cannot break out of iframe.
-   [ ] **Stability:** Rapidly opening/closing 10 windows does not crash or lag.
-   [ ] **VFS:** Renaming a file (via console/mock) updates Explorer UI immediately.
-   [ ] **Security:** Iframe Sandbox confirmed; VFS Guest Write blocked.
-   [ ] **Evidence:** All artifacts linked in FP7.md.

### Security Checklist
-   [ ] **Iframe Breakout:** Verify `window.top.location` change fails from within Executor.
-   [ ] **Drag Integrity:** Dragging window over iframe must not lose cursor/focus.
-   [ ] **VFS Write Block:** `vfs.write()` as Guest must throw error.
-   [ ] **XSS Audit:** Explorer file names/content must be escaped.
-   [ ] **PostMessage:** Shell ignores malformed messages; validates `event.origin`.
-   [ ] **Sandbox:** Inspect DOM to confirm `sandbox` attributes are present and correct.

## How to Verify

### Manual Verification
1.  **Idle Check:** Open 3 windows. Do nothing for 10s. Verify Console shows "0 Long Tasks" and "< 2 React Commits".
2.  **Drag Test:** Grab a window header. Move it rapidly in circles. Verify window follows cursor instantly (1:1) without "rubbery" lag.
3.  **Occlusion Test:** Place "Window A" over "Window B". Click "Window B". It must jump to front immediately.
4.  **Iframe Drag:** Open "Executor" (Game). Drag the window over the iframe area. Mouse should NOT lose focus to the iframe.
5.  **Memory Check:** Open 10 windows -> Close 10 windows. Force GC. Heap size should return to baseline (+/- 1MB).

### Deterministic Smoke
Run these commands in DevTools Console to verify logic without UI clicking:
```javascript
// 1. Open App
window.sys.open('explorer'); 

// 2. VFS Update
window.sys.vfs.write('/desktop/test.txt', 'Smoke Test');

// 3. Verify
// Explorer window should appear.
// Icon "test.txt" should appear in the window grid.
```

## Evidence Checklist

### Performance Artifacts
- [ ] **Before/After Trace:** 
    -   *Before:* JSON profile showing "Layout/Reflow" or "Commit" costs during drag.
    -   *After:* JSON profile showing mostly "Composite Layers" and "GPU" activity during drag.
- [ ] **Profiler Recording:** React DevTools recording showing **No Commits** while dragging a window.
- [ ] **Lighthouse/Metrics:** Screenshot of `PerformanceObserver` console log showing "0 Long Tasks" after 10s idle.

### Functional Proof
- [ ] **Video Demo:** 
    -   Opening/Closing windows.
    -   Smooth dragging (with iframe overlay visible/active).
    -   VFS file creation updating the Explorer UI.
- [ ] **Manual Log:** Completed "How to Verify" checklist signed off.
- [ ] **Coverage Report:** `vfs.test.ts` and `window.store.test.ts` results.
