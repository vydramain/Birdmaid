# Tests

## FP1: Browse & Play + Admin Authoring

### UAT / BDD

- Catalog loading: Given the catalog page loads, when data is fetching, then a loading state is visible, and after success the list is rendered.
- Catalog empty: Given no published games, when the catalog loads, then an empty state is shown.
- Catalog error: Given a network/API error, when the catalog loads, then an error state with retry is shown.
- Game page loading: Given a user opens a game page, when data is fetching, then a loading state is visible, and the details render after success.
- Game unavailable: Given a game is editing/archived, when a public visitor opens its page, then a 404/unavailable response is shown.
- Play iframe failure: Given the build fails to load, when the play iframe errors, then a fallback message is shown.
- Admin team creation: Given Super Admin creates a team (zero members allowed), then the team is saved and selectable for a game.
- Admin game creation/edit: Given Super Admin creates/edits a game with description_md, repo_url, cover_url, then the game is saved.
- Admin upload -> preview -> publish: Given Super Admin uploads a build ZIP, when preview loads, then the build is visible; when publish is clicked with required fields, status becomes published.
- Admin publish gating: Given cover_url/build/description_md missing, when publish is attempted, then the publish action is disabled or blocked with a message.
- Admin status + remark: Given Super Admin moves a published game to editing with a remark, then the game becomes non-public and the remark is saved.
- Admin archive: Given Super Admin archives a game, then it is removed from the public catalog and returns 404/unavailable to public visitors.
- Tags permissions: Given Super Admin, when setting tags_user/tags_system, then changes persist; given public visitor, then tags are read-only and only used for filtering.

### Acceptance Checklist (FP1)

- Modern UX baseline satisfied: loading, empty, error, responsive layouts, CTA clarity.
- Admin publish gating enforced (cover_url + build + description_md).
- Play iframe fallback message shown on failure.
- Editing/archived games are not publicly visible and return 404/unavailable.
- Admin authoring flow completes: team -> game -> upload -> preview -> publish -> tags -> status/remark.

### RTM (YAML)

```yaml
fp: FP1
requirements:
  - id: FR-001
    name: Public catalog browsing
    tests:
      - UAT-001
      - UAT-002
      - UAT-003
    code_targets: [front/catalog, back/games.list]
  - id: FR-002
    name: Game page details and play
    tests:
      - UAT-004
      - UAT-005
      - UAT-006
    code_targets: [front/game, back/games.get]
  - id: FR-003
    name: Admin team and game authoring
    tests:
      - UAT-007
      - UAT-008
    code_targets: [front/admin.teams, front/admin.game, back/admin.teams, back/admin.games]
  - id: FR-004
    name: Build upload, preview, publish gating
    tests:
      - UAT-009
      - UAT-010
    code_targets: [front/admin.game, back/admin.games.build, back/admin.games.publish]
  - id: FR-005
    name: Status transitions and admin remarks
    tests:
      - UAT-011
      - UAT-012
    code_targets: [front/admin.game, back/admin.games.status]
  - id: FR-006
    name: Tags permissions and filtering
    tests:
      - UAT-013
    code_targets: [front/catalog.filters, front/admin.game.tags, back/games.list, back/admin.games.tags]
  - id: NFR-UX-001
    name: UX baseline states
    tests:
      - UAT-001
      - UAT-002
      - UAT-003
      - UAT-004
      - UAT-006
    code_targets: [front/catalog, front/game, front/admin]
```

### Planned Test Files

- front/__tests__/fp1/catalog.states.test.tsx
- front/__tests__/fp1/game.playback.test.tsx
- front/__tests__/fp1/admin.authoring.test.tsx
- front/__tests__/fp1/admin.publish-gating.test.tsx
- front/__tests__/fp1/admin.status-remark.test.tsx
- back/__tests__/fp1/games.list.test.ts
- back/__tests__/fp1/games.get.test.ts
- back/__tests__/fp1/admin.games.build.test.ts
- back/__tests__/fp1/admin.games.publish.test.ts
- back/__tests__/fp1/admin.games.status.test.ts
- back/__tests__/fp1/admin.games.tags.test.ts
- back/__tests__/fp1/admin.teams.test.ts

---

## FP5: UI/UX Fixes and Polish

### UAT / BDD

