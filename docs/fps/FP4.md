# FP4: User Accounts & Windows 95 UI

**Status:** build  
**Created:** 2026-01-09  
**Updated:** 2026-01-22

## Scope

Что входит:
- User account system: registration, login (by email or username), password recovery via email code
- Super Admin accounts via MongoDB flag (isSuperAdmin)
- Unauthenticated visitors: catalog browsing, game playing, search, team viewing (no Editor/Settings)
- Authenticated users: all visitor capabilities + team creation, team membership, game creation for teams, Editor access, publish/archive, comments
- Super Admin: all user capabilities + edit any game, force status changes with requirements
- UI changes: remove Teams sidebar, remove ratings, add comments, login/username button in top-left with burger menu
- Windows 95 styled modals: login/registration (draggable), game play modal (draggable)
- Game page redesign: description, team, members, repo, Play button (opens modal)
- Full Windows 95 styling across entire site (replace MUI Material 3)

Что НЕ входит:
- Email service configuration (external service required)
- Token refresh mechanism (JWT expiration 7 days, refresh TBD)
- Mobile optimization for Windows 95 UI

## Questions

| # | Question | Answer | Status |
|---|----------|--------|--------|
| 1 | Password policy requirements? | Min 8 chars, alphanumeric + special chars allowed | closed |
| 2 | Recovery code expiration? | 15 minutes | closed |
| 3 | Team leadership transfer? | Current leader can transfer to any member | closed |
| 4 | JWT token expiration? | 7 days | closed |
| 5 | Windows 95 styling approach? | Custom components replacing MUI Material 3 | closed |

Всего 14 вопросов, все закрыты. См. `docs/core/QNA_DECISIONS.md#FP4` для полного списка.

## Decisions (ADRs)

| # | Decision | Rationale | Status |
|---|----------|-----------|--------|
| 1 | @nestjs/jwt for JWT authentication | Standard NestJS approach, secure | accepted |
| 2 | bcrypt for password hashing | Industry standard, secure | accepted |
| 3 | nodemailer for email service | Flexible, supports multiple providers | accepted |
| 4 | Custom Windows 95 components | Full control over styling, consistent UX | accepted |
| 5 | React Context for auth state | Simple state management for auth | accepted |
| 6 | NestJS guards/decorators for permissions | Clean separation of concerns | accepted |
| 7 | Comments collection (separate) | Scalability, easier querying | accepted |

См. `docs/core/QNA_DECISIONS.md#ADRs (FP4)` для полного списка ADRs.

## Requirements

### Use Cases

**Main Flow: Registration**
1. User opens registration modal
2. User enters email, login, password
3. System validates and creates account
4. User is logged in automatically

**Main Flow: Login**
1. User opens login modal
2. User enters email/login and password
3. System validates credentials
4. User receives JWT token
5. User is authenticated

**Main Flow: Password Recovery**
1. User requests password recovery
2. System generates recovery code and sends email
3. User enters recovery code
4. User sets new password
5. User is logged in

**Main Flow: Team Creation**
1. Authenticated user creates team
2. User becomes team leader
3. User can add members to team
4. Team members can create games for team

**Main Flow: Game Play Modal**
1. User clicks Play button on game page
2. Windows 95 styled modal opens
3. Game loads in iframe
4. User can drag modal
5. User can close modal

### Business Rules

- Unauthenticated users: can browse, play, search, view teams (no Editor/Settings)
- Authenticated users: all visitor capabilities + teams, games, Editor, comments
- Super Admin: all user capabilities + edit any game, force status changes
- Team membership: determines access to Editor and game creation
- Comments: visible to all users on published games
- Windows 95 UI: full site styling, draggable modals

### Validations

- Email: valid format, unique
- Login: unique, alphanumeric + underscore
- Password: min 8 characters
- Recovery code: 6 digits, expires in 15 minutes
- JWT token: expires in 7 days

## UX Map

