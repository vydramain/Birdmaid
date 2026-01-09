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

## FP3: Navigation Tabs and Auth Removal

### CTA table

| CTA_ID | CTA | Page | Endpoint(s) | State keys | mock_status |
| --- | --- | --- | --- | --- | --- |
| CTA-031 | Navigate to catalog | AllPages | Link to / | - | - |
| CTA-032 | Navigate to game page | CatalogPage, AdminPages | Link to /games/:gameId | - | - |
| CTA-033 | Navigate to admin teams | AllPages | Link to /admin/teams | - | - |
| CTA-034 | Navigate to admin game editor | AdminTeamsPage, GamePage | Link to /admin/games/:gameId or /admin/games/new | - | - |
| CTA-035 | Navigate to admin settings | AllPages | Link to /admin/settings | - | - |
| CTA-039 | Load existing game in editor | AdminGameEditorPage | GET /admin/games/{gameId} (returns adminRemark) | admin.game.form, admin.game.current | unknown |
| CTA-040 | Load teams list | AdminTeamsPage | GET /admin/teams | admin.teams.list | unknown |
| CTA-041 | Load settings | AdminSettingsPage | GET /admin/settings/build-limits | admin.settings.maxBuildSize | unknown |
| CTA-042 | Select team from dropdown | AdminGameEditorPage | GET /admin/teams (load teams list) | admin.game.form.teamId, admin.teams.list | unknown |
| CTA-043 | Upload cover image | AdminGameEditorPage | POST /admin/games/{id}/cover | admin.game.form.cover_url | unknown |
| CTA-044 | View catalog games | CatalogPage | GET /games?tag=...&sort=... | games.list, ui.loading, ui.empty, ui.error | unknown |

### System Design (per CTA)

#### CTA-031-035 Global navigation (menu bar tabs)

```mermaid
sequenceDiagram
  autonumber
  actor U as User
  participant N as NavigationComponent
  participant R as Router

  U->>N: Click nav tab (Catalog/Game/Teams/Editor/Settings)
  N->>R: navigate to target route
  R-->>U: render target page
  Note over N,R: All tabs always visible, no auth checks
```

### System Interaction Overview (FP)

```mermaid
flowchart LR
  subgraph Frontend
    NAV[NavigationComponent]
    CP[CatalogPage]
    GP[GamePage]
    AP[AdminPages]
  end
  subgraph Backend
    CTRL[Controller: All endpoints public]
    SVC[Service: Games/Teams/Settings]
  end

  NAV --> CP
  NAV --> GP
  NAV --> AP
  CP --> CTRL
  GP --> CTRL
  AP --> CTRL
  CTRL --> SVC
```

#### CTA-039 Load existing game in editor

```mermaid
sequenceDiagram
  autonumber
  actor U as User
  participant P as PageComponent(AdminGameEditorPage)
  participant C as API Controller(/admin/games/{id})
  participant SV as Service(Games)

  U->>P: Navigate to /admin/games/:gameId
  P->>C: GET /admin/games/{gameId}
  C->>SV: fetch game
  SV-->>C: game data
  C-->>P: return game
  P->>P: populate form fields (title, description, cover_url, build_url, tags, status)
  P-->>U: render editor with game data
  Note over P,C: No auth checks, all endpoints public
```

#### CTA-040 Load teams list

```mermaid
sequenceDiagram
  autonumber
  actor U as User
  participant P as PageComponent(AdminTeamsPage)
  participant C as API Controller(/admin/teams)
  participant SV as Service(Teams)

  U->>P: Open /admin/teams
  P->>C: GET /admin/teams
  C->>SV: fetch all teams
  SV-->>C: teams list
  C-->>P: return teams[]
  P->>P: update teams state
  P-->>U: render teams list
  Note over P,C: No auth checks, all endpoints public
```

#### CTA-041 Load settings

```mermaid
sequenceDiagram
  autonumber
  actor U as User
  participant P as PageComponent(AdminSettingsPage)
  participant C as API Controller(/admin/settings/build-limits)
  participant SV as Service(Settings)

  U->>P: Open /admin/settings
  P->>C: GET /admin/settings/build-limits
  C->>SV: fetch settings
  SV-->>C: maxBuildSizeBytes
  C-->>P: return settings
  P->>P: populate maxBuildSize input
  P-->>U: render settings with current values
  Note over P,C: No auth checks, all endpoints public
```

#### CTA-042 Select team from dropdown

```mermaid
sequenceDiagram
  autonumber
  actor U as User
  participant P as PageComponent(AdminGameEditorPage)
  participant C as API Controller(/admin/teams)
  participant SV as Service(Teams)

  U->>P: Open /admin/games/new
  P->>C: GET /admin/teams
  C->>SV: fetch all teams
  SV-->>C: teams list
  C-->>P: return teams[]
  U->>P: Type team name in search field
  P->>P: Filter teams by name
  U->>P: Select team from dropdown
  P->>P: Set teamId from selected team
  P-->>U: render selected team name
  Note over P,C: All teams visible for admin, searchable by name
```

#### CTA-043 Upload cover image

```mermaid
sequenceDiagram
  autonumber
  actor U as User
  participant P as PageComponent(AdminGameEditorPage)
  participant C as API Controller(/admin/games/{id}/cover)
  participant SV as Service(Games)
  participant EXT as External(S3/MinIO)

  U->>P: Select cover image file or enter URL
  P->>P: If file selected, create game if needed
  P->>C: POST /admin/games/{id}/cover (multipart/form-data)
  C->>SV: validate image type and size
  SV->>EXT: upload to S3/MinIO (covers/{id}/cover.{ext})
  SV-->>C: cover_url
  C-->>P: return { cover_url }
  P->>P: Update cover_url state and show preview
  P-->>U: render cover image preview
  Note over P,C: Cover can be uploaded or URL entered directly
```

#### CTA-044 View catalog games

```mermaid
sequenceDiagram
  autonumber
  actor U as User
  participant P as PageComponent(CatalogPage)
  participant C as API Controller(/games)
  participant SV as Service(Games)

  U->>P: Open catalog page
  P->>C: GET /games?tag=...&sort=...
  C->>SV: fetch published games
  SV-->>C: games list
  C-->>P: return games[]
  P->>P: Render game cards with cover images
  P-->>U: display catalog grid or "No games available" message
  Note over P,C: Shows real games from API, no placeholder content
```
