# FP7 Test Suite Reconciliation

**Date:** 2026-01-22  
**Status:** In Progress  
**Goal:** Document test migrations, removals, and replacements after FP7 architecture changes.

## Test Migration Table

| Test File | Action | Old Behavior | FP7 Behavior | Replacement Test(s) |
|-----------|--------|--------------|--------------|---------------------|
| `fp2/admin.guard.test.tsx` | **REWRITE** | Expected "Welcome" text on redirect | FP7 shows DesktopPage (ShellRoot at `/`) | Updated to check for DesktopPage landmarks (teal background, WindowManager) |
| `fp2/admin.forbidden-states.test.tsx` | **REWRITE** | Expected "Welcome" text | FP7 shows DesktopPage | Updated to check for DesktopPage, no editor fields |
| `fp4/auth.login.test.tsx` | **REWRITE** | Ambiguous selector for Login button | Multiple Login buttons (header + modal) | Uses `getAllByRole` and selects last button (modal submit) |
| `fp5/catalog.*.test.tsx` | **REWRITE** | Manual MemoryRouter wrapping App | Router duplication error | Migrated to `renderAppRoot({ route })` |
| `fp5/teams.*.test.tsx` | **REWRITE** | Manual MemoryRouter wrapping App | Router duplication error | Migrated to `renderAppRoot({ route })` |
| `fp5/game.*.test.tsx` | **REWRITE** | Manual MemoryRouter wrapping App | Router duplication error | Migrated to `renderAppRoot({ route })` |
| `fp5/editor.*.test.tsx` | **REWRITE** | Manual MemoryRouter wrapping App | Router duplication error | Migrated to `renderAppRoot({ route })` |
| `fp4/teams.*.test.tsx` | **REWRITE** | Manual MemoryRouter wrapping App | Router duplication error | Migrated to `renderAppRoot({ route })` |
| `fp4/game.play-modal.test.tsx` | **REWRITE** | Manual MemoryRouter wrapping App | Router duplication error | Migrated to `renderAppRoot({ route })` |
| `fp6/desktop.workspace.test.tsx` | **DELETE+REPLACE** | Placeholder tests (`expect(true).toBe(true)`) | FP7 ShellRoot replaces naive FP6 implementation | Replace with `fp7/shell.desktop.test.tsx` (to be created) |
| `fp6/window.manager.test.tsx` | **DELETE+REPLACE** | Naive FP6 window system | FP7 WindowStore (rAF loop) replaces it | Replace with `fp7/window.store.test.tsx` (to be created) |
| `fp6/explorer.tree.test.tsx` | **DELETE+REPLACE** | FP6 Tree implementation | FP7 VFS-driven Explorer | Replace with `fp7/explorer.vfs.test.tsx` (to be created) |

## Feature Contracts Validated After FP7

### 1. Routing
- **Contract:** ShellRoot at `/`, no redirects
- **Status:** ✅ Validated
- **Tests:** `admin.guard.test.tsx`, `admin.forbidden-states.test.tsx`
- **Behavior:** Unauthenticated users see DesktopPage (ShellRoot) at `/`, not redirected to separate welcome page

