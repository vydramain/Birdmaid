# REWRITE_CHECKLIST: Phases for FP7 Implementation After Cuts

**Version:** 1.0  
**Date:** 2026-01-22  
**Source of Truth:** [docs/fps/FP7.md](./fps/FP7.md), [docs/CUTLINE_PLAN.md](./CUTLINE_PLAN.md)

## Purpose

This checklist defines the rewrite phases aligned to actual work order after legacy code cuts. Each phase must be completed before moving to the next.

## Phase Order (After Cuts)

### Phase 1: Auth Rewrite (P0 - Critical)

**Goal:** Replace email/password auth with Telegram auth, remove isSuperAdmin.

**Tasks:**
- [ ] **C8:** Add Telegram auth endpoint (`/api/auth/telegram`) in `back/src/auth/auth.controller.ts`
  - Implement Telegram signature verification
  - Return JWT token with user role
  - Reference: FP7.md line 860-862

- [ ] **C6:** Rewrite `AuthModal.tsx` for Telegram auth
  - Remove email/password form fields
  - Add Telegram auth button/widget
  - Integrate with Telegram Web App SDK or Telegram Login Widget
  - Reference: FP7.md line 245-248

- [ ] **C7:** Rewrite `AuthContext.tsx` for Telegram auth
  - Remove `register`, `login`, `requestRecovery`, `verifyRecovery` methods
  - Add `telegramAuth` method
  - Update `useAuth` hook to use Telegram auth
  - Reference: FP7.md line 245-248

- [ ] **C4:** Replace `isSuperAdmin` with role checks (backend)
  - Replace `isSuperAdmin` boolean checks with `role === 'Organizer'`
  - Remove `isSuperAdmin` from JWT payload (keep only for backward compatibility during migration)
  - Update all service methods to use `role: UserRole` instead of `isSuperAdmin: boolean`
  - Files: `back/src/users/users.repository.ts`, `back/src/auth/auth.service.ts`, `back/src/auth/auth.controller.ts`, `back/src/vfs/vfs.controller.ts`, `back/src/games/games.service.ts`, `back/src/games/games.controller.ts`
  - Reference: FP7.md line 250-252

- [ ] **C5:** Replace `isSuperAdmin` with role checks (frontend)
  - Replace all `user.isSuperAdmin` checks with `user.role === 'Organizer'`
  - Remove `isSuperAdmin` from User type (keep only for backward compatibility during migration)
  - Files: `front/src/contexts/AuthContext.tsx`, `front/src/os/apps/UserPanelApp.tsx`, `front/src/test/mocks/mockApi.ts`, `front/src/test/fixtures/user.ts`
  - Reference: FP7.md line 250-252

**DoD:**
- [ ] Telegram auth endpoint works (`/api/auth/telegram`)
- [ ] `AuthModal.tsx` uses Telegram auth UI
- [ ] `AuthContext.tsx` uses Telegram auth methods
- [ ] No `isSuperAdmin` checks in production code (except deprecated)
- [ ] All role checks use `role === 'Organizer'` pattern
- [ ] Tests: `auth.telegram.test.tsx`, `auth.roles.test.tsx` pass
- [ ] Build passes: `cd back && npm run build && cd ../front && npm run build`

---

### Phase 2: Help Files on Desktop (P1 - High)

**Goal:** Ensure help files exist on Desktop and help endpoint reads from VFS.

**Tasks:**
- [ ] **C11:** Add `admin_help.txt` for Organizer role in VFS init
  - File: `front/src/os/fs/vfs-init.ts` (line 24)
  - Create `admin_help.txt` in `/Disk C/desktop/` during VFS initialization
  - Ensure `admin_help.txt` is only visible/accessible for Organizer role
  - Reference: FP7.md line 340-368

