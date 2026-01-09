# FP4 Architecture Plan

## Overview

This document outlines the architectural changes required for FP4: User Accounts & Windows 95 UI. It describes what needs to be built, how it should be structured, and the goals of each change.

## Goals

1. **Authentication System**: Enable user registration, login (email/username), and password recovery via email codes.
2. **Authorization**: Implement role-based access (unauthenticated, authenticated user, super admin) with JWT tokens.
3. **Team Management**: Support team creation, membership management, and leadership transfer.
4. **Windows 95 UI**: Replace MUI Material 3 with custom Windows 95 styled components.
5. **Comments System**: Allow users to post and view comments on published games.
6. **Game Page Redesign**: Remove iframe from main page, add Play modal.

## Architecture Changes

### Backend (NestJS)

#### 1. Authentication Module (`back/src/auth/`)

**Structure:**
```
auth/
  auth.module.ts
  auth.controller.ts
  auth.service.ts
  auth.guard.ts
  jwt.strategy.ts
  decorators/
    current-user.decorator.ts
    require-super-admin.decorator.ts
  dto/
    register.dto.ts
    login.dto.ts
    recovery-request.dto.ts
    recovery-verify.dto.ts
```

**Dependencies to add:**
- `@nestjs/jwt` - JWT token generation/validation
- `@nestjs/bcrypt` - Password hashing
- `jsonwebtoken` - JWT library
- `bcrypt` - Password hashing
- `nodemailer` - Email sending (SMTP)

**Endpoints:**
- `POST /auth/register` - User registration
- `POST /auth/login` - User login (email or username)
- `POST /auth/recovery/request` - Request password recovery code
- `POST /auth/recovery/verify` - Verify code and reset password

**Goals:**
- Secure password storage (bcrypt hashing)
- JWT token generation with user info (userId, email, login, isSuperAdmin)
- Email service integration for recovery codes
- Validation: email/login uniqueness, password min 6 chars

#### 2. Users Module (`back/src/users/`)

**Structure:**
```
users/
  users.module.ts
  users.service.ts
  users.repository.ts
  schemas/
    user.schema.ts
```

**Database:**
- Collection: `users`
- Fields: `_id`, `email` (unique), `login` (unique), `password` (hashed), `isSuperAdmin` (boolean), `recoveryCode` (optional), `createdAt`, `updatedAt`
- Indexes: `email` (unique), `login` (unique)

**Goals:**
- User CRUD operations
- Password hashing on create/update
- Recovery code storage (overwrite on new request)
- Migration script: FP1 admins → users with isSuperAdmin: true

#### 3. Teams Module Updates (`back/src/teams/`)

**Changes:**
- Add `leader` field (userId reference)
- Update `members[]` to contain userId references
- Add permission checks: only leader can add members, transfer leadership

**New Endpoints:**
- `POST /teams` - Create team (authenticated, creator becomes leader)
- `POST /teams/{id}/members` - Add member (leader only)
- `DELETE /teams/{id}/members/{userId}` - Remove member (leader only)
- `POST /teams/{id}/leader` - Transfer leadership (current leader only)

**Goals:**
- Team leadership model (ADR-034)
- Permission validation via TeamPermissionService
- Member management restricted to leader

#### 4. Comments Module (`back/src/comments/`)

**Structure:**
```
comments/
  comments.module.ts
  comments.controller.ts
  comments.service.ts
  comments.repository.ts
  schemas/
    comment.schema.ts
```

**Database:**
- Collection: `comments`
- Fields: `_id`, `gameId`, `userId`, `text`, `userLogin` (denormalized), `createdAt`
- Indexes: `gameId`, `userId`, `createdAt`

**Endpoints:**
- `GET /games/{id}/comments` - List comments (public for published games)
- `POST /games/{id}/comments` - Create comment (authenticated)

**Goals:**
- Comments visible to all on published games
- Denormalized userLogin for fast queries
- Only authenticated users can post

#### 5. Games Module Updates (`back/src/games/`)

**Changes:**
- Add permission checks: team members can edit their team's games
- Super admin can edit any game (bypass team check)
- Add `POST /games` endpoint (authenticated, team member required)
- Update status change endpoint: super admin can force with optional remark

**Goals:**
- Team-based game creation/editing
- Super admin override
- Permission checks via guards and services

#### 6. JWT Guard and Decorators

**Files:**
- `back/src/auth/auth.guard.ts` - Validates JWT, extracts user
- `back/src/auth/decorators/current-user.decorator.ts` - Injects user into controller
- `back/src/auth/decorators/require-super-admin.decorator.ts` - Super admin only

**Goals:**
- Reusable authentication guard
- Clean controller code with decorators
- Easy testing with mocked guards

### Frontend (React + Vite)

#### 1. Authentication Context (`front/src/contexts/AuthContext.tsx`)

**Structure:**
- React Context for auth state
- `useAuth` hook
- Methods: `login`, `logout`, `register`, `requestRecovery`, `verifyRecovery`
- Token storage: `localStorage` (key: `birdmaid_token`)
- User state: `{ id, email, login, isSuperAdmin } | null`

**Goals:**
- Centralized auth state
- Token persistence across reloads
- Easy access via hook

#### 2. API Client Updates (`front/src/api/`)

**Changes:**
- Add `Authorization: Bearer <token>` header to all requests
- Handle 401 responses (clear token, redirect to login)
- Base URL from `VITE_API_BASE_URL` env var

**Goals:**
- Automatic token injection
- Error handling for expired tokens

#### 3. Windows 95 Components (`front/src/components/win95/`)

