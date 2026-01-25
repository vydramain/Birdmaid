# FP6 Reality Check & Platform Contracts Audit

**Date:** 2026-01-22  
**Status:** ✅ Completed  
**Audit Type:** Platform Contracts Validation  
**Roles:** @Engineer (platform core) + @Designer (UX expectations)

## Executive Summary

FP6 was refactored by FP7, but the **platform contracts** remain valid and must be preserved. This document confirms current contracts and establishes a **platform smoke test list** that must never be removed.

## Platform Contracts Confirmed

### ✅ Contract 1: Desktop Icons from VFS

**Contract:** Desktop icons are read from VFS `/desktop` directory, not hardcoded.

**Implementation:**
- `DesktopPage.tsx` reads from `vfs.readDir('/desktop')`
- Icons subscribe to VFS changes via `vfs.subscribe('/desktop', updateIcons)`
- VFS is seeded via `initVFS()` in `vfs-init.ts`

**Evidence:**
```typescript
// DesktopPage.tsx lines 19-53
useEffect(() => {
  const updateIcons = () => {
    const nodes = vfs.readDir('/desktop');
    // ... map nodes to icons
  };
  updateIcons();
  return vfs.subscribe('/desktop', updateIcons);
}, []);
```

**Status:** ✅ **CONFIRMED** - Desktop icons come from VFS

### ✅ Contract 2: Explorer Tree Reads Same VFS

**Contract:** Explorer window reads from the same VFS that Desktop uses.

**Implementation:**
- `ExplorerWindow.tsx` reads from VFS using `vfs.readDir(currentPath)`
- Subscribes to VFS changes via `vfs.subscribe(currentPath, updateFiles)`
- Default path is `/desktop` (same as Desktop icons)

**Evidence:**
```typescript
// ExplorerWindow.tsx lines 10-23
useEffect(() => {
  const updateFiles = () => {
    const nodes = vfs.readDir(currentPath);
    setFiles(nodes);
  };
  updateFiles();
  return vfs.subscribe(currentPath, updateFiles);
}, [currentPath]);
```

**Status:** ✅ **CONFIRMED** - Explorer reads from same VFS

### ⚠️ Contract 3: Mobile Mode Exists and is Reachable

**Contract:** Mobile mode exists and is reachable via PlatformContext, even if it's a placeholder.

**Implementation:**
- `ShellRoot.tsx` checks `isMobile` from PlatformContext
- Currently shows placeholder: "Mobile View - Coming Soon (FP8)"
- `MobilePage.tsx` exists but is not currently used by ShellRoot
- Platform detection: viewport < 768px, query param `?mode=mobile`, or localStorage

**Evidence:**
```typescript
// ShellRoot.tsx lines 4-19
export function ShellRoot() {
  const { isMobile } = usePlatform();
  if (isMobile) {
    return (
      <div>Mobile View - Coming Soon (FP8)</div>
    );
  }
  return <DesktopPage />;
}
```

**Status:** ⚠️ **PARTIALLY CONFIRMED** - Mobile mode is reachable via PlatformContext, but shows placeholder instead of MobilePage

**Note:** This is acceptable for contract purposes - mobile mode is reachable, even if it's a placeholder. The contract is that PlatformContext can switch to mobile, not that MobilePage must be fully functional.

## Test Status

### FP6 Tests Updated

**Before:** All FP6 tests were placeholders (`expect(true).toBe(true)`)

**After:** Created `platform.contracts.test.tsx` that validates:
1. Desktop icons read from VFS
2. Explorer reads from same VFS
3. Mobile mode is reachable via PlatformContext

**Test Pattern:**
- Uses `renderAppRoot({ route, platform })` (not manual Router wrapping)
- Uses `mockApi.setupDefaults()` (not `vi.stubGlobal("fetch")`)
- Validates contracts, not implementation details
- Tests VFS directly when needed

### Remaining FP6 Tests

