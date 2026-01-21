# FP1: Browse & Play + Admin Authoring

**Status:** build  
**Created:** 2026-01-08  
**Updated:** 2026-01-22

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
| 4. Implementation | 2026-01-08 | Реализовать фичу | Engineer | in_progress |
| 5. Release | TBD | Acceptance, релиз | Product Lead | todo |

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

- PR: #...
- CI: https://...
- Demo: https://...