- Catalog card sizing: Given catalog displays games, when there are fewer than 5 cards, then cards maintain consistent size and do not become oversized.
- Cover image display: Given catalog loads games, when cover images are requested, then backend returns signed URLs (not S3 keys) and images display correctly.
- Team members display: Given user opens game page, when team members are shown, then member logins (usernames) are displayed, not user IDs.
- Catalog title search: Given user types in catalog search input, when text is entered, then games are filtered by title in real-time (case-insensitive, partial match).
- Catalog search input styling: Given catalog page loads, when search input is rendered, then it uses Windows 95 styling (Win95Input component).
- Teams Create Team button: Given Teams page loads, when Create Team button is displayed, then text is in single line and button width is adaptive.
- Teams search input styling: Given Teams page loads, when search input is rendered, then it uses Windows 95 styling (Win95Input component).
- Teams name search: Given user types in Teams search input, when text is entered, then teams are filtered by name in real-time (case-insensitive, partial match).
- Teams info modal sizing: Given user opens team info modal, when modal is displayed, then it has adaptive height (not full screen) and ends after "Add Member" section.
- Teams info modal Make Leader: Given user opens team info modal, when current leader is displayed, then "Make Leader" button is not shown for the leader.
- Teams info modal user search styling: Given user opens team info modal, when user search input is displayed, then it uses Windows 95 styling (Win95Input component).
- Teams info modal user search: Given team leader types user login in search input, when valid login is entered and "Add Member" is clicked, then user is added to team via backend API and members list updates.
- Edit button on game page: Given user opens game page for their team's game, when page loads, then "Edit" button is visible and navigates to editor page.
- Tag filtering with teamId: Given user filters catalog by tag and teamId, when both filters are applied, then games matching both conditions are returned (AND logic).
- New Game page help tooltips: Given user opens New Game page, when help icons are clicked, then Windows 95 styled tooltip windows explain game upload rules.
- New Game page error modals: Given user performs operation on New Game page, when operation fails, then Windows 95 styled error modal is displayed with error message.

### Acceptance Checklist (FP5)

- ✅ Catalog card sizing is consistent regardless of count.
- ✅ Cover images display correctly in catalog (signed URLs returned).
- ✅ Team members show logins (usernames) on game page.
- ✅ Catalog title search works in real-time.
- ✅ All search inputs use Windows 95 styling.
- ✅ Teams Create Team button is single line and adaptive width.
- ✅ Teams name search works in real-time.
- ✅ Teams info modal has adaptive height.
- ✅ "Make Leader" button hidden for current leader.
- ✅ User search in Teams modal works and adds users to team.
- ✅ Edit button appears on game page for team members.
- ✅ Tag filtering with teamId works correctly (AND logic).
- ✅ Help tooltips display on New Game page (Windows 95 styled).
- ✅ Error modals display on New Game page failures (Windows 95 styled).
- ✅ Tags management: User tags with chips UI, system tags dropdown (Super Admin only), tags persist correctly.

### RTM (YAML)

```yaml
fp: FP5
requirements:
  - id: FR-FP5-001
    name: Catalog card sizing
    tests:
      - UAT-FP5-001
    code_targets: [front/src/App.tsx, front/src/retro.css]
  - id: FR-FP5-002
    name: Cover image display in catalog
    tests:
      - UAT-FP5-002
    code_targets: [back/src/games/games.controller.ts, back/src/build-url.service.ts]
  - id: FR-FP5-003
    name: Team members display on game page
    tests:
      - UAT-FP5-003
    code_targets: [back/src/games/games.controller.ts, back/src/games/games.service.ts, front/src/App.tsx]
  - id: FR-FP5-004
    name: Catalog title search
    tests:
      - UAT-FP5-004
    code_targets: [front/src/App.tsx, back/src/games/games.service.ts]
  - id: FR-FP5-005
    name: Catalog search input styling
    tests:
      - UAT-FP5-005
    code_targets: [front/src/App.tsx, front/src/components/win95/Win95Input.tsx]
  - id: FR-FP5-006
    name: Teams Create Team button
    tests:
      - UAT-FP5-006
    code_targets: [front/src/App.tsx]
  - id: FR-FP5-007
    name: Teams search input styling
    tests:
      - UAT-FP5-007
    code_targets: [front/src/App.tsx, front/src/components/win95/Win95Input.tsx]
  - id: FR-FP5-008
    name: Teams name search
    tests:
      - UAT-FP5-008
    code_targets: [front/src/App.tsx]
  - id: FR-FP5-009
    name: Teams info modal sizing
    tests:
      - UAT-FP5-009
    code_targets: [front/src/components/win95/Win95Modal.tsx, front/src/App.tsx]
  - id: FR-FP5-010
    name: Teams info modal Make Leader button
    tests:
      - UAT-FP5-010
    code_targets: [front/src/App.tsx]
  - id: FR-FP5-011
    name: Teams info modal user search styling
    tests:
      - UAT-FP5-011
    code_targets: [front/src/App.tsx, front/src/components/win95/Win95Input.tsx]
  - id: FR-FP5-012
    name: Teams info modal user search functionality
    tests:
      - UAT-FP5-012
    code_targets: [front/src/App.tsx, back/src/teams/teams.controller.ts, back/src/users/users.controller.ts]
  - id: FR-FP5-013
    name: Edit button on game page
    tests:
      - UAT-FP5-013
    code_targets: [front/src/App.tsx]
  - id: FR-FP5-014
    name: Tag filtering with teamId
    tests:
      - UAT-FP5-014
    code_targets: [back/src/games/games.service.ts]
  - id: FR-FP5-015
    name: New Game page help and errors
    tests:
      - UAT-FP5-015
      - UAT-FP5-016
    code_targets: [front/src/App.tsx, front/src/components/win95/Win95Modal.tsx]
```

