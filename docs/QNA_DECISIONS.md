# QnA / Decisions

## Stakeholder answers (source)

- owner: vydra
- date: 2026-01-08
- answers:
  - Web builds hosted on a separate machine with S3-compatible storage.
  - Max build size is 300 MB for MVP; must be configurable via Super Admin later.
  - Super Admin can move a game from "published" to "editing" and leave remarks to address before republish.
  - MVP requires only a Super Admin account with full CRUD access across the system.
  - Publication workflow: create game on behalf of a team; default status "editing"; publish after upload/testing/markdown; archive hides from catalog; editing hides from catalog.
  - Tags can be set only by team members and Super Admin (system tag governance TBD).
  - Play in browser via iframe; assume restrictive embedding (no guarantee for COOP/COEP); use safe baseline CSP.

## Questions / Gaps (structured)

- id: Q-001
  fp: FP1
  status: closed
  owner: vydra
  date: 2026-01-08
  question: Where do we store web builds (object storage, repo, or external links)?
  answer: Separate machine with S3-compatible object storage.
  decision: ADR-002

- id: Q-002
  fp: FP1
  status: closed
  owner: vydra
  date: 2026-01-08
  question: What is the max build size and per-team limits?
  answer: 300 MB limit for MVP; configurable later in Super Admin panel.
  decision: ADR-002

- id: Q-003
  fp: FP1
  status: closed
  owner: vydra
  date: 2026-01-08
  question: What moderation/abuse flow is required for MVP (reports, takedown, manual review)?
  answer: Super Admin can move published -> editing and leave remarks; admin-only takedown for MVP.
  decision: ADR-003

- id: Q-004
  fp: FP1
  status: closed
  owner: vydra
  date: 2026-01-08
  question: What auth method is required for MVP (email/password, invite-only, magic link)?
  answer: MVP only uses Super Admin account with full access.
  decision: ADR-001

- id: Q-005
  fp: FP1
  status: closed
  owner: vydra
  date: 2026-01-08
  question: What is the publication workflow (draft, review, public) and who can publish?
  answer: Default status editing; publish after upload/testing/markdown; archive hides from catalog; editing hides from catalog; admin controls transitions.
  decision: ADR-003

- id: Q-006
  fp: FP1
  status: closed
  owner: vydra
  date: 2026-01-08
  question: Who governs system tags and how are user tags moderated?
  answer: Tags can be set by team members and Super Admin; system tag governance TBD.
  decision: ADR-014

- id: Q-007
  fp: FP1
  status: closed
  owner: vydra
  date: 2026-01-08
  question: What iframe sandboxing and CSP rules are required for web builds?
  answer: Embed only via iframe on /builds/<buildId>/index.html (or similar) with sandbox (no allow-same-origin). Allow only allow-scripts, allow-forms, allow-pointer-lock; allow-popups optional; deny allow-downloads and allow-top-navigation. Use allow="fullscreen; autoplay; gamepad". CSP baseline on host page: default-src 'self'; frame-src 'self' (+ build domain if separate); script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self' (+ build domain if separate); object-src 'none'; base-uri 'self'; frame-ancestors 'self'. No COOP/COEP in FP1.
  decision: ADR-005

- id: Q-008
  fp: FP1
  status: closed
  owner: vydra
  date: 2026-01-08
  question: If MVP is admin-only, who uploads/creates games (admin only) or do we allow team members without accounts?
  answer: Super Admin performs all uploads and creates for MVP.
  decision: ADR-006

- id: Q-009
  fp: FP1
  status: closed
  owner: vydra
  date: 2026-01-08
  question: Do we need a Team entity in FP1 if only admin exists? If yes, how is membership represented now vs later?
  answer: Team exists in FP1 and is not bound to any account.
  decision: ADR-006

- id: Q-010
  fp: FP1
  status: closed
  owner: vydra
  date: 2026-01-08
  question: What is the minimal "remarks" mechanism (free text comment, status reason, or audit log)?
  answer: Simple text comment near status from Super Admin.
  decision: ADR-007

- id: Q-011
  fp: FP1
  status: closed
  owner: vydra
  date: 2026-01-08
  question: How do we handle tag abuse if tags are free (rate limits, admin cleanup, blacklist)?
  answer: Manual Super Admin cleanup; basic rate limiting is TBD.
  decision: ADR-008

- id: Q-012
  fp: FP1
  status: closed
  owner: vydra
  date: 2026-01-08
  question: Do we require game cover image or screenshots in FP1?
  answer: Publishing requires a cover image.
  decision: ADR-009

- id: Q-013
  fp: FP1
  status: closed
  owner: vydra
  date: 2026-01-08
  question: Do builds have versions (single current build vs releases/history)?
  answer: Single version only; reupload replaces the previous build.
  decision: ADR-010

- id: Q-014
  fp: FP1
  status: closed
  owner: vydra
  date: 2026-01-08
  question: Public visibility rules: if status is editing/archived, does game page return 404 or show "unavailable"?
  answer: Hide from catalog; game page returns 404 for non-admin.
  decision: ADR-011

- id: Q-015
  fp: FP1
  status: deferred
  owner: vydra
  date: 2026-01-08
  question: What is the required test build setup and docker-compose layout (minimum two services: S3-compatible storage and the web service)?
  answer: Defer to tests-red/implement; baseline is local docker-compose with web service + S3-compatible storage (MinIO). No extra services in FP1 discovery. Backend stores buildId/buildUrl and returns iframe link later in design-first.
  notes: Not a blocker for design-first.

- id: Q-016
  fp: FP1
  status: closed
  owner: vydra
  date: 2026-01-08
  question: Are tags free-form strings on games, or do we maintain a tags collection with CRUD?
  answer: Use free-form tags on games; optional system tags can be a separate array assigned by Super Admin.
  decision: ADR-019

- id: Q-017
  fp: FP1
  status: closed
  owner: vydra
  date: 2026-01-08
  question: Do we support dark mode in FP1?
  answer: FP1 is light mode only; dark mode is deferred.
  decision: ADR-021

- id: Q-018
  fp: FP1
  status: closed
  owner: vydra
  date: 2026-01-08
  question: How should the iframe URL be delivered to the client?
  answer: Backend returns a signed build URL for the iframe; Game stores currentBuildId.
  decision: ADR-020

- id: Q-019
  fp: FP1
  status: closed
  owner: vydra
  date: 2026-01-08
  question: Are simple user accounts required in FP1, or is Super Admin-only sufficient for MVP?
  answer: Defer simple user accounts to FP2. FP1 remains Super Admin-only for authoring; public browsing/playing is anonymous.
  decision: ADR-022

- id: Q-020
  fp: FP1
  status: closed
  owner: vydra
  date: 2026-01-08
  question: Do we need system tags for hackathons in FP1, or can we keep only free-form user tags?
  answer: FP1 supports optional hackathon/system tags assigned by Super Admin as string arrays on Game documents; no separate tags collection in FP1.
  decision: ADR-023

## ADRs