- [ ] **C10:** Rewrite help endpoint to read from VFS Desktop folder
  - File: `back/src/help/help.service.ts`, `back/src/help/help.repository.ts`
  - Remove DB-based help content (lines 31-71 in `help.repository.ts`)
  - Read `help.txt` from VFS `/Disk C/desktop/help.txt`
  - Read `admin_help.txt` from VFS `/Disk C/desktop/admin_help.txt` (only for Organizer role)
  - Reference: FP7.md line 340-368

**DoD:**
- [ ] `help.txt` exists in `/Disk C/desktop/` (already compliant)
- [ ] `admin_help.txt` exists in `/Disk C/desktop/` for Organizer role
- [ ] Help endpoint (`/api/help`) reads from VFS Desktop folder, not DB
- [ ] Organizer sees both `help.txt` and `admin_help.txt`
- [ ] Guest/Participant see only `help.txt`
- [ ] Tests: Help endpoint tests pass
- [ ] Build passes: `cd back && npm run build`

---

### Phase 3: Icon Size Pipeline (P1 - High)

**Goal:** Ensure icon size pipeline (16/32/48) works correctly.

**Tasks:**
- [ ] **Verify icon sizes exist:** Icons must exist in `front/public/icons/chicago95-default/{16x16,32x32,48x48}/`
  - Current status: ✅ COMPLIANT (97 files found in `front/public/icons/chicago95-default/`)
  - Verify: `ls -la front/public/icons/chicago95-default/16x16/ | wc -l` (should show icons)
  - Verify: `ls -la front/public/icons/chicago95-default/32x32/ | wc -l` (should show icons)
  - Verify: `ls -la front/public/icons/chicago95-default/48x48/ | wc -l` (should show icons)
  - Reference: FP7.md line 25 (compliance report)

- [ ] **Verify icon pipeline:** Ensure icons are generated/available in all required sizes
  - Check if icon generation script exists: `front/scripts/generate-placeholder-icons.cjs`
  - Verify script generates 16x16, 32x32, 48x48 sizes
  - Reference: FP7.md (icon size requirements)

- [ ] **Verify Desktop Icons use correct sizes:**
  - Desktop Icons should use 48x48px containers (reference: FP7.md line 143)
  - Explorer Grid should use 32x32px icons (reference: FP7.md line 149)
  - Verify: Check `front/src/pages/DesktopPage.tsx` and `front/src/os/apps/Explorer.tsx`

**DoD:**
- [ ] Icons exist in all three sizes (16x16, 32x32, 48x48)
- [ ] Icon generation script works (if exists)
- [ ] Desktop Icons use 48x48px containers
- [ ] Explorer Grid uses 32x32px icons
- [ ] Tests: Icon rendering tests pass (if exist)
- [ ] Build passes: `cd front && npm run build`

---

### Phase 4: Legacy Pages Verification (P1 - High)

**Goal:** Verify legacy pages are not used in production, keep as history if unused.

**Tasks:**
- [ ] **C9:** Verify legacy pages not imported in production
  - File: `front/src/legacy/pages.tsx` (contains CatalogPage, GamePage, TeamsPage, EditorPage)
  - Check: `grep -r "CatalogPage\|GamePage\|TeamsPage\|EditorPage" front/src/ --exclude-dir=legacy --exclude-dir=node_modules`
  - If not imported: KEEP as history/docs
  - If imported: DELETE or move to separate legacy package
  - Reference: FP7.md line 240-244

**DoD:**
- [ ] Legacy pages not imported in production code
- [ ] Legacy pages kept in `front/src/legacy/` for history (if not imported)
- [ ] No references to legacy pages in production code
- [ ] Build passes: `cd front && npm run build`

---

### Phase 5: Games/Teams/Comments Scope Verification (P1 - High)

**Goal:** Verify if Games/Teams/Comments endpoints are OUT of FP7 scope, delete if confirmed.

**Tasks:**
- [ ] **C12:** Verify Games/Teams/Comments scope
  - Check FP7.md line 266-268: "Не входит: комментарии, рейтинги, 'соцсеть'"
  - Verify if `back/src/games/` is used by VFS/Explorer or only for social features
  - Verify if `back/src/teams/` is used by VFS/Explorer or only for social features
  - Verify if `back/src/comments/` is used by VFS/Explorer or only for games
  - If OUT of scope: DELETE entire folders
  - If IN scope: KEEP and document usage

