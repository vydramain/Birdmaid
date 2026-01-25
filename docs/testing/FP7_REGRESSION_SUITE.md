# FP7 Minimal Regression Suite (Cannot Break)

**Date:** 2026-01-22  
**Status:** ⚠️ TO BE IMPLEMENTED  
**Purpose:** Critical platform contracts that must never break

## Overview

This document defines the **minimal regression test suite** for FP7 platform contracts. These tests validate core architecture contracts and must pass in all future FPs.

**⚠️ CRITICAL:** These tests must NEVER be removed or skipped. They validate platform contracts that other FPs depend on.

---

## Test File Structure

**Location:** `front/__tests__/fp7/platform.contracts.test.tsx`

**Test Categories:**
1. ShellRoot Entry Point
2. Platform Detection & Persistence
3. Window System (Registry + Store + Frame)
4. VFS Event Model & Sync
5. AppHost Security (Sandbox + Overlay)

---

## Test Suite: ShellRoot Entry Point

### Test 1: ShellRoot Renders Without Redirects

**Test Name:** `"ShellRoot renders DesktopPage when platform is desktop"`

**What it validates:**
- `ShellRoot` component renders without redirects
- Desktop mode shows `DesktopPage`
- URL stays `/` (no `window.location` changes)

**Must never be removed because:**
- This is the core FP7 architecture contract
- Breaking this breaks the entire shell system
- Future FPs depend on ShellRoot as entry point

**Test Implementation:**
```typescript
it("ShellRoot renders DesktopPage when platform is desktop", () => {
  const { container } = render(
    <PlatformProvider initialPlatform="desktop">
      <WindowRegistryProvider>
        <ShellRoot />
      </WindowRegistryProvider>
    </PlatformProvider>
  );
  
  // DesktopPage should render (check for desktop icons container)
  expect(container.querySelector('[style*="grid"]')).toBeInTheDocument();
  // URL should not change
  expect(window.location.pathname).toBe('/');
});
```

---

### Test 2: Mobile Mode Placeholder

**Test Name:** `"ShellRoot renders Mobile placeholder when platform is mobile"`

**What it validates:**
- Mobile mode shows placeholder UI
- Platform switching works

**Must never be removed because:**
- Ensures platform detection works
- Future FPs (FP8) will implement mobile UI

**Test Implementation:**
```typescript
it("ShellRoot renders Mobile placeholder when platform is mobile", () => {
  const { getByText } = render(
    <PlatformProvider initialPlatform="mobile">
      <WindowRegistryProvider>
        <ShellRoot />
      </WindowRegistryProvider>
    </PlatformProvider>
  );
  
  expect(getByText(/Mobile View/i)).toBeInTheDocument();
  expect(getByText(/Coming Soon/i)).toBeInTheDocument();
});
```

---

## Test Suite: Platform Detection & Persistence

### Test 3: Query Param Override

**Test Name:** `"Platform detection respects ?mode= query param"`

**What it validates:**
- `?mode=desktop` forces desktop mode
- `?mode=mobile` forces mobile mode
- Query param takes priority over localStorage/viewport

**Must never be removed because:**
- This is the platform detection contract
- Breaking this breaks platform switching
- Used for testing and manual override

**Test Implementation:**
```typescript
it("Platform detection respects ?mode= query param", () => {
  // Mock URL with query param
  Object.defineProperty(window, 'location', {
    value: { search: '?mode=desktop' },
    writable: true,
  });
  
  const { container } = render(
    <PlatformProvider>
      <WindowRegistryProvider>
        <ShellRoot />
      </WindowRegistryProvider>
    </PlatformProvider>
  );
  
  // Should render DesktopPage
  expect(container.querySelector('[style*="grid"]')).toBeInTheDocument();
});
```

---

### Test 4: LocalStorage Persistence

**Test Name:** `"Platform detection respects localStorage persistence"`

**What it validates:**
- `localStorage.getItem("birdmaid_platform")` persists choice
- Platform persists across page reloads

