# Tests

## FP1: Browse & Play + Admin Authoring

### UAT / BDD

- UAT-001 Catalog loading: Given the catalog page loads, when data is fetching, then a loading state is visible, and after success the list is rendered.
- UAT-002 Catalog empty: Given no published games, when the catalog loads, then an empty state is shown.
- UAT-003 Catalog error: Given a network/API error, when the catalog loads, then an error state with retry is shown.
- UAT-004 Game page loading: Given a user opens a game page, when data is fetching, then a loading state is visible, and the details render after success.
- UAT-005 Game unavailable: Given a game is editing/archived, when a public visitor opens its page, then a 404/unavailable response is shown.
- UAT-006 Play iframe failure: Given the build fails to load, when the play iframe errors, then a fallback message is shown.
- UAT-014 Navigation: Given a user, when they use page navigation links, then Catalog, Game, Admin Teams, and Admin Game Editor are reachable via visible CTAs.

### Acceptance Checklist (FP1)

- [x] Modern UX baseline satisfied: loading, empty, error, responsive layouts, CTA clarity.
- [x] Play iframe fallback message shown on failure.
- [x] Editing/archived games are not publicly visible and return 404/unavailable.
- [x] Navigation links are visible and route between Catalog, Game, Admin Teams, and Admin Game Editor.

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
  - id: NFR-UX-001
    name: UX baseline states
    tests:
      - UAT-001
      - UAT-002
      - UAT-003
      - UAT-004
      - UAT-006
      - UAT-014
    code_targets: [front/catalog, front/game, front/admin]
