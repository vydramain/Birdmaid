# FP7 Reality Check & Contract Audit

**Date:** 2026-01-22  
**Status:** ✅ Completed  
**Audit Type:** Architecture/Performance + Compliance + Release Gate  
**Roles:** @Engineer (architecture/perf) + @Compliance (iframe sandbox) + @Delivery (release gate)

## Executive Summary

FP7 introduces a unified shell architecture with performance-optimized windowing, VFS event model, and iframe security. This audit verifies that all FP7 contracts exist in code, identifies missing tests, and establishes a minimal regression suite.

## Contract Verification

### ✅ Contract 1: Single Entry Shell (ShellRoot)

**Contract:** Application loads at `/` with `ShellRoot` as unified entry point. No redirects.

**Implementation:**
- `main.tsx` renders `ShellRoot` directly (no react-router)
- `ShellRoot.tsx` uses `PlatformContext` to conditionally render Desktop/Mobile
- URL stays `/`; platform switching happens via Context, not routing

**Evidence:**
```1:19:front/src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { AuthProvider } from "./contexts/AuthContext";
import { PlatformProvider } from "./contexts/PlatformContext";
import { WindowRegistryProvider } from "./os/wm/WindowRegistry";
import { ShellRoot } from "./os/ShellRoot";
import "./retro.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <PlatformProvider>
      <AuthProvider>
        <WindowRegistryProvider>
          <ShellRoot />
        </WindowRegistryProvider>
      </AuthProvider>
    </PlatformProvider>
  </React.StrictMode>
);
```

```1:23:front/src/os/ShellRoot.tsx
import { usePlatform } from "../contexts/PlatformContext";
import { DesktopPage } from "../pages/DesktopPage";

export function ShellRoot() {
  const { isMobile } = usePlatform();

  if (isMobile) {
    return (
      <div style={{ padding: 20, textAlign: 'center', color: 'white', background: '#000', height: '100vh' }}>
        <h1>Mobile View</h1>
        <p>Coming Soon (FP8)</p>
        <button onClick={() => {
          localStorage.setItem("birdmaid_platform", "desktop");
          window.location.reload();
        }}>
          Switch to Desktop
        </button>
      </div>
    );
  }

  return <DesktopPage />;
}
```

**Status:** ✅ **CONFIRMED** - Single entry shell exists

---

### ✅ Contract 2: Platform Detection & Override Persistence

**Contract:** Platform detection priority: `?mode=` query param → `localStorage` → viewport width. Persists across sessions.

**Implementation:**
- `PlatformContext.tsx` checks query param first, then localStorage, then viewport
- Platform choice persists in `localStorage.getItem("birdmaid_platform")`
- Platform is locked on boot (no live resize switching)

**Evidence:**
```16:46:front/src/contexts/PlatformContext.tsx
  useEffect(() => {
    if (initialPlatform) return; // Skip auto-detection if explicit platform provided (testing)

    // 1. Check Query Param (Force Mode)
    const params = new URLSearchParams(window.location.search);
    const mode = params.get("mode");
    if (mode === "mobile" || mode === "desktop") {
      setPlatform(mode);
      return;
    }

    // 2. Check LocalStorage
    const stored = localStorage.getItem("birdmaid_platform");
    if (stored === "mobile" || stored === "desktop") {
      setPlatform(stored);
      return;
    }

    // 3. Check Viewport
    const checkWidth = () => {
      if (window.innerWidth < 768) {
        setPlatform("mobile");
      } else {
        setPlatform("desktop");
      }
    };

    checkWidth();
    // Note: We deliberately DO NOT listen to resize to prevent layout thrashing.
    // Platform is determined on boot.
  }, []);
```

**Status:** ✅ **CONFIRMED** - Platform detection and persistence exist

---

### ✅ Contract 3: WindowFrame + AppHost + Sandbox Policy

**Contract:** WindowFrame uses rAF-driven geometry updates. AppHost wraps iframes with sandbox attributes. Overlay prevents iframe pointer capture during drag.

**Implementation:**
- `WindowFrame.tsx` subscribes to `WindowStore.subscribeGeometry` for rAF updates
- `AppHost.tsx` applies sandbox attributes to iframe
- `WindowManager.tsx` renders transparent overlay when `isDragging` is true

