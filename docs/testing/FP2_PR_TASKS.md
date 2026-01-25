# FP2 Audit PR Tasks

**Date:** 2026-01-22  
**Status:** Ready for execution  
**Related:** `docs/testing/FP2_REALITY_CHECK.md`, `docs/testing/RTM.md`

## Summary

FP2 features (Teams, Game Editing) are backend-complete but frontend-inaccessible. Backend tests use deprecated `x-admin-token`, frontend tests target unreachable routes.

## Tasks

### 1. Backend Tests: Migrate from `x-admin-token` to JWT

**Priority:** High  
**Effort:** Medium  
**Files:** 8 test files

#### 1.1 Update test files to use JWT tokens

**Files to update:**
- `back/__tests__/fp2/admin.teams.test.ts`
- `back/__tests__/fp2/admin.games.build.test.ts`
- `back/__tests__/fp2/admin.games.publish.test.ts`
- `back/__tests__/fp2/admin.games.status.test.ts`
- `back/__tests__/fp2/admin.games.tags.test.ts`
- `back/__tests__/fp2/admin.status-validation.test.ts`
- `back/__tests__/fp2/admin.publish-validation.test.ts`
- `back/__tests__/fp2/admin.build-limit.test.ts`

**Changes:**
- Replace `const adminHeaders = { "x-admin-token": "admin-token" }` with JWT token setup
- Use `JwtAuthGuard` pattern (see `back/__tests__/fp4/*` for examples)
- Create mock JWT tokens with `isSuperAdmin: true` for super admin tests
- Update controller calls to use `@CurrentUser()` decorator pattern

**Example migration:**
```typescript
// Before (FP2):
const adminHeaders = { "x-admin-token": "admin-token" };
const team = await controller.createTeam({ name: "Omsk Jam" }, adminHeaders);

// After (FP4):
const mockUser = { userId: "admin-1", isSuperAdmin: true };
const token = createMockJWT(mockUser);
const request = { headers: { authorization: `Bearer ${token}` }, user: mockUser };
const team = await controller.createTeam({ name: "Omsk Jam" }, request);
```

**Acceptance criteria:**
- All 8 tests pass with JWT auth
- No references to `x-admin-token` remain
- Tests verify `isSuperAdmin` flag correctly

#### 1.2 Verify existing JWT tests

**Files to verify:**
- `back/__tests__/fp2/admin.tags-permission.test.ts`
- `back/__tests__/fp2/admin.guard.test.ts`
- `back/__tests__/fp2/games.visibility.test.ts`
- `back/__tests__/fp2/csp.headers.test.ts`

**Action:** Run tests, verify they use JWT correctly, update if needed.

---

### 2. Frontend Tests: Remove Route-Based Tests

**Priority:** High  
**Effort:** Low  
**Files:** 7 test files

#### 2.1 Remove route-based tests

**Files to remove/update:**
- `front/__tests__/fp2/admin.authoring.test.tsx` - Remove route tests, add placeholder
- `front/__tests__/fp2/admin.publish-validation.test.tsx` - Remove route test, add placeholder
- `front/__tests__/fp2/admin.status-validation.test.tsx` - Remove route test, add placeholder
- `front/__tests__/fp2/admin.tags-ui.test.tsx` - Remove route test, add placeholder
- `front/__tests__/fp2/admin.status-remark.test.tsx` - Remove route test, add placeholder
- `front/__tests__/fp2/admin.publish-gating.test.tsx` - Remove route test, add placeholder

**Action:** Delete route-based test code, add placeholder comments:
```typescript
// TODO: When Teams/Editor apps exist, add tests:
// - "Teams app allows creating team (authenticated)"
// - "Editor app validates publish requirements"
// - etc.
```

**Acceptance criteria:**
- No tests reference `/teams` or `/editor/*` routes
- Placeholder comments added for future app tests
- Tests file structure preserved (describe blocks, etc.)