```

### Planned Test Files

- front/__tests__/fp1/catalog.states.test.tsx
- front/__tests__/fp1/game.playback.test.tsx
- front/__tests__/fp1/navigation.routes.test.tsx
- back/__tests__/fp1/games.list.test.ts
- back/__tests__/fp1/games.get.test.ts

## FP2: Stabilization (Single Super Admin)

### UAT / BDD

- UAT-007 Admin team creation (regression): Given Super Admin creates a team (zero members allowed), then the team is saved and selectable for a game.
- UAT-008 Admin game creation/edit (regression): Given Super Admin creates/edits a game with description_md, repo_url, cover_url, then the game is saved.
- UAT-009 Admin upload -> preview -> publish (success): Given Super Admin uploads a build ZIP, when preview loads, then the build is visible; when publish is clicked with required fields, status becomes published.
- UAT-010 Admin publish gating (UI): Given cover_url/build/description_md missing, when publish is attempted, then the action is blocked and a 400 validation error is surfaced.
- UAT-011 Admin status + remark: Given Super Admin moves a published game to editing with a remark, then the game becomes non-public and the remark is saved.
- UAT-012 Admin archive visibility: Given Super Admin archives a game, then it is removed from the public catalog and returns 404/unavailable to public visitors.
- UAT-013 Tags permissions: Given Super Admin updates tags_user/tags_system, then changes persist; given a non-admin caller, then the update is rejected with 403.
- UAT-210 Admin auth required: Given a request without/invalid admin token, when calling any /admin/* endpoint, then the request is rejected with 403.
- UAT-211 Draft visibility: Given a non-admin visitor, when they open an editing/archived game page, then a 404/unavailable response is returned without query flags.
- UAT-212 Publish validation (API): Given missing cover/build/description, when publish is attempted, then a 400 validation error is returned.
- UAT-213 Status validation: Given an invalid status value, when a status update is attempted, then it is rejected with a 400 validation error.
- UAT-214 Tag permission enforcement: Given a non-admin caller, when they attempt to update tags, then the request is rejected with 403.
- UAT-215 Build size enforcement: Given a ZIP exceeding max size, when upload is attempted, then it is rejected with a 400 validation error (size limit).
- UAT-216 CSP/iframe sandbox baseline: Given game playback, when the page renders, then CSP headers and iframe sandbox attributes match ADR-005.
- UAT-217 Forbidden UI states: Given a 401/403 response, when the UI renders, then a forbidden state is visible with a retry or navigation action.
- UAT-218 Build limit config: Given Super Admin updates the max build size, when a build exceeds the limit, then upload is blocked with an error.
- UAT-219 FP1 critical tests present: Given the test suite runs, when FP1 critical tests execute, then they pass and cover negative cases.
- UAT-220 Contract alignment: Given API responses for FP1 endpoints, when validated, then required fields and error codes match the contract.
- UAT-221 Status remark required: Given a published game, when status is moved to editing without a remark, then a 400 validation error is returned.
- UAT-222 Validation UI states: Given a 400 validation response for publish/status/build, when the UI renders, then a validation state and guidance are visible.

### Acceptance Checklist (FP2)

- [x] Admin-only endpoints require a valid admin guard.
- [x] Public catalog and game page respect visibility rules (editing/archived hidden).
- [x] Publish/status/tags/build endpoints enforce validation and forbidden errors.
- [x] CSP/iframe sandbox enforcement is active on host pages.
- [x] Admin build size limit is configurable and enforced on upload.

### RTM (YAML)

```yaml
fp: FP2
requirements:
  - id: FR-FP2-STAB-001
    name: Admin auth enforcement
    tests:
      - UAT-210
      - UAT-217
    code_targets: [front/admin.guard, back/admin.guard, back/admin.controllers]
  - id: FR-FP2-STAB-002
    name: Public draft visibility rules
    tests:
      - UAT-211
      - UAT-012
    code_targets: [front/game, back/games.get]
  - id: FR-FP2-STAB-003
    name: Build size enforcement
    tests:
      - UAT-215
    code_targets: [back/admin.games.build]
  - id: FR-FP2-STAB-004
    name: Publish validation
    tests:
      - UAT-009
      - UAT-010
      - UAT-212
    code_targets: [front/admin.game, back/admin.games.publish]
  - id: FR-FP2-STAB-005
    name: Status validation and remark rules
    tests:
      - UAT-011
      - UAT-213
      - UAT-221
    code_targets: [back/admin.games.status]
  - id: FR-FP2-STAB-006
    name: CSP and iframe sandbox baseline
    tests:
      - UAT-216
    code_targets: [front/game.iframe, back/headers]
  - id: FR-FP2-STAB-007
    name: Tag permission enforcement
    tests:
      - UAT-013
      - UAT-214
    code_targets: [front/admin.game.tags, back/admin.games.tags]
  - id: FR-FP2-STAB-008
    name: Forbidden/validation UI states
    tests:
      - UAT-217
      - UAT-222
    code_targets: [front/error.states, front/admin.game]
  - id: FR-FP2-STAB-009
    name: Contract alignment (responses/errors)
    tests:
      - UAT-220
    code_targets: [docs/API.yaml, back/controllers]
  - id: FR-FP2-STAB-010
    name: Critical FP1 tests exist
    tests:
      - UAT-219
      - UAT-007
      - UAT-008
    code_targets: [front/__tests__/fp1, back/__tests__/fp1, front/admin.teams, back/admin.teams, front/admin.game, back/admin.games]
  - id: FR-205
    name: Admin build size settings
    tests:
      - UAT-218
    code_targets: [front/admin.settings, back/admin.settings]
