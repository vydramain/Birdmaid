# CUTLINE_PLAN: Surgical Execution Plan for FP7-only Repo State

**Version:** 1.0  
**Date:** 2026-01-22  
**Supervisor:** Cutline Execution  
**Source of Truth:** [docs/fps/FP7.md](./fps/FP7.md), [docs/audit/FP7_COMPLIANCE_REPORT.md](./audit/FP7_COMPLIANCE_REPORT.md), [docs/audit/FP7_DELETE_REWRITE_LIST.md](./audit/FP7_DELETE_REWRITE_LIST.md)

## Goal

Reach FP7-only repository state in minimal, rollback-friendly commits. Each commit is atomic, testable, and reversible.

## Commit Strategy

- **Atomic commits:** Each commit removes/rewrites one logical unit
- **Test-first:** Verify removal with tests/grep/build before commit
- **Rollback-friendly:** Each commit can be reverted independently
- **No architecture redesign:** Only delete legacy and restore FP7 contract

## Commit Plan

### C1: Delete Legacy Auth DTOs (P0)

**Intent:** Remove email/password auth DTOs that violate FP7 contract.

**Paths affected:**
- `back/src/auth/dto/register.dto.ts` (DELETE)
- `back/src/auth/dto/login.dto.ts` (DELETE)
- `back/src/auth/dto/recovery-request.dto.ts` (DELETE)
- `back/src/auth/dto/recovery-verify.dto.ts` (DELETE)
- `back/src/auth/auth.controller.ts` (REMOVE imports and endpoint methods: lines 3-6, 15-33)
- `back/src/auth/auth.service.ts` (REMOVE methods: register, login, requestRecovery, verifyRecovery, hashPassword)

**Acceptance check:**
```bash
# 1. Verify DTOs deleted
test ! -f back/src/auth/dto/register.dto.ts && \
test ! -f back/src/auth/dto/login.dto.ts && \
test ! -f back/src/auth/dto/recovery-request.dto.ts && \
test ! -f back/src/auth/dto/recovery-verify.dto.ts && \
echo "✅ DTOs deleted"

# 2. Verify controller doesn't import DTOs
grep -q "RegisterDto\|LoginDto\|RecoveryRequestDto\|RecoveryVerifyDto" back/src/auth/auth.controller.ts && \
echo "❌ Controller still imports DTOs" || echo "✅ Controller clean"

# 3. Verify endpoints removed
grep -q "@Post(\"register\")\|@Post(\"login\")\|@Post(\"recovery\")" back/src/auth/auth.controller.ts && \
echo "❌ Endpoints still exist" || echo "✅ Endpoints removed"

# 4. Build check
cd back && npm run build 2>&1 | grep -q "error" && echo "❌ Build failed" || echo "✅ Build passes"
```

**Rollback:** `git revert C1` restores DTOs and endpoints.

---

### C2: Delete Legacy Auth Tests (P0)

**Intent:** Remove tests validating OUT-of-FP7 email/password auth behavior.

**Paths affected:**
- `back/__tests__/fp4/auth.register.test.ts` (DELETE)
- `back/__tests__/fp4/auth.login.test.ts` (DELETE)
- `back/__tests__/fp4/auth.recovery.test.ts` (DELETE)
- `front/__tests__/fp4/auth.flows.test.tsx` (DELETE if exists)

**Acceptance check:**
```bash
# 1. Verify test files deleted
test ! -f back/__tests__/fp4/auth.register.test.ts && \
test ! -f back/__tests__/fp4/auth.login.test.ts && \
test ! -f back/__tests__/fp4/auth.recovery.test.ts && \
echo "✅ Auth tests deleted"

# 2. Verify tests don't run
cd back && npm test -- --testPathPattern="auth.register|auth.login|auth.recovery" 2>&1 | \
grep -q "No tests found\|No test files found" && echo "✅ Tests removed" || echo "❌ Tests still run"

# 3. Verify no references in test configs
grep -r "auth.register\|auth.login\|auth.recovery" back/__tests__/ 2>/dev/null && \
echo "❌ References found" || echo "✅ No references"
```

**Rollback:** `git revert C2` restores test files.

---

### C3: Delete Email Service (P1)

**Intent:** Remove email service not needed for Telegram auth.

**Paths affected:**
- `back/src/auth/email.service.ts` (DELETE)
- `back/src/auth/auth.service.ts` (REMOVE EmailService import and constructor injection)
- `back/src/auth/auth.module.ts` (REMOVE EmailService from providers)

