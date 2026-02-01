# FP7 Legacy Surface Map

**Version:** 1.0  
**Date:** 2026-01-22  
**Auditor:** Inspector (Code Audit)  
**Source of Truth:** [docs/fps/FP7.md](../fps/FP7.md)

## Purpose

This document maps all routes, endpoints, UI screens/flows, and tests that exist but are **OUT of FP7 scope**. These should be removed or verified as legacy/history-only.

## Backend Routes/Endpoints OUT of FP7

### Auth Endpoints (P0 - Must Delete)

| Endpoint | Method | Current Location | FP7 Status | Action |
|----------|--------|------------------|------------|--------|
| `/api/auth/register` | POST | `back/src/auth/auth.controller.ts:15-18` | OUT (line 245-248) | DELETE |
| `/api/auth/login` | POST | `back/src/auth/auth.controller.ts:20-23` | OUT (line 245-248) | DELETE |
| `/api/auth/recovery/request` | POST | `back/src/auth/auth.controller.ts:25-28` | OUT (line 245-248) | DELETE |
| `/api/auth/recovery/verify` | POST | `back/src/auth/auth.controller.ts:30-33` | OUT (line 245-248) | DELETE |

**FP7 Contract:** Only `/api/auth/dev`, `/api/auth/telegram`, `/api/auth/me` should exist.

### Games Endpoints (P1 - Verify Scope)

| Endpoint | Method | Current Location | FP7 Status | Action |
|----------|--------|------------------|------------|--------|
| `/api/games` | GET | `back/src/games/games.controller.ts` | OUT? (social features, line 266-268) | VERIFY |
| `/api/games/:id` | GET | `back/src/games/games.controller.ts` | OUT? (social features) | VERIFY |
| `/api/games` | POST | `back/src/games/games.controller.ts` | OUT? (social features) | VERIFY |
| `/api/games/:id/comments` | GET/POST | `back/src/comments/comments.controller.ts` | OUT (line 266-268: "Не входит: комментарии") | DELETE |
| `/api/games/:id/publish` | POST | `back/src/games/games.controller.ts` | OUT? (social features) | VERIFY |
| `/api/games/:id/archive` | POST | `back/src/games/games.controller.ts` | OUT? (social features) | VERIFY |

**FP7 Contract:** Social functions (comments, ratings, "соцсеть") are OUT (line 266-268).

### Teams Endpoints (P1 - Verify Scope)

| Endpoint | Method | Current Location | FP7 Status | Action |
|----------|--------|------------------|------------|--------|
| `/api/teams` | GET | `back/src/teams/teams.controller.ts` | OUT? (social features) | VERIFY |
| `/api/teams` | POST | `back/src/teams/teams.controller.ts` | OUT? (social features) | VERIFY |
| `/api/teams/:id/members` | POST | `back/src/teams/teams.controller.ts` | OUT? (social features) | VERIFY |

**FP7 Contract:** Social functions are OUT (line 266-268).

### Help Endpoint (P1 - Rewrite)

| Endpoint | Method | Current Location | FP7 Status | Action |
|----------|--------|------------------|------------|--------|
| `/api/help` | GET | `back/src/help/help.controller.ts:8-11` | WRONG SOURCE | REWRITE |

**FP7 Contract:** Help files must exist on Desktop (`/Disk C/desktop/help.txt`, `/Disk C/desktop/admin_help.txt`). Current implementation reads from DB.

## Frontend UI Screens/Flows OUT of FP7

### Legacy Pages (P1 - Verify Not Used)

| Component | Location | FP7 Status | Action |
|-----------|----------|------------|--------|
| `CatalogPage` | `front/src/legacy/pages.tsx:224` | OUT (line 240-244) | KEEP as history (verify not imported) |
| `GamePage` | `front/src/legacy/pages.tsx:494` | OUT (line 240-244) | KEEP as history (verify not imported) |
| `TeamsPage` | `front/src/legacy/pages.tsx:738` | OUT (line 240-244) | KEEP as history (verify not imported) |
| `EditorPage` | `front/src/legacy/pages.tsx:1127` | OUT (line 240-244) | KEEP as history (verify not imported) |

**FP7 Contract:** Shell-only navigation. No react-router routes `/catalog`, `/games/:id`, `/teams`, `/editor/*` (line 240-244).

**Verification:** Check if these are imported anywhere:
```bash
grep -r "CatalogPage\|GamePage\|TeamsPage\|EditorPage" front/src --exclude-dir=legacy
```

### Auth Modal (P0 - Rewrite)

| Component | Location | FP7 Status | Action |
|-----------|----------|------------|--------|
| `AuthModal` | `front/src/components/AuthModal.tsx:12-291` | OUT (email/password) | REWRITE for Telegram auth |

**FP7 Contract:** Only Telegram auth (line 245-248).

## Tests OUT of FP7

### Email/Password Auth Tests (P0 - Delete)

| Test File | Location | FP7 Status | Action |
|-----------|----------|------------|--------|
| `auth.register.test.ts` | `back/__tests__/fp4/auth.register.test.ts` | OUT (email/password) | DELETE |
| `auth.login.test.ts` | `back/__tests__/fp4/auth.login.test.ts` | OUT (email/password) | DELETE |
| `auth.recovery.test.ts` | `back/__tests__/fp4/auth.recovery.test.ts` | OUT (email/password) | DELETE |
| `auth.flows.test.tsx` | `front/__tests__/fp4/auth.flows.test.tsx` | OUT (email/password) | DELETE |

**FP7 Contract:** Tests Contract (line 891-893) requires deletion of email/password auth tests.

### React-Router Route Tests (P1 - Verify)

| Test File | Location | FP7 Status | Action |
|-----------|----------|------------|--------|
| Tests for `/catalog`, `/games/:id`, `/teams`, `/editor/*` | `front/__tests__/fp1/`, `fp2/`, `fp4/`, `fp5/`, `fp6/` | OUT (line 891-892) | VERIFY: Check if exist and delete |

**FP7 Contract:** Tests Contract (line 891-892) requires deletion of react-router route tests.

## Summary

### Must Delete (P0)
- 4 auth endpoints (register, login, recovery/request, recovery/verify)
- 4 email/password auth test files
- Email/password auth DTOs

### Must Rewrite (P0)
- Add Telegram auth endpoint
- Rewrite AuthModal for Telegram
- Rewrite AuthContext for Telegram

### Must Verify (P1)
- Games/Teams/Comments endpoints (may be OUT of FP7 scope)
- Legacy pages not imported/used
- React-router route tests exist and should be deleted

### Must Rewrite (P1)
- Help endpoint to read from VFS Desktop folder
- Add admin_help.txt for Organizer role
