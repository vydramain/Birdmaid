# FP7 Test Recovery Plan

Based on [TEST_AUDIT_FP7](../../testing/TEST_AUDIT_FP7.md).

## Definition of Done (DoD)

For a PR to be merged, it must meet these criteria:
-   [ ] **Strict Mode:** No `describe.skip`, `it.skip`, `test.only`, or `fdescribe`.
-   [ ] **Execution:** `npm run test` passes for the specific suite.
-   [ ] **Coverage:** Coverage report is generated (no specific % threshold yet, but must not error out).
-   [ ] **Cleanliness:** No console errors/warnings during test execution.

---

## Execution Tasks (Ordered)

### PR 1: Foundation & Core Smoke (The Engine)
**Goal:** Establish a trusted baseline. If these fail, the platform is broken.

1.  **Clean up Legacy Placeholders:**
    *   Delete `front/__tests__/fp6/*.test.tsx` (the "expect true to be true" placeholders).
2.  **Fix Test Harness:**
    *   Update `front/src/test/utils/render.tsx` to include `PlatformProvider` (with default Desktop mode) and mocked `WindowRegistry`.
3.  **Implement Core Smoke Suite (FP7):**
    *   Create `front/__tests__/fp7/vfs.core.test.ts`: Verify `VirtualFileSystem` read/write/subscribe.
    *   Create `front/__tests__/fp7/window.store.test.ts`: Verify `WindowStore` geometry updates and rAF loop (mocked).
    *   Create `front/__tests__/fp7/shell.boot.test.tsx`: Verify `ShellRoot` renders `DesktopShell` by default.

### PR 2: App Recovery (The User Experience)
**Goal:** Restore functionality for Guest Users (Catalog, Play, Explorer).

1.  **Rewire Explorer/Catalog Tests (FP1, FP5, FP6):**
    *   Update `front/__tests__/fp1/catalog.states.test.tsx`: Test `Explorer` component directly with VFS mocks.
    *   Update `front/__tests__/fp6/explorer.tree.test.tsx`: Test VFS tree rendering.
    *   Update `front/__tests__/fp5/catalog.*.test.tsx`: Apply "Card Size" and "Search" tests to the new `Explorer` grid view.
2.  **Rewire Game Playback (FP1):**
    *   Update `front/__tests__/fp1/game.playback.test.tsx`: Test `Executor` app component (iframe host) instead of full page routing.

### PR 3: Identity & Admin (The Ecosystem)
**Goal:** Restore functionality for Registered Users and Admins.

1.  **Rewire Auth Tests (FP4):**
    *   Update `front/__tests__/fp4/auth.flows.test.tsx`: Test `AuthWindow` or `WindowManager`'s handling of auth modals.
2.  **Rewire Admin/Teams (FP1, FP2, FP5):**
    *   Update `front/__tests__/fp1/admin.*.test.tsx`: Wrap Admin components in `AppHost` context.
    *   Update `front/__tests__/fp5/teams.*.test.tsx`: Verify Teams UI works within the new Window system.

---

## Release Gate Checklist

To be checked before marking FP7 Test Recovery as complete.

### Platform Smoke (Critical)
-   [ ] **Boot:** Desktop Shell loads without crashing.
-   [ ] **VFS:** File System seeds correctly; `readDir` returns icons.
-   [ ] **Windows:** Windows open, focus, and close via Store events.
-   [ ] **Perf:** Window drag does not trigger React re-renders (verified via `window.store.test.ts`).

### Functional Regression
-   [ ] **Catalog:** Games list renders from VFS/API.
-   [ ] **Playback:** Executor iframe loads with correct sandbox attributes.
-   [ ] **Auth:** Login flow updates global AuthContext.
-   [ ] **Admin:** Admin tools remain accessible and functional.

### Quality Assurance
-   [ ] All tests passed (`npm run test`).
-   [ ] Zero skipped tests.
-   [ ] Traceability Matrix in `TEST_AUDIT_FP7.md` fully addressed.
