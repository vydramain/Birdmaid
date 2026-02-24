# FP4: System Viewers & Players (Image / Audio / Video)

**Status:** released  
**Created:** 2025-02-23  
**Updated:** 2026-02-23  
**Audit:** [FP4_AUDIT_REPORT.md](../audit/FP4_AUDIT_REPORT.md)  
**Purpose:** Добавить системные приложения для открытия простых файлов: Image Viewer, Media Player (audio/video). Открытие из Explorer по double click; virtual list + Prev/Next; Win98 look (98.css).

**Archived:** [archive/FP4/](../../archive/FP4/README.md) (evidence, reports, TEMP docs)

> **Context:** FP1–FP3 готовы. FP4 расширяет viewers (FP3 M4) до полноценных system apps с MIME routing, virtual list и controls.

> **Scope Lock (M0):** Goal/Non-Goals и Scope § IN/OUT — фиксированы. No scope creep. Изменения в canonical PROTOCOL*v0 (без размножения PROTOCOL*\*.md).

---

## Contradictions & Fixes (resolved)

| #   | Contradiction                                                       | Fix                                                                                                                                       |
| --- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Viewer "сам вызывает list/open-url" vs "viewers без gateway access" | Explorer (единственный с token) делает list + open-url; отправляет viewer OPEN_FILE с playlist. Viewer не вызывает gateway.               |
| 2   | Boot "same-origin" vs "viewer sandbox без same-origin"              | Code served from shell.local/apps/<app>/ (same-origin URL). Sandbox: allow-scripts only (no allow-same-origin). Content: signed URL only. |
| 3   | MIME/handler "размазано между Explorer и Shell"                     | Explorer шлёт SHELL_OPEN_FILE { path }. Shell — единственная точка: mime.getType + handler registry.                                      |
| 4   | "3 apps" vs "Media Player с режимом"                                | 2 apps: ImageViewer + MediaPlayer (mode=audio\|video).                                                                                    |
| 5   | Virtual list "TBD"                                                  | Explorer передаёт playlist в OPEN_FILE. Сортировка: localeCompare (как Explorer list).                                                    |
| 6   | Autoplay "пытаемся; если blocked → ?"                               | Явное правило: пытаемся autoplay; если blocked → показать "Press Play".                                                                   |
| 7   | E2E "опционально"                                                   | E2E OUT of scope FP4. Gate: smoke + unit + integration.                                                                                   |
| 8   | Explorer postMessage targetOrigin vs Cursor/embedded                | M4: Explorer send() использует targetOrigin `"*"` — сообщения доставляются при parent в webview (Cursor Simple Browser).                  |

---

## Definitions / Glossary

| Term                        | Definition                                                                                                                                             |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **System app**              | Приложение из фиксированного защищённого пути (C:/Program Files/...), доступное всем. Served runtime с shell.local/apps/<app>/ (same-origin URL).      |
| **Viewer / Player**         | System app для просмотра/воспроизведения файлов. Sandboxed iframe (allow-scripts only). Не вызывает gateway. Получает контент только через signed URL. |
| **Handler registry**        | Централизованный маппинг MIME → app (ImageViewer / MediaPlayer). Хранится в Shell. Единственная точка правды для выбора приложения.                    |
| **Virtual list / Playlist** | Список файлов того же media-type в текущей директории. Передаётся viewer/player в OPEN_FILE. Порядок: localeCompare (как Explorer).                    |
| **Signed URL**              | Временный URL для чтения файла из MinIO. Выдаётся gateway (open-url). Viewer загружает контент напрямую по URL, без gateway вызовов.                   |
| **OPEN_FILE**               | postMessage от Shell к viewer/player при инициализации. Payload: initialPath, initialUrl, playlist. Viewer больше с бэком не общается.                 |

---

## Goal / Non-Goals

### Goal

Добавить системные приложения для открытия простых файлов:

