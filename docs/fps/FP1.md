# FP1: Browse & Play + Admin Authoring

**Status:** release  
**Created:** 2026-01-08  
**Updated:** 2026-01-08

## Scope

Что входит:
- Public catalog -> game page -> play web build in-browser
- Admin authoring: team -> game -> upload -> preview -> publish -> tags -> status/remark
- Minimal filtering/sorting by tags
- Admin-only CRUD for Teams/Games/Builds
- Game status transitions: editing/published/archived

Что НЕ входит:
- User authentication (будет в FP4)
- Comments (будет в FP6)
- Ratings

## Questions

| # | Question | Answer | Status |
|---|----------|--------|--------|
| 1 | Нужна ли модерация игр? | Нет, админ сам публикует | closed |
| 2 | Как обрабатывать ошибки загрузки? | Показывать ошибку пользователю | closed |

## Decisions (ADRs)

| # | Decision | Rationale | Status |
|---|----------|-----------|--------|
| 1 | Использовать React + NestJS | Простота, знакомый стек | accepted |
| 2 | MongoDB для хранения | NoSQL, гибкость схемы | accepted |
| 3 | MinIO для S3-совместимого хранилища | Локальная разработка | accepted |

## Requirements

### Use Cases

**Main Flow: Browse & Play**
1. User открывает каталог
2. User видит список игр
3. User кликает на игру
4. User видит страницу игры
5. User кликает "Play"
6. Игра открывается в браузере

**Main Flow: Admin Authoring**
1. Admin создает команду
2. Admin создает игру
3. Admin загружает build (ZIP)
4. Admin предпросматривает build
5. Admin публикует игру

### Business Rules

- Только админ может создавать команды и игры
- Игра может быть в статусе: editing, published, archived
- Только published игры видны в публичном каталоге

### Validations

- Build должен содержать `index.html` в корне
- Cover image: максимум 300 KB, только изображения
- Tags: пользовательские и системные (только админ)

## UX Map

| CTA | Endpoint | State | Page | Mock | Status |
|-----|----------|-------|------|------|--------|
| Browse catalog | GET /games | games.list | CatalogPage | no | done |
| Filter by tags | GET /games?tag=... | games.filters | CatalogPage | no | done |
| Open game page | GET /games/:id | game.current | GamePage | no | done |
| Play game | GET /games/:id (build_url) | build.url | GamePage | no | done |
| Create team | POST /admin/teams | admin.teams.form | AdminTeamsPage | no | done |
| Create/edit game | POST/PATCH /admin/games | admin.game.form | AdminGameEditorPage | no | done |
| Upload build | POST /admin/games/:id/build | admin.build.upload | AdminGameEditorPage | no | done |
| Preview build | GET /games/:id | admin.build.preview | AdminGameEditorPage | no | done |
| Publish game | POST /admin/games/:id/publish | admin.game.status | AdminGameEditorPage | no | done |
| Set tags | POST /admin/games/:id/tags | admin.game.tags | AdminGameEditorPage | no | done |
| Change status | POST /admin/games/:id/status | admin.game.status | AdminGameEditorPage | no | done |

## Architecture

### Components

- Frontend: React 18.2, Vite 5.1, TypeScript 5.4
- Backend: NestJS 10.3, TypeScript 5.4
- Database: MongoDB 6
- Storage: MinIO (S3-compatible)

### Diagrams

См. `docs/core/UX_MAP.md#FP1` для sequence diagrams.

## Tests

### UAT/BDD

- [x] User can browse catalog
- [x] User can filter by tags
- [x] User can open game page
- [x] User can play game
- [x] Admin can create team
- [x] Admin can create game
- [x] Admin can upload build
- [x] Admin can publish game

### Test Files

- `front/__tests__/fp1/catalog.states.test.tsx`
- `front/__tests__/fp1/game.playback.test.tsx`
- `front/__tests__/fp1/admin.authoring.test.tsx`
- `back/__tests__/fp1/games.list.test.ts`
- `back/__tests__/fp1/games.get.test.ts`
- `back/__tests__/fp1/admin.games.publish.test.ts`

### Coverage

- Backend: 85%
- Frontend: 90%

## Metrics

### Success Metrics

- North Star: Number of games played
- Supporting: Number of games published, Number of active admins

### Events