**Structure:**
```
components/win95/
  Win95Modal.tsx (draggable)
  Win95Button.tsx
  Win95Input.tsx
  Win95Window.tsx
  Win95Menu.tsx
  Win95TitleBar.tsx
```

**Dependencies to remove:**
- `@mui/material` - Remove MUI Material 3

**Goals:**
- Replace all MUI components with Windows 95 styled components
- Draggable modals (mouse events on title bar)
- Consistent Windows 95 aesthetic
- Reference artifacts for visual consistency

#### 4. Auth Modal (`front/src/components/AuthModal.tsx`)

**Features:**
- Windows 95 styled modal
- Draggable by title bar
- Modes: login, register, recovery
- Form validation
- Error display

**Goals:**
- Single modal for all auth flows
- Windows 95 styling
- Draggable functionality

#### 5. Play Modal (`front/src/components/PlayModal.tsx`)

**Features:**
- Windows 95 styled modal
- Draggable by title bar
- Game iframe inside
- Close button

**Goals:**
- Game plays in modal (not on main page)
- Windows 95 styling
- Draggable functionality

#### 6. Header Component Updates (`front/src/components/Header.tsx`)

**Changes:**
- Top-left button: "Login" (unauthenticated) or username (authenticated)
- Username button opens burger menu with logout
- Remove any MUI components

**Goals:**
- Login/username button in top-left
- Burger menu for authenticated users
- Windows 95 styling

#### 7. Game Page Redesign (`front/src/pages/GamePage.tsx`)

**Changes:**
- Remove large iframe from main page
- Show: description, team name, team members, repository link, "Play" button
- "Play" button opens PlayModal
- Add comments section (view and post)

**Goals:**
- Clean game page layout
- Play functionality in modal
- Comments visible below game info

#### 8. Teams Page Updates (`front/src/pages/TeamsPage.tsx`)

**Changes:**
- Remove sidebar "Teams" panel
- Show team list with create team form
- Add member management (for leaders)
- Add leadership transfer (for leaders)

**Goals:**
- No sidebar
- Team creation and management
- Windows 95 styling

#### 9. Editor Page Updates (`front/src/pages/EditorPage.tsx`)

**Changes:**
- Only visible for authenticated users (team members)
- Super admin can edit any game
- Remove MUI components
- Windows 95 styling

**Goals:**
- Permission-based visibility
- Windows 95 styling
- Game creation/editing for team members

#### 10. Catalog Page Updates (`front/src/pages/CatalogPage.tsx`)

**Changes:**
- Filter by team (new filter option)
- Search by title (new search)
- Remove MUI components
- Windows 95 styling

**Goals:**
- Enhanced filtering
- Windows 95 styling

### Database Changes

#### Migration: FP1 Super Admin → Users

**Script:** `back/scripts/migrate-admins-to-users.ts`

**Steps:**
1. Read all documents from `admins` collection
2. For each admin:
   - Create user in `users` collection with `isSuperAdmin: true`
   - Use admin email as user email
   - Generate random login (or use email prefix)
   - Set temporary password (user must reset on first login)
3. Log migration results
4. Optionally: mark `admins` collection as deprecated

**Goals:**
- One-time migration
- Preserve super admin access
- Users can reset password on first login

### Environment Variables

**Backend:**
- `JWT_SECRET` - Secret for JWT signing (required)
- `JWT_EXPIRES_IN` - Token expiration (default: "7d")
- `BCRYPT_ROUNDS` - Bcrypt salt rounds (default: 10)
- `SMTP_HOST` - SMTP server host
- `SMTP_PORT` - SMTP server port
- `SMTP_USER` - SMTP username
- `SMTP_PASS` - SMTP password
- `SMTP_FROM` - Email sender address

**Frontend:**
- `VITE_API_BASE_URL` - Backend API URL (default: "http://localhost:3000")

### Testing Strategy

**Backend:**
- Unit tests for services (auth, users, teams, comments)
- Integration tests for endpoints (with JWT mocking)
- Permission tests (team leader, member, super admin)

**Frontend:**
- Component tests for Windows 95 components
- Auth flow tests (registration, login, recovery)
- Permission-based UI tests (Editor visibility, etc.)
- Modal drag tests (if feasible)

### Implementation Order

1. **Backend Auth Module** - Foundation for all authenticated features
2. **Users Module** - User storage and management
3. **JWT Guard/Decorators** - Protect routes
4. **Teams Module Updates** - Team leadership and members
5. **Comments Module** - Comments system
6. **Games Module Updates** - Permission-based editing
7. **Frontend Auth Context** - Auth state management
8. **Windows 95 Components** - UI foundation
9. **Auth Modal** - Login/registration UI
10. **Header Updates** - Login/username button
11. **Game Page Redesign** - New layout + Play modal
12. **Teams Page Updates** - Remove sidebar, add management
13. **Editor Page Updates** - Permission-based access
14. **Catalog Updates** - Enhanced filtering
15. **Migration Script** - FP1 admin migration

### Success Criteria

- ✅ Users can register, login (email/username), and recover password
- ✅ JWT tokens work for authenticated requests
- ✅ Unauthenticated users see only published games; Editor/Settings hidden
- ✅ Authenticated users can create teams, add members, create games
- ✅ Super admin can edit any game and force status changes
- ✅ Comments visible to all; authenticated users can post
- ✅ Windows 95 modals are draggable
- ✅ Game page shows info + Play button (no iframe on main page)
- ✅ Entire site styled in Windows 95 (no MUI artifacts)
- ✅ Team sidebar removed from Teams page

