# FP7 Auth Cleanup - PR Summary

## Why

Implements minimal FP7-compliant auth by removing all legacy email/password authentication and keeping only:
- `POST /api/auth/dev` (AUTH_MODE=dev)
- `POST /api/auth/telegram` (AUTH_MODE=telegram)
- `GET /api/auth/me`

This aligns with FP7.md requirements (Scope OUT, line 245-248) which explicitly removes email/password auth in favor of Telegram auth.

## What Changed

### Backend

1. **Removed legacy endpoints:**
   - `POST /api/auth/register`
   - `POST /api/auth/login`
   - `POST /api/auth/recovery/request`
   - `POST /api/auth/recovery/verify`

2. **Implemented AUTH_MODE gating:**
   - `AUTH_MODE=dev`: enables `/api/auth/dev`, blocks `/api/auth/telegram` (returns 403)
   - `AUTH_MODE=telegram`: enables `/api/auth/telegram`, blocks `/api/auth/dev` (returns 403)
   - Default: `AUTH_MODE=telegram` (dev mode blocked by default)

3. **Fixed `/api/auth/dev` behavior:**
   - Creates user if `userId` not found (instead of throwing error)
   - Updates role in DB if provided and different from user's role
   - Persists role in DB as editable field
   - JWT includes role for backend RBAC checks

4. **Added `/api/auth/telegram` endpoint:**
   - Stub implementation (returns 501 Not Implemented)
   - AUTH_MODE gating enforced

### Frontend

1. **Updated AuthContext:**
   - Removed: `login`, `register`, `requestRecovery`, `verifyRecovery`
   - Added: `devAuth`, `telegramAuth`

2. **Updated AuthModal:**
   - Removed all email/password fields
   - Simple dev auth form: userId (optional) + role selector
   - Creates user if userId not provided

### Tests

1. **Unit tests:**
   - `auth.dev.test.ts`: Updated for new devAuth behavior (create user if not found, update role)
   - `auth.mode-gating.test.ts`: Tests AUTH_MODE gating for both endpoints

2. **Integration test:**
   - `auth.integration.test.ts`: Tests dev login returns token + `/me` returns user+role

## Removed Files

### Backend DTOs
- `back/src/auth/dto/register.dto.ts`
- `back/src/auth/dto/login.dto.ts`
- `back/src/auth/dto/recovery-request.dto.ts`
- `back/src/auth/dto/recovery-verify.dto.ts`

### Backend Services
- `back/src/auth/email.service.ts`

## Removed Endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/recovery/request`
- `POST /api/auth/recovery/verify`

## Removed Methods

### Backend Service
- `register()`
- `login()`
- `requestRecovery()`
- `verifyRecovery()`
- `hashPassword()`
- `verifyPassword()`
- `getRecoveryCode()`

### Frontend Context
- `login()`
- `register()`
- `requestRecovery()`
- `verifyRecovery()`

## How Tested

1. **Unit tests:** All passing
   - `auth.dev.test.ts`: 8 tests passing
   - `auth.mode-gating.test.ts`: 6 tests passing

2. **Integration test:** 
   - `auth.integration.test.ts`: Tests full flow (dev auth → token → /me)

3. **Manual verification:**
   - No email/password references in codebase (except in docs/comments)
   - All legacy endpoints removed from controller
   - AUTH_MODE gating works correctly

## Notes

- `UserDoc` type still has `password` field for backward compatibility with existing DB data, but it's not used for authentication
- `telegramAuth` endpoint is a stub (returns 501) - actual Telegram auth implementation is out of scope
- Role persistence: `UsersRepository.updateRole()` method added to persist role changes in DB
- Frontend `AuthModal` simplified to dev auth only - Telegram auth UI can be added later
