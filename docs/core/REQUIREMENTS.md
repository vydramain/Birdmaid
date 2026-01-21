# Birdmaid Requirements

## Product vision

Birdmaid is an itch.io-at-home for the Omsk gamedev community: a small, hackathon-friendly catalog where teams can publish web builds and players can discover and play them in the browser.

## Roles

- Super Admin: the only authenticated role in FP1; full CRUD access across the system.
- Team member: can edit their team's games and set tags (future; not in FP1 until accounts exist).
- Public Visitor: anonymous browsing and playing of published games only.

### FP4: Roles Update

- **Unauthenticated Visitor**: can browse catalog, play published games, search by tags/titles, view teams, view team's game catalog. Cannot access Editor or Settings tabs.
- **Authenticated User**: all unauthenticated visitor capabilities, plus: create teams, add users to teams, create games for their teams, access Editor tab for their team's games, publish/archive their games, leave comments on games.
- **Super Admin**: all authenticated user capabilities, plus: edit any game, force status changes (published -> editing/archived) with requirements/remarks for any team.

## Functional requirements (FR)

- Browse a public catalog of published games.
- View a published game page with details and actions.
- Play the web build in-browser on the game page.
- Super Admin can create and manage Teams, Games, Builds, and Tags (game tags only; no separate tag collection in FP1).
- Super Admin can create a game on behalf of a team (teams can have zero members in FP1).
- Game details include description_md, repo_url, and cover_url (cover_url required to publish).
- Build workflow: upload ZIP -> preview on platform -> publish.
- Publish requires cover_url + description_md + build.
- Game status transitions: editing (default), published, archived.
- Super Admin can move a game from published to editing and leave remarks that must be addressed before republish.
- Tag assignment is restricted to team members and Super Admin (FP1: Super Admin only).
- Support user tags and optional system tags (assigned by Super Admin) for filtering/sorting by hackathons and genres.
- User tags: Free-form text input, added via Enter key or comma separator, displayed as removable chips (Windows 95 styled).
- System tags: Predefined list (hackathons: omsk-hackathon-2024, omsk-hackathon-2025, global-game-jam, ludum-dare; genres: action, puzzle, platformer, rpg, strategy, arcade), selected from multiple select dropdown, displayed as removable chips (Super Admin only).
- System tags field is hidden for non-super-admins (UI-level permission check).
- Tags are stored as arrays and persist correctly after save (game reloads to reflect changes).

## Non-functional requirements (NFR)

- Web builds stored in S3-compatible object storage on a separate machine.
- Max build size 300 MB for MVP; configurable later via Super Admin panel.
- iframe embed with conservative sandboxing; no guarantee for SharedArrayBuffer/WASM threads (COOP/COEP not required).
- Moderation baseline is admin-only takedown with remarks and status changes.
- Compatibility: Godot HTML5 build works if the ZIP contains index.html and assets.

## Stack evaluation (engineering constraints)

- Must be easy for a small community team to maintain.
- Must support iframe play and admin CRUD flows.
- Must have a common ecosystem and testing tooling.
- Minimal ops; deployable to a typical Linux VPS.
- MongoDB and S3-compatible storage must be supported.

## Engineering constraints

- Repo workflow assumes Codex skills are installed under `.codex/skills/**`; contributors must run the install command before agent work.

## UX / Design System (Baseline)

- UI library: MUI (Material UI) + Material 3 baseline.
- Tokens to capture (TBD in design-first): spacing scale (8pt), typography scale, radius, elevation, color palette.
- UX states:
  - Loading states for catalog/game/admin pages (skeleton or spinner).
  - Empty states (no games, no results).
  - Error states with retry for network/API failures.
  - Responsive layout: catalog grid adapts (mobile 1-2 cols, desktop 3-4 cols).
  - Iframe play: clear "Play", "Fullscreen", and fallback message if build fails.
  - Admin publish gating: publish disabled until cover_url + build + description_md present.
- Accessibility baseline:
  - Visible focus, keyboard-navigable primary CTAs, semantic headings.

## Stitch usage (reference-only)