### Planned Test Files

- front/__tests__/fp5/catalog.card-sizing.test.tsx
- front/__tests__/fp5/catalog.cover-images.test.tsx
- front/__tests__/fp5/game.team-members.test.tsx
- front/__tests__/fp5/catalog.title-search.test.tsx
- front/__tests__/fp5/catalog.search-input-styling.test.tsx
- front/__tests__/fp5/teams.create-button.test.tsx
- front/__tests__/fp5/teams.search-styling.test.tsx
- front/__tests__/fp5/teams.name-search.test.tsx
- front/__tests__/fp5/teams.modal-sizing.test.tsx
- front/__tests__/fp5/teams.modal-leader-button.test.tsx
- front/__tests__/fp5/teams.modal-user-search.test.tsx
- front/__tests__/fp5/game.edit-button.test.tsx
- front/__tests__/fp5/editor.help-tooltips.test.tsx
- front/__tests__/fp5/editor.error-modals.test.tsx
- back/__tests__/fp5/games.cover-urls.test.ts
- back/__tests__/fp5/games.tag-teamid-filter.test.ts
- back/__tests__/fp5/teams.add-member.test.ts
- back/__tests__/fp5/users.search.test.ts

---

## FP4: User Accounts & Windows 95 UI

### UAT / BDD

- User registration: Given a user opens registration modal, when they enter valid email, unique login, and password (min 6 chars), then account is created and JWT token is returned.
- User login with email: Given a registered user, when they login with email and password, then JWT token is returned and user is authenticated.
- User login with username: Given a registered user, when they login with login (username) and password, then JWT token is returned and user is authenticated.
- Password recovery request: Given a user requests password recovery, when they enter email, then recovery code is generated, previous code is invalidated, and email is sent.
- Password recovery verify: Given a recovery code was sent, when user enters code and new password, then password is updated and JWT token is returned.
- Unauthenticated catalog access: Given an unauthenticated visitor, when they browse catalog, then only published games are visible, and Editor/Settings tabs are hidden.
- Authenticated catalog access: Given an authenticated user, when they browse catalog, then all games (including editing/archived for their teams) are visible, and Editor tab is accessible for their teams' games.
- Create team: Given an authenticated user, when they create a team, then team is created with user as leader and member.
- Add team member: Given a team leader, when they add a user to team, then user is added to members array.
- Transfer team leadership: Given a team leader, when they transfer leadership to another member, then leader field is updated.
- Create game for team: Given a team member, when they create a game for their team, then game is created with status "editing".
- Edit game (team member): Given a team member, when they edit their team's game, then changes are saved.
- Edit game (super admin): Given a super admin, when they edit any game, then changes are saved regardless of team membership.
- Publish game: Given a team member, when they publish their team's game (with cover, description, build), then status changes to "published".
- Archive game: Given a team member, when they archive their team's game, then status changes to "archived".
- Super admin force status: Given a super admin, when they force status change with optional remark, then game status and remark are updated.
- View comments: Given any user (authenticated or not), when they view a published game, then comments are visible with userLogin and timestamp.
- Post comment: Given an authenticated user, when they post a comment on a published game, then comment is saved with userLogin.
- Play game modal: Given a user clicks "Play" button, when game page loads, then Windows 95 styled draggable modal opens with game iframe.
- Login modal: Given an unauthenticated user clicks "Login" button, when modal opens, then Windows 95 styled draggable modal appears with login/registration form.
- Windows 95 styling: Given any page, when page renders, then all UI elements follow Windows 95 design (title bars, buttons, inputs, modals).