**Evidence:**
```26:32:front/src/os/wm/WindowFrame.tsx
  // 2. Subscribe to Geometry (rAF/Direct DOM)
  useEffect(() => {
    return windowStore.subscribeGeometry(id, (geom) => {
      if (windowRef.current) {
        windowRef.current.style.transform = `translate3d(${geom.x}px, ${geom.y}px, 0)`;
      }
    });
  }, [id]);
```

```14:15:front/src/os/apps/AppHost.tsx
  // Default secure sandbox
  const sandboxAttr = sandbox || "allow-scripts allow-forms allow-same-origin allow-popups";
```

```17:30:front/src/os/wm/WindowManager.tsx
      {isDragging && (
        <div 
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            backgroundColor: "transparent",
            pointerEvents: "auto"
          }} 
        />
      )}
```

**Sandbox Policy Verification:**
- ✅ Default: `allow-scripts allow-forms allow-same-origin allow-popups`
- ⚠️ **SECURITY NOTE:** `allow-popups` is enabled by default (permissive). Should be removed from default per FP7_SECURITY_AUDIT.md recommendation.
- ✅ `allow-top-navigation` is **DENIED** (not in default string)
- ✅ Overlay prevents iframe pointer capture during drag

**Status:** ✅ **CONFIRMED** - WindowFrame, AppHost, and overlay exist (sandbox policy needs hardening)

---

### ✅ Contract 4: VFS Event Model + Theming Tokens

**Contract:** VFS is event-driven singleton. Components subscribe to paths. Theme uses CSS variables.

**Implementation:**
- `VirtualFileSystem.ts` implements `subscribe(path, callback)` and `emit(type, path)`
- `retro.css` defines CSS variables (`--win-gray`, `--win-blue`, etc.)
- Components use `vfs.subscribe('/desktop', updateCallback)` pattern

**Evidence:**
```126:142:front/src/os/fs/VirtualFileSystem.ts
  subscribe(path: string, cb: Listener): () => void {
    const listener = { path, cb };
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private emit(type: 'add' | 'remove' | 'update', path: string) {
    this.listeners.forEach(l => {
      // Simple prefix matching for now
      // If listener is watching /desktop, it should get events for /desktop/file.txt
      if (path.startsWith(l.path)) {
        l.cb({ type, path });
      }
    });
  }
```

```3:16:front/src/retro.css
:root {
  /* Chicago95 Palette */
  --win-gray: #c0c0c0;
  --win-gray-light: #dfdfdf;
  --win-gray-dark: #808080;
  --win-gray-darker: #404040; /* Used for deepest shadows */
  --win-blue: #000080;
  --win-blue-light: #1084d0;
  --win-teal: #008080;
  --win-white: #ffffff;
  --win-black: #000000;
  --win-red: #ff0000;
  --win-yellow: #ffff00;
}
```

**VFS Usage Example:**
```19:53:front/src/pages/DesktopPage.tsx
  // VFS Sync
  useEffect(() => {
    const updateIcons = () => {
      const nodes = vfs.readDir('/desktop');
      const newIcons = nodes.map(node => {
        // ... mapping logic
      });
      setIcons(newIcons);
    };

    updateIcons();
    return vfs.subscribe('/desktop', updateIcons);
  }, []);
```

**Status:** ✅ **CONFIRMED** - VFS event model and theming tokens exist

---

## Test Verification

### ❌ Missing Tests: FP7 Platform Contracts

**Required Tests (Per Subsystem):**

1. **Boot + Platform Override:**
   - ❌ Test: ShellRoot renders DesktopPage when platform is desktop
   - ❌ Test: ShellRoot renders Mobile placeholder when platform is mobile
   - ❌ Test: Platform detection respects `?mode=` query param
   - ❌ Test: Platform detection respects localStorage persistence
   - ❌ Test: Platform detection falls back to viewport width

2. **Open Window + Z-Order:**
   - ❌ Test: `window.sys.open('explorer')` opens window
   - ❌ Test: Clicking window brings it to front (z-index update)
   - ❌ Test: WindowStore geometry updates via rAF (no React commits during drag)
   - ❌ Test: Maximum 10 windows policy enforced