**Must never be removed because:**
- This is the persistence contract
- Breaking this breaks user preference persistence

**Test Implementation:**
```typescript
it("Platform detection respects localStorage persistence", () => {
  localStorage.setItem("birdmaid_platform", "desktop");
  
  const { container } = render(
    <PlatformProvider>
      <WindowRegistryProvider>
        <ShellRoot />
      </WindowRegistryProvider>
    </PlatformProvider>
  );
  
  // Should render DesktopPage
  expect(container.querySelector('[style*="grid"]')).toBeInTheDocument();
  
  localStorage.clear();
});
```

---

## Test Suite: Window System

### Test 5: Window Open via System API

**Test Name:** `"window.sys.open('explorer') opens window"`

**What it validates:**
- `window.sys.open()` API exists
- Window opens and appears in DOM
- Window has correct appId

**Must never be removed because:**
- This is the window system contract
- Breaking this breaks all window operations
- Used by smoke tests and manual verification

**Test Implementation:**
```typescript
it("window.sys.open('explorer') opens window", async () => {
  render(
    <PlatformProvider initialPlatform="desktop">
      <WindowRegistryProvider>
        <ShellRoot />
      </WindowRegistryProvider>
    </PlatformProvider>
  );
  
  // Wait for window.sys to be available
  await waitFor(() => {
    expect((window as any).sys).toBeDefined();
  });
  
  // Open window
  (window as any).sys.open('explorer');
  
  // Window should appear
  await waitFor(() => {
    expect(screen.getByText(/Explorer/i)).toBeInTheDocument();
  });
});
```

---

### Test 6: Window Z-Order Update

**Test Name:** `"Clicking window brings it to front (z-index update)"`

**What it validates:**
- Clicking window updates z-index
- Window comes to front visually
- WindowRegistry updates zIndex correctly

**Must never be removed because:**
- This is the window focus contract
- Breaking this breaks window management
- Core UX expectation

**Test Implementation:**
```typescript
it("Clicking window brings it to front (z-index update)", async () => {
  render(
    <PlatformProvider initialPlatform="desktop">
      <WindowRegistryProvider>
        <ShellRoot />
      </WindowRegistryProvider>
    </PlatformProvider>
  );
  
  await waitFor(() => {
    expect((window as any).sys).toBeDefined();
  });
  
  // Open two windows
  const win1 = (window as any).sys.open('explorer');
  const win2 = (window as any).sys.open('help');
  
  // Get window elements
  const windows = screen.getAllByText(/Explorer|Help/i);
  const win1Element = windows[0].closest('.win-window-base');
  const win2Element = windows[1].closest('.win-window-base');
  
  // Click win1 to bring it to front
  fireEvent.click(win1Element!);
  
  // win1 should have higher z-index
  const z1 = parseInt(getComputedStyle(win1Element!).zIndex);
  const z2 = parseInt(getComputedStyle(win2Element!).zIndex);
  expect(z1).toBeGreaterThan(z2);
});
```

---

### Test 7: Maximum Windows Policy

**Test Name:** `"Maximum 10 windows policy enforced"`

**What it validates:**
- Opening 11th window closes oldest window
- WindowStore unregisters closed window
- Maximum 10 windows maintained

**Must never be removed because:**
- This is the window limit contract
- Breaking this causes memory leaks
- Performance requirement

**Test Implementation:**
```typescript
it("Maximum 10 windows policy enforced", async () => {
  render(
    <PlatformProvider initialPlatform="desktop">
      <WindowRegistryProvider>
        <ShellRoot />
      </WindowRegistryProvider>
    </PlatformProvider>
  );
  
  await waitFor(() => {
    expect((window as any).sys).toBeDefined();
  });
  
  // Open 11 windows
  for (let i = 0; i < 11; i++) {
    (window as any).sys.open('explorer');
  }
  
  // Should have exactly 10 windows
  await waitFor(() => {
    const windows = screen.queryAllByText(/Explorer/i);
    expect(windows.length).toBeLessThanOrEqual(10);
  });
});
```

