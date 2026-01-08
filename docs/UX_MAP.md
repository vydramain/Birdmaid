# UX Map

## FP1: Browse & Play + Admin Authoring

### CTA table

| CTA_ID | CTA | Page | Endpoint(s) | State keys | mock_status |
| --- | --- | --- | --- | --- | --- |
| CTA-001 | Browse catalog | CatalogPage (/) | TODO: GET /games?tag=...&sort=... | ui.loading, ui.empty, ui.error, games.list, games.filters | unknown |
| CTA-002 | Filter/sort by tags | CatalogPage (/) | TODO: GET /tags (optional, derived from games tags); GET /games?tag=... | ui.loading, ui.empty, ui.error, tags.list, games.filters | unknown |
| CTA-003 | Open game page | GamePage (/games/:gameId) | TODO: GET /games/{id} | ui.loading, ui.error, game.current | unknown |
| CTA-004 | Play web build in browser | GamePage (/games/:gameId) | TODO: GET /games/{id} (includes description_md, repo_url, cover_url, tags_user, tags_system, status, build_url/build_id) | ui.loading, ui.error, build.url | unknown |
| CTA-005 | Admin create team | AdminTeamsPage (/admin/teams) | TODO: POST /admin/teams | ui.loading, ui.error, admin.teams.form | unknown |
| CTA-006 | Admin create/edit game details | AdminGameEditorPage (/admin/games/:gameId) | TODO: POST/PATCH /admin/games | ui.loading, ui.error, admin.game.form | unknown |
| CTA-007 | Admin upload build ZIP | AdminGameEditorPage (/admin/games/:gameId) | TODO: POST /admin/games/{id}/build | ui.loading, ui.error, admin.build.upload | unknown |
| CTA-008 | Admin preview build | AdminGameEditorPage (/admin/games/:gameId) | TODO: GET /games/{id} (build_url/build_id) | ui.loading, ui.error, admin.build.preview | unknown |
| CTA-009 | Admin publish game | AdminGameEditorPage (/admin/games/:gameId) | TODO: POST /admin/games/{id}/publish or /status | ui.loading, ui.error, admin.game.status | unknown |
| CTA-010 | Admin set tags on game | AdminGameEditorPage (/admin/games/:gameId) | TODO: POST/PATCH /admin/games/{id}/tags (tags_user/tags_system) | ui.loading, ui.error, admin.game.tags | unknown |
| CTA-011 | Admin change status + remark | AdminGameEditorPage (/admin/games/:gameId) | TODO: POST /admin/games/{id}/status, POST /admin/games/{id}/remarks | ui.loading, ui.error, admin.game.status | unknown |

### System Design (per CTA)

#### CTA-001 Browse catalog

```mermaid
sequenceDiagram
  autonumber
  actor U as User
  participant P as PageComponent(CatalogPage)
  participant S as FrontStore
  participant C as API Controller(/games)
  participant SV as Service(TODO)
  participant R as Repo(TODO)

  U->>P: Open catalog
  P->>S: dispatch(loadGames)
  S->>C: GET /games?tag=...&sort=...
  C->>SV: TODO
  SV->>R: TODO
  R-->>SV: TODO
  SV-->>C: TODO
  C-->>S: games list
  S-->>P: update state
  P-->>U: render catalog
```

#### CTA-002 Filter/sort by tags

```mermaid
sequenceDiagram
  autonumber
  actor U as User
  participant P as PageComponent(CatalogPage)
  participant S as FrontStore
  participant C as API Controller(/tags,/games)
  participant SV as Service(TODO)
  participant R as Repo(TODO)

  U->>P: Select tag/sort
  P->>S: dispatch(applyFilters)
  S->>C: GET /tags (optional)
  S->>C: GET /games?tag=...&sort=...
  C->>SV: TODO
  SV->>R: TODO
  R-->>SV: TODO
  SV-->>C: TODO
  C-->>S: filtered list
  S-->>P: update state
  P-->>U: render filtered catalog
```

#### CTA-003 Open game page

```mermaid
sequenceDiagram
  autonumber
  actor U as User
  participant P as PageComponent(GamePage)
  participant S as FrontStore
  participant C as API Controller(/games/{id})
  participant SV as Service(TODO)
  participant R as Repo(TODO)

  U->>P: Open game page
  P->>S: dispatch(loadGame)
  S->>C: GET /games/{id}
  C->>SV: TODO
  SV->>R: TODO
  R-->>SV: TODO
  SV-->>C: TODO
  C-->>S: description_md, repo_url, cover_url, tags_user, tags_system, status, build_url/build_id
  S-->>P: update state
  P-->>U: render game page
```

#### CTA-004 Play web build in browser

```mermaid
sequenceDiagram
  autonumber
  actor U as User
  participant P as PageComponent(GamePage)
  participant S as FrontStore
  participant C as API Controller(/games/{id})
  participant SV as Service(TODO)
  participant R as Repo(TODO)

  U->>P: Click Play
  P->>S: dispatch(loadBuild)
  S->>C: GET /games/{id}
  C->>SV: TODO (return signed build_url)
  SV->>R: TODO
  R-->>SV: TODO
  SV-->>C: TODO
  C-->>S: build_url (signed) or build_id
  S-->>P: update state
  P-->>U: render iframe with build
```

#### CTA-005 Admin create team