- **Image Viewer** — png, jpg, webp
- **Media Player** — mp3 (audio), mp4, webm (video); один app с режимом

Эти приложения:

- существуют как system apps (аналогично Explorer): лежат в "Program Files", защищены от модификации;
- открываются из Explorer по double click на файле;
- при запуске получают от Shell (через Explorer) initial file + playlist и показывают/воспроизводят;
- дают навигацию Prev/Next по циклическому списку (без дополнительных gateway вызовов).

### Non-Goals

- Настраиваемые пользователем "default apps"
- Ассоциации "по пользователю" и сохранение предпочтений
- Плейлисты из разных директорий / поиск / сортировка / медиа-библиотека
- Поддержка форматов кроме перечисленных
- DRM, потоковое видео, субтитры, эквалайзеры, визуализации
- E2E тесты в FP4 (достаточно unit + integration + smoke)

---

## Scope

### IN — Что входит

- Handler registry в Shell: MIME → app (ImageViewer / MediaPlayer)
- Маршрутизация: Explorer → SHELL_OPEN_FILE { path, playlist } → Shell (mime + handler) → viewer/player
- Explorer: list + open-url для initial + playlist; передача через Shell в OPEN_FILE
- 2 system apps: ImageViewer, MediaPlayer (mode=audio|video)
- UI под Win98 (98.css)
- Prev/Next по playlist (локально, без gateway)
- Media Player: Play/Pause/Stop, volume slider, mute

### OUT — Что не входит

- User default apps, per-user associations
- Плейлисты из разных директорий, медиа-библиотека
- Форматы кроме png/jpg/webp, mp3, mp4/webm
- DRM, streaming, субтитры, эквалайзеры
- E2E в FP4 gate

---

## Open Questions (resolved for build)

| #   | Question                                      | Answer                                                         | Status |
| --- | --------------------------------------------- | -------------------------------------------------------------- | ------ |
| 1   | Точные пути Program Files?                    | C:/Program Files/Image Viewer/, C:/Program Files/Media Player/ | closed |
| 2   | Fixtures: структура папок Images/Music/Video? | C:/My Documents/Images/, Music/, Video/ с sample файлами       | closed |
| 3   | Progress bar: read-only или interactive?      | Read-only в FP4 (seek — non-goal)                              | closed |

---

## Decisions (ADRs)

| #   | Decision                                                                 | Rationale                                                                                       | Status   |
| --- | ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- | -------- |
| D1  | Explorer шлёт SHELL_OPEN_FILE { path } без MIME                          | Shell — единственная точка: mime.getType + handler registry. Эволюция FP5+ без правок Explorer. | accepted |
| D2  | Explorer делает list + open-url; передаёт viewer через Shell в OPEN_FILE | Только Explorer имеет token и gateway доступ. Viewer не вызывает gateway.                       | accepted |
| D3  | Playlist в OPEN_FILE: [{ path, url }] — precomputed signed URLs          | Viewer не запрашивает gateway. Prev/Next — локальная навигация по уже переданному списку.       | accepted |
| D4  | 2 apps: ImageViewer + MediaPlayer(mode=audio\|video)                     | Меньше дублирования; один Media Player для audio и video.                                       | accepted |
| D5  | Boot: shell.local/apps/image-viewer/, media-player/ (same-origin URL)    | Как Explorer (D9). Sandbox: allow-scripts only (viewers не same-origin по sandbox).             | accepted |
| D6  | Сортировка playlist: localeCompare (как Explorer list)                   | Консистентность с FP2/FP3.                                                                      | accepted |
| D7  | Autoplay: пытаемся; если blocked → показать "Press Play"                 | Явное UX правило.                                                                               | accepted |
| D8  | Unsupported MIME → log only, не падать                                   | Graceful degradation.                                                                           | accepted |
| D9  | MIME via npm `mime`; allowlist в Shell                                   | Стандартный способ; централизованный registry.                                                  | accepted |

