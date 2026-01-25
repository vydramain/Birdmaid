# Test Audit & Traceability Matrix (FP7)

**Goal:** Ensure all tests from FP1-FP6 are compatible with FP7 (OS Mode) or explicitly deprecated.
**Strategy:** "Prove Relevance" - Only keep tests that validate active features in the new OS architecture.

## Traceability Matrix

| Feature Pack | Test Suite / File | Feature | Status | Justification | Replacement / Action |
|--------------|-------------------|---------|--------|---------------|----------------------|
| **FP1** | `front/__tests__/fp1/game.playback.test.tsx` | Game Playback (Iframe) | **REWIRE** | `GamePage` is now hosted in `Executor` app (iframe). URL routing `/games/:id` is intercepted by Shell. | Render `Executor` app component directly or simulate "Open" event in Shell. |
| **FP1** | `front/__tests__/fp1/catalog.states.test.tsx` | Catalog Display | **REWIRE** | Catalog is now part of `Explorer` or `CatalogApp`. Page-based routing is obsolete. | Render `Explorer` component with `games` folder path. |
| **FP1** | `front/__tests__/fp1/admin.*.test.tsx` | Admin Authoring | **KEEP** | Admin interface remains likely as a distinct App or fallback route. Logic (validation) is reusable. | Ensure Admin components are wrapped in `AppHost` or rendered in isolation. |
| **FP2** | `front/__tests__/fp2/admin.*.test.tsx` | Enhanced Admin Validation | **KEEP** | Validation logic is independent of OS shell. | Update render harness to provide `PlatformContext`. |
| **FP4** | `front/__tests__/fp4/auth.*.test.tsx` | Auth Modals (Login/Reg) | **REWIRE** | Modals are now Windows managed by `WindowRegistry`. | Test `AuthWindow` component or `WindowManager` interaction. |
| **FP4** | `front/__tests__/fp4/ui.windows95.test.tsx` | UI Components | **KEEP** | Core UI components (inputs, buttons) are reused. | Verify compatibility with new Theme v1 variables. |
| **FP5** | `front/__tests__/fp5/catalog.*.test.tsx` | Catalog UI Polish | **REWIRE** | "Card size" and "Search" logic now applies to `Explorer` grid view. | Adapt tests to target `Explorer` grid view component. |
| **FP5** | `front/__tests__/fp5/teams.*.test.tsx` | Teams Management | **KEEP** | Teams UI likely runs in a Window or fallback page. | Ensure correct context wrapping. |
| **FP6** | `front/__tests__/fp6/desktop.workspace.test.tsx` | Desktop Layout | **DELETE+REPLACE** | File contains placeholders (`expect(true).toBe(true)`). Implementation superseded by FP7 `ShellRoot`. | Replace with `front/__tests__/fp7/shell.desktop.test.tsx` (to be created). |
| **FP6** | `front/__tests__/fp6/window.manager.test.tsx` | Window Logic | **DELETE+REPLACE** | Naive FP6 implementation replaced by FP7 `WindowStore` (rAF loop). | Replace with `front/__tests__/fp7/window.store.test.tsx` (to be created). |
| **FP6** | `front/__tests__/fp6/explorer.tree.test.tsx` | Explorer Tree | **DELETE+REPLACE** | FP6 Tree replaced by FP7 VFS-driven Tree. | Replace with `front/__tests__/fp7/explorer.vfs.test.tsx` (to be created). |
| **FP7** | `*MISSING*` | VFS Core | **CREATE** | New feature. | Create `front/__tests__/fp7/vfs.core.test.ts`. |
| **FP7** | `*MISSING*` | Window Store (Perf) | **CREATE** | New feature. | Create `front/__tests__/fp7/window.store.test.ts`. |

## Platform Smoke Suite

Critical path tests that must pass to consider the platform "bootable".

1.  **Shell Boot (Desktop):**
    *   **Goal:** Verify Desktop environment loads on desktop viewport.
    *   **Check:** Render `<App />` -> Assert `DesktopShell` is present -> Assert `Taskbar` is present.
2.  **Shell Boot (Mobile):**
    *   **Goal:** Verify Mobile environment loads on mobile viewport.
    *   **Check:** Render `<App />` (mock width 375px) -> Assert `MobileShell` is present.
3.  **VFS Integrity:**
    *   **Goal:** Verify Core file system is seeded.
    *   **Check:** `vfs.readDir('/desktop')` returns default icons (Explorer, Help).
4.  **Window Lifecycle:**
    *   **Goal:** Verify apps can open.
    *   **Check:** Emit `window.open('help')` -> Assert Window Frame appears with title "Help".
5.  **Auth Flow (UI):**
    *   **Goal:** Verify Login window interactions.
    *   **Check:** Open Login Window -> Fill Form -> Click Login -> Assert Auth Context update (mock).

## Action List

### 1. Fix Test Harness
*   **File:** `front/src/test/utils/render.tsx`
*   **Action:** Ensure `WindowRegistryProvider` and `PlatformProvider` are correctly initialized with default mocks (e.g., specific viewport for desktop tests).

### 2. Rewire Component Tests (FP1, FP4, FP5)
*   **Target:** Tests marked **REWIRE** in Matrix.
*   **Action:**
    *   Stop using `initialEntries` to navigate to "pages" if those pages don't exist in the Shell.
    *   Instead, render the specific *App Component* (e.g., `<Explorer />`, `<AuthWindow />`) wrapped in the Harness.
    *   Example: `render(<Explorer />)` instead of `render(<App />, { route: '/games' })`.

### 3. Implement FP7 Core Tests
*   **Priority:** High.
*   **Files to Create:**
    *   `front/__tests__/fp7/vfs.core.test.ts` (Test `VirtualFileSystem` class directly).
    *   `front/__tests__/fp7/window.store.test.ts` (Test `WindowStore` logic / rAF loop mock).
    *   `front/__tests__/fp7/shell.boot.test.tsx` (The Smoke Suite).

### 4. Cleanup FP6 Placeholders
*   **Action:** Delete `front/__tests__/fp6/*.test.tsx` files that contain only placeholder/empty tests to remove false sense of security.
