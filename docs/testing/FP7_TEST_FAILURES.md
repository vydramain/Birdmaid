# FP7 Test Failures - Root Cause Analysis

**Date:** 2026-01-22  
**Status:** In Progress  
**Total Failures:** 26 failed suites / 60 failed tests (48 files, 114 tests)

## Executive Summary

Systematic root-cause analysis of failing Vitest test suites for FP7. This document tracks failure clusters, root causes, fixes applied, and evidence.

## Failure Taxonomy

| Cluster | Signature | Suites Affected | Root Cause | Fix Plan | Status |
|---------|-----------|----------------|------------|----------|--------|
| **Router Duplication** | `You cannot render a <Router> inside another <Router>` | 1+ | Tests manually wrap `<App />` with `<MemoryRouter>` while using `render()` which already provides Router | Split render helpers: `renderAppRoot()` (no Router) vs `renderRouted()` (adds Router only when needed) | 🔄 In Progress |
| **Network Isolation** | `[Network Isolation] Unhandled request: GET http://localhost:3000/...` | 20+ | Tests call API endpoints without registering mocks | Implement route-registry mock with helpers (mockGames, mockGame, mockComments, mockTeams, mockAuth) | ⏳ Pending |
| **Missing DOM APIs** | `ResizeObserver is not defined` / `matchMedia is not defined` / `requestAnimationFrame is not defined` | 0 (prevented) | Browser APIs missing in jsdom | Add stable mocks in test setup | ✅ Fixed |
| **Runtime Crashes** | `TypeError: Cannot read property 'length' of undefined` | 5+ | Components access array properties without null checks | Add defensive checks or fix mocks to match contract | ⏳ Pending |
| **Test Selectors** | `Unable to find an element with the text: /Welcome/i` | 2+ | Tests expect old UI elements that changed in FP7 | Update selectors/flows to match FP7 behavior | ⏳ Pending |
| **Multiple Elements** | `Found multiple elements with the role "button" and name /login/i` | 1+ | Tests use ambiguous selectors (multiple Login buttons) | Use more specific selectors (within modal, by test-id, etc.) | ⏳ Pending |

## Detailed Analysis

### Cluster 1: Router Duplication (CRITICAL)

**Signature:** `Error: You cannot render a <Router> inside another <Router>. You should never have more than one in your app.`

**Affected Files:**
- `__tests__/fp2/admin.publish-validation.test.tsx` (line 15-18)

**Root Cause:**
```tsx
// ❌ WRONG: render() already wraps with Router, then test adds another Router
render(
  <MemoryRouter initialEntries={["/admin/games/1"]}>
    <App />
  </MemoryRouter>
);
```

The `render` export from `@/test/utils` is aliased to `renderShell`, which wraps components with `MemoryRouter`. When tests manually add another `<MemoryRouter>`, we get Router inside Router.

**Evidence:**
```
Error: You cannot render a <Router> inside another <Router>.
    at Router (node_modules/react-router/lib/components.tsx:429:3)
    at MemoryRouter (node_modules/react-router/dist/umd/react-router.development.js:1101:7)
    at WindowPositionProvider (/front/src/contexts/WindowPositionContext.tsx:6:35)
    at WindowRegistryProvider (/front/src/os/wm/WindowRegistry.tsx:23:35)
    at AuthProvider (/front/src/contexts/AuthContext.tsx:8:25)
    at PlatformProvider (/front/src/contexts/PlatformContext.tsx:6:29)
    at Wrapper (/front/src/test/utils/render.tsx:53:22)
```

**Fix Plan:**
1. Update `render.tsx` to export `renderAppRoot()` that does NOT wrap with Router (App already expects Router above)
2. Create `renderRouted()` for components that need Router but don't have it
3. Migrate failing tests to use correct helper

**Status:** ✅ Fixed (PR1)

**Fix Applied:**
- Updated `admin.publish-validation.test.tsx` to use `renderAppRoot()` instead of manually wrapping with `<MemoryRouter>`
- Added proper auth token mock (JWT format)
- Added API mocks for `/teams` and `/games/1`

**Evidence:**
- Before: `Error: You cannot render a <Router> inside another <Router>`
- After: `✓ __tests__/fp2/admin.publish-validation.test.tsx (1 test) 91ms`

---

### Cluster 2: Network Isolation - Unhandled Requests

**Signature:** `[Network Isolation] Unhandled request: GET http://localhost:3000/games... Use fetchMock.register() in your test.`