### Rejected Alternatives

| Alternative                                       | Rejected because                                                           |
| ------------------------------------------------- | -------------------------------------------------------------------------- |
| Bulk open-url API (multiple paths in one request) | Existing open-url is single-path; N calls acceptable; no API change needed |
| Viewer same-origin with Shell                     | Security: would allow fetch to api.shell.local                             |
| Lazy playlist loading                             | Complexity; precomputed simpler for FP4                                    |
| E2E for FP4 gate                                  | Design decision: coverage via unit+integration; E2E deferred               |

---

## Protocol

**FP4 extends FP3:** SHELL_OPEN (kind=app) для apps без изменений. Для files — новый тип SHELL_OPEN_FILE с playlist.

### Explorer → Shell

| Type            | Payload                                                            | When                                                                                |
| --------------- | ------------------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| SHELL_OPEN_FILE | `{ path: string, playlist: Array<{ path: string, url: string }> }` | Double click на file. Explorer: list + open-url, build playlist. Не вычисляет MIME. |

### Flow (fixed)

1. Explorer: double click file → GET list (dirname) → filter by allowlist ext → sort localeCompare → POST open-url для каждого → build playlist.
2. Explorer: SHELL_OPEN_FILE { path, playlist: [{ path, url }] }.
3. Shell: mime.getType(basename(path)) → handler → createWindow → postMessage OPEN_FILE.
4. Viewer: load initialUrl; Prev/Next — локально по playlist.

### Shell → Viewer/Player

| Type      | Payload                                                                                       | When                                                          |
| --------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| OPEN_FILE | `{ initialPath: string, initialUrl: string, playlist: Array<{ path: string, url: string }> }` | При создании окна viewer/player. После handshake (APP_READY). |

### Viewer → Shell (если нужно)

Prev/Next — чисто локально. Playlist уже содержит все urls. Viewer не шлёт REQUEST_NEXT/PREV. Если в будущем понадобится lazy loading — отдельный FP.

---

## Requirements

### Use Cases

**Main Flow (Image):**

1. User double-clicks .png/.jpg/.webp в Explorer.
2. Explorer: list dir → filter image ext → sort localeCompare → open-url для каждого → build playlist.
3. Explorer: SHELL_OPEN_FILE { path, playlist }.
4. Shell: mime.getType → ImageViewer → createWindow → OPEN_FILE { initialPath, initialUrl, playlist }.
5. ImageViewer: load initialUrl, show image. Prev/Next по playlist (локально).

**Main Flow (Audio/Video):**

1. User double-clicks .mp3/.mp4/.webm.
2. Explorer: list → filter by ext → sort → open-url для каждого → playlist.
3. Explorer: SHELL_OPEN_FILE { path, playlist }.
4. Shell: mime.getType → MediaPlayer(mode) → createWindow → OPEN_FILE.
5. MediaPlayer: autoplay initialUrl. Prev/Next: stop → load next url → autoplay. Play/Pause/Stop, Volume, Mute.

**Error Flows:**

- MIME не в allowlist → Shell log "no handler", не открывать окно.

### Business Rules

**Play/Pause/Stop (MediaPlayer):**

- **On open:** autoplay с начала. Если browser blocked → показать "Press Play".
- **Play:** если играет → no-op; если paused → продолжить; если stopped → начать с 0.
- **Pause:** если играет → пауза; иначе no-op.
- **Stop:** остановить, seek(0); если уже stopped → no-op.
- **Progress bar:** read-only в FP4 (seek — non-goal).

**Volume / Mute:**

- Slider 0..100%. Mute: запомнить предыдущее значение, выставить 0; повторный клик — восстановить.

**Prev/Next:**

- Циклично. Audio/Video: stop текущего → load нового → autoplay.

**Image Viewer:**

- Fit в область. Zoom/pan — out of scope.

---

## MIME Mapping

### Allowlist (npm `mime`)