**Acceptance check:**
```bash
# 1. Verify email service deleted
test ! -f back/src/auth/email.service.ts && echo "✅ Email service deleted"

# 2. Verify no imports
grep -r "EmailService\|email.service" back/src/auth/ --exclude-dir=node_modules && \
echo "❌ Imports found" || echo "✅ No imports"

# 3. Build check
cd back && npm run build 2>&1 | grep -q "error" && echo "❌ Build failed" || echo "✅ Build passes"
```

**Rollback:** `git revert C3` restores email service.

---

### C4: Remove isSuperAdmin from Backend (P0 - Part 1)

**Intent:** Remove `isSuperAdmin` field usage from backend code, replace with role checks.

**Paths affected:**
- `back/src/users/users.repository.ts` (REMOVE isSuperAdmin field or mark deprecated)
- `back/src/auth/auth.service.ts` (REPLACE isSuperAdmin checks with role checks, lines 24-200)
- `back/src/auth/auth.controller.ts` (REMOVE isSuperAdmin from /me response, line 55)
- `back/src/vfs/vfs.controller.ts` (REPLACE isSuperAdmin with role check, line 18)
- `back/src/games/games.service.ts` (REPLACE isSuperAdmin parameters with role, lines 12-264)
- `back/src/games/games.controller.ts` (REPLACE isSuperAdmin usage with role, lines 72-828)

**Acceptance check:**
```bash
# 1. Verify isSuperAdmin removed from JWT payload generation
grep -q "isSuperAdmin.*payload\|payload.*isSuperAdmin" back/src/auth/auth.service.ts && \
echo "❌ isSuperAdmin in payload" || echo "✅ Payload clean"

# 2. Verify role checks used instead
grep -q "role.*===.*Organizer\|role.*!==.*Organizer" back/src/auth/auth.service.ts && \
echo "✅ Role checks found" || echo "❌ No role checks"

# 3. Verify /me endpoint doesn't return isSuperAdmin (or marks deprecated)
grep -A 5 "getMe" back/src/auth/auth.controller.ts | grep -q "isSuperAdmin" && \
echo "⚠️  isSuperAdmin still in /me (check if deprecated)" || echo "✅ /me clean"

# 4. Build check
cd back && npm run build 2>&1 | grep -q "error" && echo "❌ Build failed" || echo "✅ Build passes"
```

**Rollback:** `git revert C4` restores isSuperAdmin usage.

---

### C5: Remove isSuperAdmin from Frontend (P0 - Part 2)

**Intent:** Remove `isSuperAdmin` field usage from frontend code, replace with role checks.

**Paths affected:**
- `front/src/contexts/AuthContext.tsx` (REMOVE isSuperAdmin field, use role only, lines 10-114)
- `front/src/os/apps/UserPanelApp.tsx` (REPLACE isSuperAdmin check with role === 'Organizer', line 19)
- `front/src/test/mocks/mockApi.ts` (REPLACE isSuperAdmin in mocks, lines 228-268)
- `front/src/test/fixtures/user.ts` (REMOVE isSuperAdmin from fixtures, lines 9-20)

**Acceptance check:**
```bash
# 1. Verify isSuperAdmin removed from User type (or marked deprecated)
grep -A 3 "type User" front/src/contexts/AuthContext.tsx | grep -q "isSuperAdmin.*deprecated\|role.*UserRole" && \
echo "✅ User type updated" || echo "❌ User type not updated"

# 2. Verify role checks used instead
grep -q "role.*===.*Organizer\|role.*!==.*Organizer" front/src/os/apps/UserPanelApp.tsx && \
echo "✅ Role checks found" || echo "❌ No role checks"

# 3. Verify no isSuperAdmin in production code (except deprecated)
grep -r "isSuperAdmin" front/src/ --exclude-dir=legacy --exclude-dir=node_modules --include="*.tsx" --include="*.ts" | \
grep -v "deprecated\|//" && echo "❌ isSuperAdmin found" || echo "✅ No isSuperAdmin"

# 4. Build check
cd front && npm run build 2>&1 | grep -q "error" && echo "❌ Build failed" || echo "✅ Build passes"
```

**Rollback:** `git revert C5` restores isSuperAdmin usage.

---

### C6: Rewrite AuthModal for Telegram (P0)

**Intent:** Replace email/password form with Telegram auth UI.