| CTA | Endpoint | State | Page | Mock | Status |
|-----|----------|-------|------|------|--------|
| Register | POST /auth/register | auth.modal.open, auth.mode, user.current, user.token | AuthModal | unknown | done |
| Login | POST /auth/login | auth.modal.open, auth.mode, user.current, user.token | AuthModal | unknown | done |
| Request recovery | POST /auth/recovery/request | auth.modal.open, auth.mode (recovery) | AuthModal | unknown | done |
| Verify recovery | POST /auth/recovery/verify | auth.modal.open, auth.mode (recovery), user.current | AuthModal | unknown | done |
| Logout | - | user.current (clear), user.token (clear) | Header | unknown | done |
| Browse catalog | GET /games | games.list, games.filters | CatalogPage | unknown | done |
| Search games | GET /games?title=... | games.filters.title, games.list | CatalogPage | unknown | done |
| Filter by team | GET /games?teamId=... | games.filters.teamId, games.list | CatalogPage | unknown | done |
| View teams | GET /teams | teams.list | TeamsPage | unknown | done |
| Create team | POST /teams | teams.form, teams.list | TeamsPage | unknown | done |
| Add team member | POST /teams/:id/members | teams.current.members | TeamsPage | unknown | done |
| View game | GET /games/:id | game.current | GamePage | unknown | done |
| View comments | GET /games/:id/comments | comments.list | GamePage | unknown | done |
| Post comment | POST /games/:id/comments | comments.list | GamePage | unknown | done |
| Play game | GET /games/:id (build_url) | game.playModal.open, game.build.url | GamePage | unknown | done |
| Create game | POST /games | games.form | EditorPage | unknown | done |
| Edit game | PATCH /games/:id | games.form | EditorPage | unknown | done |
| Publish game | POST /games/:id/publish | game.status | EditorPage | unknown | done |

Всего 26 CTAs. См. `docs/core/UX_MAP.md#FP4` для полного списка и sequence diagrams.

## Architecture

### Components

- Frontend: React 18.2, Vite 5.1, TypeScript 5.4, Windows 95 custom components
- Backend: NestJS 10.3, TypeScript 5.4, @nestjs/jwt, bcrypt, nodemailer
- Database: MongoDB 6 (users collection, teams.members update, comments collection)
- Storage: MinIO (S3-compatible) for builds and covers
- Auth: JWT tokens (7 days expiration)

### Diagrams

См. `docs/core/UX_MAP.md#FP4` для:
- System Design (per CTA) sequence diagrams
- System Interaction Overview diagram

## Tests

### UAT/BDD

- [x] User can register with email/login/password
- [x] User can login with email or login
- [x] User can recover password via email code
- [x] Unauthenticated user can browse and play games
- [x] Authenticated user can create teams
- [x] Authenticated user can create games for teams
- [x] User can post comments on published games
- [x] Super Admin can edit any game
- [x] Windows 95 modals are draggable
- [x] Full site uses Windows 95 styling

### Test Files

**Backend (12 tests):**
- `back/__tests__/fp4/auth.register.test.ts`
- `back/__tests__/fp4/auth.login.test.ts`
- `back/__tests__/fp4/auth.recovery.test.ts`
- `back/__tests__/fp4/teams.create.test.ts`
- `back/__tests__/fp4/teams.members.test.ts`
- `back/__tests__/fp4/games.create.test.ts`
- `back/__tests__/fp4/games.comments.test.ts`
- `back/__tests__/fp4/games.permissions.test.ts`
- `back/__tests__/fp4/superadmin.test.ts`
- `back/__tests__/fp4/jwt.guards.test.ts`
- `back/__tests__/fp4/buildurl.service.test.ts`
- `back/__tests__/fp4/cors.test.ts`

**Frontend (11 tests):**
- `front/__tests__/fp4/auth.flows.test.tsx`
- `front/__tests__/fp4/catalog.visibility.test.tsx`
- `front/__tests__/fp4/teams.test.tsx`
- `front/__tests__/fp4/game.editor.test.tsx`
- `front/__tests__/fp4/comments.test.tsx`
- `front/__tests__/fp4/play.modal.test.tsx`
- `front/__tests__/fp4/windows95.ui.test.tsx`
- `front/__tests__/fp4/auth.context.test.tsx`
- `front/__tests__/fp4/team.membership.test.tsx`
- `front/__tests__/fp4/superadmin.ui.test.tsx`
- `front/__tests__/fp4/buildurl.loading.test.tsx`