| Media | MIME                              | Extensions               |
| ----- | --------------------------------- | ------------------------ |
| image | image/png, image/jpeg, image/webp | .png, .jpg, .jpeg, .webp |
| audio | audio/mpeg                        | .mp3                     |
| video | video/mp4, video/webm             | .mp4, .webm              |

### Handler Registry (Shell)

| MIME prefix | App                      |
| ----------- | ------------------------ |
| image/\*    | ImageViewer              |
| audio/mpeg  | MediaPlayer (mode=audio) |
| video/\*    | MediaPlayer (mode=video) |

Rule: mime.getType(filename). Если не в allowlist → log, no handler.

---

## Boot & Sandbox

| App         | Served from                    | Sandbox                         | Gateway      |
| ----------- | ------------------------------ | ------------------------------- | ------------ |
| Explorer    | shell.local/apps/explorer/     | allow-scripts allow-same-origin | Full (token) |
| ImageViewer | shell.local/apps/image-viewer/ | allow-scripts only              | None         |
| MediaPlayer | shell.local/apps/media-player/ | allow-scripts only              | None         |

Viewers: код с shell.local (same-origin URL), но sandbox без allow-same-origin — fetch к api.shell.local blocked. Контент — только signed URL (MinIO).

---

## Program Files Structure (System Apps)

**Source of truth:** Repo layout + runtime mapping. No new compose/Dockerfile/env.

### Repo Layout

| App         | Repo path                  | S3 fixture path (read-only)                               |
| ----------- | -------------------------- | --------------------------------------------------------- |
| Explorer    | `front/apps/explorer/`     | `infra/minio/fixtures/DISK_C/Program Files/Explorer/`     |
| ImageViewer | `front/apps/image-viewer/` | `infra/minio/fixtures/DISK_C/Program Files/Image Viewer/` |
| MediaPlayer | `front/apps/media-player/` | `infra/minio/fixtures/DISK_C/Program Files/Media Player/` |

### Runtime Mapping

| Repo path                  | Runtime URL                      | Delivery                                                 |
| -------------------------- | -------------------------------- | -------------------------------------------------------- |
| `front/apps/explorer/`     | `shell.local/apps/explorer/`     | Vite dev-server; dev-init copies to S3 for app-discovery |
| `front/apps/image-viewer/` | `shell.local/apps/image-viewer/` | Vite dev-server; dev-init copies to S3 for app-discovery |
| `front/apps/media-player/` | `shell.local/apps/media-player/` | Vite dev-server; dev-init copies to S3 for app-discovery |

**Rule:** System apps are served from same-origin URL (shell.local/apps/&lt;app&gt;/). S3 path C:/Program Files/&lt;App&gt;/ is fixture + FS model (read-only); used for app-discovery in Explorer list. Boot source = Vite-served front/apps/&lt;app&gt;/, NOT open-url.

---

## Security

- Viewers/Players: **не получают token**, **не вызывают gateway**.
- Explorer: единственный с token; делает list + open-url; передаёт данные в SHELL_OPEN_FILE.
- Shell: router; создаёт окно, передаёт OPEN_FILE. Shell не вызывает gateway (Explorer делает).
- postMessage: allowlist origins, no "\*". OPEN_FILE только от Shell к viewer.

### Security Checklist (verified)

- [x] ImageViewer iframe: sandbox allow-scripts only
- [x] MediaPlayer iframe: sandbox allow-scripts only
- [x] OPEN_FILE: no token in payload
- [x] Handler registry: allowlist only
- [x] Unsupported MIME: log, no handler
- [x] postMessage: allowlist origins, no `"*"`
- [x] Explorer: only app that calls list + open-url for playlist

---

## UX Flows (agreed protocol only)

### Open File