- ADR-001: Curated MVP access model (Super Admin only)
  - Context: MVP scope must be minimal and admin-driven; no self-serve accounts yet.
  - Decision: Only a Super Admin account exists in MVP with full CRUD across Teams/Games/Builds/Tags. Public users are anonymous visitors.
  - Consequences: No user registration, no team member accounts, and all publishing actions are performed by admin. Later expansion requires auth model design.

- ADR-002: Storage for web builds
  - Context: Web builds need hosting and a size limit for MVP.
  - Decision: Store builds on a separate machine using S3-compatible object storage. Enforce 300 MB max size for MVP; make limit configurable later via admin panel.
  - Consequences: Upload and delivery paths must integrate with S3-compatible storage; large builds may be rejected. Admin UI must later expose a configurable limit.

- ADR-003: Game lifecycle statuses and admin remarks
  - Context: Public visibility and moderation require clear status transitions and admin intervention.
  - Decision: Game statuses are editing (default), published, archived. Admin can move published -> editing and leave required remarks; archived and editing are hidden from public catalog.
  - Consequences: Public catalog shows only published games. Admin remarks need a minimal storage field and UI. No automated moderation beyond admin actions.

- ADR-004: Tags policy for MVP
  - Context: MVP needs tagging for discovery but governance is unclear.
  - Decision: Tags are allowed for games, with governance deferred; permissions are controlled by ADR-014.
  - Consequences: Potential tag abuse exists; moderation rules are limited to admin cleanup for MVP. Later governance rules are needed.

- ADR-005: Embed and security baseline
  - Context: Games run in browser via iframe and require a conservative security posture.
  - Decision: Use iframe embedding on /builds/<buildId>/index.html with sandbox (no allow-same-origin). Allow allow-scripts, allow-forms, allow-pointer-lock; optional allow-popups; deny allow-downloads and allow-top-navigation. Use allow="fullscreen; autoplay; gamepad". CSP baseline: default-src 'self'; frame-src 'self' (+ build domain if separate); script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self' (+ build domain if separate); object-src 'none'; base-uri 'self'; frame-ancestors 'self'. No COOP/COEP in FP1.
  - Consequences: Some games may lose features due to restrictive policies; SharedArrayBuffer/WASM threads are not guaranteed; external domains inside builds may be blocked by CSP until updated.

- ADR-006: Team entity in FP1 without membership binding
  - Context: FP1 is admin-only but games are created on behalf of teams.
  - Decision: Team exists in FP1 and is not bound to any account.
  - Consequences: Membership/auth is deferred; Super Admin manages teams.

- ADR-007: Minimal admin remarks mechanism
  - Context: Admin needs a way to request fixes when reverting published to editing.
  - Decision: Use a simple text comment near status from Super Admin (stored as a field).
  - Consequences: No audit log in FP1; can expand later.

- ADR-008: Tag abuse handling for MVP
  - Context: Tags are user-defined and may be abused.
  - Decision: Manual Super Admin cleanup; basic rate limiting TBD.
  - Consequences: Abuse is possible; add moderation backlog.

- ADR-009: Cover requirement for publishing
  - Context: Catalog presentation needs a consistent visual baseline.
  - Decision: Publishing requires a cover image.
  - Consequences: UI/API must enforce cover presence; catalog uses cover.

- ADR-010: Build versioning model for FP1
  - Context: MVP requires a minimal build workflow.
  - Decision: Single version only; reupload replaces the previous build.
  - Consequences: No history/rollback; simpler storage.

- ADR-011: Public visibility rules for non-published statuses
  - Context: Editing/archived games must not be visible to the public.
  - Decision: Hide from catalog; game page returns 404 for non-admin.
  - Consequences: Super Admin can still access/edit; public cannot deep-link.

- ADR-012: MongoDB as primary datastore
  - Context: Platform uses MongoDB; SQL is not used.
  - Decision: Use MongoDB; MODEL.sql is maintained as a logical data model (collections/fields/indexes).
  - Consequences: No SQL DDL; relations are handled via references or embedding in application logic.

- ADR-013: Admin-only account with team creation on behalf
  - Context: FP1 has only one real account, but games belong to teams.
  - Decision: Super Admin creates teams (including zero members) and publishes games on behalf of teams.
  - Consequences: Team membership is conceptual only in FP1; future accounts will populate members.

- ADR-014: Tag permissions for games
  - Context: Tagging needs access control and future team member support.
  - Decision: Only team members and Super Admin can set tags; in FP1 this means Super Admin only.
  - Consequences: Public users cannot set tags; future role expansion needed for team members.

- ADR-015: Build workflow (upload -> preview -> publish)
  - Context: Builds must be validated before public release.
  - Decision: Super Admin uploads ZIP, receives buildId/buildUrl, previews on platform, then publishes.
  - Consequences: Publishing requires a successful preview path and stored build reference.

- ADR-016: UI stack choice for FP1 (MUI + Material 3)
  - Context: FP1 needs a consistent modern UI baseline and components.
  - Decision: Use MUI (Material UI) with Material 3 baseline.
  - Consequences: Future changes (e.g., shadcn/tailwind) require a Change Request and ADR update.

