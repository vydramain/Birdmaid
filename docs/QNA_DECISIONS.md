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

## Questions / Gaps (FP3)

- id: Q-030
  fp: FP3
  status: closed
  owner: vydra
  date: 2026-01-09
  question: Do we need a backend login endpoint, or can we use static token validation on frontend only?
  answer: Use static token validation on frontend only. Backend already validates token via X-Admin-Token header against ADMIN_TOKEN env var. Login page accepts token input directly and stores in localStorage.
  decision: ADR-030

- id: Q-031
  fp: FP3
  status: closed
  owner: vydra
  date: 2026-01-09
  question: Should login page accept token input directly, or use credentials (email/password) that backend validates?
  answer: Accept token input directly. MVP uses static admin token (ADMIN_TOKEN env var or default "admin-token"). No credentials needed.
  decision: ADR-030

- id: Q-032
  fp: FP3
  status: closed
  owner: vydra
  date: 2026-01-09
  question: Where should global navigation component be placed (header, sidebar, menu bar)?
  answer: Place in win-menu bar (existing menu structure). Replace static menu items with functional navigation links.
  decision: ADR-032

- id: Q-033
  fp: FP3
  status: closed
  owner: vydra
  date: 2026-01-09
  question: Should navigation show admin links only when authenticated, or always show with disabled state?
  answer: Show admin links only when authenticated (isAuthenticated === true). Hide completely when not authenticated to avoid confusion.
  decision: ADR-033

- id: Q-034
  fp: FP3
  status: closed
  owner: vydra
  date: 2026-01-09
  question: How should we handle token expiration or invalidation (redirect to login, show error, auto-refresh)?
  answer: On 401/403 response in fetchJson, clear token from localStorage, set isAuthenticated=false, and redirect to /login. No auto-refresh for MVP (static token).
  decision: ADR-034

- id: Q-035
  fp: FP3
  status: closed
  owner: vydra
  date: 2026-01-09
  question: Should ProtectedRoute component wrap admin routes, or use a higher-order component pattern?
  answer: Use ProtectedRoute component wrapper pattern. Wrap admin routes in Routes: <Route path="/admin/*" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />.
  decision: ADR-035

- id: Q-036
  fp: FP3
  status: closed
  owner: vydra
  date: 2026-01-09
  question: Should auth context be React Context API, Zustand, or another state management solution?
  answer: Use React Context API (minimal, no extra dependencies). Create AuthContext with Provider wrapping App, exposing token, isAuthenticated, login, logout functions.
  decision: ADR-036

- id: Q-037
  fp: FP3
  status: closed
  owner: vydra
  date: 2026-01-09
  question: What happens when user navigates to admin page without token (redirect immediately or show error first)?
  answer: ProtectedRoute checks auth immediately on mount. If not authenticated, redirect to /login immediately (no error screen delay).
  decision: ADR-037

- id: Q-038
  fp: FP3
  status: closed
  owner: vydra
  date: 2026-01-09
  question: Should logout clear only token, or also clear any cached game/team data?
  answer: Clear only token from localStorage. Page-level state will reset on remount. No need to clear cached data (pages reload on navigation).
  decision: ADR-038

- id: Q-039
  fp: FP3
  status: closed
  owner: vydra
  date: 2026-01-09
  question: Should AdminGameEditorPage load existing game when gameId is in URL?
  answer: Yes. Add useEffect to fetch game data from GET /admin/games/{gameId} when routeGameId is provided and populate form fields.
  decision: ADR-039

- id: Q-040
  fp: FP3
  status: closed
  owner: vydra
  date: 2026-01-09
  question: Should AdminTeamsPage load existing teams list on mount?
  answer: Yes. Add GET /admin/teams endpoint call on mount to display existing teams (currently only shows manually created ones).
  decision: ADR-040

- id: Q-041
  fp: FP3
  status: closed
  owner: vydra
  date: 2026-01-09
  question: Should AdminSettingsPage load current build limit settings on mount?
  answer: Yes. Add GET /admin/settings/build-limits endpoint call on mount to display current maxBuildSizeBytes value.
  decision: ADR-041

- id: Q-042
  fp: FP3
  status: closed
  owner: vydra
  date: 2026-01-09
  question: Do we need new backend GET endpoints for admin data loading?
  answer: Yes. Need GET /admin/teams (list), GET /admin/games/{id} (with adminRemark), GET /admin/settings/build-limits. Existing GET /games/{id} doesn't return adminRemark and may not be sufficient for editor.
  decision: ADR-042

## ADRs (FP3)

- ADR-030: Static token authentication for MVP
  - Context: FP3 needs minimal auth flow without backend login endpoint complexity.
  - Decision: Use static token stored in ADMIN_TOKEN env var (default "admin-token"). Login page accepts token input directly and stores in localStorage. Backend validates via X-Admin-Token header.
  - Consequences: No backend login endpoint needed. Token must be manually entered on first use. No token expiration/refresh for MVP.

- ADR-032: Navigation placement in win-menu bar
  - Context: Existing UI has win-menu bar structure; navigation links need consistent placement.
  - Decision: Replace static menu items (File, Edit, View, etc.) with functional navigation links in win-menu bar. Keep retro aesthetic.
  - Consequences: Menu bar becomes primary navigation. Admin links conditionally rendered based on auth state.

