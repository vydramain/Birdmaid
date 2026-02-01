# FP7 Delete/Rewrite List

**Version:** 1.0  
**Date:** 2026-01-22  
**Auditor:** Inspector (Code Audit)  
**Source of Truth:** [docs/fps/FP7.md](../fps/FP7.md)

## Purpose

This document provides exact folders/files/modules to delete, rewrite, or keep as docs/history for FP7 compliance.

## DELETE Set (Remove Immediately)

### Backend: Auth Endpoints (P0)

**Files to Delete:**
- `back/src/auth/dto/register.dto.ts`
- `back/src/auth/dto/login.dto.ts`
- `back/src/auth/dto/recovery-request.dto.ts`
- `back/src/auth/dto/recovery-verify.dto.ts`
- `back/src/auth/email.service.ts` (if exists)

**Code to Remove:**
- `back/src/auth/auth.controller.ts:15-33` (register, login, recovery endpoints)
- `back/src/auth/auth.service.ts:38-112` (register, login, recovery methods)

**Evidence:**
- FP7.md line 245-248: "Email/password auth: Удалить регистрацию через email/password"
- FP7.md line 860-862: Only `/api/auth/dev`, `/api/auth/telegram`, `/api/auth/me` should exist

### Backend: Auth Tests (P0)

**Files to Delete:**
- `back/__tests__/fp4/auth.register.test.ts`
- `back/__tests__/fp4/auth.login.test.ts`
- `back/__tests__/fp4/auth.recovery.test.ts`

**Evidence:**
- FP7.md line 891-893: "Удалить: Все тесты для email/password auth"

### Frontend: Auth Tests (P0)

**Files to Delete:**
- `front/__tests__/fp4/auth.flows.test.tsx` (if tests email/password auth)

**Evidence:**
- FP7.md line 891-893: "Удалить: Все тесты для email/password auth"

### Backend: Comments Endpoints (P1 - Verify First)

**Files to Delete (if confirmed OUT of FP7):**
- `back/src/comments/comments.controller.ts`
- `back/src/comments/comments.service.ts`
- `back/src/comments/comments.repository.ts`
- `back/src/comments/comments.module.ts`

**Evidence:**
- FP7.md line 266-268: "Не входит: комментарии, рейтинги, 'соцсеть'"

**Action:** VERIFY first - check if comments are used by VFS/Explorer or only for games.

### Backend: Games/Teams Endpoints (P1 - Verify First)

**Files to Delete (if confirmed OUT of FP7):**
- `back/src/games/` (entire folder, if games are social feature only)
- `back/src/teams/` (entire folder, if teams are social feature only)

**Evidence:**
- FP7.md line 266-268: "Не входит: комментарии, рейтинги, 'соцсеть'"

**Action:** VERIFY first - check if games/teams are used by VFS/Explorer or only for social features.

## REWRITE Set (Must Rewrite Implementation)

### Backend: Add Telegram Auth (P0)

**File to Modify:**
- `back/src/auth/auth.controller.ts`

**Action:**
- Add `@Post("telegram")` endpoint
- Implement Telegram auth signature verification
- Return JWT token with user role

**Evidence:**
- FP7.md line 860: `/api/auth/telegram` is required endpoint
- FP7.md line 245-248: "Заменить на Telegram auth"

**Reference:**
- FP7.md line 860-862: Telegram auth contract

### Backend: Replace isSuperAdmin with Role (P0)

**Files to Modify:**
- `back/src/users/users.repository.ts` (remove `isSuperAdmin` field or mark deprecated)
- `back/src/auth/auth.service.ts` (replace all `isSuperAdmin` checks with role checks)
- `back/src/auth/auth.controller.ts:55-56` (remove `isSuperAdmin` from response)
- `back/src/vfs/vfs.controller.ts:18` (replace `isSuperAdmin` with role)
- `back/src/games/games.service.ts` (replace all `isSuperAdmin` parameters with role)
- `back/src/games/games.controller.ts` (replace all `isSuperAdmin` usage with role)

**Action:**
- Replace `isSuperAdmin` boolean checks with `role === 'Organizer'`
- Remove `isSuperAdmin` from JWT payload (keep only for backward compatibility during migration)
- Update all service methods to use `role: UserRole` instead of `isSuperAdmin: boolean`

**Evidence:**
- FP7.md line 250-252: "Удалить `isSuperAdmin` как отдельную роль. Заменить на Guest/Participant/Organizer модель"

**Files with isSuperAdmin usage:**
- `back/src/users/users.repository.ts:11`
- `back/src/auth/auth.service.ts:24-200` (53 matches)
- `back/src/games/games.service.ts:12-264` (20 matches)
- `back/src/games/games.controller.ts:72-828` (15 matches)
- `back/src/vfs/vfs.controller.ts:18`

### Frontend: Rewrite AuthModal for Telegram (P0)

**File to Modify:**
- `front/src/components/AuthModal.tsx`

**Action:**
- Remove email/password form fields
- Add Telegram auth button/widget
- Integrate with Telegram Web App SDK or Telegram Login Widget

**Evidence:**
- FP7.md line 245-248: "Заменить на Telegram auth"
- Current: `front/src/components/AuthModal.tsx:12-291` uses email/password

### Frontend: Rewrite AuthContext for Telegram (P0)

**File to Modify:**
- `front/src/contexts/AuthContext.tsx`

**Action:**
- Remove `register`, `login`, `requestRecovery`, `verifyRecovery` methods
- Add `telegramAuth` method
- Update `useAuth` hook to use Telegram auth

**Evidence:**
- FP7.md line 245-248: "Заменить на Telegram auth"
- Current: `front/src/contexts/AuthContext.tsx:27-132` has email/password methods