3. **AppHost Overlay + Iframe Sandbox:**
   - ❌ Test: AppHost applies sandbox attributes to iframe
   - ❌ Test: Sandbox does NOT include `allow-top-navigation`
   - ❌ Test: Overlay appears when dragging window (isDragging = true)
   - ❌ Test: Overlay prevents iframe pointer capture

4. **VFS Sync Desktop ↔ Explorer:**
   - ❌ Test: Desktop icons read from VFS `/desktop`
   - ❌ Test: Explorer reads from same VFS
   - ❌ Test: VFS write triggers Desktop icon update
   - ❌ Test: VFS write triggers Explorer grid update
   - ❌ Test: VFS subscribe/unsubscribe cleanup (no memory leaks)

**Existing Tests (FP6 Placeholders):**
- `front/__tests__/fp6/platform.contracts.test.tsx` - ✅ Exists, validates VFS contracts
- `front/__tests__/fp6/window.manager.test.tsx` - ⚠️ Placeholder (all tests are `expect(true).toBe(true)`)
- `front/__tests__/fp6/desktop.workspace.test.tsx` - ⚠️ Placeholder
- `front/__tests__/fp6/window.drag.test.tsx` - ⚠️ Placeholder

**Status:** ❌ **MISSING** - No FP7-specific platform contract tests

---

## Legacy Tests Requiring Rewrite

### Tests That Assert Old Routes or App.tsx Assumptions

**Files Using `MemoryRouter` (Old Routing):**
- `front/__tests__/fp6/window.manager.test.tsx` - Uses `MemoryRouter`, should use `ShellRoot`
- `front/__tests__/fp6/desktop.workspace.test.tsx` - Uses `MemoryRouter`, should use `ShellRoot`
- `front/__tests__/fp6/explorer.tree.test.tsx` - Uses `MemoryRouter`, should use `ShellRoot`
- `front/__tests__/fp6/help.txt.test.tsx` - Uses `MemoryRouter`, should use `ShellRoot`
- `front/__tests__/fp6/mobile.mode.test.tsx` - Uses `MemoryRouter`, should use `ShellRoot`
- `front/__tests__/fp6/window.drag.test.tsx` - Uses `MemoryRouter`, should use `ShellRoot`

**Root Cause:**
- These tests import `MemoryRouter` from `react-router-dom` but FP7 uses `ShellRoot` without routing
- Tests should render `ShellRoot` directly (or use `renderShell` helper if it exists)

**Action Required:**
1. Remove `MemoryRouter` imports
2. Update tests to render `ShellRoot` or `DesktopPage` directly
3. Use `PlatformProvider` with `initialPlatform` for testing
4. Use `WindowRegistryProvider` wrapper for window tests

**Example Migration:**
```typescript
// ❌ OLD (FP6)
import { MemoryRouter } from "react-router-dom";
render(
  <MemoryRouter>
    <App />
  </MemoryRouter>
);

// ✅ NEW (FP7)
import { ShellRoot } from "@/os/ShellRoot";
import { PlatformProvider } from "@/contexts/PlatformContext";
render(
  <PlatformProvider initialPlatform="desktop">
    <WindowRegistryProvider>
      <ShellRoot />
    </WindowRegistryProvider>
  </PlatformProvider>
);
```

---

## Dead Code Identification

### Files That Exist But Are Unused (Per FP7.md Reality Check)