---

## Test Suite: VFS Event Model & Sync

### Test 8: Desktop Icons Read from VFS

**Test Name:** `"Desktop icons read from VFS /desktop directory"`

**What it validates:**
- DesktopPage reads icons from `vfs.readDir('/desktop')`
- Icons subscribe to VFS changes
- VFS is single source of truth

**Must never be removed because:**
- This is the VFS contract
- Breaking this breaks Desktop functionality
- Future FPs depend on VFS-based icons

**Test Implementation:**
```typescript
it("Desktop icons read from VFS /desktop directory", async () => {
  render(
    <PlatformProvider initialPlatform="desktop">
      <WindowRegistryProvider>
        <ShellRoot />
      </WindowRegistryProvider>
    </PlatformProvider>
  );
  
  await waitFor(() => {
    expect((window as any).sys).toBeDefined();
  });
  
  // VFS should have desktop icons
  const nodes = (window as any).sys.vfs.readDir('/desktop');
  expect(nodes.length).toBeGreaterThan(0);
  
  // Desktop should show icons
  const icons = screen.queryAllByRole('button'); // DesktopIcon buttons
  expect(icons.length).toBeGreaterThan(0);
});
```

---

### Test 9: VFS Write Triggers UI Update

**Test Name:** `"VFS write triggers Desktop icon update"`

**What it validates:**
- VFS `writeFile()` triggers `subscribe` callback
- Desktop icons update when VFS changes
- Event model works correctly

**Must never be removed because:**
- This is the VFS event contract
- Breaking this breaks VFS sync
- Core architecture requirement

**Test Implementation:**
```typescript
it("VFS write triggers Desktop icon update", async () => {
  render(
    <PlatformProvider initialPlatform="desktop">
      <WindowRegistryProvider>
        <ShellRoot />
      </WindowRegistryProvider>
    </PlatformProvider>
  );
  
  await waitFor(() => {
    expect((window as any).sys).toBeDefined();
  });
  
  // Write file to VFS
  (window as any).sys.vfs.writeFile('/desktop/test.txt', 'Test content');
  
  // Desktop should show new icon
  await waitFor(() => {
    expect(screen.getByText(/test\.txt/i)).toBeInTheDocument();
  });
});
```

---

### Test 10: Explorer Reads Same VFS

**Test Name:** `"Explorer reads from same VFS as Desktop"`

**What it validates:**
- ExplorerWindow reads from VFS
- Explorer and Desktop use same VFS source
- Single source of truth maintained

**Must never be removed because:**
- This ensures consistency between Desktop and Explorer
- Breaking this breaks Explorer functionality
- Core VFS contract

**Test Implementation:**
```typescript
it("Explorer reads from same VFS as Desktop", async () => {
  render(
    <PlatformProvider initialPlatform="desktop">
      <WindowRegistryProvider>
        <ShellRoot />
      </WindowRegistryProvider>
    </PlatformProvider>
  );
  
  await waitFor(() => {
    expect((window as any).sys).toBeDefined();
  });
  
  // Write file to VFS
  (window as any).sys.vfs.writeFile('/desktop/test.txt', 'Test content');
  
  // Open Explorer
  (window as any).sys.open('explorer');
  
  // Explorer should show same file
  await waitFor(() => {
    expect(screen.getByText(/test\.txt/i)).toBeInTheDocument();
  });
});
```

---

## Test Suite: AppHost Security

### Test 11: Iframe Sandbox Attribute

**Test Name:** `"AppHost applies sandbox attributes to iframe"`

**What it validates:**
- AppHost renders iframe with sandbox attribute
- Sandbox attribute is present in DOM
- Default sandbox is applied

**Must never be removed because:**
- This is the security contract
- Breaking this breaks iframe security
- Compliance requirement