**DoD:**
- [ ] Scope decision documented (IN or OUT of FP7)
- [ ] If OUT: Modules deleted (`back/src/games/`, `back/src/teams/`, `back/src/comments/`)
- [ ] If IN: Usage documented in FP7.md
- [ ] Build passes: `cd back && npm run build`

---

### Phase 6: Email Service Cleanup (P1 - High)

**Goal:** Remove email service not needed for Telegram auth.

**Tasks:**
- [ ] **C3:** Delete email service
  - File: `back/src/auth/email.service.ts` (DELETE)
  - File: `back/src/auth/auth.service.ts` (REMOVE EmailService import and constructor injection)
  - File: `back/src/auth/auth.module.ts` (REMOVE EmailService from providers)
  - Reference: FP7.md line 245-248 (not needed for Telegram auth)

**DoD:**
- [ ] Email service deleted
- [ ] No imports of EmailService in auth module
- [ ] Build passes: `cd back && npm run build`

---

## Execution Order Summary

1. **Phase 1: Auth Rewrite (P0)** - Must complete first (blocks FP7 compliance)
2. **Phase 2: Help Files on Desktop (P1)** - Required before release
3. **Phase 3: Icon Size Pipeline (P1)** - Required before release
4. **Phase 4: Legacy Pages Verification (P1)** - Required before release
5. **Phase 5: Games/Teams/Comments Scope Verification (P1)** - Required before release
6. **Phase 6: Email Service Cleanup (P1)** - Required before release

## Verification Commands

**After all phases:**
```bash
# 1. Verify no email/password auth code
grep -r "register.*email\|login.*password\|recovery.*email" back/src/ front/src/ \
--exclude-dir=node_modules --exclude-dir=legacy && \
echo "❌ Legacy auth found" || echo "✅ Legacy auth removed"

# 2. Verify Telegram auth present
grep -r "telegramAuth\|/api/auth/telegram" back/src/ front/src/ \
--exclude-dir=node_modules && echo "✅ Telegram auth found" || echo "❌ No Telegram auth"

# 3. Verify isSuperAdmin removed (except deprecated)
grep -r "isSuperAdmin" back/src/ front/src/ \
--exclude-dir=node_modules --exclude-dir=legacy | \
grep -v "deprecated\|//" && echo "❌ isSuperAdmin found" || echo "✅ isSuperAdmin removed"

# 4. Verify help files on Desktop
grep -q "admin_help.txt\|help.txt" front/src/os/fs/vfs-init.ts && \
echo "✅ Help files in VFS init" || echo "❌ Help files missing"

# 5. Verify help endpoint reads from VFS
grep -q "vfs\|/Disk C/desktop/help.txt\|readFile" back/src/help/help.service.ts && \
echo "✅ Help endpoint reads from VFS" || echo "❌ Help endpoint not updated"

# 6. Verify icon sizes exist
test -d front/public/icons/chicago95-default/16x16 && \
test -d front/public/icons/chicago95-default/32x32 && \
test -d front/public/icons/chicago95-default/48x48 && \
echo "✅ Icon sizes exist" || echo "❌ Icon sizes missing"

# 7. Full build check
cd back && npm run build && cd ../front && npm run build && \
echo "✅ All builds pass" || echo "❌ Build failed"

# 8. Test suite
cd back && npm test && cd ../front && npm test && \
echo "✅ All tests pass" || echo "❌ Tests fail"
```

## Notes

- **No architecture redesign:** Only delete legacy and restore FP7 contract
- **Test-first:** Write tests before implementation (tests-red → implement → tests-green)
- **Documentation:** Update FP7.md, CUTLIST.md, and CUTLINE_PLAN.md after each phase
- **Rollback-friendly:** Each phase can be reverted independently

---

**End of REWRITE_CHECKLIST**