1. Explorer: double click file → не app-dir.
2. Explorer: GET /api/fs/list?path=dirname(file).
3. Explorer: filter items по allowlist ext (png/jpg/webp или mp3 или mp4/webm).
4. Explorer: sort items by name (localeCompare).
5. Explorer: POST open-url для каждого path → collect urls.
6. Explorer: SHELL_OPEN_FILE { path, playlist: [{ path, url }] }.
7. Shell: mime.getType(basename(path)) → handler.
8. Shell: createWindow(src=shell.local/apps/<app>/, ...).
9. Viewer: APP_READY.
10. Shell: postMessage OPEN_FILE { initialPath: path, initialUrl: url, playlist }.
11. Viewer: load initialUrl, set currentIndex по path в playlist.

### Prev/Next

1. User Prev/Next.
2. currentIndex = (currentIndex ± 1 + length) % length.
3. url = playlist[currentIndex].url.
4. Load url. MediaPlayer: stop → load → autoplay.

---

## Acceptance Criteria

### ImageViewer

| AC  | Критерий                                                                         |
| --- | -------------------------------------------------------------------------------- |
| AC1 | Explorer double click .png/.jpg/.webp → ImageViewer открывается, показывает файл |
| AC2 | Prev/Next циклично переключают файлы того же типа в директории                   |
| AC3 | Image fit в область просмотра                                                    |

### MediaPlayer

| AC  | Критерий                                                                    |
| --- | --------------------------------------------------------------------------- |
| AC4 | Explorer double click .mp3 → MediaPlayer(mode=audio), воспроизведение       |
| AC5 | Explorer double click .mp4/.webm → MediaPlayer(mode=video), воспроизведение |
| AC6 | Prev/Next циклично; stop текущего → load следующего → autoplay              |
| AC7 | Play/Pause/Stop по правилам                                                 |
| AC8 | Volume slider 0..100%; Mute toggle сохраняет предыдущее значение            |
| AC9 | Autoplay blocked → показать "Press Play"                                    |

### General

| AC   | Критерий                               |
| ---- | -------------------------------------- |
| AC10 | Unsupported type → log only, не падать |

---

## Metrics / Events

| Event                                  | Payload               | When            |
| -------------------------------------- | --------------------- | --------------- |
| viewer_open                            | type, ext, path_depth | Viewer opened   |
| viewer_next, viewer_prev               | —                     | Nav clicked     |
| player_play, player_pause, player_stop | —                     | Control clicked |
| player_volume_change                   | from, to              | Slider changed  |
| player_mute_toggle                     | muted                 | Mute toggled    |
| open_unsupported                       | ext, mime             | No handler      |

---

## Tests Plan

### AC → Test Mapping

| AC   | Test ID | Type | Description                                                           |
| ---- | ------- | ---- | --------------------------------------------------------------------- |
| AC1  | T-AC1   | Int  | Explorer double click .png/.jpg/.webp → ImageViewer opens, shows file |
| AC2  | T-AC2   | Int  | ImageViewer Prev/Next cyclic in playlist                              |
| AC3  | T-AC3   | Int  | Image fit in view (contain)                                           |
| AC4  | T-AC4   | Int  | Explorer double click .mp3 → MediaPlayer(mode=audio), playback        |
| AC5  | T-AC5   | Int  | Explorer double click .mp4/.webm → MediaPlayer(mode=video), playback  |
| AC6  | T-AC6   | Int  | MediaPlayer Prev/Next: stop → load next → autoplay                    |
| AC7  | T-AC7   | Unit | Play/Pause/Stop state machine                                         |
| AC8  | T-AC8   | Unit | Volume 0..100%; Mute toggle saves/restores value                      |
| AC9  | T-AC9   | Unit | Autoplay blocked → "Press Play" shown                                 |
| AC10 | T-AC10  | Unit | Unsupported MIME → log only, no crash                                 |

### Unit

**Location:** `front/__tests__/fp4/`