The following FP6 test files remain as placeholders and should be replaced with FP7 contract tests:
- `desktop.workspace.test.tsx` → Replace with `fp7/shell.desktop.test.tsx`
- `window.manager.test.tsx` → Replace with `fp7/window.store.test.tsx`
- `explorer.tree.test.tsx` → Replace with `fp7/explorer.vfs.test.tsx`
- `desktop.icons.test.tsx` → Covered by `platform.contracts.test.tsx`
- `window.drag.test.tsx` → Replace with `fp7/window.drag.test.tsx`
- `help.txt.test.tsx` → Replace with `fp7/help.viewer.test.tsx`
- `mobile.mode.test.tsx` → Covered by `platform.contracts.test.tsx`

## Platform Smoke Test List

**⚠️ CRITICAL: This list must NEVER be removed. These tests validate core platform contracts.**

### Smoke Test 1: Desktop Icons from VFS

**Test File:** `front/__tests__/fp6/platform.contracts.test.tsx`  
**Test:** "should read desktop icons from VFS /desktop directory"

**What it validates:**
- DesktopPage reads icons from VFS `/desktop`
- Icons update when VFS changes
- Contract: Desktop icons are VFS-driven, not hardcoded

**Must never be removed because:**
- This is a core platform contract
- Breaking this breaks Desktop functionality
- Future FPs depend on VFS-based icons

### Smoke Test 2: Explorer Reads Same VFS

**Test File:** `front/__tests__/fp6/platform.contracts.test.tsx`  
**Test:** "should read from VFS when Explorer window opens"

**What it validates:**
- ExplorerWindow reads from VFS
- Explorer and Desktop use same VFS source
- Contract: Single source of truth (VFS) for file system

**Must never be removed because:**
- This ensures consistency between Desktop and Explorer
- Breaking this breaks Explorer functionality
- Future FPs depend on VFS as single source of truth

### Smoke Test 3: Mobile Mode Reachable

**Test File:** `front/__tests__/fp6/platform.contracts.test.tsx`  
**Test:** "should be reachable via PlatformContext (mobile platform)"

**What it validates:**
- PlatformContext can switch to mobile mode
- Mobile mode is reachable (even if placeholder)
- Contract: Platform detection works

**Must never be removed because:**
- This ensures platform detection works
- Breaking this breaks mobile/desktop switching
- Future FPs depend on PlatformContext

## Architecture Notes

### FP6 → FP7 Migration

**What Changed:**
- Window management: `WindowContext` → `WindowRegistry` + `WindowStore`
- Routing: Multiple routes → `ShellRoot` unified entry point
- Desktop icons: Hardcoded → VFS-driven

**What Stayed the Same:**
- ✅ Desktop icons from VFS (contract preserved)
- ✅ Explorer reads from VFS (contract preserved)
- ✅ Mobile mode reachable (contract preserved)

### VFS Initialization

**How it works:**
- VFS is initialized when `WindowRegistry` is imported
- `initVFS()` seeds `/desktop` with default icons
- Tests should reset VFS and reinitialize for isolation

**Test Pattern:**
```typescript
beforeEach(() => {
  // Reset VFS
  const root = vfs.resolve('/');
  if (root && root.children) {
    root.children = [];
  }
  vfs.mkdir('/desktop');
  vfs.mkdir('/documents');
  initVFS();
});
```

## Recommendations

### Immediate Actions

1. ✅ **DONE:** Created `platform.contracts.test.tsx` with contract tests
2. ⏳ **TODO:** Replace remaining FP6 placeholder tests with FP7 contract tests
3. ⏳ **TODO:** Update MobilePage to use VFS (currently hardcoded icons)

### Future Considerations

1. **MobilePage VFS Integration:** MobilePage should read icons from VFS, not hardcoded array
2. **Platform Smoke Tests:** Add these to CI/CD pipeline as required tests
3. **Contract Documentation:** Keep this document updated as contracts evolve

## Conclusion

✅ **All three platform contracts are confirmed:**
1. Desktop icons from VFS ✅
2. Explorer reads same VFS ✅
3. Mobile mode reachable ✅

✅ **Platform smoke tests created and must never be removed**

✅ **Tests use renderAppRoot and mockApi defaults (not implementation details)**

---

**Last Updated:** 2026-01-22  
**Next Review:** When FP8 implements full MobilePage functionality