### Coverage

- Backend: TBD
- Frontend: TBD

## Metrics

### Success Metrics

- North Star: Number of authenticated users
- Supporting: Number of teams created, Number of comments posted, Number of games created by teams

### Events

- `user_registered` — when user creates account
- `user_logged_in` — when user logs in
- `team_created` — when user creates team
- `comment_posted` — when user posts comment
- `game_created_by_team` — when team member creates game

## Plan

| Milestone | Date | Tasks | Owner | Status |
|-----------|------|--------|-------|--------|
| 1. Discovery | 2026-01-09 | Questions, ADRs, requirements | Product Lead | done |
| 2. Design | 2026-01-09 | UX map, API, MODEL, diagrams | Designer | done |
| 3. Architecture | 2026-01-09 | Auth stack, email service, Windows 95 components | Engineer | done |
| 4. Tests | 2026-01-09 | Red tests (23 files) | Engineer | done |
| 5. Implementation | 2026-01-09 | Backend auth, frontend auth, Windows 95 UI | Engineer | in_progress |
| 6. Release | TBD | Acceptance, gate, релиз | Product Lead | todo |

## Risks

| Risk | Probability | Impact | Mitigation | Status |
|------|-------------|--------|------------|--------|
| Windows 95 styling requires significant refactoring | high | high | Incremental replacement, component library | mitigated |
| Authentication adds complexity | medium | medium | Use proven libraries (@nestjs/jwt, bcrypt) | mitigated |
| Email service configuration | medium | medium | Document setup, provide examples | mitigated |
| Draggable modals accessibility | medium | low | Test with screen readers, provide keyboard navigation | mitigated |
| JWT expiration may need refresh | low | medium | Add refresh mechanism in future FP | accepted |

## Dependencies

- `docs/core/REQUIREMENTS.md` — FP4 requirements
- `docs/core/API.yaml` — FP4 endpoints (auth, teams, comments)
- `docs/core/MODEL.sql` — users collection, teams.members, comments collection
- `docs/core/UX_MAP.md` — FP4 UX map with 26 CTAs
- `docs/core/TESTS.md` — FP4 test specs
- `docs/core/QNA_DECISIONS.md` — FP4 questions and ADRs
- `artifacts/FP1/2026-01-08/evidence/stitch/**/*` — Windows 95 style references

## Artifacts

- Coverage: `artifacts/FP4/YYYY-MM-DD/coverage/...`
- Logs: `artifacts/FP4/YYYY-MM-DD/logs/...`
- Evidence: `artifacts/FP4/YYYY-MM-DD/evidence/...`

## Reflection

**What went well:**
- All 14 questions answered and ADRs created
- UX_MAP updated with 26 CTAs and sequence diagrams
- API.yaml and MODEL.sql aligned with FP4 requirements
- Architecture decisions documented (JWT, bcrypt, nodemailer, Windows 95 components)
- 23 test files created (12 backend + 11 frontend)
- Implementation started with backend auth module

**Risks:**
- Windows 95 styling replacement requires significant refactoring
- Email service configuration needs documentation
- Draggable modals need custom implementation
- Tests will fail until implementation complete (expected red state)

**Next focus:**
- Complete implementation to make tests green
- Start with backend auth, then frontend auth context, then Windows 95 components
- Document email service setup

**Implementation notes:**
- 2026-01-09: Implemented 12 UI/UX fixes (CR-FP4-20260109-03)
- 2026-01-09: Fixed PlayModal issues (CR-FP4-20260109-04)
- 2026-01-09: Fixed CORS for local network access (CR-FP4-20260109-05)
- 2026-01-09: Fixed build URL expiration (CR-FP4-20260109-06)
- 2026-01-09: Fixed UI/UX issues (CR-FP4-20260109-07)
- 2026-01-09: Fixed team update and cover image issues (CR-FP4-20260109-08)
- 2026-01-09: Refactored cover image upload (CR-FP4-20260109-09)

## Evidence

- PR: #...
- CI: https://...
- Demo: https://...
