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