**Affected Files (Sample):**
- `__tests__/fp2/admin.guard.test.tsx`
- `__tests__/fp2/admin.forbidden-states.test.tsx`
- `__tests__/fp5/catalog.title-search.test.tsx`
- `__tests__/fp5/catalog.cover-images.test.tsx`
- `__tests__/fp4/game.editor.test.tsx`
- `__tests__/fp4/teams.creation.test.tsx`
- `__tests__/fp4/teams.members.test.tsx`
- ... (20+ files)

**Root Cause:**
Tests render components that call `apiClient.json()` but don't register mocks for those endpoints. The network guard correctly blocks real requests, but tests don't set up mocks.

**Evidence:**
```
[API Client] Making request to: http://localhost:3000/games/2
[TEST SETUP] Unhandled request: [Network Isolation] Unhandled request: GET http://localhost:3000/games/2. Use fetchMock.register() in your test.
```

**Fix Plan:**
1. Enhance `mock-api.ts` with convenience helpers:
   - `mockApi.games(games[])` - mock GET /games
   - `mockApi.game(id, game)` - mock GET /games/:id
   - `mockApi.comments(gameId, comments[])` - mock GET /games/:id/comments
   - `mockApi.teams(teams[])` - mock GET /teams
   - `mockApi.authLogin(user, token)` - mock POST /auth/login
   - `mockApi.setupDefaults()` - common defaults
2. Update tests to call `mockApi.setupDefaults()` or specific mocks
3. Pilot batch: Fix 5-10 tests first

**Status:** ⏳ Pending (PR2)

---

### Cluster 3: Missing DOM APIs (PREVENTED)

**Signature:** `ResizeObserver is not defined` / `matchMedia is not defined` / `requestAnimationFrame is not defined`

**Root Cause:** jsdom doesn't provide all browser APIs by default.

**Fix Applied:** ✅ Already fixed in `front/src/test/setup.ts`:
- ResizeObserver mock (lines 84-88)
- matchMedia mock (lines 91-103)
- requestAnimationFrame mock (lines 106-107)

**Status:** ✅ Fixed (no failures observed)

---

### Cluster 4: Runtime Crashes from Undefined Data

**Signature:** `TypeError: Cannot read property 'length' of undefined` / `Cannot read property 'map' of undefined`

**Affected Files:**
- Components accessing `game.tags_user.length` without checking if array exists
- Components accessing `comments.map()` without checking if array exists

**Root Cause:** Components assume API returns arrays, but mocks or error states return undefined/null.

**Evidence:**
```
TypeError: Cannot read property 'length' of undefined
    at CatalogPage (App.tsx:291:32)
```

**Fix Plan:**
1. Add defensive checks in components: `(game.tags_user ?? []).length`
2. OR ensure mocks always return arrays: `tags_user: []` instead of omitting field
3. Add unit tests that assert crash does not occur

**Status:** ⏳ Pending (PR3+)

---

### Cluster 5: Test Selectors - Changed UI (FP7)

**Signature:** `Unable to find an element with the text: /Welcome/i`

**Affected Files:**
- `__tests__/fp2/admin.guard.test.tsx` (line 14)
- `__tests__/fp2/admin.forbidden-states.test.tsx` (line 12)

**Root Cause:** Tests expect "Welcome" text that doesn't exist in FP7 UI. FP7 uses DesktopPage with icons, not a Welcome window.

**Evidence:**
```tsx
expect(await screen.findByText(/Welcome/i)).toBeInTheDocument();
// But FP7 shows DesktopPage with icons, not Welcome text
```

**Fix Plan:**
1. Update tests to check for FP7 UI elements (desktop icons, catalog window, etc.)
2. OR mark feature as removed and replace test

**Status:** ⏳ Pending (PR3+)

---

### Cluster 6: Multiple Elements - Ambiguous Selectors

**Signature:** `Found multiple elements with the role "button" and name /login/i`

**Affected Files:**
- `__tests__/fp4/auth.login.test.tsx` (line 31, 56)

**Root Cause:** Multiple "Login" buttons exist (header button + modal submit button). Test uses `getByRole("button", { name: /login/i })` which matches both.

**Evidence:**
```
Found multiple elements with the role "button" and name `/login/i`:
  1. <button class="win-btn" type="button">Login</button> (header)
  2. <button style="..." type="button">Login</button> (modal tab)
  3. <button class="win-btn" type="submit">Login</button> (modal submit)
```

**Fix Plan:**
1. Use `getAllByRole` and select specific button (e.g., `buttons[buttons.length - 1]` for submit)
2. OR use `within(modal)` to scope query
3. OR add `data-testid` to buttons

**Status:** ⏳ Pending (PR3+)

---

## Commands to Reproduce