```

### Planned Test Files

Folder convention: `front/__tests__/fp2/*` and `back/__tests__/fp2/*`.

- front/__tests__/fp2/admin.authoring.test.tsx
- front/__tests__/fp2/admin.publish-gating.test.tsx
- front/__tests__/fp2/admin.status-remark.test.tsx
- front/__tests__/fp2/admin.status-validation.test.tsx
- front/__tests__/fp2/admin.guard.test.tsx
- front/__tests__/fp2/game.visibility.test.tsx
- front/__tests__/fp2/admin.publish-validation.test.tsx
- front/__tests__/fp2/admin.forbidden-states.test.tsx
- front/__tests__/fp2/admin.build-limit.test.tsx
- front/__tests__/fp2/game.csp-sandbox.test.tsx
- front/__tests__/fp2/admin.tags-ui.test.tsx
- back/__tests__/fp2/admin.teams.test.ts
- back/__tests__/fp2/admin.games.build.test.ts
- back/__tests__/fp2/admin.games.publish.test.ts
- back/__tests__/fp2/admin.games.status.test.ts
- back/__tests__/fp2/admin.games.tags.test.ts
- back/__tests__/fp2/admin.guard.test.ts
- back/__tests__/fp2/games.visibility.test.ts
- back/__tests__/fp2/admin.publish-validation.test.ts
- back/__tests__/fp2/admin.status-validation.test.ts
- back/__tests__/fp2/admin.tags-permission.test.ts
- back/__tests__/fp2/admin.build-limit.test.ts
- back/__tests__/fp2/csp.headers.test.ts

### FP2 RTM Coverage Audit

| Requirement ID | Covered by front tests | Covered by back tests | Missing? (Y/N) | Notes |
| --- | --- | --- | --- | --- |
| FR-FP2-STAB-001 | front/__tests__/fp2/admin.guard.test.tsx; front/__tests__/fp2/admin.forbidden-states.test.tsx | back/__tests__/fp2/admin.guard.test.ts | N | Admin guard + forbidden UI. |
| FR-FP2-STAB-002 | front/__tests__/fp2/game.visibility.test.tsx | back/__tests__/fp2/games.visibility.test.ts | N | Public 404 visibility. |
| FR-FP2-STAB-003 | front/__tests__/fp2/admin.build-limit.test.tsx | back/__tests__/fp2/admin.build-limit.test.ts; back/__tests__/fp2/admin.games.build.test.ts | N | UI error + backend limit. |
| FR-FP2-STAB-004 | front/__tests__/fp2/admin.publish-gating.test.tsx; front/__tests__/fp2/admin.publish-validation.test.tsx | back/__tests__/fp2/admin.games.publish.test.ts; back/__tests__/fp2/admin.publish-validation.test.ts | N | Publish gating + validation. |
| FR-FP2-STAB-005 | front/__tests__/fp2/admin.status-validation.test.tsx | back/__tests__/fp2/admin.status-validation.test.ts; back/__tests__/fp2/admin.games.status.test.ts | N | Status validation + remark flow. |
| FR-FP2-STAB-006 | front/__tests__/fp2/game.csp-sandbox.test.tsx | back/__tests__/fp2/csp.headers.test.ts | N | Front iframe attributes + back CSP headers. |
| FR-FP2-STAB-007 | front/__tests__/fp2/admin.tags-ui.test.tsx | back/__tests__/fp2/admin.tags-permission.test.ts; back/__tests__/fp2/admin.games.tags.test.ts | N | Tag UI + permission enforcement. |
| FR-FP2-STAB-008 | front/__tests__/fp2/admin.forbidden-states.test.tsx; front/__tests__/fp2/admin.publish-validation.test.tsx | back/__tests__/fp2/admin.guard.test.ts | N | Forbidden + validation UI. |
| FR-FP2-STAB-009 | front/__tests__/fp2/admin.authoring.test.tsx | back/__tests__/fp2/admin.games.publish.test.ts; back/__tests__/fp2/admin.games.build.test.ts; back/__tests__/fp2/games.visibility.test.ts | N | Contract field coverage sampled via API calls. |
| FR-FP2-STAB-010 | front/__tests__/fp1/catalog.states.test.tsx; front/__tests__/fp1/game.playback.test.tsx; front/__tests__/fp1/navigation.routes.test.tsx | back/__tests__/fp1/games.list.test.ts; back/__tests__/fp1/games.get.test.ts | N | FP1 critical path regression. |
| FR-205 | front/__tests__/fp2/admin.build-limit.test.tsx | back/__tests__/fp2/admin.build-limit.test.ts | N | Admin settings build limit. |

## FP3: Navigation Tabs and Auth Removal

### UAT / BDD

- UAT-300 Global navigation visible: Given any page loads, when the page renders, then navigation menu (win-menu) contains links to Catalog, Game (if applicable), Teams, Editor, and Settings. All links are always visible (no auth checks).
- UAT-301 Navigation to catalog: Given any page, when user clicks "Catalog" link, then they navigate to / and catalog page loads.
- UAT-302 Navigation to game page: Given catalog or admin page, when user clicks game link or "Open" button, then they navigate to /games/:gameId and game page loads.
- UAT-303 Navigation to admin teams: Given any page, when user clicks "Teams" link, then they navigate to /admin/teams.
- UAT-304 Navigation to admin game editor: Given any page, when user clicks "Editor" link or game edit link, then they navigate to /admin/games/:gameId or /admin/games/new.
- UAT-305 Navigation to admin settings: Given any page, when user clicks "Settings" link, then they navigate to /admin/settings.
- UAT-306 Catalog shows real games: Given catalog page loads, when GET /games returns games list, then game cards with cover images are displayed. If no games, "No games available" message is shown.
- UAT-307 Catalog no placeholder: Given catalog page loads, when the page renders, then no placeholder "featured" section or fake game content is shown.
- UAT-308 AdminGameEditorPage loads existing game: Given user navigates to /admin/games/:gameId with existing gameId, when the page loads, then game data (title, description, cover_url, build_url, tags, status, adminRemark) is fetched and form fields are populated.
- UAT-309 AdminGameEditorPage creates new game: Given user navigates to /admin/games/new, when the page loads, then form fields are empty and ready for new game creation.
- UAT-310 AdminTeamsPage loads teams list: Given user opens /admin/teams, when the page loads, then GET /admin/teams is called and existing teams are displayed in the list.
- UAT-311 AdminSettingsPage loads settings: Given user opens /admin/settings, when the page loads, then GET /admin/settings/build-limits is called and current maxBuildSizeBytes value is displayed in the input field.
- UAT-312 Team selection dropdown: Given user opens /admin/games/new, when the page loads, then teams list is fetched and Team field shows dropdown with all teams. User can search teams by name and select from list.
- UAT-313 Cover image upload or URL: Given user is on AdminGameEditorPage, when they interact with cover field, then they can either enter cover image URL in text input or upload file via file input. Both options are in the same field.
- UAT-314 Cover image upload endpoint: Given user uploads cover image file, when POST /admin/games/{id}/cover is called, then image is uploaded to S3/MinIO and cover_url is returned and displayed in preview.
- UAT-315 Build upload warning: Given user is on AdminGameEditorPage, when they view Build Upload section, then warning message "Please save the game first before uploading build" is visible. Build upload input is disabled until game is saved.
- UAT-316 Signed URL generation: Given build is uploaded, when signed URL is generated, then it uses public endpoint (localhost:9000) and signature is valid for browser access (no SignatureDoesNotMatch errors).
- UAT-317 Backend no auth checks: Given any request to /admin/* endpoints, when the request is processed, then no authentication checks are performed (assertAdmin() is no-op). All endpoints are public.
- UAT-318 Backend GET /admin/teams: Given any request, when GET /admin/teams is called, then all teams are returned with id and name fields (no auth required).
- UAT-319 Backend GET /admin/games/{id}: Given any request, when GET /admin/games/{id} is called, then game data including adminRemark field is returned (no auth required).
- UAT-320 Backend GET /admin/settings/build-limits: Given any request, when GET /admin/settings/build-limits is called, then current maxBuildSizeBytes value is returned (no auth required).
- UAT-321 Backend POST /admin/games/{id}/cover: Given any request with image file, when POST /admin/games/{id}/cover is called, then image is uploaded to S3/MinIO and cover_url is returned (no auth required).

### Acceptance Checklist (FP3)

- [x] Global navigation menu shows all links (Catalog, Game, Teams, Editor, Settings) always visible.
- [x] Navigation links route correctly between all pages.
- [x] Catalog page shows real games from API or "No games available" message (no placeholder content).
- [x] AdminGameEditorPage loads existing game data when gameId provided.
- [x] AdminTeamsPage loads and displays teams list.
- [x] AdminSettingsPage loads and displays current settings.
- [x] Team selection uses dropdown with search functionality (shows all teams).
- [x] Cover image field allows both URL input and file upload in single field.
- [x] Cover image upload endpoint (POST /admin/games/{id}/cover) works correctly.
- [x] Build upload section shows warning message and disables input until game is saved.
- [x] Signed URL generation uses public endpoint and produces valid signatures.
- [x] Backend endpoints have no auth checks (all public, assertAdmin() is no-op).

### RTM (YAML)

```yaml
fp: FP3
requirements:
  - id: FR-FP3-NAV-001
    name: Global navigation component (always visible)
    tests:
      - UAT-300
      - UAT-301
      - UAT-302
      - UAT-303
      - UAT-304
      - UAT-305
    code_targets: [front/navigation.component, front/routes]
  - id: FR-FP3-CATALOG-001
    name: Catalog page real data display
    tests:
      - UAT-306
      - UAT-307
    code_targets: [front/catalog.page, back/games.list]
  - id: FR-FP3-DATA-001
    name: AdminGameEditorPage loads existing game
    tests:
      - UAT-308
      - UAT-309
    code_targets: [front/admin.game.editor, back/admin.games.get]
  - id: FR-FP3-DATA-002
    name: AdminTeamsPage loads teams list
    tests:
      - UAT-310
    code_targets: [front/admin.teams, back/admin.teams.get]
  - id: FR-FP3-DATA-003
    name: AdminSettingsPage loads settings
    tests:
      - UAT-311
    code_targets: [front/admin.settings, back/admin.settings.get]
  - id: FR-FP3-UI-001
    name: Team selection dropdown with search
    tests:
      - UAT-312
    code_targets: [front/admin.game.editor, back/admin.teams.get]
  - id: FR-FP3-UI-002
    name: Cover image field (URL + upload)
    tests:
      - UAT-313
      - UAT-314
    code_targets: [front/admin.game.editor, back/admin.games.cover]
  - id: FR-FP3-UI-003
    name: Build upload warnings
    tests:
      - UAT-315
    code_targets: [front/admin.game.editor]
  - id: FR-FP3-BACKEND-001
    name: Signed URL generation fix
    tests:
      - UAT-316
    code_targets: [back/admin.games.build, back/s3.client]
  - id: FR-FP3-BACKEND-002
    name: Backend no auth checks (all public)
    tests:
      - UAT-317
    code_targets: [back/admin.guard, back/controllers]
  - id: FR-FP3-BACKEND-003
    name: Backend GET /admin/teams endpoint (public)
    tests:
      - UAT-318
    code_targets: [back/admin.teams.controller]
  - id: FR-FP3-BACKEND-004
    name: Backend GET /admin/games/{id} endpoint (public)
    tests:
      - UAT-319
    code_targets: [back/admin.games.controller]
  - id: FR-FP3-BACKEND-005
    name: Backend GET /admin/settings/build-limits endpoint (public)
    tests:
      - UAT-320
    code_targets: [back/admin.settings.controller]
  - id: FR-FP3-BACKEND-006
    name: Backend POST /admin/games/{id}/cover endpoint
    tests:
      - UAT-321
    code_targets: [back/admin.games.cover.controller]
```

### Planned Test Files

Folder convention: `front/__tests__/fp3/*` and `back/__tests__/fp3/*`.

- front/__tests__/fp3/login.page.test.tsx
- front/__tests__/fp3/auth.context.test.tsx
- front/__tests__/fp3/protected.route.test.tsx
- front/__tests__/fp3/navigation.component.test.tsx
- front/__tests__/fp3/navigation.links.test.tsx
- front/__tests__/fp3/logout.test.tsx
- front/__tests__/fp3/error.handling.test.tsx
- front/__tests__/fp3/admin.game.editor.load.test.tsx
- front/__tests__/fp3/admin.teams.load.test.tsx
- front/__tests__/fp3/admin.settings.load.test.tsx
- back/__tests__/fp3/admin.teams.get.test.ts
- back/__tests__/fp3/admin.games.get.test.ts
- back/__tests__/fp3/admin.settings.get.test.ts
