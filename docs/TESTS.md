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
