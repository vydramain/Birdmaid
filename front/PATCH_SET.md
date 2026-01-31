# PATCH SET: Test Fixes for FP7 (All Tests Green)

## Summary
Fixed all test failures across the entire test suite.
All 74 tests are now passing.

## Files Modified

### 1. Test Setup
- **File**: `front/src/test/setup.ts`
- **Change**: Added mock for `URL.createObjectURL` and `URL.revokeObjectURL` (jsdom doesn't support them)
- **Category**: H (Browser API missing)

### 2. RBAC Fixtures
- **File**: `front/__tests__/fp7/content.txt-opens-notepad.test.tsx`
- **Change**: Set role to Organizer before `vfs.writeFile()`, then back to Guest for read-only testing
- **Category**: G (RBAC fixtures mismatch)

### 3. Ambiguous Selectors
- **File**: `front/__tests__/fp7/desktop.icons.from-desktop-only.test.tsx`
- **Change**: Replaced regex `/My Computer|Explorer/` with separate `within(container).getByText()` calls
- **Category**: A (Ambiguous selector)

### 4. Wrong Selectors
- **File**: `front/__tests__/fp7/auth.logout.test.tsx`
- **Change**: Replaced `document.querySelector('[title*="logged"]')` with `screen.getByTestId("tray-user-icon")`
- **Category**: C (Async timing / wrong scope)

### 5. Scoped Close Button Search
- **File**: `front/__tests__/fp7/auth.user-panel.test.tsx`
- **Change**: Used scoped search for close button - find User Panel window container, then find close button within it using `within(userPanel).getByRole('button', { name: /close window/i })`
- **Category**: A (Ambiguous selector) + C (Async timing)

### 6. Import Paths - Mobile App Files
- **Files**: 
  - `front/apps/mobile/viewers/ImageViewer.tsx`
  - `front/apps/mobile/viewers/VideoViewer.tsx`
  - `front/apps/mobile/viewers/TextViewer.tsx`
  - `front/apps/mobile/viewers/HtmlViewer.tsx`
  - `front/apps/mobile/viewers/WebappViewer.tsx`
  - `front/apps/mobile/MobileApp.tsx`
  - `front/apps/mobile/main-mobile.tsx`
- **Change**: Replaced relative paths `../../../../src/...` with `@/` alias
- **Category**: D (Import/alias)

### 7. Video Element Selector
- **File**: `front/__tests__/fp7/content.video-opens-viewer.test.tsx`
- **Change**: Replaced `screen.queryByTitle("test.mp4")` with `screen.queryByRole('video')` or `document.querySelector('video')` (video elements don't have title attribute)
- **Category**: C (Async timing / wrong selector)

### 8. VFS API Usage
- **File**: `front/apps/mobile/MobileApp.tsx`
- **Change**: Replaced `vfs.readFile(path)` (returns `string | Blob`) with `vfs.stat(path)` (returns `VFSNode`) and added check for `node.type === 'file'`
- **Category**: I (VFS API misuse)

## Test Results

### Final Status: ✅ ALL TESTS PASSING

**Test Files**: 16 passed (16) ✅
**Tests**: 74 passed (74) ✅

### Test Files Breakdown
- ✅ `taskbar.tray.test.tsx`: 5/5
- ✅ `auth.user-panel.test.tsx`: 5/5
- ✅ `auth.logout.test.tsx`: 3/3
- ✅ `mobile.boot.test.tsx`: 3/3
- ✅ `content.video-opens-viewer.test.tsx`: 4/4
- ✅ `content.txt-opens-notepad.test.tsx`: 4/4
- ✅ `content.image-opens-viewer.test.tsx`: 5/5
- ✅ `content.html-opens-ie.test.tsx`: 4/4
- ✅ `content.webapp-opens-executor.test.tsx`: 4/4
- ✅ `desktop.icons.from-desktop-only.test.tsx`: 5/5
- ✅ `explorer.tree-grid-navigation.test.tsx`: 7/7
- ✅ `shell.boot.desktop.test.tsx`: 4/4
- ✅ `shell.boot.mobile.test.tsx`: 3/3
- ✅ `vfs.organizer.nested-ops.test.tsx`: 7/7
- ✅ `vfs.system-folders.immutable.test.tsx`: 6/6
- ✅ `window.viewport-boundary.test.tsx`: 5/5

## Pattern Fixes Applied

| Category | Fixes | Files |
|----------|-------|-------|
| **A** (Ambiguous selectors) | 1 | `desktop.icons.from-desktop-only.test.tsx`, `auth.user-panel.test.tsx` |
| **C** (Async timing) | 3 | `auth.logout.test.tsx`, `auth.user-panel.test.tsx`, `content.video-opens-viewer.test.tsx` |
| **D** (Import/alias) | 1 | 7 mobile app files |
| **G** (RBAC fixtures) | 1 | `content.txt-opens-notepad.test.tsx` |
| **H** (Browser API) | 1 | `src/test/setup.ts` |
| **I** (VFS API) | 1 | `apps/mobile/MobileApp.tsx` |

**Total: 8 pattern fixes across 15 files**

## Verification

Run all tests:
```bash
npm test
```

Expected: **16/16 test files passing, 74/74 tests passing** ✅

Run specific test suites:
```bash
# M4.5 Feature (Taskbar Tray + Clock + User Panel)
npm test -- taskbar.tray.test.tsx auth.user-panel.test.tsx auth.logout.test.tsx --run

# Mobile App
npm test -- mobile.boot.test.tsx --run

# Content Viewers
npm test -- content.video-opens-viewer.test.tsx --run
```

## Notes

- All fixes follow the pattern rules defined in `TEST_FAILURE_PATTERNS.md`
- No tests were disabled or skipped
- All fixes address root causes, not symptoms
- FP7 product contract was not altered for test purposes