#### 2.2 Rewrite redirect tests

**Files to update:**
- `front/__tests__/fp2/admin.guard.test.tsx` - Update to DesktopPage semantics
- `front/__tests__/fp2/admin.forbidden-states.test.tsx` - Update to DesktopPage semantics

**Changes:**
- Keep `renderAppRoot` usage (already correct)
- Replace route-based assertions with DesktopPage checks:
  - ✅ `expect(screen.queryByText(/Description/i)).not.toBeInTheDocument()`
  - ✅ `expect(document.body.innerHTML.includes('008080'))` (desktop background)
  - ✅ `expect(document.querySelector('[class*="desktop"]'))` (desktop container)
- Remove references to "Welcome text" or route-specific content

**Acceptance criteria:**
- Tests verify DesktopPage is rendered (not EditorPage)
- Tests use shell/desktop-level semantics
- No route-based assertions remain

#### 2.3 Verify public access tests

**Files to verify:**
- `front/__tests__/fp2/game.visibility.test.tsx` - Verify public game access
- `front/__tests__/fp2/game.csp-sandbox.test.tsx` - Verify CSP sandbox

**Action:** Run tests, verify they test public access correctly, update if needed.

---

### 3. Documentation Updates

**Priority:** Medium  
**Effort:** Low

#### 3.1 Update FP2.md

**File:** `docs/fps/FP2.md`

**Changes:**
- Add note: "Frontend routes (`/teams`, `/editor/*`) are not accessible via ShellRoot. Backend endpoints work correctly."
- Update status if needed
- Add link to `FP2_REALITY_CHECK.md`

#### 3.2 Update RTM.md

**File:** `docs/testing/RTM.md`

**Status:** ✅ Already updated in this audit

---

### 4. Code Cleanup (Optional)

**Priority:** Low  
**Effort:** Medium

#### 4.1 Remove unused routes from App.tsx

**File:** `front/src/App.tsx`

**Action:** Consider removing unused routes (`/teams`, `/editor/*`) if they won't be used. **OR** keep them for future ShellRoot routing integration.

**Decision needed:** Should routes be removed or kept for future use?

#### 4.2 Document Teams/Editor app requirements

**File:** `docs/fps/FP2.md` or new `docs/fps/FP2_FUTURE.md`

**Content:**
- Requirements for Teams window app
- Requirements for Editor window app
- Integration options (separate apps vs Explorer integration)

---

## Testing Checklist

### Backend Tests
- [ ] All FP2 backend tests pass with JWT auth
- [ ] No `x-admin-token` references remain
- [ ] Super admin permissions verified correctly
- [ ] Team member permissions verified correctly

### Frontend Tests
- [ ] All route-based tests removed/replaced
- [ ] Redirect tests use DesktopPage semantics
- [ ] Public access tests verified
- [ ] CSP tests verified

### Documentation
- [ ] FP2.md updated with current state
- [ ] RTM.md updated (already done)
- [ ] FP2_REALITY_CHECK.md created (already done)

---

## Dependencies

- None (hermetic tests, all network mocked)

## Risks

- **Low:** Removing route-based tests may break CI if tests are expected to pass
- **Mitigation:** Add placeholder tests with `it.skip()` or `it.todo()` to preserve test structure

## Notes

- All tests use `mockApi` fixtures (hermetic)
- No Router duplication; use `renderAppRoot` vs `renderRouted`
- Backend endpoints work correctly; only tests need updates
- Frontend UI exists but is not accessible; needs app registration

---

## Execution Order

1. **Backend tests migration** (can be done in parallel)
2. **Frontend tests removal** (can be done in parallel)
3. **Documentation updates** (after tests are fixed)
4. **Code cleanup** (optional, after all tests pass)

---

## Related Issues

- FP1 audit: Similar route accessibility issues
- FP7 architecture: ShellRoot replaces Router
- FP4 auth migration: JWT replaces `x-admin-token`