**Files to Modify:**
- `front/src/contexts/AuthContext.tsx:10-114` (remove isSuperAdmin, add Telegram auth)

### Frontend: Replace isSuperAdmin with Role (P0)

**Files to Modify:**
- `front/src/contexts/AuthContext.tsx:10-114` (remove `isSuperAdmin` field, use `role` only)
- `front/src/os/apps/UserPanelApp.tsx:19` (replace `isSuperAdmin` check with `role === 'Organizer'`)
- `front/src/test/mocks/mockApi.ts:228-268` (replace `isSuperAdmin` in mocks)
- `front/src/test/fixtures/user.ts:9-20` (remove `isSuperAdmin` from fixtures)

**Action:**
- Replace all `user.isSuperAdmin` checks with `user.role === 'Organizer'`
- Remove `isSuperAdmin` from User type (keep only for backward compatibility during migration)

**Evidence:**
- FP7.md line 250-252: "Удалить `isSuperAdmin` как отдельную роль"

**Files with isSuperAdmin usage:**
- `front/src/contexts/AuthContext.tsx:10-114` (26 matches)
- `front/src/os/apps/UserPanelApp.tsx:19`
- `front/src/legacy/pages.tsx:337-1831` (legacy, but verify not used)

### Backend: Rewrite Help Endpoint (P1)

**File to Modify:**
- `back/src/help/help.service.ts`
- `back/src/help/help.repository.ts`

**Action:**
- Remove DB-based help content
- Read `help.txt` from VFS `/Disk C/desktop/help.txt`
- Read `admin_help.txt` from VFS `/Disk C/desktop/admin_help.txt` (only for Organizer role)

**Evidence:**
- FP7.md line 340-368: Help files must exist on Desktop (`/Disk C/desktop/help.txt`, `/Disk C/desktop/admin_help.txt`)
- Current: `back/src/help/help.repository.ts:31-71` reads from DB

### Frontend: Add admin_help.txt for Organizer (P1)

**File to Modify:**
- `front/src/os/fs/vfs-init.ts`

**Action:**
- Add `admin_help.txt` creation in VFS init
- Ensure `admin_help.txt` is only visible/accessible for Organizer role

**Evidence:**
- FP7.md line 340-368: "admin_help.txt only for Organizer"
- Current: `front/src/os/fs/vfs-init.ts:24` only creates `help.txt`

## KEEP Set (Keep as Docs/History Only)

### Legacy Pages (P1 - Verify Not Used)

**Files to Keep:**
- `front/src/legacy/pages.tsx` (CatalogPage, GamePage, TeamsPage, EditorPage)

**Action:**
- Verify these are NOT imported in production code:
  ```bash
  grep -r "CatalogPage\|GamePage\|TeamsPage\|EditorPage" front/src --exclude-dir=legacy
  ```
- If not imported, KEEP as history/docs
- If imported, DELETE or move to separate legacy package

**Evidence:**
- FP7.md line 240-244: "Удалить все маршруты `/catalog`, `/games/:id`, `/teams`, `/editor/*`"
- Current: `front/src/legacy/pages.tsx:1-1893` contains legacy pages

### Legacy Tests (P1 - Verify)

**Files to Keep (if not testing FP7 features):**
- `front/__tests__/fp1/`, `fp2/`, `fp4/`, `fp5/`, `fp6/` (if they test react-router routes)

**Action:**
- Verify these test react-router routes or OUT-of-FP7 features
- If yes, DELETE or move to `front/__tests__/legacy/`
- If they test FP7 features, KEEP

**Evidence:**
- FP7.md line 891-892: "Удалить: Все тесты для react-router маршрутов"

## Git-Oriented Commands

### Delete Commands

```bash
# Delete email/password auth DTOs
rm back/src/auth/dto/register.dto.ts
rm back/src/auth/dto/login.dto.ts
rm back/src/auth/dto/recovery-request.dto.ts
rm back/src/auth/dto/recovery-verify.dto.ts

# Delete email/password auth tests
rm back/__tests__/fp4/auth.register.test.ts
rm back/__tests__/fp4/auth.login.test.ts
rm back/__tests__/fp4/auth.recovery.test.ts
rm front/__tests__/fp4/auth.flows.test.tsx  # if exists

# Delete email service (if exists)
rm back/src/auth/email.service.ts  # if exists

# Delete comments (if confirmed OUT of FP7)
rm -rf back/src/comments/

# Delete games/teams (if confirmed OUT of FP7)
rm -rf back/src/games/
rm -rf back/src/teams/
```

### Rewrite Checklist

- [ ] Add Telegram auth endpoint in `back/src/auth/auth.controller.ts`
- [ ] Replace `isSuperAdmin` with `role` in all backend files
- [ ] Replace `isSuperAdmin` with `role` in all frontend files
- [ ] Rewrite `AuthModal.tsx` for Telegram auth
- [ ] Rewrite `AuthContext.tsx` for Telegram auth
- [ ] Rewrite help endpoint to read from VFS Desktop folder
- [ ] Add `admin_help.txt` creation in VFS init

## Summary

### Immediate Actions (P0)
1. DELETE email/password auth endpoints and DTOs
2. DELETE email/password auth tests
3. REWRITE add Telegram auth endpoint
4. REWRITE replace `isSuperAdmin` with role checks
5. REWRITE AuthModal and AuthContext for Telegram

### High Priority (P1)
1. VERIFY legacy pages not used
2. VERIFY Games/Teams/Comments endpoints scope
3. REWRITE help endpoint to read from VFS
4. REWRITE add admin_help.txt for Organizer

### Keep as History
1. Legacy pages in `front/src/legacy/pages.tsx` (if not imported)
2. Legacy tests in `front/__tests__/fp1/`, `fp2/`, `fp4/`, `fp5/`, `fp6/` (if not testing FP7)