- ADR-017: Stitch reference-only policy and artifact storage
  - Context: Stitch generates UI references and tokens but should not supply production code.
  - Decision: Use Stitch for reference-only; store outputs as artifacts under artifacts/<FP>/<date>/evidence/stitch/* and do not commit.
  - Consequences: Designs guide implementation but require manual translation into production code.

- ADR-018: Modern UX baseline requirements
  - Context: FP1 needs a minimum UX quality bar across public and admin flows.
  - Decision: Require loading/empty/error/responsive states, clear CTA hierarchy, iframe fallback message, and accessible defaults (focus, keyboard, headings).
  - Consequences: Tests and acceptance must include UX state coverage; design-first must capture tokens.

- ADR-019: Tags stored on games (no collection in FP1)
  - Context: FP1 needs a minimal tag model for filtering without extra admin overhead.
  - Decision: Store tags as free-form arrays on games; optional system tags can be a separate array assigned by Super Admin.
  - Consequences: Tag filtering is a simple game query; system tag curation is deferred.

- ADR-020: Signed build URL for iframe
  - Context: Build delivery should avoid exposing raw storage URLs and allow controlled access.
  - Decision: Backend returns a signed build URL for iframe playback; Game stores currentBuildId.
  - Consequences: Requires URL signing logic; frontend uses provided URL without extra auth flows.

- ADR-021: Light mode only for FP1
  - Context: Dark mode adds design and QA scope in MVP.
  - Decision: FP1 is light mode only; dark mode deferred.
  - Consequences: Design tokens and screens target light mode; dark mode may require additional work later.

- ADR-022: Defer simple user accounts to FP2
  - Context: MVP needs to stay minimal while enabling publication and play.
  - Decision: Defer simple user accounts to FP2. FP1 remains Super Admin-only for authoring; public browsing/playing is anonymous.
  - Consequences: No user signup/login in FP1; future account work required for team members.

- ADR-023: System tags stored on games in FP1
  - Context: Hackathon tags are needed without introducing a tags collection.
  - Decision: Store optional system/hackathon tags as string arrays on Game documents, assigned by Super Admin; no tags collection in FP1.
  - Consequences: Tag filtering uses game fields; future tag governance may require a separate collection.

- ADR-024: Frontend stack choice
  - Context: FP1 needs a minimal, maintainable frontend with strong ecosystem support.
  - Decision: React + Vite + TypeScript + MUI (Material 3).
  - Consequences: Fast local dev and common tooling; future framework changes require a CR and ADR update.
  - Decision matrix (weights):
    - maintainability (0.30), delivery speed (0.25), deploy simplicity (0.20), testing (0.15), extensibility (0.10)
    - React+Vite: 4.7, Next.js: 4.2, Remix: 3.9 (weighted totals)

- ADR-025: Backend stack choice
  - Context: FP1 needs a minimal backend with clear structure and testing support.
  - Decision: NestJS + TypeScript (HTTP API only; MongoDB + S3 integrations later).
  - Consequences: Standard patterns and testing helpers; added framework overhead but low ops burden for MVP.
  - Decision matrix (weights):
    - maintainability (0.30), delivery speed (0.25), deploy simplicity (0.20), testing (0.15), extensibility (0.10)
    - NestJS: 4.4, Fastify/Express TS: 4.1, Go (chi): 3.6, FastAPI: 3.7 (weighted totals)

- ADR-026: Monorepo layout and test conventions
  - Context: Tests-red CODE needs stable paths for front/back tests.
  - Decision: Use top-level `front/` and `back/` with separate package.json files. Front tests in `front/__tests__/fp1/*`, back tests in `back/__tests__/fp1/*`.
  - Consequences: Simple separation; no workspaces required for MVP; test paths remain stable.

- ADR-027: Minimal local dev environment
  - Context: MVP needs simple local dev and CI without heavy ops.
  - Decision: Use local dev services only (app + in-memory/stub) for scaffolding; integrate MongoDB + S3-compatible storage in later implementation/testing.
  - Consequences: Faster onboarding; full integration tests deferred until services are wired.

- ADR-028: Docker-compose deferred to implement
  - Context: Local service orchestration (MongoDB/MinIO) is needed but not required for scaffolding.
  - Decision: Add docker-compose in implement stage, after core scaffolding and tests-red SPEC.
  - Consequences: Local service setup is deferred; initial tests run without docker-compose.

- ADR-029: Mandatory skill preflight and evidence
  - Context: Roles rely on Codex skills for consistent quality and must be verified before work starts.
  - Decision: Require skills preflight and per-role skill run evidence in WORKPLAN reflection.
  - Consequences: Modes refuse to start if required skills are missing; reflections must include skill usage notes.

- ADR-030: Password requirements for FP4
  - Context: FP4 requires user registration with password authentication.
  - Decision: Minimum password length is 6 characters. No complexity requirements (no special characters, numbers, or uppercase required).
  - Consequences: Simple password policy; users may choose weak passwords. Security relies on password hashing and rate limiting.

- ADR-031: Password recovery code model
  - Context: Password recovery via email requires code expiration and validation rules.
  - Decision: Recovery codes have no time expiration. Only the last sent code is valid (new code request invalidates previous code). No limit on number of requests, but only one active code at a time.
  - Consequences: Codes remain valid until new code is requested; simpler implementation but potential security risk if email is compromised. No rate limiting on code requests (may need future enhancement).

- ADR-032: Email service configuration
  - Context: Password recovery requires email sending capability.
  - Decision: Email service provider is configurable via environment variables or configuration file. No specific provider is required; implementation must support pluggable email service.
  - Consequences: Flexible deployment; requires configuration documentation and example setup for common providers (SMTP, SendGrid, etc.).

- ADR-033: Unique email and login constraints
  - Context: User accounts need unique identifiers for authentication.
  - Decision: Both email and login (username) must be unique across all users. MongoDB indexes enforce uniqueness.
  - Consequences: Registration must validate uniqueness; login can use either email or login as identifier.

- ADR-034: Team leadership model
  - Context: Team membership management requires permission rules for adding members.
  - Decision: Teams have a leader field (userId). Only team leader can add users to team. Leader can be transferred to another team member. Team creator becomes initial leader.
  - Consequences: Teams collection requires leader field; permission checks needed for add-member operations; leader transfer endpoint required.

- ADR-035: Comments storage model
  - Context: Comment system needs data persistence strategy.
  - Decision: Comments stored in separate `comments` collection (not embedded in games). Each comment references gameId and userId.
  - Consequences: Easier querying and pagination; requires join/aggregation for game page display; separate collection for scalability.

- ADR-036: Session management with JWT
  - Context: Authenticated users need session management.
  - Decision: Use JWT (JSON Web Tokens) for session management. Tokens stored client-side (localStorage or cookie). Backend validates JWT on protected routes.
  - Consequences: Stateless authentication; tokens must include user ID and isSuperAdmin flag; requires JWT secret configuration; token expiration policy needed.

- ADR-037: Windows 95 styling replaces MUI Material 3
  - Context: FP4 requires Windows 95 aesthetic throughout the site.
  - Decision: Windows 95 styling completely replaces MUI Material 3 baseline. Remove all MUI Material 3 components and styling. Implement custom Windows 95 styled components.
  - Consequences: Significant UI refactoring; custom component library needed; reference artifacts from FP1 stitch outputs guide implementation.

- ADR-038: Optional admin remarks on forced status changes
  - Context: Super Admin can force game status changes and leave remarks.
  - Decision: Remarks/requirements are optional when Super Admin forces status change (published -> editing/archived). Admin can change status without remark.
  - Consequences: Simpler admin workflow; remarks field can be empty/null.

- ADR-039: Migrate FP1 Super Admin to users collection
  - Context: FP1 has separate admins collection; FP4 introduces users collection with isSuperAdmin flag.
  - Decision: Migrate existing Super Admin account from admins collection to users collection with isSuperAdmin: true. Migration script required.
  - Consequences: One-time migration needed; admins collection can be deprecated after migration.

- ADR-040: JWT library choice for NestJS
  - Context: FP4 requires JWT token generation and validation for authentication (ADR-036).
  - Decision: Use `@nestjs/jwt` package (official NestJS JWT module) with `jsonwebtoken` as underlying library. Store JWT secret in environment variable `JWT_SECRET`. Token expiration: 7 days (configurable via `JWT_EXPIRES_IN`).
  - Consequences: Standard NestJS patterns; easy integration with guards and decorators; token expiration requires refresh or re-login after expiry.
  - Decision matrix (weights: maintainability 0.30, delivery speed 0.25, ecosystem 0.25, security 0.20):
    - @nestjs/jwt: 4.6, passport-jwt: 4.2, jsonwebtoken directly: 3.8 (weighted totals)

- ADR-041: Password hashing library
  - Context: User passwords must be securely hashed before storage (NFR-FP4-001).
  - Decision: Use `bcrypt` library with `@nestjs/bcrypt` wrapper for NestJS integration. Salt rounds: 10 (configurable via `BCRYPT_ROUNDS` env var, default 10).
  - Consequences: Industry-standard hashing; async operations; configurable security vs performance tradeoff.

- ADR-042: Email service integration strategy
  - Context: Password recovery requires email sending (ADR-032). Email service must be configurable and pluggable.
  - Decision: Create abstract `EmailService` interface in NestJS. Implement SMTP provider using `nodemailer` as default. Configuration via environment variables: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`. Support for other providers (SendGrid, AWS SES) via additional implementations (deferred to implement if needed).
  - Consequences: Flexible email provider selection; SMTP is universal but requires server configuration; other providers can be added later without changing interface.

- ADR-043: Windows 95 UI component strategy
  - Context: FP4 requires Windows 95 styling to replace MUI Material 3 (ADR-037). Frontend already has `retro.css` with Windows 95 styles.
  - Decision: Remove MUI Material 3 dependency. Build custom Windows 95 styled components using existing `retro.css` as base. Create reusable components: `Win95Modal` (draggable), `Win95Button`, `Win95Input`, `Win95Window`, `Win95Menu`. Use CSS modules or styled-components pattern for component-specific styles. Reference artifacts from `artifacts/FP1/2026-01-08/evidence/stitch/**/*` for visual consistency.
  - Consequences: Full control over styling; no external UI library overhead; requires building all components from scratch; draggable modals need custom drag implementation.

- ADR-044: Authentication guard and decorator pattern
  - Context: Protected routes need JWT validation and user context injection.
  - Decision: Use NestJS `@UseGuards(JwtAuthGuard)` pattern. Create `JwtAuthGuard` that validates JWT and extracts user info. Create `@CurrentUser()` decorator to inject user object (with isSuperAdmin flag) into controller methods. Optional `@RequireSuperAdmin()` decorator for super admin-only endpoints.
  - Consequences: Clean controller code; reusable guards; easy to test with mocked guards.

- ADR-045: Frontend authentication state management
  - Context: Frontend needs to store JWT token, user info, and handle authentication state across pages.
  - Decision: Use React Context API for authentication state (`AuthContext`). Store JWT token in `localStorage` (key: `birdmaid_token`). Store user info in context state. Create `useAuth` hook for accessing auth state and methods (login, logout, register, recovery). Intercept API requests to add `Authorization: Bearer <token>` header.
  - Consequences: Simple state management; token persists across page reloads; localStorage accessible to XSS (mitigated by httpOnly cookies not used); manual token refresh needed.

- ADR-046: Recovery code storage model
  - Context: Password recovery codes need temporary storage (ADR-031: only last code valid, no expiration).
  - Decision: Store recovery codes in MongoDB `users` collection as embedded field: `recoveryCode: { code: string, createdAt: Date }`. On new code request, overwrite previous code. Validate code by comparing with stored code (case-sensitive).
  - Consequences: Simple implementation; codes stored in same collection as user; no separate collection needed; manual cleanup of old codes not required (overwritten).

- ADR-047: Team membership permission checks
  - Context: Team operations require permission validation (leader can add members, members can create games for team).
  - Decision: Create `TeamPermissionService` that validates: (1) user is team leader for add-member/transfer-leadership operations, (2) user is team member (or super admin) for game creation/editing. Cache team membership lookups in service layer to avoid repeated DB queries.
  - Consequences: Centralized permission logic; easy to test; potential performance optimization with caching.

- ADR-048: Draggable modal implementation
  - Context: Windows 95 modals must be draggable by title bar (FR-FP4-006, FR-FP4-007).
  - Decision: Implement drag functionality using React mouse events (`onMouseDown`, `onMouseMove`, `onMouseUp`) on modal title bar. Store modal position in component state. Use CSS `transform: translate()` for positioning. Support touch events for mobile (optional, deferred if mobile not priority).
  - Consequences: Native React implementation; no external drag library; mobile support deferred; accessibility considerations (keyboard navigation) may need enhancement.

- ADR-049: Comment denormalization strategy
  - Context: Comments display user login/username (FR-FP4-003). User login stored in users collection.
  - Decision: Denormalize `userLogin` field in comments collection (store login string directly in comment document). Update userLogin if user changes login (deferred: no login change feature in FP4). Fetch comments with embedded userLogin (no join needed).
  - Consequences: Faster comment queries; no joins required; potential data inconsistency if login changes (mitigated by no login change in FP4).

- ADR-050: FP4 UI/UX fixes (Change Request CR-FP4-20260109-01)
  - Context: FP4 implementation revealed 11 UI/behavior issues requiring fixes.
  - Decision: Apply all 11 fixes: (1) Update menu tabs to Catalog/Teams/Edit/Settings/Help, (2) Make game cards square in catalog, (3) Add game cover image on right side of game page, (4) Style comment input field, (5) Add Help dropdown with site description, (6) Show Settings tab only for admin, (7) Replace Refresh button with Login/username button, (8) Add tag selection bar and dropdown on catalog, (9) Make main window draggable, (10) Add file upload for Cover image, (11) Restore publish and upload game functionality.
  - Consequences: Improved UX consistency, better Windows 95 styling, restored missing functionality.

- ADR-051: FP4 Additional UI/UX refinements (Change Request CR-FP4-20260109-02)
  - Context: Additional 13 UI/behavior refinements required after initial fixes.
  - Decision: Apply all 13 fixes: (1) Move Login/Username to toolbar, remove Header component, (2) Remove team dropdown from Catalog, (3) Fix and style search input, (4) Fix comment input styling, (5) Fix game launch in modal, (6) Make game fill entire modal, (7) Fix window position persistence, (8) Simplify team cards, (9) Add team info modal with member management, (10) Fix Create Game button, (11) Add Edit button for super admin, (12) Allow unauthenticated access to Teams, (13) Make login modal smaller.
  - Consequences: Better UX flow, consistent Windows 95 styling, fixed functionality issues.

- ADR-052: FP4 Additional UI/UX refinements and bug fixes (Change Request CR-FP4-20260109-03)
  - Context: 12 additional UI/behavior fixes and bug fixes required during implement phase.
  - Decision: Apply all 12 fixes: (1) Hide "Add Member" for unregistered users (permission-based UI), (2) Real-time catalog filtering by name (debounced), (3) Team filter in catalog with URL params and tag display, (4) Modal height fixes (auto height, not full screen), (5) Visual tabs in AuthModal (Windows 95 style), (6) Smaller team info modal, (7) Display user logins instead of UUIDs (backend enhancement), (8) Fix game creation endpoints, (9) Remove Settings tab highlighting, (10) Fix CORS for local network access, (11) Add PlayModal margin, (12) Note build URL expiration (public URLs used, signed URLs may need backend changes).
  - Consequences: Improved UX consistency, better permission handling, fixed functionality issues, enhanced backend API (user logins in teams), better CORS support for local development.

- ADR-053: PlayModal fixes - game loading and margins (Change Request CR-FP4-20260109-04)
  - Context: PlayModal had issues with game not loading and black iframe block overflowing window edges (missing right margin).
  - Decision: (1) Improved iframe loading logic with proper timeout (50ms), added console logging for debugging, better error handling. (2) Fixed margins - added 8px margin on all sides, removed padding from modal content div for Game title, adjusted container dimensions using calc() to account for modal padding and prevent overflow.
  - Consequences: Games now load properly in modal, iframe container has proper margins on all sides, no overflow issues, better debugging capabilities with console logs.

- ADR-054: CORS fixes for local network access (Change Request CR-FP4-20260109-05)
  - Context: CORS errors persisted when accessing site from other machines in local network (e.g., http://192.168.100.35:5173).
  - Decision: (1) Enhanced backend CORS config with explicit origin callback allowing all origins for development, added all required headers (Content-Type, Authorization, Accept, Origin, X-Requested-With, etc.), proper preflight handling with OPTIONS requests returning 204, fallback middleware to ensure CORS headers are always set. (2) Backend listens on 0.0.0.0 instead of localhost to accept connections from all network interfaces. (3) Frontend auto-detects API URL: if VITE_API_BASE_URL is set, use it; otherwise, if accessing via IP, use same IP with port 3000; if localhost, use localhost:3000. (4) Added credentials: 'include' to all fetch requests. (5) Fixed FormData handling - don't set Content-Type header for FormData requests (browser sets it automatically with boundary).
  - Consequences: Site can be accessed from any machine in local network without CORS errors, API URL automatically adapts to current hostname, proper credential handling for authenticated requests, FormData uploads work correctly.

- ADR-055: Fix build URL expiration - generate signed URLs dynamically (Change Request CR-FP4-20260109-06)
  - Context: "AccessDeniedRequest has expired" error appeared when opening games in PlayModal. Stored build_url in database was static and expired after some time, causing MinIO/S3 to reject requests. Also, signed URLs contained internal Docker hostname "minio" instead of public "localhost", making them inaccessible from browser.
  - Decision: (1) Created BuildUrlService injectable service that generates signed S3 URLs dynamically using @aws-sdk/s3-request-presigner. (2) Updated GamesController.getGame() to call BuildUrlService.getSignedBuildUrl() which extracts buildId from stored build_url, generates fresh signed URL with 1-hour expiration using GetObjectCommand, and returns it. (3) BuildUrlService uses regex to match S3/MinIO URLs and extract buildId, falls back to original URL if signing fails or URL doesn't point to S3. (4) Fixed hostname replacement - after generating signed URL, replaces internal Docker hostname (from S3_ENDPOINT, e.g. "minio") with public URL hostname (from S3_PUBLIC_URL, e.g. "localhost") so URLs are accessible from browser. (5) Installed @aws-sdk/s3-request-presigner package.
  - Consequences: Build URLs are now always fresh and valid when games are requested, no more expiration errors in PlayModal, URLs expire after 1 hour but are regenerated on each game request, works with both S3/MinIO and external URLs, signed URLs use correct public hostname for browser access.

- ADR-056: UI/UX fixes - modal heights, loader, New Game page (Change Request CR-FP4-20260109-07)
  - Context: Multiple UI/UX issues: (1) AuthModal and Team info modal still taking full screen height, (2) Signed URLs using internal Docker hostname "minio" causing connection errors, (3) No loading indicator when game is loading in PlayModal, (4) "Edit" tab confusing for creating new games.
  - Decision: (1) Fixed modal heights - updated Win95Modal to use title.startsWith("Team:") check and added explicit height: auto for Authentication and Team modals. (2) Fixed signed URL hostname - BuildUrlService now replaces internal hostname with public hostname after URL generation. (3) Added HourglassLoader component - Windows 95 style animated hourglass loader with sand falling effect, shows in PlayModal while iframe loads, positioned absolutely over game container. (4) Replaced "Edit" with "New Game" - changed all toolbar instances, updated route to /editor/games/new. (5) Fixed editor/games/new page - added check for routeGameId === "new" to reset form instead of loading game, allows creating game before upload (handleUpload creates game if needed), proper form state management.
  - Consequences: Modals now have proper auto height, signed URLs work correctly from browser, users see loading feedback when games load, clearer navigation with "New Game" tab, new game creation flow works properly.

- ADR-057: Fix team update and cover image loading issues (Change Request CR-FP4-20260109-08)
  - Context: (1) When editing a game, team information was not updating correctly - teamId was not being loaded or saved. (2) Cover images from MinIO were not loading - same hostname issue as build URLs. (3) No loading indicator for cover images.
  - Decision: (1) Fixed team update - added teamId to GameDetails type, loadGame() now sets teamId from response, handleUpdateGame() includes teamId in request body and reloads game after update to refresh team info. (2) Fixed cover image loading - updated BuildUrlService.getSignedBuildUrl() to support any S3 URL path (changed regex from specific builds pattern to generic bucket path pattern), GamesController.getGame() now generates signed URL for cover_url using BuildUrlService, returns teamId in response. (3) Added cover image loader - created CoverImageWithLoader component that wraps img tag, shows HourglassLoader while loading, handles onLoad/onError events, displays error message on failure.
  - Consequences: Team information updates correctly when editing games, cover images from MinIO load properly with signed URLs, users see loading feedback for cover images, better UX with visual feedback during image loading.

- ADR-058: Cover image upload refactoring - S3 storage and file upload only (Change Request CR-FP4-20260109-09)
  - Context: Users could enter blob URLs or external URLs for cover images, which caused issues. Need to store covers in S3 and only allow file uploads with size limit (300 KB).
  - Decision: (1) Created POST /games/:id/cover endpoint in GamesController - validates file size (300 KB max), file type (image/*), uploads to S3 with key "covers/{coverId}.{ext}", stores S3 key in game.cover_url field. (2) Updated GameDoc schema - cover_url now stores S3 key (e.g., "covers/{coverId}.jpg") instead of full URL, allows generating fresh signed URLs. (3) Updated BuildUrlService - added getSignedUrlFromKey() method to generate signed URLs directly from S3 keys, updated getGame() to detect S3 keys (starts with "covers/") and use getSignedUrlFromKey(), updated listGames() to generate signed URLs for all cover images. (4) Removed cover URL input field - users can only upload files via file input, added file size validation (300 KB) and type validation on frontend, shows file name and size after selection. (5) Updated frontend upload flow - handleCoverUpload validates file, creates blob preview, uploads to endpoint if game exists, reloads game after upload to get signed URL, handleCreateGame uploads cover after game creation, handleUpdateGame uploads cover if new file selected.
  - Consequences: Cover images are now stored in S3 with proper access control, users can only upload files (no manual URLs), file size is limited to 300 KB, signed URLs are generated fresh on each request, better security and consistency.

- ADR-059: Catalog card grid layout - fixed 5x4 grid with scroll (FP5)
  - Context: Catalog cards currently use CSS grid with auto-fit and minmax, causing inconsistent card sizes. Need consistent card sizing for better UX.
  - Decision: Implement fixed grid layout with 5 columns and 4 rows visible on screen (20 cards visible at once). Cards have fixed dimensions calculated based on viewport size. If more than 20 games exist, scrolling appears within the catalog pseudo-window container. Grid uses CSS Grid with explicit column count (5) and row template. Card dimensions are calculated to fit exactly 5 columns and 4 rows in the visible area.
  - Consequences: Consistent card sizes regardless of game count, predictable layout, better visual consistency. Requires viewport size calculations and responsive adjustments for different screen sizes.

- ADR-060: Cover URL signing in listGames() endpoint (FP5)
  - Context: Cover images in catalog sometimes show S3 keys instead of signed URLs, causing "Invalid cover URL" errors. Need to ensure all cover URLs are signed before returning to frontend.
  - Decision: Generate signed URLs dynamically in listGames() endpoint using the same approach as getGame() endpoint. For each game with cover_url starting with "covers/" (S3 key), call BuildUrlService.getSignedUrlFromKey() to generate fresh signed URL (expires in 1 hour). For legacy full URLs, use BuildUrlService.getSignedBuildUrl(). Never return S3 keys to frontend - always generate signed URLs or return undefined. This matches the existing implementation pattern in getGame() and is cost-effective (only generates URLs when games are requested, URLs expire after 1 hour).
  - Consequences: All cover images in catalog will display correctly, consistent with game page behavior, no changes needed to storage model, signed URLs are fresh on each catalog load, works reliably with S3/MinIO.

- ADR-061: User search endpoint for team member addition (FP5)
  - Context: Teams page needs to search users by login to add them to teams. No existing endpoint provides user search functionality.
  - Decision: Create new GET /users endpoint that accepts optional query parameter `login` for searching users by login (partial match, case-insensitive). Endpoint returns array of users with id and login fields. Endpoint is accessible to authenticated users only. Search supports partial matching (e.g., "john" matches "john_doe", "JohnSmith"). Returns maximum 20 results to prevent large responses.
  - Consequences: Teams page can search and add users by login, new endpoint required, search is simple but sufficient for MVP, may need pagination or rate limiting if usage grows.

- ADR-062: Help tooltips and error modals format for New Game page (FP5)
  - Context: New Game page needs help tooltips and error modals, but format is unclear.
  - Decision: (1) Help tooltips: Use Windows 95 styled tooltips that appear on hover/click of question mark icons. Tooltips are small popup windows in Windows 95 style (not modal dialogs), positioned near the help icon, show brief explanations of game upload rules and requirements. (2) Error modals: Use fake modal windows (Win95Modal component) styled as Windows 95 error dialogs. Modals are draggable, show error icon and message, have "Close" button and X button in top-right corner. Modals close on Close button click or X button click.
  - Consequences: Consistent Windows 95 styling, tooltips provide inline help without blocking UI, error modals are clearly visible and user-friendly, requires implementing Windows 95 styled tooltip component.

- ADR-063: Error modal behavior and styling for New Game page (FP5)
  - Context: Error modals on New Game page need to match Windows 95 error dialog style and behavior.
  - Decision: Error modals must be draggable Windows 95 styled modals (using Win95Modal component). Modals display Windows 95 error icon (red X or warning icon), error message text, and "Close" button at bottom. Modal has X button in top-right corner (standard Windows 95 window controls). Modal closes when user clicks "Close" button or X button. Modal title shows "Error" or specific error type. Modal is positioned centered on screen initially but can be dragged by title bar.
  - Consequences: Consistent Windows 95 error experience, modals are user-friendly and match system expectations, requires Win95Modal component to support draggable behavior and close buttons.

## Questions / Gaps (FP4)

- id: Q-FP4-001
  fp: FP4
  status: closed
  owner: vydra
  date: 2026-01-09
  question: What are the password requirements (minimum length, complexity, special characters)?
  answer: минимум 6 символов. больше никаких требований
  decision: ADR-030

- id: Q-FP4-002
  fp: FP4
  status: closed
  owner: vydra
  date: 2026-01-09
  question: How long should password recovery codes be valid (expiration time)?
  answer: нет ограничений на время. есть ограничение на количество. действует только последний отправленный код
  decision: ADR-031

- id: Q-FP4-003
  fp: FP4
  status: closed
  owner: vydra
  date: 2026-01-09
  question: What email service/provider should be used for sending password recovery codes?
  answer: не ебу пока что. Сделай просто так, чтобы можно было его указать где-то
  decision: ADR-032

- id: Q-FP4-004
  fp: FP4
  status: closed
  owner: vydra
  date: 2026-01-09
  question: Should login (username) and email both be unique, or can multiple users share the same email?
  answer: Both login and email must be unique (per requirements: email unique, login unique).
  decision: ADR-033

- id: Q-FP4-005
  fp: FP4
  status: closed
  owner: vydra
  date: 2026-01-09
  question: Who can add users to teams - only team creator, or any team member?
  answer: людей в команду может добавлять только лидер. лидера можно передавать. изначально лидером считается создатель
  decision: ADR-034

- id: Q-FP4-006
  fp: FP4
  status: closed
  owner: vydra
  date: 2026-01-09
  question: Should comments be stored embedded in games collection or as separate comments collection?
  answer: пусть комменты в отдельной коллекции лежат
  decision: ADR-035

- id: Q-FP4-007
  fp: FP4
  status: answered
  owner: vydra
  date: 2026-01-09
  question: Can unauthenticated users view comments, or only authenticated users?
  answer: Per requirements, comments should be visible to all users (authenticated and unauthenticated) on published games.
  decision: TBD

- id: Q-FP4-008
  fp: FP4
  status: closed
  owner: vydra
  date: 2026-01-09
  question: What session management approach should be used (JWT tokens, secure cookies, session storage)?
  answer: JWT токены
  decision: ADR-036

- id: Q-FP4-009
  fp: FP4
  status: closed
  owner: vydra
  date: 2026-01-09
  question: Should Windows 95 styling completely replace MUI Material 3, or be a theme overlay?
  answer: Per requirements, Windows 95 styling should replace existing styling (remove non-Windows 95 artifacts).
  decision: ADR-037

- id: Q-FP4-010
  fp: FP4
  status: answered
  owner: vydra
  date: 2026-01-09
  question: What is the exact data model for team membership (members array structure, user ID references)?
  answer: user ID ref
  decision: TBD

- id: Q-FP4-011
  fp: FP4
  status: answered
  owner: vydra
  date: 2026-01-09
  question: Should Editor tab be visible but disabled for unauthenticated users, or completely hidden?
  answer: Per requirements, Editor tab should not be visible/accessible for unauthenticated users (hidden).
  decision: TBD

- id: Q-FP4-012
  fp: FP4
  status: closed
  owner: vydra
  date: 2026-01-09
  question: When Super Admin forces status change, should the requirement/remark be mandatory or optional?
  answer: опциональная
  decision: ADR-038

- id: Q-FP4-013
  fp: FP4
  status: answered
  owner: vydra
  date: 2026-01-09
  question: Should the login/registration modal support switching between login and registration modes, or be separate modals?
  answer: Per requirements, single modal for both login and registration (Windows 95 style).
  decision: TBD

- id: Q-FP4-014
  fp: FP4
  status: closed
  owner: vydra
  date: 2026-01-09
  question: What happens to existing Super Admin account from FP1 - should it be migrated to new users collection with isSuperAdmin flag?
  answer: да
  decision: ADR-039

## Change Requests (FP4)

- id: CR-FP4-20260109-01
  fp: FP4
  status: closed
  owner: vydra
  date: 2026-01-09
  change: UI/UX fixes for FP4 implementation
  description: |
    11 UI/behavior fixes required:
    1. Fix tabs: should be "Catalog Teams Edit Settings Help" instead of "File Edit View Help"
    2. Games in catalog should have square cards
    3. Game page should have image on the right
    4. Comment input field not styled
    5. Help tab should show dropdown with brief description about the site
    6. Settings tab should only appear for admin
    7. Login/username button should be instead of Refresh button
    8. On catalog, missing tag selection bar and dropdown for tags that don't fit
    9. Main info window cannot be dragged
    10. On game creation page, no ability to upload Cover image from files
    11. Missing module with ability to publish game and upload game
  decision: ADR-050

- id: CR-FP4-20260109-02
  fp: FP4
  status: closed
  owner: vydra
  date: 2026-01-09
  change: Additional UI/UX fixes and refinements
  description: |
    13 additional fixes required:
    1. Login/Username button should be in toolbar, no Header component
    2. Remove team dropdown from Catalog toolbar
    3. Fix search input in Catalog (not working, not styled for Windows 95)
    4. Fix comment input styling in Game Details
    5. Game doesn't start when Play button clicked
    6. Game should fill entire modal window
    7. Window position jumps when switching tabs - should stay fixed
    8. Remove leader and member count from team cards
    9. Add Info button to team cards with modal showing members/leader and management options
    10. Create Game button doesn't work
    11. Super admin needs Edit button on game details page
    12. Unauthenticated users should be able to access Teams tab
    13. Login modal should be small (reference Windows 95 small windows)
  decision: ADR-051

- id: CR-FP4-20260109-03
  fp: FP4
  status: closed
  owner: vydra
  date: 2026-01-09
  change: Additional UI/UX refinements and bug fixes
  description: |
    12 fixes implemented:
    1. Hide "Add Member" button for unregistered users in team info modal (only shows for authenticated team leaders)
    2. Real-time filtering by game name in Catalog search input (debounced, 300ms)
    3. "View Games" redirect with team filter - redirects to catalog with teamId param, team name appears as tag, clicking removes filter
    4. Fixed login/register modal height (not full screen, uses auto height)
    5. Replaced login/register buttons with visual tabs in AuthModal (Windows 95 style)
    6. Made team info modal smaller (250-350px width, auto height)
    7. Display leader and members' logins instead of UUIDs (backend returns leaderLogin/memberLogins arrays)
    8. Fixed game creation page functionality (corrected endpoint paths: /games instead of /admin/games for most endpoints)
    9. Removed visual highlighting from Settings tab (now uses Link component like other tabs)
    10. Fixed CORS errors for local network IP access (updated backend CORS config with credentials, methods, headers)
    11. Added left margin (8px) to PlayModal game iframe container
    12. Build URL expiration issue noted (resolved in CR-FP4-20260109-06 with dynamic signed URL generation)
  decision: ADR-052

- id: CR-FP4-20260109-04
  fp: FP4
  status: closed
  owner: vydra
  date: 2026-01-09
  change: PlayModal fixes - game loading and margins
  description: |
    2 fixes implemented:
    1. Fixed PlayModal game loading - improved iframe loading logic with proper timeout and error handling, added console logging for debugging
    2. Fixed PlayModal margins - added right margin (8px on all sides), removed padding from modal content for Game title, adjusted container dimensions to use calc() for proper sizing without overflow
  decision: ADR-053

- id: CR-FP4-20260109-05
  fp: FP4
  status: closed
  owner: vydra
  date: 2026-01-09
  change: CORS fixes for local network access
  description: |
    Enhanced CORS configuration to fix access from other machines in local network:
    1. Enhanced backend CORS config - added explicit origin callback, all required headers, proper preflight handling, fallback middleware for CORS headers
    2. Backend listens on all interfaces (0.0.0.0) instead of just localhost
    3. Frontend auto-detects API URL based on current hostname (if accessing via IP, uses same IP for API)
    4. Added credentials: 'include' to fetch requests for proper CORS with credentials
    5. Fixed FormData handling - don't set Content-Type header for FormData (browser sets it automatically with boundary)
  decision: ADR-054

- id: CR-FP4-20260109-06
  fp: FP4
  status: closed
  owner: vydra
  date: 2026-01-09
  change: Fix build URL expiration issue - generate signed URLs dynamically
  description: |
    Fixed "AccessDeniedRequest has expired" error when opening games in PlayModal:
    1. Created BuildUrlService to generate signed S3 URLs dynamically on each game request
    2. Updated GamesController.getGame() to generate fresh signed URL (expires in 1 hour) instead of using stored static URL
    3. Installed @aws-sdk/s3-request-presigner package for signed URL generation
    4. BuildUrlService extracts buildId from stored build_url and generates fresh signed URL using GetObjectCommand
    5. Falls back to original URL if signing fails or URL doesn't point to S3
    6. Fixed signed URL hostname - replaces internal Docker hostname (minio) with public URL hostname (localhost) so URLs are accessible from browser
  decision: ADR-055

- id: CR-FP4-20260109-07
  fp: FP4
  status: closed
  owner: vydra
  date: 2026-01-09
  change: UI/UX fixes - modal heights, loader, New Game page
  description: |
    5 fixes implemented:
    1. Fixed AuthModal and Team info modal heights - changed from full screen to auto height, added explicit height: auto for these modals in Win95Modal
    2. Fixed signed URL hostname issue - BuildUrlService now replaces internal Docker hostname (minio) with public URL hostname (localhost) in generated signed URLs
    3. Added Windows 95 style hourglass loader (HourglassLoader component) to PlayModal - shows while game iframe is loading, animated sand falling effect
    4. Fixed team info modal height - uses title.startsWith("Team:") check for proper sizing
    5. Replaced "Edit" tab with "New Game" tab - changed all instances, fixed editor/games/new page to properly handle new game creation (resets form when routeGameId is "new", allows creating game before upload)
  decision: ADR-056

- id: CR-FP4-20260109-08
  fp: FP4
  status: closed
  owner: vydra
  date: 2026-01-09
  change: Fix team update and cover image loading issues
  description: |
    3 fixes implemented:
    1. Fixed team not updating when editing game - added teamId to loadGame() to load and set teamId, added teamId to handleUpdateGame() request body, added reload of game after update to refresh team info
    2. Fixed cover image not loading from MinIO - updated BuildUrlService to support any S3 URL path (not just builds), added signed URL generation for cover_url in GamesController.getGame(), returns teamId in response
    3. Added hourglass loader for cover images - created CoverImageWithLoader component that shows HourglassLoader while image loads, handles loading and error states
  decision: ADR-057

- id: CR-FP4-20260109-09
  fp: FP4
  status: closed
  owner: vydra
  date: 2026-01-09
  change: Cover image upload refactoring - S3 storage and file upload only
  description: |
    5 changes implemented:
    1. Created POST /games/:id/cover endpoint for uploading cover images to S3 - validates file size (300 KB max), file type (image only), uploads to S3 with key "covers/{coverId}.{ext}", stores S3 key in game.cover_url instead of full URL
    2. Updated GameDoc to store cover S3 key (e.g., "covers/{coverId}.jpg") instead of full URL - allows generating fresh signed URLs on each request
    3. Updated BuildUrlService - added getSignedUrlFromKey() method to generate signed URLs directly from S3 keys, updated getGame() to detect S3 keys (starts with "covers/") and generate signed URLs
    4. Removed cover URL input field from frontend - users can only upload files, no manual URL entry, added file size validation (300 KB) and file type validation on frontend
    5. Updated frontend cover upload flow - handleCoverUpload validates file, creates preview, uploads to /games/:id/cover endpoint, reloads game after upload to get signed URL, handleCreateGame and handleUpdateGame handle cover upload for new/existing games
  decision: ADR-058

## Questions / Gaps (FP5)

- id: Q-FP5-001
  fp: FP5
  status: closed
  owner: vydra
  date: 2026-01-10
  question: How should catalog card sizing be implemented? Fixed pixel dimensions or CSS grid constraints?
  answer: Сделай сетку с плитками. Желательно, чтобы экран был 5 плиток в ширину и 4 плитки в высоту. Если игр больше, то появляется скрол в псевдоокне.
  decision: ADR-059

- id: Q-FP5-002
  fp: FP5
  status: closed
  owner: vydra
  date: 2026-01-10
  question: Should cover URL signing happen in listGames() endpoint or should we ensure all cover_urls are signed URLs before storing?
  answer: Я не хочу заниматься кодом и разбираться, как он работает. Поэтому проведи исследование, которое максимально подойдёт к текущей реализации, будет дёшево для работы и не будет ломаться в случае работы с S3. Можешь ориентироваться на то, как реализован похожий процесс отображения обложки на странице игры.
  decision: ADR-060

- id: Q-FP5-003
  fp: FP5
  status: closed
  owner: vydra
  date: 2026-01-10
  question: Do we need a new GET /users endpoint for user search, or can we modify existing endpoints?
  answer: Добавь ещё один endpoint
  decision: ADR-061

- id: Q-FP5-004
  fp: FP5
  status: closed
  owner: vydra
  date: 2026-01-10
  question: What should be the exact format for help tooltips on New Game page? Modal windows or inline tooltips?
  answer: для ошибок используй fake modal windows. для подсказок должны появляться tooltips в стиле windows 95
  decision: ADR-062

- id: Q-FP5-005
  fp: FP5
  status: closed
  owner: vydra
  date: 2026-01-10
  question: Should error modals on New Game page be draggable Windows 95 modals or simple alerts?
  answer: да. Ошибки должны выглядеть как окна ошибки из windows 95. Быть перетаскиваемыми и закрываться должны по кнопке close или по крестику справа вверху
  decision: ADR-063

## ADRs (FP5)

### ADR-064: Catalog Tags Display Fix
date: 2026-01-10
status: accepted
context: Catalog page tag bar was conditionally rendered only when allTags.length > 0, causing it to disappear when no tags were available
decision: Always render tag bar with minimum height, show "No tags available" message when empty. This ensures consistent UI layout and better UX.
consequences: Tag bar is always visible, providing consistent visual structure even when no tags are available.

### ADR-065: Catalog Cover Images Display Fix
date: 2026-01-10
status: accepted
context: Catalog page cover images were not displaying correctly, using custom img tag instead of CoverImageWithLoader component
decision: Use CoverImageWithLoader component (same as on game details page) for consistent cover image display with loading states and error handling.
consequences: Consistent cover image display across catalog and game pages, better error handling and loading states.

### ADR-066: Team Creation Modal Window
date: 2026-01-10
status: accepted
context: Team creation used inline input field, creating two input rows on Teams page
decision: Replace inline input field with draggable Windows 95 styled modal window. Modal opens on "Create Team" button click, contains team name input, validation errors, and Create/Cancel buttons.
consequences: Cleaner Teams page UI, better UX with modal window, consistent with Windows 95 design system.

### ADR-067: Team Creation Response Format
date: 2026-01-10
status: accepted
context: TeamsController.createTeam() returned team without leaderLogin and memberLogins, causing frontend to display IDs instead of logins
decision: Update TeamsController.createTeam() to return team with leaderLogin and memberLogins populated, same format as getAllTeams(). User creating team is automatically added as member (already implemented in TeamsRepository.create()).
consequences: Consistent team data format across endpoints, proper login display instead of IDs.

### ADR-068: Team Filter Games Display
date: 2026-01-10
status: accepted
context: When filtering games by teamId, only published games were shown even for team members
decision: Update GamesService.listGames() to show all team games (including editing/archived) for authenticated team members when filtering by teamId. Unauthenticated users and non-members still see only published games.
consequences: Team members can see all their team's games when filtering by team, better team management workflow.

### ADR-069: Editor Help Tooltips Implementation
date: 2026-01-10
status: accepted
context: Help tooltips on Editor page were not displaying correctly
decision: Use Win95Modal component for help tooltips instead of inline divs. Tooltips open as draggable modal windows when help icon (?) is clicked, consistent with Windows 95 design system.
consequences: Better UX with draggable help windows, consistent with error modals and other Windows 95 styled components.

### ADR-070: Editor Error Modals and Validation
date: 2026-01-10
status: accepted
context: Error modals were not displaying, validation errors for empty fields were not shown
decision: Add validation for required fields (team, title) before API call. Display detailed error messages in Windows 95 styled draggable modal windows. Replace all alert() calls with error modals.
consequences: Better user feedback, detailed error messages help users understand what went wrong, consistent Windows 95 error handling.

### ADR-071: Tags UI Implementation
date: 2026-01-11
status: accepted
context: Tags were not saving correctly, system tags were visible to all users, and tag input UX was unclear
decision: 
  - User tags: Input field with Enter/comma support, tags displayed as removable chips (Windows 95 styled)
  - System tags: Multiple select dropdown with predefined options (hackathons: omsk-hackathon-2024, omsk-hackathon-2025, global-game-jam, ludum-dare; genres: action, puzzle, platformer, rpg, strategy, arcade), displayed as removable chips (Super Admin only)
  - Tags stored as arrays (not comma-separated strings), reload game after save to reflect changes
  - System tags field hidden for non-super-admins (UI-level permission check)
consequences: Clear tag management UX, proper permission enforcement, tags persist correctly, consistent Windows 95 styling with removable chips.