**Paths affected:**
- `front/src/components/AuthModal.tsx` (REWRITE: remove email/password forms, add Telegram auth button/widget, lines 12-291)

**Acceptance check:**
```bash
# 1. Verify email/password fields removed
grep -q "email\|password\|identifier" front/src/components/AuthModal.tsx | \
grep -v "Telegram\|comment\|//" && echo "❌ Email/password fields found" || echo "✅ Fields removed"

# 2. Verify Telegram auth UI present
grep -q "Telegram\|telegramAuth\|@telegram" front/src/components/AuthModal.tsx && \
echo "✅ Telegram auth UI found" || echo "❌ No Telegram auth UI"

# 3. Build check
cd front && npm run build 2>&1 | grep -q "error" && echo "❌ Build failed" || echo "✅ Build passes"
```

**Rollback:** `git revert C6` restores email/password form.

---

### C7: Rewrite AuthContext for Telegram (P0)

**Intent:** Replace email/password auth methods with Telegram auth method.

**Paths affected:**
- `front/src/contexts/AuthContext.tsx` (REWRITE: remove register, login, requestRecovery, verifyRecovery methods, add telegramAuth method, lines 27-132)

**Acceptance check:**
```bash
# 1. Verify email/password methods removed
grep -q "login.*identifier.*password\|register.*email.*password\|requestRecovery\|verifyRecovery" \
front/src/contexts/AuthContext.tsx && echo "❌ Methods found" || echo "✅ Methods removed"

# 2. Verify telegramAuth method present
grep -q "telegramAuth\|telegram.*auth" front/src/contexts/AuthContext.tsx && \
echo "✅ Telegram auth method found" || echo "❌ No Telegram auth method"

# 3. Build check
cd front && npm run build 2>&1 | grep -q "error" && echo "❌ Build failed" || echo "✅ Build passes"
```

**Rollback:** `git revert C7` restores email/password methods.

---

### C8: Add Telegram Auth Endpoint (P0)

**Intent:** Implement required `/api/auth/telegram` endpoint per FP7 contract.

**Paths affected:**
- `back/src/auth/auth.controller.ts` (ADD @Post("telegram") endpoint)
- `back/src/auth/auth.service.ts` (ADD telegramAuth method with signature verification)

**Acceptance check:**
```bash
# 1. Verify endpoint exists
grep -q "@Post(\"telegram\")\|@Post('telegram')" back/src/auth/auth.controller.ts && \
echo "✅ Telegram endpoint found" || echo "❌ No Telegram endpoint"

# 2. Verify service method exists
grep -q "telegramAuth\|telegram.*auth" back/src/auth/auth.service.ts && \
echo "✅ Service method found" || echo "❌ No service method"

# 3. Build check
cd back && npm run build 2>&1 | grep -q "error" && echo "❌ Build failed" || echo "✅ Build passes"

# 4. Test endpoint (if tests exist)
cd back && npm test -- --testPathPattern="auth.telegram" 2>&1 | \
grep -q "PASS\|✓" && echo "✅ Tests pass" || echo "⚠️  No tests or tests fail"
```

**Rollback:** `git revert C8` removes Telegram endpoint.

---

### C9: Verify Legacy Pages Not Used (P1)

**Intent:** Verify legacy pages are not imported in production code, keep as history if unused.

**Paths affected:**
- `front/src/legacy/pages.tsx` (VERIFY not imported)
- `front/src/` (CHECK for imports of CatalogPage, GamePage, TeamsPage, EditorPage)

**Acceptance check:**
```bash
# 1. Verify legacy pages not imported in production
grep -r "CatalogPage\|GamePage\|TeamsPage\|EditorPage" front/src/ --exclude-dir=legacy --exclude-dir=node_modules && \
echo "❌ Legacy pages imported" || echo "✅ Legacy pages not imported"

# 2. Verify legacy folder exists (for history)
test -d front/src/legacy && echo "✅ Legacy folder exists" || echo "⚠️  Legacy folder missing"

# 3. Document decision: KEEP as history or DELETE
echo "Decision: KEEP as history (not imported in production)"
```

**Rollback:** N/A (verification only, no code changes).

---

### C10: Rewrite Help Endpoint to Read from VFS (P1)

**Intent:** Change help endpoint to read from VFS Desktop folder instead of DB.

**Paths affected:**
- `back/src/help/help.service.ts` (REWRITE: read from VFS `/Disk C/desktop/help.txt`)
- `back/src/help/help.repository.ts` (REWRITE: remove DB-based help, use VFS API, lines 31-71)
- `back/src/help/help.controller.ts` (UPDATE: ensure reads from VFS)