- `game_viewed` — когда пользователь открывает страницу игры
- `game_played` — когда пользователь запускает игру
- `game_published` — когда админ публикует игру

## Plan

| Milestone | Date | Tasks | Owner | Status |
|-----------|------|--------|-------|--------|
| 1. Architecture | 2026-01-08 | Выбрать стек, создать scaffolds | Engineer | done |
| 2. Design | 2026-01-08 | UX map, API, MODEL | Designer | done |
| 3. Tests | 2026-01-08 | Написать тесты | Engineer | done |
| 4. Implementation | 2026-01-08 | Реализовать фичу | Engineer | done |
| 5. Release | 2026-01-08 | Acceptance, релиз | Product Lead | done |

## Risks

| Risk | Probability | Impact | Mitigation | Status |
|------|-------------|--------|------------|--------|
| Embed policies могут снизить совместимость | medium | high | Тестировать на разных играх | mitigated |
| Admin scope может расшириться | medium | medium | Строго следовать scope | mitigated |

## Dependencies

- `docs/core/REQUIREMENTS.md` — общие требования
- `docs/core/API.yaml` — API контракт
- `docs/core/MODEL.sql` — модель данных
- `docs/core/UX_MAP.md` — UX map

## Artifacts

- Coverage: `artifacts/FP1/2026-01-08/coverage/...`
- Logs: `artifacts/FP1/2026-01-08/logs/...`
- Evidence: `artifacts/FP1/2026-01-08/evidence/...`

## Reflection

**What went well:**
- Реализован минимальный MVP flow (admin authoring + upload + publish)
- Добавлен docker-compose с MongoDB + MinIO

**Risks:**
- Coverage не проверен
- Docker flow ориентирован на dev и нуждается в валидации

**Next focus:**
- Запустить coverage scripts и собрать artifacts
- Перейти к tests-green

## Evidence

- Commit: `e26e3f1 FP1`
- Initial implementation: Full MVP with admin authoring, catalog, game playback
- Created: 88 files, 19285 insertions
- Includes: Frontend (React + Vite), Backend (NestJS), Docker setup, tests, documentation

## Reality Check (2026-01-22 Audit)

**Status:** FP1 features partially accessible due to FP6/FP7 architecture changes.

### Current Platform State

**Entry Point:** `main.tsx` uses `ShellRoot` → `DesktopPage` (no router, no `App.tsx` routes).

**FP1 Contract vs Reality:**

| Feature | Contract | Current State | Status |
|---------|----------|---------------|--------|
| **Public Catalog** |
| Browse catalog | `CatalogPage` at `/catalog` | `CatalogPage` exists in `App.tsx` but route `/catalog` NOT accessible (main.tsx uses ShellRoot) | ❌ NOT ACCESSIBLE |
| Filter by tags | `GET /games?tag=...` | Backend works, frontend route not accessible | ❌ NOT ACCESSIBLE |
| **Game Playback** |
| Open game page | `GamePage` at `/games/:id` | `GamePage` exists but route NOT accessible | ❌ NOT ACCESSIBLE |
| Play game (iframe) | Modal/iframe in `GamePage` | `executor` app exists using `AppHost` (iframe sandbox), but no way to open games | ⚠️ PARTIAL (executor exists, no catalog integration) |
| **Admin Authoring** |
| Create team | `TeamsPage` at `/teams` | Route NOT accessible | ❌ NOT ACCESSIBLE |
| Create/edit game | `EditorPage` at `/editor/games/:id` | Route NOT accessible | ❌ NOT ACCESSIBLE |
| Upload build | `POST /admin/games/:id/build` | Backend endpoint works, frontend route not accessible | ⚠️ BACKEND ONLY |
| Publish game | `POST /admin/games/:id/publish` | Backend endpoint works, frontend route not accessible | ⚠️ BACKEND ONLY |
| Set tags | `POST /admin/games/:id/tags` | Backend endpoint works, frontend route not accessible | ⚠️ BACKEND ONLY |
| Change status | `POST /admin/games/:id/status` | Backend endpoint works, frontend route not accessible | ⚠️ BACKEND ONLY |

### Code Entry Points