- Stitch is used to generate visual references and design tokens only.
- Stitch exports are not production code; they are references.
- Store Stitch outputs as artifacts (not committed): artifacts/<FP>/<date>/evidence/stitch/*.
- Use English prompts for Stitch.

## Stitch Prompt Pack (Generated)

### Summary

- Product: Birdmaid (Omsk gamedev catalog for web builds)
- FP1 scope: Browse & Play + Admin Authoring
- UI library: MUI (Material 3 baseline)
- Modes: light only (FP1)

### Screens to generate

- CatalogPage: public catalog grid with filters/tags and sort.
- GamePage: game details + play iframe + repo link + markdown description.
- AdminGameEditorPage: game details, build upload, preview, publish, tags, status/remark.
- AdminTeamsPage: create teams (zero members allowed).

### UX requirements to reflect

- Loading/empty/error states for catalog, game page, and admin editor.
- Responsive grid: mobile 1-2 cols, desktop 3-4 cols.
- Clear CTA hierarchy (primary: Play, Publish; secondary: Edit, Preview).
- Publish disabled until cover_url + description_md + build are present.
- Iframe play with fullscreen and fallback message on failure.
- Accessibility: visible focus, keyboard navigable CTAs, semantic headings.

### Design token checklist

- Color palette (primary/secondary/surface/background)
- Typography scale (H1-H6 + body + captions)
- Spacing scale (8pt)
- Radius, elevation, and component density

### Stitch prompt (English)

Design a modern, minimal game catalog and admin authoring UI for a web platform called Birdmaid. Screens: CatalogPage (public catalog grid with filters/tags and sort), GamePage (details with markdown description, repo link, cover, play iframe), AdminGameEditorPage (game details, build upload, preview, publish, tags, status/remark), AdminTeamsPage (create teams, zero members allowed). Emphasize loading/empty/error states, responsive grid (mobile 1-2 cols, desktop 3-4 cols), clear CTA hierarchy (primary: Play, Publish; secondary: Edit, Preview), iframe play with fullscreen and fallback message on failure. Use MUI Material 3 baseline and provide tokens for color palette, typography scale, spacing (8pt), radius, and elevation. Light mode only.

## Non-goals (FP1)

- Self-serve user registration beyond the Super Admin account.
- Automated moderation or community reporting flows.
- Ratings, comments, payments, or marketplace features.
- User management, complex permissions, audit logs, or release history.

---

## FP4: User Accounts & Windows 95 UI

### Functional requirements (FR)

#### FR-FP4-001: User Account System
- Users can register with email, login (username), and password.
- Users can authenticate using either login (username) or email with password.
- Users can request password recovery via email with a generated recovery code.
- Password recovery flow: user requests recovery -> system generates code -> email sent -> user enters code -> user sets new password.
- User accounts stored in MongoDB with fields: _id, email (unique), login (unique), password (hashed), isSuperAdmin (boolean flag), createdAt, updatedAt.
- Super Admin accounts can be created/updated by directly setting `isSuperAdmin: true` flag in MongoDB.

#### FR-FP4-002: Unauthenticated Visitor Access
- Unauthenticated visitors land on catalog page (home page = catalog).
- Can browse published games in catalog.
- Can open any published game page.
- Can play published games in browser.
- Can search games by tags and by title/name.
- Can view list of all teams.
- Can open team's game catalog (filter games by team).
- Cannot access Editor tab (hidden for unauthenticated).
- Cannot access Settings tab (hidden for unauthenticated).

#### FR-FP4-003: Authenticated User Access
- All unauthenticated visitor capabilities (FR-FP4-002).
- Can create new teams.
- Can add other users to teams (team membership management).
- For each team where user is a member: can create new games for that team.
- For each team where user is a member: can access Editor tab to create/edit games.
- Can publish games (change status from editing to published) for their teams' games.
- Can archive games (change status from published/editing to archived) for their teams' games.
- Can leave comments on any published game (comment includes user login/username).

#### FR-FP4-004: Super Admin Access
- All authenticated user capabilities (FR-FP4-003).
- Can edit any game (regardless of team membership).
- Can force status change for any game: published -> editing/archived.
- Can leave requirements/remarks when forcing status changes (same mechanism as FP1 admin remarks).

#### FR-FP4-005: UI Navigation Changes
- Remove sidebar "Teams" panel from Teams page/tab.
- Remove any rating/scoring system for games.
- Add comment system: users can leave comments on games; comments display with user login/username below the game.
- Login/username button in top-left corner: shows "Login" for unauthenticated, shows username for authenticated.
- Username button opens burger menu with logout option (for authenticated users).
- Login button opens login/registration modal (for unauthenticated users).

#### FR-FP4-006: Authentication UI (Windows 95 Style)
- Login and registration use a single modal window styled as Windows 95 window.
- Modal is draggable by dragging the top title bar.
- Modal contains form fields and buttons following standard Windows 95 UX patterns.
- Modal can be moved anywhere on the page while dragging.

#### FR-FP4-007: Game Page Redesign
- Game page shows: description, team name, team members list, repository link, "Play" button.
- Remove large black rectangle/iframe embed from main game page.
- "Play" button opens a modal window styled as Windows 95 window.
- Play modal contains the game iframe and is draggable by dragging the top title bar.
- Play modal can be moved anywhere on the page while dragging.

#### FR-FP4-008: Windows 95 UI Styling
- Entire site must be styled to match Windows 95 aesthetic.
- Reference artifacts: `artifacts/FP1/2026-01-08/evidence/stitch/**/*` for Windows 95 styling patterns.
- All UI elements (buttons, windows, modals, forms, inputs) must follow Windows 95 design language.
- Remove any non-Windows 95 styling artifacts throughout the site.

### Non-functional requirements (NFR)

#### NFR-FP4-001: Authentication Security
- Passwords must be hashed using secure hashing algorithm (bcrypt or equivalent).
- Email verification for password recovery codes (codes expire after reasonable time, e.g., 15-30 minutes).
- Session management: secure session tokens/cookies for authenticated users.
- Password requirements: minimum length and complexity (TBD in design-first).

#### NFR-FP4-002: Account Data Model
- MongoDB collection: `users` with fields: _id, email (unique index), login (unique index), password (hashed), isSuperAdmin (boolean, default false), createdAt, updatedAt.
- Super Admin flag (`isSuperAdmin`) can be set directly in MongoDB for manual account elevation.
- Team membership: update `teams` collection to include `members[]` array with user IDs.

#### NFR-FP4-003: Windows 95 UI Consistency
- All modals must be draggable via title bar.
- All windows/modals must follow Windows 95 visual style (title bar, borders, buttons, fonts).
- Consistent Windows 95 styling across all pages and components.
- Reference existing Windows 95 artifacts for style consistency.

#### NFR-FP4-004: Comment System
- Comments stored per game (embedded in games collection or separate comments collection - TBD in design-first).
- Comments display: comment text + user login/username + timestamp.
- Comments visible to all users (authenticated and unauthenticated) on published games.

#### NFR-FP4-005: Team Membership
- Teams collection updated: `members[]` array contains user IDs.
- Users can be added to teams by team creators or existing team members (permission model TBD in design-first).
- Team membership determines access to Editor tab and game creation for that team.

### Acceptance Criteria (FP4)

#### AC-FP4-001: Account Registration and Login
- ✅ User can register with email, login, and password.
- ✅ User can login using either email or login (username) with password.
- ✅ Registration form validates email format and login uniqueness.
- ✅ Login form accepts either email or login as identifier.

#### AC-FP4-002: Password Recovery
- ✅ User can request password recovery from login modal.
- ✅ System generates recovery code and sends email.
- ✅ User can enter recovery code and set new password.
- ✅ Recovery code expires after defined time period.

#### AC-FP4-003: Super Admin Flag
- ✅ Super Admin accounts can be created by setting `isSuperAdmin: true` in MongoDB.
- ✅ Super Admin flag grants all super admin capabilities (FR-FP4-004).

#### AC-FP4-004: Unauthenticated Visitor Experience
- ✅ Home page (/) shows catalog of published games.
- ✅ Can browse, search, play games, view teams, view team catalogs.
- ✅ Editor and Settings tabs are not visible/accessible.

#### AC-FP4-005: Authenticated User Experience
- ✅ All unauthenticated capabilities available.
- ✅ Can create teams and add users to teams.
- ✅ Can create games for teams where user is a member.
- ✅ Editor tab appears and is accessible for user's team games.
- ✅ Can publish and archive own team's games.
- ✅ Can leave comments on any published game.

#### AC-FP4-006: Super Admin Experience
- ✅ Can edit any game regardless of team membership.
- ✅ Can force status changes (published -> editing/archived) for any game.
- ✅ Can leave requirements/remarks when forcing status changes.

#### AC-FP4-007: UI Navigation
- ✅ Teams page/tab has no sidebar "Teams" panel.
- ✅ No rating system visible anywhere.
- ✅ Comments visible on game pages with user login/username.
- ✅ Top-left corner shows "Login" button (unauthenticated) or username button (authenticated).
- ✅ Username button opens burger menu with logout option.

#### AC-FP4-008: Authentication Modal (Windows 95)
- ✅ Login/registration modal styled as Windows 95 window.
- ✅ Modal is draggable by title bar.
- ✅ Modal contains appropriate form fields and buttons.
- ✅ Modal follows Windows 95 UX patterns.

#### AC-FP4-009: Game Page Redesign
- ✅ Game page shows: description, team, members, repository, "Play" button.
- ✅ No large black rectangle/iframe on main game page.
- ✅ "Play" button opens Windows 95 styled modal with game iframe.
- ✅ Play modal is draggable by title bar.

#### AC-FP4-010: Windows 95 Styling Consistency
- ✅ Entire site matches Windows 95 aesthetic.
- ✅ All UI elements (buttons, windows, modals, forms) follow Windows 95 design.
- ✅ No non-Windows 95 styling artifacts remain.
- ✅ Styling matches reference artifacts from `artifacts/FP1/2026-01-08/evidence/stitch/**/*`.

### Non-goals (FP4)

- Email verification for registration (deferred; password recovery only).
- Social login (OAuth, etc.).
- User profiles/avatars.
- Comment moderation beyond basic display.
- Team role management (owner/member permissions - all members have equal access in FP4).
- Game versioning/history beyond current build.
- Advanced search filters beyond tags and title.

### Assumptions (FP4)

- Email service is configured and available for password recovery codes.
- Session management uses secure cookies or JWT tokens.
- Team membership is managed by team creators or existing members (exact permission model TBD in design-first).
- Comments are stored per game (exact data model TBD in design-first).
- Windows 95 styling replaces existing MUI Material 3 baseline (design system change).

## Assumptions

- Team membership management is deferred until after FP1.
- Public catalog only shows published games; editing/archived are hidden.
- Detailed CSP and sandbox rules are defined in discovery and recorded in ADRs.

---

## FP5: UI/UX Fixes and Polish

### Functional requirements (FR)

#### FR-FP5-001: Catalog Card Sizing
- Game cards in catalog must have consistent size regardless of the number of cards displayed.
- Cards should use fixed dimensions or grid constraints that prevent size variation.
- Minimum card size should be maintained even when fewer than 5 cards are displayed.

#### FR-FP5-002: Cover Image Display in Catalog
- Backend must always return signed URLs for cover images in GET /games endpoint, never S3 keys.
- Frontend must display cover images correctly without showing "Invalid cover URL (S3 key received)" error.
- Cover images should load properly in catalog grid.

#### FR-FP5-003: Team Members Display on Game Page
- Team members list on game page must display user logins (usernames), not user IDs.
- Backend must return member logins in GET /games/{id} response.
- Display format: comma-separated list of logins.

#### FR-FP5-004: Catalog Title Search
- Search input in catalog must filter games by title in real-time as user types.
- Filtering should be case-insensitive and support partial matches.
- Search should work correctly with other filters (tags, teamId).

#### FR-FP5-005: Catalog Search Input Styling
- Search input in catalog toolbar must be styled according to Windows 95 design system.
- Input should use Win95Input component or equivalent Windows 95 styling.

#### FR-FP5-006: Teams Page Create Team Button
- "Create Team" button must display text in a single line.
- Button width must be adaptive (fit content, not full width).
- Button should follow Windows 95 button styling.

#### FR-FP5-007: Teams Page Search Input
- Search input for filtering teams by name must be styled according to Windows 95 design system.
- Input should use Win95Input component or equivalent Windows 95 styling.

#### FR-FP5-008: Teams Page Team Name Search
- Search input on Teams page must filter teams by name in real-time as user types.
- Filtering should be case-insensitive and support partial matches.
- Teams list should update dynamically based on search input.

#### FR-FP5-009: Teams Info Modal Sizing
- Team info modal must have adaptive height (not full screen).
- Modal should end immediately after "Add Member" button section.
- Modal should not stretch to full viewport height.

#### FR-FP5-010: Teams Info Modal "Make Leader" Button
- "Make Leader" button must not be displayed for the current team leader.
- Button should only appear for non-leader members when current user is the leader.
- Logic: if memberId === team.leader, do not show "Make Leader" button.

#### FR-FP5-011: Teams Info Modal User Search Input Styling
- User search input in Teams info modal must be styled according to Windows 95 design system.
- Input should use Win95Input component or equivalent Windows 95 styling.

#### FR-FP5-012: Teams Info Modal User Search Functionality
- User search input must allow searching for users by login.
- When a valid user login is entered and "Add Member" is clicked, user must be added to the team.
- Backend endpoint POST /teams/{id}/members must accept userId or userLogin.
- Frontend must call backend API to add member, not just close modal.

#### FR-FP5-013: Edit Button on Game Page
- Game page must display "Edit" button for team members (users who are members of the game's team).
- Button should navigate to /editor/games/{gameId} page.
- Button should only be visible to authenticated users who are team members or super admin.
- Button should be styled according to Windows 95 design system.

#### FR-FP5-014: Tag Filtering with TeamId
- When both tag and teamId parameters are provided to GET /games, both filters must work together.
- Backend must return games that match both: belong to specified team AND have specified tag.
- Filtering logic: teamId filter AND tag filter (both conditions must be satisfied).

#### FR-FP5-015: New Game Page Help and Error Handling
- New Game page must display help tooltips (question mark icons) styled for Windows 95.
- Tooltips should explain rules for uploading games (file format, size limits, etc.).
- Error modals must be displayed when operations fail (upload, create, update).
- Error modals must be styled as Windows 95 windows (draggable, Windows 95 styling).
- Help icons should be clickable and show tooltip windows with instructions.

### Non-functional requirements (NFR)

#### NFR-FP5-001: Windows 95 Styling Consistency
- All new UI elements must follow Windows 95 design system.
- Inputs, buttons, modals, and tooltips must match existing Windows 95 styling.
- Reference artifacts from `artifacts/FP2/2026-01-09/evidence/stitch/**/*` for consistency.

#### NFR-FP5-002: Backend API Compatibility
- Backend changes must not break existing API contracts.
- Cover URL signing must work correctly for all existing games.
- Tag filtering with teamId must maintain backward compatibility.

#### NFR-FP5-003: User Search Performance
- User search in Teams info modal should support real-time filtering.
- Backend endpoint for user search should be efficient (indexed queries).
- Search should work with partial login matches.

### Acceptance Criteria (FP5)

#### AC-FP5-001: Catalog Card Sizing
- ✅ Game cards have consistent size regardless of count (1-100+ cards).
- ✅ Cards maintain minimum size when fewer than 5 cards displayed.
- ✅ Grid layout prevents card size variation.

#### AC-FP5-002: Cover Image Display
- ✅ All cover images in catalog display correctly (no "Invalid cover URL" errors).
- ✅ Backend returns signed URLs, not S3 keys, in GET /games response.
- ✅ Cover images load and display properly in catalog grid.

#### AC-FP5-003: Team Members Display
- ✅ Game page shows team member logins (usernames), not IDs.
- ✅ Backend returns member logins in GET /games/{id} response.
- ✅ Display format is readable (comma-separated logins).

#### AC-FP5-004: Catalog Title Search
- ✅ Search input filters games by title in real-time.
- ✅ Filtering is case-insensitive and supports partial matches.
- ✅ Search works correctly with tag and teamId filters.

#### AC-FP5-005: Catalog Search Input Styling
- ✅ Search input uses Windows 95 styling (Win95Input component).
- ✅ Input matches Windows 95 design system.

#### AC-FP5-006: Teams Create Team Button
- ✅ Button text displays in single line.
- ✅ Button width is adaptive (fits content).
- ✅ Button uses Windows 95 styling.

#### AC-FP5-007: Teams Search Input Styling
- ✅ Search input uses Windows 95 styling (Win95Input component).
- ✅ Input matches Windows 95 design system.

#### AC-FP5-008: Teams Name Search
- ✅ Search input filters teams by name in real-time.
- ✅ Filtering is case-insensitive and supports partial matches.
- ✅ Teams list updates dynamically.

#### AC-FP5-009: Teams Info Modal Sizing
- ✅ Modal has adaptive height (not full screen).
- ✅ Modal ends after "Add Member" section.
- ✅ Modal does not stretch to full viewport height.

#### AC-FP5-010: Teams Info Modal "Make Leader" Button
- ✅ "Make Leader" button is hidden for current leader.
- ✅ Button only appears for non-leader members when user is leader.
- ✅ Logic correctly identifies current leader.

#### AC-FP5-011: Teams Info Modal User Search Input Styling
- ✅ User search input uses Windows 95 styling (Win95Input component).
- ✅ Input matches Windows 95 design system.

#### AC-FP5-012: Teams Info Modal User Search Functionality
- ✅ User search allows searching by login.
- ✅ "Add Member" button adds user to team via backend API.
- ✅ Backend endpoint accepts userId or userLogin.
- ✅ Team members list updates after adding member.

#### AC-FP5-013: Edit Button on Game Page
- ✅ "Edit" button appears for team members on game page.
- ✅ Button navigates to /editor/games/{gameId}.
- ✅ Button only visible to authenticated team members or super admin.
- ✅ Button uses Windows 95 styling.

#### AC-FP5-014: Tag Filtering with TeamId
- ✅ GET /games?tag=X&teamId=Y returns games matching both conditions.
- ✅ Backend correctly applies both filters (AND logic).
- ✅ Empty results are returned correctly when no games match both conditions.

#### AC-FP5-015: New Game Page Help and Errors
- ✅ Help tooltips (question mark icons) display on New Game page.
- ✅ Tooltips explain game upload rules (Windows 95 styled).
- ✅ Error modals display on operation failures (Windows 95 styled, draggable).
- ✅ Help icons are clickable and show tooltip windows.

### Non-goals (FP5)

- Major UI redesigns beyond Windows 95 styling fixes.
- New features beyond fixing existing functionality.
- Performance optimizations beyond basic query efficiency.
- Accessibility improvements beyond existing baseline.

### Assumptions (FP5)

- Existing Windows 95 styling components (Win95Input, Win95Button, Win95Modal) are available.
- Backend can be modified to return signed URLs for cover images.
- User search endpoint can be added or existing endpoint modified.
- Tag filtering logic can be updated without breaking existing functionality.

### UX Baseline Tokens (FP5) - Reference Only

FP5 focuses on UI/UX fixes and polish using existing Windows 95 design system. No new design tokens required. Reference existing Windows 95 styling from:
- `artifacts/FP1/2026-01-08/evidence/stitch/**/*` (Windows 95 style references)
- Existing `retro.css` and Windows 95 components (Win95Modal, Win95Input, Win95Button)

**Component Tokens (Reference):**
- Tooltip: Windows 95 styled popup window, appears on hover/click, positioned near help icon
- Error Modal: Windows 95 styled draggable modal with error icon, message, and Close/X buttons
- Search Input: Win95Input component styling (Windows 95 text input appearance)
- Button: Win95Button component styling (Windows 95 button appearance)
- Card Grid: Fixed 5 columns × 4 rows layout, card size calculated from viewport dimensions

**Stitch References:**
- No new Stitch outputs required for FP5 (uses existing Windows 95 artifacts from FP1/FP4)