**Test Implementation:**
```typescript
it("AppHost applies sandbox attributes to iframe", () => {
  render(<AppHost src="about:blank" title="Test" />);
  
  const iframe = screen.getByTitle('Test');
  expect(iframe).toHaveAttribute('sandbox');
  
  const sandbox = iframe.getAttribute('sandbox');
  expect(sandbox).toContain('allow-scripts');
  expect(sandbox).toContain('allow-same-origin');
});
```

---

### Test 12: Sandbox Does NOT Include allow-top-navigation

**Test Name:** `"Sandbox does NOT include allow-top-navigation"`

**What it validates:**
- Sandbox attribute does NOT contain `allow-top-navigation`
- Top-level navigation is blocked
- Security policy enforced

**Must never be removed because:**
- This is the security contract
- Breaking this allows iframe breakout
- Critical security requirement

**Test Implementation:**
```typescript
it("Sandbox does NOT include allow-top-navigation", () => {
  render(<AppHost src="about:blank" title="Test" />);
  
  const iframe = screen.getByTitle('Test');
  const sandbox = iframe.getAttribute('sandbox');
  
  expect(sandbox).not.toContain('allow-top-navigation');
  expect(sandbox).not.toContain('allow-top-navigation-by-user-activation');
});
```

---

### Test 13: Overlay Appears During Drag

**Test Name:** `"Overlay appears when dragging window (isDragging = true)"`

**What it validates:**
- WindowManager renders overlay when `isDragging` is true
- Overlay has `z-index: 9999`
- Overlay prevents iframe pointer capture

**Must never be removed because:**
- This is the drag protection contract
- Breaking this allows iframe to steal pointer
- UX requirement

**Test Implementation:**
```typescript
it("Overlay appears when dragging window (isDragging = true)", async () => {
  render(
    <PlatformProvider initialPlatform="desktop">
      <WindowRegistryProvider>
        <ShellRoot />
      </WindowRegistryProvider>
    </PlatformProvider>
  );
  
  await waitFor(() => {
    expect((window as any).sys).toBeDefined();
  });
  
  // Open window with iframe (Executor)
  (window as any).sys.open('executor');
  
  // Start drag (simulate pointer down on titlebar)
  const windowFrame = screen.getByText(/Executor/i).closest('.win-window-base');
  const titlebar = windowFrame?.querySelector('.win-titlebar');
  
  fireEvent.pointerDown(titlebar!, { clientX: 100, clientY: 100 });
  
  // Overlay should appear
  await waitFor(() => {
    const overlay = document.querySelector('[style*="z-index: 9999"]');
    expect(overlay).toBeInTheDocument();
  });
});
```

---

## Test Execution Requirements

### CI Integration

**Command:**
```bash
cd front
npm run test -- __tests__/fp7/platform.contracts.test.tsx
```

**CI Check:**
- These tests must pass in all PRs
- These tests must never be skipped (`.skip`, `.only`, `.todo`)
- These tests must run before merge

### Coverage Requirements

**Minimum Coverage:**
- All 13 tests must pass
- No skipped tests
- No flaky tests (must be deterministic)

---

## Maintenance Notes

### When to Update This Suite

**Add New Tests When:**
- New platform contract is introduced
- New security requirement is added
- New architecture contract is established

**Remove Tests When:**
- Contract is deprecated (with FP version bump)
- Contract is replaced by new contract (migrate test, don't remove)

**Never Remove Tests For:**
- "Test is flaky" (fix the test, don't remove)
- "Test is slow" (optimize the test, don't remove)
- "Test is redundant" (if it validates a contract, it's not redundant)

---

## Related Documents

- `docs/testing/FP7_REALITY_CHECK.md` - Full audit of FP7 contracts
- `docs/fps/FP7.md` - FP7 specification
- `docs/security/FP7_SECURITY_AUDIT.md` - Security audit

---

## Status

**Current Status:** ⚠️ **TO BE IMPLEMENTED**

**Next Steps:**
1. Create `front/__tests__/fp7/platform.contracts.test.tsx`
2. Implement all 13 tests
3. Verify tests pass in CI
4. Add CI check to prevent skipping these tests