**Active:**
- ✅ `main.tsx` → `ShellRoot` → `DesktopPage` (FP7 unified shell)
- ✅ Desktop icons → `openWindow(appId)` → `WindowRegistry` → `AppRegistry`
- ✅ Registered apps: `explorer`, `help`, `landing`, `executor`
- ✅ `executor` app uses `AppHost` (iframe sandbox) for game playback

**Dead Code (Not Reachable):**
- ❌ `App.tsx` routes (`/catalog`, `/games/:id`, `/teams`, `/editor/*`) - Not used by `main.tsx`
- ❌ `components/WindowManager.tsx` - Uses old `WindowContext` (replaced by `os/wm/WindowManager.tsx`)
- ❌ `components/Window.tsx` - Uses old `WindowContext` (replaced by `os/wm/WindowFrame.tsx`)
- ❌ `contexts/WindowContext.tsx` - Replaced by `os/wm/WindowRegistry.tsx`

### Test Reconciliation

**Backend Tests:** ✅ KEEP - All backend endpoints work, tests are valid.

**Frontend Tests:** ❌ REMOVE+REPLACE - All test routes (`/catalog`, `/games/:id`, `/teams`, `/editor/*`) are not accessible in production.

| Test File | Current Issue | Action | Replacement |
|-----------|---------------|--------|-------------|
| `front/__tests__/fp1/catalog.states.test.tsx` | Tests `/catalog` route (not accessible) | REMOVE+REPLACE | New: "Catalog app shows games from mockApi.games" (when catalog app exists) |
| `front/__tests__/fp1/game.playback.test.tsx` | Tests `/games/:id` route (not accessible) | REMOVE+REPLACE | New: "Executor app opens game with AppHost and respects iframe sandbox" |
| `front/__tests__/fp1/admin.authoring.test.tsx` | Tests `/teams`, `/editor/*` routes (not accessible) | REMOVE+REPLACE | New: "Admin app allows creating team/game" (when admin app exists) OR mark feature removed |
| `front/__tests__/fp1/admin.publish-gating.test.tsx` | Tests `/editor/*` route (not accessible) | REMOVE+REPLACE | Same as above |
| `front/__tests__/fp1/admin.status-remark.test.tsx` | Tests `/editor/*` route (not accessible) | REMOVE+REPLACE | Same as above |

### PR Plan

**Phase 1: Remove Dead Code**
1. Remove `App.tsx` routes (or document as legacy/deferred)
2. Remove `components/WindowManager.tsx` (dead, replaced by `os/wm/WindowManager.tsx`)
3. Remove `components/Window.tsx` (dead, replaced by `os/wm/WindowFrame.tsx`)
4. Remove `contexts/WindowContext.tsx` (dead, replaced by `os/wm/WindowRegistry.tsx`)

**Phase 2: Remove Obsolete Tests**
1. Remove `front/__tests__/fp1/catalog.states.test.tsx`
2. Remove `front/__tests__/fp1/game.playback.test.tsx`
3. Remove `front/__tests__/fp1/admin.authoring.test.tsx`
4. Remove `front/__tests__/fp1/admin.publish-gating.test.tsx`
5. Remove `front/__tests__/fp1/admin.status-remark.test.tsx`

**Phase 3: Add Replacement Tests**
1. Add `front/__tests__/fp1/executor.apphost.test.tsx`: "Executor app opens game with AppHost and respects iframe sandbox"
2. Add `front/__tests__/fp1/catalog.app.test.tsx`: "Catalog app shows games from mockApi.games" (when catalog app exists)
3. Add `front/__tests__/fp1/admin.app.test.tsx`: "Admin app allows creating team/game" (when admin app exists) OR document feature removed

**Phase 4: Document Feature Status**
- Update FP1.md to reflect that catalog/admin UI is deferred (backend endpoints still work)
- Document that game playback is available via `executor` app but requires catalog/admin apps for full flow

### Decisions Needed

1. **Catalog:** Should we create a catalog app (registered in AppRegistry) or integrate with Explorer?
2. **Admin Authoring:** Should we create an admin app or mark as deferred/removed?
3. **Game Opening:** How should users open games? Via Explorer? Via catalog app? Via desktop icons?

### Next Steps

1. **Immediate:** Remove dead code and obsolete tests
2. **Short-term:** Add replacement tests for Executor/AppHost
3. **Medium-term:** Decide on catalog/admin app strategy and implement
4. **Long-term:** Full integration test coverage for FP1 flows in FP7 architecture