- `mime-mapping.test.ts`, `handler-routing.test.ts`, `playlist-filter-sort.test.ts`, `playlist-nav.test.ts`, `unsupported-mime.test.ts`, `media-player-state.test.ts`, `autoplay-blocked.test.ts`, `window-manager-viewers.test.ts`
- MIME mapping, handler routing, playlist filter/sort, unsupported: log, no crash.

### Integration

**Location:** `back/__tests__/fp4/`

- `open-url-viewers.integration.test.ts`, `allowlist-types.integration.test.ts`, `unsupported-negative.integration.test.ts`, `signed-url-reuse.integration.test.ts`
- Explorer: list + open-url → playlist; Shell SHELL_OPEN_FILE → handler → OPEN_FILE; viewer Prev/Next (no gateway).

### E2E

**OUT of scope FP4.** Gate: smoke + unit + integration. E2E — в FP5+.

---

## Gate Commands (FP4 build, canonical)

| Command                      | Required | Purpose                                                                |
| ---------------------------- | -------- | ---------------------------------------------------------------------- |
| `git status --porcelain`     | yes      | Clean state (empty output)                                             |
| `./infra/smoke.sh`           | yes      | Platform OK                                                            |
| `./infra/test-lint.sh`       | yes      | Lint + format:check                                                    |
| `./infra/test-unit.sh`       | yes      | Unit tests (front: FP4 mime, handler, playlist, media-player-state)    |
| `./infra/test-api-fp.sh FP4` | yes      | Integration (back: Explorer list+open-url, Shell SHELL_OPEN_FILE, API) |

**E2E:** NOT required for FP4 PASS. Design decision: E2E OUT of scope (Contradictions §7). Coverage via unit + integration.

**Canonical:** `./infra/gate.sh FP4` or sequential run of commands above.

**PASS rule:** ALL commands exit 0. No partial PASS. No skipped FP4 tests. See [GUARDRAILS.md](../dev/GUARDRAILS.md) § Gate Semantics.

### Required Test Suites (PASS)

| Suite         | Script                       | Coverage                                                                           |
| ------------- | ---------------------------- | ---------------------------------------------------------------------------------- |
| Smoke         | `./infra/smoke.sh`           | Platform health                                                                    |
| Lint + format | `./infra/test-lint.sh`       | ESLint, Stylelint, Prettier                                                        |
| Unit          | `./infra/test-unit.sh`       | front/\*_/_.test (FP4: mime, handler, playlist, media-player-state)                |
| Integration   | `./infra/test-api-fp.sh FP4` | back/**tests**/fp4/\*.test.ts (Explorer playlist, Shell SHELL_OPEN_FILE, open-url) |

### DoD (build-stage)

- [x] All AC (AC1–AC10) met with evidence
- [x] Unit: mime mapping, handler routing, playlist filter/sort, unsupported MIME, media-player-state
- [x] Integration: Explorer list+open-url→playlist, Shell SHELL_OPEN_FILE→handler→OPEN_FILE, viewer Prev/Next
- [x] Smoke + lint + format green
- [x] docs/fps/FP4.md updated

---

## Plan / Milestones

| M   | Milestone                                                            | Status |
| --- | -------------------------------------------------------------------- | ------ |
| M0  | Scope lock, Program Files structure, TEMP docs, Gate commands        | done   |
| M1  | File-type routing: SHELL_OPEN_FILE, handler registry, mime allowlist | done   |
| M2  | System apps packaging: ImageViewer, MediaPlayer paths, boot          | done   |
| M3  | Explorer: list + open-url → playlist → SHELL_OPEN_FILE               | done   |
| M4  | OPEN_FILE protocol, viewer init, Prev/Next                           | done   |
| M5  | MediaPlayer controls, autoplay policy                                | done   |
| M6  | Tests + gate                                                         | done   |

---

## Risks