- ❌ `front/src/contexts/WindowContext.tsx` - DEAD CODE (replaced by WindowRegistry)
- ❌ `front/src/components/WindowManager.tsx` - DEAD CODE (replaced by `os/wm/WindowManager.tsx`)
- ❌ `front/src/App.tsx` routes - DEAD CODE (`main.tsx` doesn't use it)
- ❌ `front/src/components/Window.tsx` - DEAD CODE (uses old WindowContext)

**Action Required:** Remove dead code in cleanup PR (not blocking release)

---

## Security Compliance Notes

### Iframe Sandbox Policy

**Current State:**
- ✅ `allow-top-navigation` is **DENIED** (not in default)
- ⚠️ `allow-popups` is enabled by default (permissive)
- ✅ Overlay prevents iframe pointer capture during drag

**Recommendation (From FP7_SECURITY_AUDIT.md):**
- Remove `allow-popups` from default sandbox
- Pass `allow-popups` explicitly only for Executor (Game) app

**Status:** ⚠️ **NEEDS HARDENING** - Sandbox policy is functional but permissive

---

## Minimal Regression Suite (Cannot Break)

### Critical Platform Contracts (Must Never Break)

**Test File:** `front/__tests__/fp7/platform.contracts.test.tsx` (TO BE CREATED)

1. **ShellRoot Entry Point:**
   - ✅ ShellRoot renders without redirects
   - ✅ Desktop mode shows DesktopPage
   - ✅ Mobile mode shows placeholder

2. **Platform Detection:**
   - ✅ Query param `?mode=desktop` forces desktop
   - ✅ localStorage persistence works
   - ✅ Viewport fallback works

3. **Window System:**
   - ✅ `window.sys.open('explorer')` opens window
   - ✅ Window z-order updates on focus
   - ✅ Maximum 10 windows enforced

4. **VFS Contracts:**
   - ✅ Desktop icons read from VFS `/desktop`
   - ✅ Explorer reads from same VFS
   - ✅ VFS write triggers UI update (Desktop + Explorer)

5. **AppHost Security:**
   - ✅ Iframe has sandbox attribute
   - ✅ Sandbox does NOT include `allow-top-navigation`
   - ✅ Overlay appears during drag

**Status:** ⚠️ **MISSING** - Regression suite needs to be created

---

## Release Gate Assessment

### ✅ PASS Criteria

- ✅ **Shell:** Single entry point (`ShellRoot`) exists
- ✅ **Performance:** WindowStore uses rAF for geometry updates
- ✅ **Windowing:** WindowFrame + WindowRegistry + WindowStore architecture exists
- ✅ **VFS:** Event-driven VFS with subscribe/emit exists
- ✅ **Theming:** CSS variables defined in `retro.css`
- ✅ **AppHost:** Iframe sandbox wrapper exists

### ⚠️ WARNINGS

- ⚠️ **Tests:** No FP7-specific platform contract tests exist
- ⚠️ **Security:** Sandbox policy is permissive (`allow-popups` default)
- ⚠️ **Dead Code:** Old routing/components exist but unused

### ❌ BLOCKERS

- ❌ **Tests:** Legacy tests use old routing (`MemoryRouter`) and need rewrite
- ❌ **Regression Suite:** Minimal "cannot break" suite not created

---

## Recommendations

### Immediate Actions (Pre-Release)

1. **Create FP7 Platform Contract Tests:**
   - Create `front/__tests__/fp7/platform.contracts.test.tsx`
   - Test boot + platform override
   - Test window z-order
   - Test AppHost sandbox
   - Test VFS sync

2. **Rewrite Legacy Tests:**
   - Remove `MemoryRouter` from FP6 tests
   - Update to use `ShellRoot` contract
   - Use `PlatformProvider` with `initialPlatform` for testing

3. **Create Regression Suite:**
   - Document minimal "cannot break" test list
   - Ensure tests run in CI

### Post-Release Actions

1. **Security Hardening:**
   - Remove `allow-popups` from default sandbox
   - Pass explicitly only for Executor app

2. **Dead Code Cleanup:**
   - Remove `WindowContext.tsx`
   - Remove `components/WindowManager.tsx`
   - Remove `components/Window.tsx`
   - Remove unused routes from `App.tsx` (or document that App.tsx is legacy)

---

## Evidence

### Code Verification

- ✅ `main.tsx` uses `ShellRoot` (no react-router)
- ✅ `ShellRoot.tsx` exists and uses `PlatformContext`
- ✅ `PlatformContext.tsx` implements detection + persistence
- ✅ `WindowFrame.tsx` uses rAF geometry updates
- ✅ `AppHost.tsx` applies sandbox attributes
- ✅ `WindowManager.tsx` renders drag overlay
- ✅ `VirtualFileSystem.ts` implements event model
- ✅ `retro.css` defines theme variables

### Test Status

- ❌ No FP7-specific tests exist
- ⚠️ FP6 tests are placeholders
- ⚠️ Legacy tests use old routing

---

## Conclusion

**FP7 contracts exist in code** ✅, but **tests are missing** ❌. Legacy tests need rewrite to use `ShellRoot` contract instead of old routing. Minimal regression suite must be created before release.

**Release Gate:** ⚠️ **CONDITIONAL PASS** - Contracts verified, but tests missing. Recommend creating FP7 platform contract tests and rewriting legacy tests before release.