### 2. Shell
- **Contract:** DesktopPage/MobilePage based on PlatformContext
- **Status:** ✅ Validated
- **Tests:** ShellRoot renders DesktopPage for desktop platform
- **Behavior:** Platform detection works, DesktopPage shows teal background (#008080) and WindowManager

### 3. Desktop
- **Contract:** Icons from VFS, windows via WindowManager
- **Status:** ⏳ Needs FP7 contract tests
- **Tests:** To be created in `fp7/shell.desktop.test.tsx`
- **Behavior:** Desktop icons read from VFS `/desktop`, windows managed by WindowManager

### 4. Editor
- **Contract:** Still uses page-based routing (`/editor/games/:id`)
- **Status:** ✅ Validated
- **Tests:** `game.editor.test.tsx`, `editor.*.test.tsx`
- **Behavior:** Editor routes still work, protected by auth guard (redirects to `/` if unauthenticated)

### 5. Auth Modal
- **Contract:** Modal-based auth (not window-based yet)
- **Status:** ✅ Validated
- **Tests:** `auth.login.test.tsx`, `auth.registration.test.tsx`
- **Behavior:** AuthModal opens, handles multiple Login buttons correctly

### 6. Teams
- **Contract:** Still uses page-based routing (`/teams`)
- **Status:** ✅ Validated
- **Tests:** `teams.*.test.tsx`
- **Behavior:** Teams pages work, require authentication for creation

### 7. Catalog
- **Contract:** Still uses page-based routing (`/catalog`)
- **Status:** ✅ Validated
- **Tests:** `catalog.*.test.tsx`
- **Behavior:** Catalog page renders games from `mockApi.games()`, shows error state when API fails

## Router Duplication Fixes

**Problem:** Tests manually wrapped `<App />` with `<MemoryRouter>` while `renderAppRoot()` already provides Router.

**Solution:** Migrated all tests to use:
- `renderAppRoot({ route })` - for testing `<App />` component
- `renderShell(ui, { route })` - for testing ShellRoot/DesktopPage components
- Removed all manual `<MemoryRouter>` wrapping

**Files Fixed:** 15+ test files across fp4/fp5 suites

## Mock API Standardization

**Pattern:** All tests now use:
```typescript
beforeEach(() => {
  localStorage.clear();
  mockApi.reset();
  mockApi.setupDefaults(); // Provides empty arrays for /games, /teams
});
```

**Convenience Helpers:**
- `mockApi.games([...])` - mock GET /games
- `mockApi.game(id, {...})` - mock GET /games/:id
- `mockApi.comments(gameId, [...])` - mock GET /games/:id/comments
- `mockApi.teams([...])` - mock GET /teams
- `mockApi.authLogin(user, token)` - mock POST /auth/login
- `mockApi.users([...])` - mock GET /users

## FP6 Placeholder Tests (To Be Replaced)

### `fp6/desktop.workspace.test.tsx`
- **Status:** Contains placeholders (`expect(true).toBe(true)`)
- **Action:** DELETE and create `fp7/shell.desktop.test.tsx`
- **Replacement Should Validate:**
  - ShellRoot loads at `/`
  - DesktopPage renders with icons from VFS
  - WindowManager is present

### `fp6/window.manager.test.tsx`
- **Status:** Naive FP6 implementation replaced by FP7 WindowStore
- **Action:** DELETE and create `fp7/window.store.test.tsx`
- **Replacement Should Validate:**
  - WindowStore manages geometry via rAF
  - WindowRegistry manages window list
  - WindowFrame reads from Store refs

### `fp6/explorer.tree.test.tsx`
- **Status:** FP6 Tree replaced by FP7 VFS-driven Explorer
- **Action:** DELETE and create `fp7/explorer.vfs.test.tsx`
- **Replacement Should Validate:**
  - Explorer reads from VFS
  - Tree view updates on VFS events
  - Grid view syncs with Tree view

## FP7 Contract Tests (To Be Created)

1. **`fp7/shell.boot.test.tsx`**
   - Boot at `/` loads ShellRoot without redirect
   - Platform override works (`?platform=desktop/mobile`)
   - Desktop icons come from VFS

2. **`fp7/window.lifecycle.test.tsx`**
   - AppHost loads iframe safely (sandbox attrs)
   - Shows loading overlay
   - Window opens/closes correctly

3. **`fp7/vfs.core.test.ts`** (unit test)
   - VFS reads/writes trigger events
   - Subscriptions work
   - Explorer reads from VFS and updates on events

4. **`fp7/auth.modal.test.tsx`**
   - Auth modal opens
   - Form submission works (mocked)
   - Auth context updates

5. **`fp7/catalog.render.test.tsx`**
   - Catalog page renders list from `mockApi.games()`
   - Error state shows "Unable to load catalog" when API fails

## CI Guard

**Status:** ✅ Already implemented in `front/package.json`

```json
"test:ci": "! grep -rE '\\.skip|\\.only|test\\.todo|describe\\.todo' __tests__ && vitest run --coverage"
```

This ensures no tests are skipped or focused.

## Summary

- **Router Duplication:** Fixed in 15+ test files
- **Mock API:** Standardized setup pattern across all tests
- **Obsolete Tests:** Updated admin.guard and admin.forbidden-states to match FP7 behavior
- **Auth Login:** Already handles multiple Login buttons correctly
- **FP6 Placeholders:** Identified for deletion and replacement
- **FP7 Contracts:** Identified for creation

## Next Steps

1. Create FP7 contract tests (shell.boot, window.lifecycle, vfs.core, auth.modal, catalog.render)
2. Delete FP6 placeholder tests and create replacements
3. Run full test suite and record before/after metrics
4. Verify zero Router-inside-Router errors
5. Verify zero "Unable to load catalog" errors (unless testing error state)