### Acceptance Checklist (FP4)

- Authentication flow complete: registration, login (email/username), password recovery.
- JWT tokens stored and sent with API requests.
- Unauthenticated users see only published games; Editor/Settings hidden.
- Authenticated users can create teams, add members, create games for teams.
- Super admin can edit any game and force status changes.
- Comments visible to all on published games; authenticated users can post.
- Windows 95 modals (login, play) are draggable by title bar.
- Game page shows description, team, members, repo, Play button (no iframe on main page).
- Entire site styled in Windows 95 aesthetic (no MUI Material 3 artifacts).
- Team sidebar removed from Teams page.

### RTM (YAML)

```yaml
fp: FP4
requirements:
  - id: FR-FP4-001
    name: User account system
    tests:
      - UAT-FP4-001
      - UAT-FP4-002
      - UAT-FP4-003
      - UAT-FP4-004
      - UAT-FP4-005
    code_targets: [front/auth, back/auth]
  - id: FR-FP4-002
    name: Unauthenticated visitor access
    tests:
      - UAT-FP4-006
    code_targets: [front/catalog, back/games.list]
  - id: FR-FP4-003
    name: Authenticated user access
    tests:
      - UAT-FP4-007
      - UAT-FP4-010
      - UAT-FP4-011
      - UAT-FP4-012
      - UAT-FP4-014
      - UAT-FP4-015
    code_targets: [front/teams, front/editor, back/teams, back/games]
  - id: FR-FP4-004
    name: Super admin access
    tests:
      - UAT-FP4-013
      - UAT-FP4-016
    code_targets: [front/editor, back/games.status]
  - id: FR-FP4-005
    name: UI navigation changes
    tests:
      - UAT-FP4-006
      - UAT-FP4-007
    code_targets: [front/header, front/teams]
  - id: FR-FP4-006
    name: Authentication UI (Windows 95)
    tests:
      - UAT-FP4-020
    code_targets: [front/auth.modal]
  - id: FR-FP4-007
    name: Game page redesign
    tests:
      - UAT-FP4-019
    code_targets: [front/game]
  - id: FR-FP4-008
    name: Windows 95 UI styling
    tests:
      - UAT-FP4-021
    code_targets: [front/components]
  - id: FR-FP4-009
    name: Comments system
    tests:
      - UAT-FP4-017
      - UAT-FP4-018
    code_targets: [front/game, back/comments]
  - id: NFR-FP4-001
    name: Authentication security
    tests:
      - UAT-FP4-001
      - UAT-FP4-002
      - UAT-FP4-003
    code_targets: [back/auth]
  - id: NFR-FP4-003
    name: Windows 95 UI consistency
    tests:
      - UAT-FP4-020
      - UAT-FP4-021
    code_targets: [front/components]
```

### Planned Test Files

- front/__tests__/fp4/auth.registration.test.tsx
- front/__tests__/fp4/auth.login.test.tsx
- front/__tests__/fp4/auth.recovery.test.tsx
- front/__tests__/fp4/auth.modal.test.tsx
- front/__tests__/fp4/catalog.visibility.test.tsx
- front/__tests__/fp4/teams.creation.test.tsx
- front/__tests__/fp4/teams.members.test.tsx
- front/__tests__/fp4/game.editor.test.tsx
- front/__tests__/fp4/game.comments.test.tsx
- front/__tests__/fp4/game.play-modal.test.tsx
- front/__tests__/fp4/ui.windows95.test.tsx
- back/__tests__/fp4/auth.register.test.ts
- back/__tests__/fp4/auth.login.test.ts
- back/__tests__/fp4/auth.recovery.test.ts
- back/__tests__/fp4/auth.jwt.test.ts
- back/__tests__/fp4/teams.create.test.ts
- back/__tests__/fp4/teams.members.test.ts
- back/__tests__/fp4/teams.leader.test.ts
- back/__tests__/fp4/games.create.test.ts
- back/__tests__/fp4/games.edit-permissions.test.ts
- back/__tests__/fp4/games.status-superadmin.test.ts
- back/__tests__/fp4/comments.create.test.ts
- back/__tests__/fp4/comments.list.test.ts