```bash
# Run tests with verbose output
cd front
npm run test -- --reporter=verbose > artifacts/tests/fp7-test-debug.log 2>&1

# Run specific failing suite
npm run test -- __tests__/fp2/admin.publish-validation.test.tsx

# Check for skipped tests (should be zero)
npm run test:ci
```

## PR Plan

### PR1: Harness/Router + Missing DOM Globals (Infrastructure Only)
**Goal:** Fix Router duplication and ensure DOM APIs are mocked.

**Changes:**
- [ ] Update `render.tsx`: Split `renderAppRoot()` to NOT add Router (App expects Router above)
- [ ] Create `renderRouted()` for components that need Router
- [ ] Migrate `admin.publish-validation.test.tsx` to use `renderAppRoot()`
- [ ] Verify ResizeObserver, matchMedia, rAF mocks are in setup.ts

**Acceptance:**
- Router-inside-Router errors: 0 (if cluster existed)
- DOM API errors: 0

**Evidence:**
- Before: `Error: You cannot render a <Router> inside another <Router>`
- After: Test passes without Router error

---

### PR2: Mock Registry (Test Infrastructure + Pilot Tests)
**Goal:** Implement route-registry mock and update pilot batch of tests.

**Changes:**
- [ ] Enhance `mock-api.ts` with helpers (mockGames, mockGame, mockComments, mockTeams, mockAuth)
- [ ] Add `mockApi.setupDefaults()` for common endpoints
- [ ] Update 5-10 pilot tests to use mocks:
  - `__tests__/fp2/admin.guard.test.tsx`
  - `__tests__/fp2/admin.forbidden-states.test.tsx`
  - `__tests__/fp5/catalog.title-search.test.tsx` (3 tests)
  - `__tests__/fp5/catalog.cover-images.test.tsx` (2 tests)

**Acceptance:**
- "Network forbidden" failures reduced by 5-10 tests
- Pilot tests pass

**Evidence:**
- Before: `[Network Isolation] Unhandled request: GET http://localhost:3000/games`
- After: Mock registered, test passes

---

### PR3+: Per-Feature Test Rewrites
**Goal:** Fix remaining test failures per feature.

**Changes:**
- [ ] Update selectors for FP7 UI changes (Welcome → DesktopPage)
- [ ] Fix ambiguous selectors (multiple Login buttons)
- [ ] Add defensive checks for undefined arrays
- [ ] Update mocks to match API contract

**Acceptance:**
- Total failed suites reduced meaningfully each PR
- Show numbers: Before → After

---

## Guardrails

### CI Check for Skipped Tests
```bash
# In package.json
"test:ci": "! grep -rE '\\.skip|\\.only|test\\.todo|describe\\.todo' __tests__ && vitest run --coverage"
```

This ensures no tests are skipped or focused.

---

## Evidence Log

### PR1 Evidence (Router Fix)
**Before:**
```
Error: You cannot render a <Router> inside another <Router>.
    at Router (node_modules/react-router/lib/components.tsx:429:3)
    at MemoryRouter (node_modules/react-router/dist/umd/react-router.development.js:1101:7)
```

**After:**
```
✓ __tests__/fp2/admin.publish-validation.test.tsx  (1 test) 91ms
 Test Files  1 passed (1)
      Tests  1 passed (1)
```

**Test Output:**
```
App location: /editor/games/1
EditorPage auth user: {
  id: 'admin123',
  email: 'admin@example.com',
  login: 'admin',
  isSuperAdmin: true
}
```

**Note:** Network blocking warnings are expected and will be fixed in PR2 (mock registry).

---

### PR2 Evidence (Mock Registry)
**Before:**
```
[TEST SETUP] Unhandled request: [Network Isolation] Unhandled request: GET http://localhost:3000/games. Use fetchMock.register() in your test.
```

**After:**
```
✓ __tests__/fp5/catalog.title-search.test.tsx > Catalog title search (FP5) > performs case-insensitive search
```

---

## Progress Tracking

| PR | Status | Failed Suites Before | Failed Suites After | Reduction |
|----|--------|---------------------|---------------------|-----------|
| PR1 | ✅ Completed | 26 | 25 | -1 (Router duplication fixed) |
| PR2 | ⏳ Pending | 25 | TBD | TBD |
| PR3+ | ⏳ Pending | TBD | TBD | TBD |

---

## Notes

- Test setup IS loading (we see `[TEST SETUP] loaded` and fetch mock installed)
- Network isolation is working correctly (blocking localhost requests)
- Goal is NOT to "make it green by skipping", but to find and fix root causes
- Every fix must be tied to an identified root cause and backed by evidence