**Acceptance check:**
```bash
# 1. Verify DB reads removed
grep -q "findOne\|findById\|db.*help" back/src/help/help.repository.ts && \
echo "❌ DB reads found" || echo "✅ DB reads removed"

# 2. Verify VFS reads present
grep -q "vfs\|/Disk C/desktop/help.txt\|readFile" back/src/help/help.service.ts && \
echo "✅ VFS reads found" || echo "❌ No VFS reads"

# 3. Build check
cd back && npm run build 2>&1 | grep -q "error" && echo "❌ Build failed" || echo "✅ Build passes"
```

**Rollback:** `git revert C10` restores DB-based help.

---

### C11: Add admin_help.txt for Organizer (P1)

**Intent:** Create `admin_help.txt` in VFS init for Organizer role only.

**Paths affected:**
- `front/src/os/fs/vfs-init.ts` (ADD admin_help.txt creation, line 24)

**Acceptance check:**
```bash
# 1. Verify admin_help.txt creation
grep -q "admin_help.txt\|admin_help" front/src/os/fs/vfs-init.ts && \
echo "✅ admin_help.txt creation found" || echo "❌ No admin_help.txt"

# 2. Verify Organizer-only visibility (if implemented)
grep -A 5 "admin_help" front/src/os/fs/vfs-init.ts | grep -q "Organizer\|role" && \
echo "✅ Organizer check found" || echo "⚠️  Organizer check not found"

# 3. Build check
cd front && npm run build 2>&1 | grep -q "error" && echo "❌ Build failed" || echo "✅ Build passes"
```

**Rollback:** `git revert C11` removes admin_help.txt creation.

---

### C12: Verify Games/Teams/Comments Scope (P1)

**Intent:** Verify if Games/Teams/Comments endpoints are OUT of FP7 scope, delete if confirmed.

**Paths affected:**
- `back/src/games/` (VERIFY scope, DELETE if OUT)
- `back/src/teams/` (VERIFY scope, DELETE if OUT)
- `back/src/comments/` (VERIFY scope, DELETE if OUT)

**Acceptance check:**
```bash
# 1. Check FP7 scope (manual review)
echo "Manual review required: Check FP7.md line 266-268 for social features scope"

# 2. If OUT of scope, verify deletion
if [ "$SCOPE_DECISION" = "DELETE" ]; then
  test ! -d back/src/games && test ! -d back/src/teams && test ! -d back/src/comments && \
  echo "✅ Modules deleted" || echo "❌ Modules still exist"
fi

# 3. Build check
cd back && npm run build 2>&1 | grep -q "error" && echo "❌ Build failed" || echo "✅ Build passes"
```

**Rollback:** `git revert C12` restores modules (if deleted).

---

## Execution Order

**Phase 1: Critical Deletions (P0)**
1. C1: Delete Legacy Auth DTOs
2. C2: Delete Legacy Auth Tests
3. C4: Remove isSuperAdmin from Backend
4. C5: Remove isSuperAdmin from Frontend
5. C6: Rewrite AuthModal for Telegram
6. C7: Rewrite AuthContext for Telegram
7. C8: Add Telegram Auth Endpoint

**Phase 2: High Priority (P1)**
8. C3: Delete Email Service
9. C9: Verify Legacy Pages Not Used
10. C10: Rewrite Help Endpoint to Read from VFS
11. C11: Add admin_help.txt for Organizer
12. C12: Verify Games/Teams/Comments Scope

## Rollback Strategy

Each commit is independently revertible:
- `git revert <commit-hash>` for any commit
- Test after revert to ensure system works
- Document revert reason in commit message

## Verification Commands

**After all commits:**
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

# 4. Full build check
cd back && npm run build && cd ../front && npm run build && \
echo "✅ All builds pass" || echo "❌ Build failed"

# 5. Test suite
cd back && npm test && cd ../front && npm test && \
echo "✅ All tests pass" || echo "❌ Tests fail"
```

## Notes

- **No architecture redesign:** Only delete legacy and restore FP7 contract
- **Rollback-friendly:** Each commit is atomic and reversible
- **Test-first:** Verify removal with tests/grep/build before commit
- **Documentation:** Update CUTLIST.md and REWRITE_CHECKLIST.md after each phase

---

**End of CUTLINE_PLAN**