```mermaid
sequenceDiagram
  autonumber
  actor A as SuperAdmin
  participant P as PageComponent(AdminTeamsPage)
  participant S as FrontStore
  participant C as API Controller(/admin/teams)
  participant SV as Service(TODO)
  participant R as Repo(TODO)

  A->>P: Create team
  P->>S: dispatch(saveTeam)
  S->>C: POST /admin/teams
  C->>SV: TODO
  SV->>R: TODO
  R-->>SV: TODO
  SV-->>C: TODO
  C-->>S: team created
  S-->>P: update state
  P-->>A: render team list
```

#### CTA-006 Admin create/edit game details

```mermaid
sequenceDiagram
  autonumber
  actor A as SuperAdmin
  participant P as PageComponent(AdminGameEditorPage)
  participant S as FrontStore
  participant C as API Controller(/admin/games)
  participant SV as Service(TODO)
  participant R as Repo(TODO)

  A->>P: Edit game details
  P->>S: dispatch(saveGame)
  S->>C: POST/PATCH /admin/games
  C->>SV: TODO
  SV->>R: TODO
  R-->>SV: TODO
  SV-->>C: TODO
  C-->>S: saved game
  S-->>P: update state
  P-->>A: render updated details
```

#### CTA-007 Admin upload build ZIP

```mermaid
sequenceDiagram
  autonumber
  actor A as SuperAdmin
  participant P as PageComponent(AdminGameEditorPage)
  participant S as FrontStore
  participant C as API Controller(/admin/games/{id}/build)
  participant SV as Service(TODO)
  participant R as Repo(TODO)
  participant EXT as External(S3-compatible)

  A->>P: Upload build ZIP
  P->>S: dispatch(uploadBuild)
  S->>C: POST /admin/games/{id}/build
  C->>SV: TODO
  SV->>EXT: store build
  SV->>R: save build reference
  SV-->>C: build_id + signed build_url
  C-->>S: build stored
  S-->>P: update state
  P-->>A: show build ready
```

#### CTA-008 Admin preview build

```mermaid
sequenceDiagram
  autonumber
  actor A as SuperAdmin
  participant P as PageComponent(AdminGameEditorPage)
  participant S as FrontStore
  participant C as API Controller(/games/{id})
  participant SV as Service(TODO)
  participant R as Repo(TODO)

  A->>P: Preview build
  P->>S: dispatch(loadBuildPreview)
  S->>C: GET /games/{id}
  C->>SV: TODO (return signed build_url)
  SV->>R: TODO
  R-->>SV: TODO
  SV-->>C: TODO
  C-->>S: build_url/build_id
  S-->>P: update state
  P-->>A: render iframe preview
```

#### CTA-009 Admin publish game

```mermaid
sequenceDiagram
  autonumber
  actor A as SuperAdmin
  participant P as PageComponent(AdminGameEditorPage)
  participant S as FrontStore
  participant C as API Controller(/admin/games/{id}/publish)
  participant SV as Service(TODO)
  participant R as Repo(TODO)

  A->>P: Publish game
  P->>S: dispatch(publishGame)
  S->>C: POST /admin/games/{id}/publish
  C->>SV: validate cover_url + description_md + build_url
  SV->>R: update status=published
  R-->>SV: TODO
  SV-->>C: published game
  C-->>S: status updated
  S-->>P: update state
  P-->>A: show published status
```

#### CTA-010 Admin set tags on game

```mermaid
sequenceDiagram
  autonumber
  actor A as SuperAdmin
  participant P as PageComponent(AdminGameEditorPage)
  participant S as FrontStore
  participant C as API Controller(/admin/games/{id}/tags)
  participant SV as Service(TODO)
  participant R as Repo(TODO)

  A->>P: Update tags
  P->>S: dispatch(saveTags)
  S->>C: POST/PATCH /admin/games/{id}/tags
  C->>SV: validate permissions
  SV->>R: update tags
  R-->>SV: TODO
  SV-->>C: updated tags
  C-->>S: tags saved
  S-->>P: update state
  P-->>A: render tags
```

#### CTA-011 Admin change status + remark

```mermaid
sequenceDiagram
  autonumber
  actor A as SuperAdmin
  participant P as PageComponent(AdminGameEditorPage)
  participant S as FrontStore
  participant C as API Controller(/admin/games/{id}/status)
  participant SV as Service(TODO)
  participant R as Repo(TODO)

  A->>P: Change status + remark
  P->>S: dispatch(updateStatus)
  S->>C: POST /admin/games/{id}/status
  C->>SV: TODO
  SV->>R: store remark + status
  R-->>SV: TODO
  SV-->>C: TODO
  C-->>S: status updated
  S-->>P: update state
  P-->>A: show status
```

### System Interaction Overview (FP)

```mermaid
flowchart LR
  subgraph Frontend
    CP[CatalogPage]
    GP[GamePage]
    AG[AdminGameEditorPage]
    ATE[AdminTeamsPage]
    FS[FrontStore]
  end
  subgraph Backend
    CTRL[Controller: Games/Tags/Admin]
    SVC[Service: TODO]
    REPO[Repo: TODO]
    MDB[(MongoDB)]
  end
  EXT[External Storage (S3-compatible)]

  CP --> FS --> CTRL
  GP --> FS --> CTRL
  AG --> FS --> CTRL
  ATE --> FS --> CTRL
  CTRL --> SVC --> REPO --> MDB
  SVC --> EXT
```