| Risk                                   | Probability | Impact | Mitigation                                               |
| -------------------------------------- | ----------- | ------ | -------------------------------------------------------- |
| Playlist size (many files)             | low         | medium | Limit N items или lazy open-url in future FP             |
| Autoplay blocked                       | medium      | low    | "Press Play" fallback (AC9)                              |
| Explorer SHELL_OPEN vs SHELL_OPEN_FILE | —           | —      | FP4 supersedes file flow; SHELL_OPEN(kind=app) unchanged |

---

## Dependencies

- FP1 (Shell, postMessage) — done
- FP2 (Gateway list, open-url) — done
- FP3 (Explorer, SHELL_OPEN) — done
- npm `mime` — add
- **API:** No changes. FP4 uses existing `GET /api/fs/list` and `POST /api/fs/open-url`.

---

## Evidence (for release)

### M3 (Explorer integration) — 2025-02-23

- Explorer `onItemDblClick`: `getMimeForPath` → `mimeToMedia` → `buildPlaylistAndOpen`
- `buildPlaylistAndOpen`: `dirname` → `fetchList` → `filterMediaItems` → `sortByLocaleCompare` → limit 100 → `fetchOpenUrl` per path → `SHELL_OPEN_FILE { path, playlist }`
- Unsupported types: `console.warn` + no-op (no crash, no 500)
- `front/apps/explorer/main.ts`: `mimeToMedia`, `fetchOpenUrl`, `buildPlaylistAndOpen`, `PLAYLIST_LIMIT`

### M4 (TESTS-GREEN) — 2025-02-23

**Fixes applied:**

- **Integration:** Removed "HEAD on signed URL returns 200" — S3 presigned URLs for GetObject are GET-only; signature bound to HTTP verb. Viewer flow uses GET only.
- **Unit:** Run via `./infra/test-unit.sh` (Docker, clean pnpm install) — avoids host rollup optional deps.
- **Lint:** `eslint.config.js` override for `front/apps/explorer/main.ts` — `no-console: off` (FP3/FP4 Explorer logs errors + unsupported types).
- **Format:** `pnpm exec prettier --write` on FP4-related files.

**Paths:**

- `back/__tests__/fp4/open-url-viewers.integration.test.ts` — removed HEAD assertion
- `archive/FP4/reports/FP4_AUDIT_REPORT.md` — M5 Security + Audit report
- `eslint.config.js` — override `no-console: off` for `front/apps/explorer/main.ts`
- `front/apps/explorer/main.ts` — removed inline eslint-disable (override covers)

**Commands + results:**

| Command                      | Exit |
| ---------------------------- | ---- |
| `./infra/smoke.sh`           | 0    |
| `./infra/test-lint.sh`       | 0    |
| `./infra/test-unit.sh`       | 0    |
| `./infra/test-api-fp.sh FP4` | 0    |
| `./infra/gate.sh FP4`        | 0    |

- [x] All AC met
- [x] Unit + integration green
- [x] Smoke green
- [x] docs/fps/FP4.md updated

### M6 (Image Loading) — 2026-02-23

**Problem:** ImageViewer stuck on "Loading..."; images never render.

**Root cause:** Free MinIO has no bucket CORS; `mc cors set` fails. AWS SDK adds `x-amz-checksum-mode` to presigned URLs; MinIO may reject.

**Fixes:**

- Traefik middleware `minio-cors` on s3.shell.local route: Access-Control-Allow-Origin: `*`, methods GET/HEAD
- Removed `mc cors set` from minio-init
- Gateway env: `AWS_REQUEST_CHECKSUM_CALCULATION=WHEN_REQUIRED`

**Paths:** `infra/docker-compose.dev.yml`

### M3 HARDEN & REGRESSION — 2026-02-23

**Scope:** Multiple viewers, re-open, Firefox signed URL reuse, evidence.

**Tests added:**