- ADR-033: Conditional admin link visibility
  - Context: Navigation should respect auth state to avoid confusion.
  - Decision: Show admin links (Teams, Games, Settings) only when isAuthenticated === true. Hide completely when not authenticated.
  - Consequences: Cleaner UI for public users. Admin links appear/disappear based on login state.

- ADR-034: 401/403 error handling with redirect
  - Context: API errors need consistent handling and user feedback.
  - Decision: On 401/403 response in fetchJson, clear token from localStorage, set isAuthenticated=false in context, and redirect to /login using React Router navigate.
  - Consequences: Users automatically redirected on auth failure. Token cleared to prevent stale state.

- ADR-035: ProtectedRoute component wrapper pattern
  - Context: Admin routes need consistent auth checking.
  - Decision: Create ProtectedRoute component that checks auth context. If not authenticated, redirect to /login. Otherwise render children.
  - Consequences: Centralized auth guard logic. All admin routes wrapped consistently.

- ADR-036: React Context API for auth state
  - Context: Need centralized auth state without adding dependencies.
  - Decision: Use React Context API with AuthContext provider wrapping App. Expose { token, isAuthenticated, login(token), logout() } via useContext hook.
  - Consequences: No extra dependencies. Simple state management. All components can access auth state.

- ADR-037: Immediate redirect on unauthorized access
  - Context: User experience when accessing protected routes without auth.
  - Decision: ProtectedRoute checks auth immediately on mount. If not authenticated, redirect to /login immediately (no error screen delay).
  - Consequences: Faster user feedback. No confusing "Access Denied" screens before redirect.

- ADR-038: Logout clears only token
  - Context: Logout behavior and state cleanup.
  - Decision: Logout clears only token from localStorage and sets isAuthenticated=false. Page-level state resets on remount. No need to clear cached data.
  - Consequences: Simpler implementation. Pages reload fresh on navigation.

- ADR-039: AdminGameEditorPage loads existing game data
  - Context: Editor should populate form when editing existing game.
  - Decision: Add useEffect to fetch GET /admin/games/{gameId} when routeGameId is provided. Populate form fields (title, description, cover_url, etc.) and build_url.
  - Consequences: Editor works for both create and edit flows. Users can modify existing games.

- ADR-040: AdminTeamsPage loads teams list
  - Context: Teams page should show existing teams on mount.
  - Decision: Add GET /admin/teams endpoint call on mount to fetch and display all teams. Update teams state with fetched data.
  - Consequences: Teams list persists across page reloads. Users see all teams, not just manually created ones.

- ADR-041: AdminSettingsPage loads current settings
  - Context: Settings page should display current build limit value.
  - Decision: Add GET /admin/settings/build-limits endpoint call on mount to fetch current maxBuildSizeBytes and populate input field.
  - Consequences: Settings page shows current values. Users can see existing configuration before editing.

- ADR-042: Backend GET endpoints for admin data loading
  - Context: Frontend needs to load existing teams, games (with adminRemark), and settings data.
  - Decision: Create three new GET endpoints: GET /admin/teams (returns teams list), GET /admin/games/{id} (returns game with adminRemark field), GET /admin/settings/build-limits (returns maxBuildSizeBytes). All require admin auth guard.
  - Consequences: Frontend can load data on mount. GET /admin/games/{id} differs from public GET /games/{id} by including adminRemark and not filtering by status.

- ADR-043: Team selection via dropdown with search
  - Context: Team ID input field is not user-friendly; users need to see team names and search for teams.
  - Decision: Replace Team ID text input with dropdown list that shows all teams (for admin, all teams are visible). Add search functionality to filter teams by name. Auto-create game if needed when uploading cover/build before saving.
  - Consequences: Better UX for team selection. Teams list must be loaded on editor page mount. Search provides quick team lookup.

- ADR-044: Combined cover image field (URL + upload)
  - Context: Users should be able to either enter cover image URL or upload file directly.
  - Decision: Combine cover image input into single field with text input for URL and file upload button side-by-side. Add POST /admin/games/{id}/cover endpoint for file upload. Show preview of cover image when URL is set.
  - Consequences: More flexible cover image workflow. Cover upload requires game to exist (auto-create if needed).

- ADR-045: Signed URL generation with public endpoint
  - Context: SignatureDoesNotMatch errors occur when signed URL is generated with internal endpoint (minio:9000) and host is replaced to public (localhost:9000), invalidating the signature.
  - Decision: Create separate S3Client (s3PublicClient) with public endpoint (S3_PUBLIC_URL) for generating signed URLs. This ensures signature is valid for the public URL from the start. Fix duplicate bucket name in path if it occurs.
  - Consequences: Signed URLs are valid for browser access. No need to replace host after generation.

- ADR-046: Catalog page real data display
  - Context: Catalog page shows placeholder content instead of real games from API.
  - Decision: Remove placeholder "featured" section. Display real games from GET /games endpoint with cover images. Show "No games available" message when games list is empty. Improve game card design with cover images and proper layout.
  - Consequences: Catalog shows actual published games. Better user experience with real data.

- ADR-047: Build upload workflow warnings
  - Context: Users may try to upload build before creating game, causing confusion.
  - Decision: Add warning message in Build Upload section: "Please save the game first before uploading build". Disable build upload input until game is saved. Show red error message if upload attempted before save.
  - Consequences: Clearer workflow guidance. Prevents errors from uploading before game creation.
