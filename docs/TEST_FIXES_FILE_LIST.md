# TEST FIXES — File List for @Engineer

**Quick reference:** Files to modify for test fixes (ordered by priority)

## P0: Blockers (Import/Module Resolution)

### A1: registry-init import (5 files)
- `front/__tests__/fp7/content.image-opens-viewer.test.tsx` (line 20)
- `front/__tests__/fp7/content.video-opens-viewer.test.tsx` (line 20)
- `front/__tests__/fp7/content.txt-opens-notepad.test.tsx` (line 20)
- `front/__tests__/fp7/content.html-opens-ie.test.tsx` (line 20)
- `front/__tests__/fp7/content.webapp-opens-executor.test.tsx` (line 20)

**Change:** Replace `require("@/os/apps/registry-init")` with `import { initApps } from "@/os/apps/registry-init"` and call `initApps()` in `beforeEach`.

### A2: MobileViewer import path (1 file)
- `front/apps/mobile/viewers/MobileViewer.tsx` (line 7)

**Change:** Replace `import { appRegistry } from "../../../../src/os/apps/AppRegistry"` with `import { appRegistry } from "@/os/apps/AppRegistry"`.

---

## P1: Runtime Errors

### F1: ReferenceError (1 file)
- `front/__tests__/fp7/auth.logout.test.tsx` (line 130)

**Change:** Replace `await user.click(logoutButton)` with `fireEvent.click(logoutButton)`.

### F2: AssertionError — User Icon/UserPanel selectors (2 test files + components)
- `front/__tests__/fp7/auth.logout.test.tsx` (lines 40, 75, 96, 111, 134)
- `front/__tests__/fp7/auth.user-panel.test.tsx` (lines 38, 44, 49, 58, 74, 81, 96)
- **Components to modify:** Taskbar Tray User Icon, UserPanel component (add `data-testid`)

**Change:** Add `data-testid="user-icon"` to User Icon, `data-testid="user-panel"` to UserPanel, use `getByTestId()` in tests.

---

## P2: Flaky Selectors

### C1/C2: Multiple elements (2 files)
- `front/__tests__/fp7/explorer.tree-grid-navigation.test.tsx` (lines 36, 47, 91)
- `front/__tests__/fp7/desktop.icons.from-desktop-only.test.tsx` (multiple lines)

**Change:** Use `within()` or `getAllByText()[index]` for deterministic selectors.

---

## P3: RBAC Fixtures (only if FP6 tests are NOT removed)

### D1: PermissionDenied (1 file)
- `front/__tests__/fp6/platform.contracts.test.tsx` (line 37-38, 63)

**Change:** Add `vfs.setUserRole('Organizer')` in `beforeEach` before `vfs.mkdir()` / `vfs.writeFile()`.

---

## P4: Legacy Tests Removal

### E1: FP6 tests (1 file)
- `front/__tests__/fp6/platform.contracts.test.tsx`

**Action:** Delete file OR move to `front/__tests__/legacy/fp6/platform.contracts.test.tsx`

**Note:** Per CUTLIST.md Section 5, FP6 tests should be removed.

---

## Summary

**Total files to modify:** 12 test files + 1 source file + 2 components (Taskbar/UserPanel)

**Priority order:**
1. P0: 6 files (import fixes)
2. P1: 2 test files + 2 components (runtime errors)
3. P2: 2 test files (selectors)
4. P3: 1 test file (RBAC, only if FP6 not removed)
5. P4: 1 test file (delete)

**See:** `docs/TEST_FAILURES_REPORT.md` for detailed root cause analysis and fix instructions.