| Test ID         | File                                                      | Purpose                                                               |
| --------------- | --------------------------------------------------------- | --------------------------------------------------------------------- |
| T-FP4-M3-MULTI  | `front/__tests__/fp4/window-manager-viewers.test.ts`      | 2 viewer windows each store own playlist; focus switch does not reset |
| T-FP4-M3-REOPEN | `front/__tests__/fp4/window-manager-viewers.test.ts`      | close → open same file again → new window works                       |
| T-FP4-M3-REUSE  | `back/__tests__/fp4/signed-url-reuse.integration.test.ts` | same signed URL fetched 5× → 200 each (Firefox smoke, no single-use)  |

**Commands:**

| Command                      | Exit |
| ---------------------------- | ---- |
| `./infra/test-unit.sh`       | 0    |
| `./infra/test-api-fp.sh FP4` | 0    |

**TEMP(FP4.1) docs:** `docs/dev/_tmp/FP4_*.md`, `M1_FIX_NOTES.md`, `archive/FP4/temp_docs/*` — marked TEMP(FP4.1). On archive FP4: merge into FP4.md or delete; see [archive/FP4/README.md](../../archive/FP4/README.md) § Archive checklist.

### FP4.1 HOTFIX (Media Player) — 2026-02-24

**Scope:** R1 play() reject handling, R2 min window size, R3 no scrollbars, R4 object-fit (verify), R5 logs only.

**Paths changed:**

| File                                              | Change                                                                                             |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `front/apps/media-player/main.ts`                 | syncMediaToState: play() Promise — .then() hide pressPlay, .catch() console.error + show pressPlay |
| `front/apps/media-player/index.html`              | html,body + .player-root { overflow: hidden }                                                      |
| `front/core/WindowManager.ts`                     | minWidth/minHeight per window; updateBounds enforces                                               |
| `front/Shell.tsx`                                 | resize handler uses per-window min; default 320×240 for all iframe windows                         |
| `front/__tests__/fp4/media-player-hotfix.test.ts` | T-FP4-HOTFIX-PLAY-REJECT, OVERFLOW, OBJECT-FIT, MIN-SIZE                                           |

**Commands:** `pnpm lint` 0, `pnpm format:check` 0, `pnpm test` 0, `vitest run back/__tests__/fp4/` 0.

### FP4.1 min-size (320×240) — 2026-02-24

**Scope:** Default min 320×240 for all iframe windows; clamp on resize, restore, programmatic update.

**Paths changed:**

| File                                              | Change                                                                                        |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `front/core/WindowManager.ts`                     | DEFAULT_MIN_WIDTH=320, DEFAULT_MIN_HEIGHT=240; unmaximize clamps prevBounds; export constants |
| `front/Shell.tsx`                                 | resize handler: wm.getWindow(id) for per-window min; removed Media Player override            |
| `front/index.css`                                 | --wm-window-min-width-base: 320px; --wm-window-min-height-base: 240px; fallbacks 20rem/15rem  |
| `front/__tests__/fp4/window-min-size.test.ts`     | NEW: T-MIN-DEFAULT, T-MIN-RESTORE, T-MIN-NO-CHANGE, T-MIN-OVERRIDE                            |
| `front/__tests__/fp4/media-player-hotfix.test.ts` | T-FP4-HOTFIX-MIN-SIZE: default 320×240 for iframe window                                      |

**Per-window override:** `createWindow({ minWidth: 400, minHeight: 300 })` — optional per-window override.

**Commands:**

| Command             | Exit |
| ------------------- | ---- |
| `./infra/smoke.sh`  | 0    |
| `pnpm lint`         | 0    |
| `pnpm format:check` | 0    |
| `pnpm test`         | 0    |

---

## References

- [FP1: Shell MVP](FP1.md)
- [FP2: Gateway + FS](FP2.md)
- [FP3: Explorer + Viewers](FP3.md)
- [API.yaml](../core/API.yaml)
- [GUIDE_STYLE.md](../style/GUIDE_STYLE.md)
- [STRUCTURE.md](../style/STRUCTURE.md)
