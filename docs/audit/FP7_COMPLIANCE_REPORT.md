# FP7 Compliance Report

**Version:** 1.0  
**Date:** 2026-01-22  
**Auditor:** Inspector (Code Audit)  
**Source of Truth:** [docs/fps/FP7.md](../fps/FP7.md)

## Executive Summary

This report identifies all code that contradicts FP7 contract requirements. Each violation is categorized as:
- **P0 (Critical):** Must be fixed immediately (blocks FP7 compliance)
- **P1 (High):** Must be fixed before release
- **P2 (Medium):** Should be fixed for full compliance

## Compliance Table

| FP7 Contract Clause | Current Code Reality | Mismatch | Evidence (file:path:line) | Action | Priority |
|---------------------|---------------------|----------|---------------------------|--------|----------|
| **Auth API: Only `/api/auth/dev`, `/api/auth/telegram`, `/api/auth/me`** | Email/password endpoints exist: `/api/auth/register`, `/api/auth/login`, `/api/auth/recovery/request`, `/api/auth/recovery/verify` | Email/password auth violates FP7 contract (Scope OUT, line 245-248) | `back/src/auth/auth.controller.ts:15-33` | DELETE endpoints | P0 |
| **Auth API: `/api/auth/telegram` must exist** | No Telegram auth endpoint implemented | Missing required endpoint | `back/src/auth/auth.controller.ts` (no `telegram` method) | REWRITE: Add Telegram auth endpoint | P0 |
| **Roles: Guest/Participant/Organizer only (no `isSuperAdmin`)** | `isSuperAdmin` field and logic used throughout codebase | Old role model contradicts FP7 (Scope OUT, line 250-252) | `back/src/users/users.repository.ts:11`, `back/src/auth/auth.service.ts:24-200`, `back/src/games/games.service.ts:12-264`, `back/src/games/games.controller.ts:72-828`, `front/src/contexts/AuthContext.tsx:10-114`, `front/src/os/apps/UserPanelApp.tsx:19` | REWRITE: Replace `isSuperAdmin` checks with role checks | P0 |
| **Shell-only navigation: No react-router routes** | Legacy pages exist in `front/src/legacy/pages.tsx` (CatalogPage, GamePage, TeamsPage, EditorPage) | Legacy code may be imported/used | `front/src/legacy/pages.tsx:1-1893` | KEEP as docs/history (verify not imported) | P1 |
| **Desktop Icons: Read from `/Disk C/desktop`** | Desktop icons correctly read from `/Disk C/desktop` | ✅ COMPLIANT | `front/src/pages/DesktopPage.tsx:24`, `front/apps/mobile/MobileApp.tsx:34` | KEEP (no action) | - |
| **Help files: `help.txt` always on Desktop, `admin_help.txt` only for Organizer** | `help.txt` exists in VFS init, but `admin_help.txt` not found | Missing `admin_help.txt` for Organizer role | `front/src/os/fs/vfs-init.ts:24` (only `help.txt`), no `admin_help.txt` | REWRITE: Add `admin_help.txt` creation for Organizer | P1 |
| **Icons pipeline: 16/32/48 sizes must exist** | Icons exist in `front/public/icons/chicago95-default/{16x16,32x32,48x48}/` | ✅ COMPLIANT | `front/public/icons/chicago95-default/` (97 files found) | KEEP (no action) | - |
| **VFS: Root-level system folders immutable** | Immutability checks implemented in VFS service | ✅ COMPLIANT | `back/src/vfs/vfs.service.ts:49-55`, `back/__tests__/fp7/vfs.immutable-folders.test.ts` | KEEP (no action) | - |
| **VFS: Subtree mutable (inside system folders)** | Organizer can create/upload/move/delete in subtree | ✅ COMPLIANT | `back/src/vfs/vfs.service.ts:60-66`, `front/__tests__/fp7/vfs.organizer.nested-ops.test.tsx` | KEEP (no action) | - |
| **Tests: No tests for email/password auth** | Tests exist for email/password auth | Tests validate OUT-of-FP7 behavior | `back/__tests__/fp4/auth.register.test.ts`, `back/__tests__/fp4/auth.login.test.ts`, `back/__tests__/fp4/auth.recovery.test.ts`, `front/__tests__/fp4/auth.flows.test.tsx` | DELETE tests | P0 |
| **Tests: No tests for react-router routes** | Legacy pages in `legacy/` folder (not tested in FP7 tests) | ✅ COMPLIANT (legacy not tested) | `front/__tests__/fp7/` (no legacy route tests) | KEEP (no action) | - |
| **Backend API: Games/Teams/Comments endpoints** | Games, Teams, Comments controllers exist | May be OUT of FP7 scope (social features, line 266-268) | `back/src/games/`, `back/src/teams/`, `back/src/comments/` | VERIFY: Check if these are OUT of FP7 scope | P1 |
| **Frontend: AuthModal uses email/password** | `AuthModal.tsx` implements email/password forms | Contradicts Telegram auth requirement | `front/src/components/AuthModal.tsx:12-291` | REWRITE: Replace with Telegram auth UI | P0 |
| **Frontend: AuthContext uses email/password** | `AuthContext.tsx` has `register`, `login`, `requestRecovery`, `verifyRecovery` methods | Contradicts Telegram auth requirement | `front/src/contexts/AuthContext.tsx:27-132` | REWRITE: Replace with Telegram auth methods | P0 |
| **Backend: Help endpoint `/api/help`** | Help endpoint exists but reads from DB, not VFS Desktop | Help should be read from `/Disk C/desktop/help.txt` | `back/src/help/help.controller.ts:8-11`, `back/src/help/help.repository.ts:31-71` | REWRITE: Read help from VFS Desktop folder | P1 |
| **Backend: Email service (if exists)** | Email service may exist for password recovery | Not needed for Telegram auth | `back/src/auth/email.service.ts` (if exists) | DELETE if exists | P1 |
| **DTOs: RegisterDto, LoginDto, RecoveryRequestDto, RecoveryVerifyDto** | DTOs exist for email/password auth | Not needed for Telegram auth | `back/src/auth/dto/register.dto.ts`, `back/src/auth/dto/login.dto.ts`, `back/src/auth/dto/recovery-request.dto.ts`, `back/src/auth/dto/recovery-verify.dto.ts` | DELETE DTOs | P0 |

## Summary by Priority

### P0 (Critical - Must Fix Immediately)
1. **DELETE** email/password auth endpoints (`/api/auth/register`, `/api/auth/login`, `/api/auth/recovery/*`)
2. **REWRITE** add Telegram auth endpoint (`/api/auth/telegram`)
3. **REWRITE** replace `isSuperAdmin` with role checks throughout codebase
4. **DELETE** email/password auth tests
5. **REWRITE** `AuthModal.tsx` and `AuthContext.tsx` for Telegram auth
6. **DELETE** email/password auth DTOs

### P1 (High - Must Fix Before Release)
1. **VERIFY** legacy pages not imported/used in production
2. **REWRITE** add `admin_help.txt` for Organizer role
3. **VERIFY** Games/Teams/Comments endpoints are OUT of FP7 scope
4. **REWRITE** help endpoint to read from VFS Desktop folder
5. **DELETE** email service if exists

### P2 (Medium - Should Fix for Full Compliance)
- None identified

## Notes

- Desktop icons implementation is **COMPLIANT** ✅
- Icons pipeline (16/32/48) is **COMPLIANT** ✅
- VFS immutability checks are **COMPLIANT** ✅
- Tests for FP7 features exist and are **COMPLIANT** ✅
