# FP5: User App Packages (index.html в S3) + Sandbox Hardening

**Status:** design  
**Created:** 2026-03-01  
**Updated:** 2026-03-01 (Design Package)  
**Purpose:** Поддержка пользовательских загружаемых приложений (app packages) — директории с index.html в S3. Shell запускает их в изолированном iframe без системных привилегий.

> **Context:** FP1–FP4 готовы. FP5 расширяет модель app-dir (FP3) до полноценной sandbox-модели для **user apps**: директория с index.html = app package; double click → launch в отдельном окне; app видит только свою директорию; без token, без write, без privileged bridge.

> **Scope Lock (M0):** Goal/Non-Goals и Scope § IN/OUT — фиксированы. No scope creep.

---

## Outcome (Product Lead)

**Проблема:** Пользователь загружает zip с приложением (index.html + assets). Сейчас оно запускается как обычное приложение, но нет явной модели безопасности: user app может пытаться получить доступ к системным API, токенам, чужим директориям.

**Outcome:** Пользователь может загрузить директорию-приложение (zip с index.html), после чего она запускается как обычное пользовательское приложение внутри Shell, но:

- видит и читает только свою директорию;
- не получает системные привилегии;
- не может сломать Shell / Explorer / Gateway;
- работает предсказуемо и изолированно.

---

## Key Model (зафиксировано)

| Аспект         | Правило                                                                             |
| -------------- | ----------------------------------------------------------------------------------- |
| **User app**   | Директория в S3 с обязательным `index.html` внутри                                  |
| **Discovery**  | Explorer показывает dir с index.html как приложение (иконка app)                    |
| **Launch**     | Double click в Explorer → Shell открывает новое окно с iframe                       |
| **Entrypoint** | iframe загружает приложение через shell.local hosted route (MVP)                    |
| **Read**       | Относительные URL внутри package root (./assets/…); выше root → deny; нет FS bridge |
| **Scope**      | App видит только package root; любые попытки выйти выше → deny                      |
| **Token**      | App не получает token                                                               |
| **Write**      | App не имеет write access                                                           |
| **Bridge**     | App не имеет privileged bridge (SHELL_OPEN, SHELL_OPEN_FILE и т.п.)                 |

---

## User App vs System App (различие)

| Аспект           | System App (Explorer, ImageViewer, MediaPlayer)                   | User App                                                           |
| ---------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------ |
| **Расположение** | C:/Program Files/&lt;App&gt;/ (фиксированный путь)                | Любая writable директория (напр. My Documents/)                    |
| **Boot source**  | shell.local/apps/&lt;app&gt;/ (same-origin)                       | shell.local hosted route (MVP; не прямой S3 signed URL)            |
| **Token**        | Explorer: да; Viewers: нет                                        | Нет                                                                |
| **Gateway**      | Explorer: full; Viewers: none (signed URL only)                   | None                                                               |
| **Sandbox**      | Explorer: allow-scripts allow-same-origin; Viewers: allow-scripts | allow-scripts only (stricter)                                      |
| **postMessage**  | Explorer: SHELL_OPEN, SHELL_OPEN_FILE; Viewers: OPEN_FILE         | Только APP_READY, WINDOW_TITLE, ERROR (см. § Pre-Design Decisions) |
| **File scope**   | Viewers: playlist от Explorer; Explorer: full FS                  | Только package root                                                |
| **Trust**        | Trusted (repo, fixtures)                                          | **Untrusted by default**                                           |

---

## Scope

### IN — Что входит

- **App package discovery:** Директория с index.html распознаётся как user app package. Explorer показывает её как приложение (иконка app), не как обычную папку.
- **App launch:** Double click по app package → Shell открывает новое окно, создаёт iframe, загружает приложение из package root.
- **Sandbox hardening:** User app запускается в более жёстком sandbox, чем системные: без token, без privileged bridge, без доступа к системным API.
- **Directory-scoped visibility:** User app может загружать ресурсы только через относительные URL внутри package root. Попытки выйти выше root → deny.
- **Documented launch protocol:** Протокол между Shell и user app: boot, basic metadata. Read — через относительные URL внутри package root (без отдельного FS bridge в MVP).
- **Security hardening:** User app не может: открывать privileged команды Explorer, дёргать gateway write endpoints, читать чужие директории, получать token.
- **Predictable failure behavior:** Битый app package (нет index.html, entrypoint не грузится) не валит Shell; окно показывает controlled error state.

### OUT — Что не входит (Non-Goals)

- Запись вне package root
- Удаление/переименование/создание файлов из user app
- Доступ к системным viewer apps как к внутреннему API
- Shared state между разными user apps
- Полноценный permission manager UI
- Background execution / service workers за пределами sandbox политики (если не нужно для MVP)
- Subdir index.html (только root index.html в zip)

---

## Security Constraints (Compliance)

**User apps = untrusted code.** По умолчанию: deny everything; открыть только минимально необходимое.

| Правило                           | Описание                                                           |
| --------------------------------- | ------------------------------------------------------------------ |
| **No token**                      | User app никогда не получает systemToken                           |
| **No write endpoints**            | User app не может вызывать gateway write API                       |
| **No paths outside package root** | Все file operations ограничены packageRoot                         |
| **No magic exceptions**           | Любые исключения — явно документированы в FP5                      |
| **postMessage allowlist**         | Только APP_READY, WINDOW_TITLE, ERROR (см. § Pre-Design Decisions) |
| **Sandbox flags**                 | Зафиксированный базовый набор sandbox flags для user app           |
| **CSP baseline**                  | Зафиксированная CSP-политика для app package delivery              |

### Allowed (user app)

- Загрузить собственный index.html
- Читать файлы из своей директории через **относительные URL** (./assets/app.js, ./data/config.json, ./nested/icon.png) — без отдельного API
- Использовать browser APIs, не запрещённые sandbox/CSP (localStorage/IndexedDB — allow local, см. § Pre-Design Decisions)
- Отрисовывать UI внутри своего iframe

### Forbidden (user app)

- Читать что-либо выше package root
- Писать куда-либо
- Вызывать системные команды Shell без явно разрешённого протокола
- Обращаться к privileged gateway endpoints
- Получать токен Explorer
- Отправлять SHELL_OPEN, SHELL_OPEN_FILE, READ_FILE, LIST_FILES и другие privileged message types
- fetch() на внешние URL (MVP)
- Nested iframes

---

## P0 Security Risks (закрыть на design)

| #   | Risk                                                                       | Mitigation (design)                                                            |
| --- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| 1   | Неправильно выбран sandbox (allow-same-origin / слишком широкий allowlist) | Зафиксировать sandbox matrix; user app строже system viewers                   |
| 2   | Path traversal (../, URL-encoding, unicode bypass)                         | packageRoot validation; canonical path check; deny any path outside root       |
| 3   | Скрытый доступ к системным bridge сообщениям                               | postMessage allowlist; SHELL_OPEN/SHELL_OPEN_FILE только от isExplorer windows |
| 4   | User app подмена под Explorer                                              | Явная классификация isUserApp по src/path; never grant token                   |

---

## Pre-Design Decisions (закрывают блокеры перед design)

**Цель:** Убрать гадание на design-стадии. Все решения зафиксированы для MVP.

### Boot source

**Решение:** shell.local hosted route, не прямой S3 signed URL на index.html.

**Rationale:** Контролируемый origin, меньше CORS-ада, единообразная модель с system apps.

**Design note:** Требуется proxy/route (напр. `shell.local/apps/user/?path=...`), который отдаёт контент из S3 по package path. На design-стадии закрыть: route shape, маппинг URL → packageRoot, резолв относительных asset paths, запрет выхода выше root. Это delivery route, не privileged runtime API.

### Read model

| Правило                | Описание                                                                                                                   |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **No gateway API**     | User app не имеет доступа к gateway                                                                                        |
| **Relative URLs**      | Все относительные URL внутри package root разрешены автоматически (./assets/app.js, ./data/config.json, ./nested/icon.png) |
| **Above root = deny**  | Любой путь выше package root — deny                                                                                        |
| **No FS bridge в MVP** | Никакого READ_FILE, LIST_FILES, OPEN_RELATIVE через postMessage                                                            |

**Asset model:** index.html в root package; все assets — относительные пути от него. Это считается "read access" без отдельного API.

### Bridge (postMessage allowlist)

**Минимальный набор — только:**

| Type         | Direction   | Описание                  |
| ------------ | ----------- | ------------------------- |
| APP_READY    | App → Shell | Handshake                 |
| WINDOW_TITLE | App → Shell | Обновление заголовка окна |
| ERROR        | App → Shell | Сообщение об ошибке       |

**Не входят в MVP:** READ_FILE, LIST_FILES, SHELL_OPEN, SHELL_OPEN_FILE, OPEN_FILE и любые другие privileged types.

### Browser capabilities (default policy)

| Capability                   | Policy                                                            |
| ---------------------------- | ----------------------------------------------------------------- |
| **external fetch()**         | Deny (CSP connect-src или явный запрет в MVP)                     |
| **nested iframes**           | Deny                                                              |
| **localStorage / IndexedDB** | Allow local browser storage inside iframe only; без связи с Shell |

### Zip rule

Только root index.html. Subdir/index.html — OUT of scope (уже в Non-Goals).

---

## Requirements

### R1. App package detection

Директория с index.html распознаётся как user app package. В Explorer она визуально отображается как приложение. Обычная папка без index.html остаётся обычной папкой.

### R2. Launch isolation

User app открывается в отдельном iframe-окне. Каждое окно — отдельный экземпляр. Закрытие окна полностью уничтожает runtime приложения.

### R3. Package-root sandbox scope

Для каждого user app вычисляется packageRoot. Resource loading через относительные URL ограничен packageRoot. Попытка загрузить ресурс вне packageRoot (path traversal, абсолютные пути выше root) → deny. В MVP нет отдельного "file operations" API — только относительные URL.

### R4. Security model

User app не получает token. User app не получает доступ к privileged bridge Explorer. User app не может напрямую использовать write API gateway. postMessage от user app принимается только по allowlist message types.

### R5. CSP / sandbox baseline

Зафиксирован базовый набор sandbox flags для user app. Зафиксирована базовая CSP-политика для app package delivery. Политика строже, чем у системных приложений.

### R6. Predictable failure behavior

Если app package битый (нет index.html, entrypoint не грузится, CSP ломает boot): приложение не рушит Shell; окно показывает controlled error state; ошибка логируется.

### R7. Repo/process compliance

Вся спецификация живёт в docs/fps/FP5.md. Build стадия только через tests-red → implement → tests-green.

---

## Acceptance Criteria

| #   | AC                      | Описание                                                                                                                                               |
| --- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| AC1 | Discovery               | Если в директории есть index.html, Explorer показывает её как приложение. Если нет — обычная папка                                                     |
| AC2 | Launch                  | Double click по user app package открывает новое окно с iframe. Приложение стартует и рендерит UI                                                      |
| AC3 | Directory confinement   | User app может загружать ресурсы через относительные URL внутри package root. Не может загрузить вне. При попытке выхода (path traversal) → deny/error |
| AC4 | No privilege escalation | "Враждебное" приложение не может: вызвать системную команду Shell, получить token, записать через gateway, обратиться к Explorer privileged protocol   |
| AC5 | Isolation               | Два разных user app не могут читать файлы друг друга. Окна независимы                                                                                  |
| AC6 | Failure safety          | Битый app package не валит Shell. Пользователь видит controlled error state вместо зависания                                                           |

---

## Open Questions (закрыты в Pre-Design Decisions)

| #   | Question                                                | Answer                                                  |
| --- | ------------------------------------------------------- | ------------------------------------------------------- |
| 1   | User app грузится: S3 signed URL или shell.local route? | shell.local hosted route (MVP)                          |
| 2   | Нужен ли bridge кроме boot metadata?                    | Нет. Только APP_READY, WINDOW_TITLE, ERROR              |
| 3   | Разрешены ли fetch() на внешние URL?                    | Deny (MVP)                                              |
| 4   | Разрешены ли nested iframes?                            | Deny                                                    |
| 5   | Разрешён ли localStorage/IndexedDB?                     | Allow local storage inside iframe only                  |
| 6   | Zip: root index.html или subdir?                        | Только root index.html                                  |
| 7   | Sandbox flags / CSP                                     | Design stage: конкретные значения на основе boot source |

---

## Risks

| Priority | Risk                                                         | Mitigation                                                          |
| -------- | ------------------------------------------------------------ | ------------------------------------------------------------------- |
| P0       | Sandbox too permissive; path traversal; hidden bridge access | Design: sandbox matrix, path policy, postMessage allowlist          |
| P1       | Битые app packages зависают; app DOS-ит себя тяжёлым JS      | Controlled error state; handshake timeout; consider resource limits |
| P2       | UX-путаница "папка" vs "приложение"; нестабильность delivery | Clear visual distinction; documented protocol                       |

---

## Dependencies

- FP1 (Shell, WindowManager, AppHost)
- FP2 (Gateway FS API, list, stat, open-url)
- FP3 (Explorer, app-dir discovery, SHELL_OPEN, isApp)
- FP4 (Viewers, OPEN_FILE, sandbox allow-scripts for non-Explorer)
- docs/core/PROTOCOL_v0.md (extend for user app)
- docs/core/API.yaml (shell.local route — **delivery route**, не privileged runtime API; design определит proxy/route для user app content)

---

## Plan / Milestones

| #   | Milestone          | Описание                                                                              |
| --- | ------------------ | ------------------------------------------------------------------------------------- |
| M0  | FP5 plan           | Зафиксировать scope, non-goals, security boundaries, open questions в docs/fps/FP5.md |
| M1  | FP5 design         | Protocol, sandbox matrix, package-root path policy, component/data flow, test matrix  |
| M2  | Tests-red          | Discovery tests, path confinement tests, hostile app deny tests, launch failure tests |
| M3  | Build              | Реализовать discovery + launch + sandbox + root confinement                           |
| M4  | Security hardening | Adversarial tests, protocol deny paths, origin/source validation                      |
| M5  | Release gate       | Full PASS audit                                                                       |

---

## Tests (planning only)

**Направления тестирования (без реализации на plan-стадии):**

- **Discovery:** Dir с index.html → isApp=true; без index.html → isApp=false
- **Launch:** Double click app-dir → new window, iframe src from package root
- **Path confinement:** User app request path outside packageRoot → deny
- **Hostile app:** App пытается SHELL_OPEN, получить token, вызвать write API → deny
- **postMessage allowlist:** User app отправляет non-allowlist type → ignore/reject
- **Failure safety:** Битый package (no index.html, 404) → controlled error, Shell stable
- **Isolation:** Два user app не видят файлы друг друга

---

## Evidence (for release)

- [x] AC1–AC6 evidence mapped (FP5_TESTS.md, FP5_SECURITY_DOD)
- [x] Tests green — FP5 unit 8/8 + integration 8/8 PASS (docs/audit/FP5_AUDIT_REPORT.md)
- [x] Docs updated (FP5.md, FP5_TESTS.md, FP5_SECURITY_DOD)
- [x] Security audit passed — M4 audit: PASS (docs/audit/FP5_AUDIT_REPORT.md)

---

## Design Package (M1)

| Artifact                                                   | Purpose                                              |
| ---------------------------------------------------------- | ---------------------------------------------------- |
| [docs/dev/DESIGN_LOG_FP5_1.md](../dev/DESIGN_LOG_FP5_1.md) | Contradictions scan, patchset, decisions             |
| [docs/core/API_FP5_DELTA.md](../core/API_FP5_DELTA.md)     | Hosted route shape, path confinement, failure states |
| [docs/core/UX_FP5_1.md](../core/UX_FP5_1.md)               | Failure-state UX matrix                              |
| [docs/dev/FP5_SECURITY_DOD.md](../dev/FP5_SECURITY_DOD.md) | Sandbox matrix, CSP baseline, security checklist     |
| [docs/tests/FP5_TESTS.md](../tests/FP5_TESTS.md)           | Build-ready test plan                                |
| [docs/core/PROTOCOL_v0.md](../core/PROTOCOL_v0.md)         | FP5 protocol extensions (canonical)                  |
| [docs/core/ARCH_DIAGRAMS.md](../core/ARCH_DIAGRAMS.md)     | §7 FP5 User App Launch sequence                      |

---

## Known Limitations

| Issue | Source | Mitigation |
| ----- | ------ | ---------- |
| "The Components object is deprecated" | Godot Web runtime (GDExtension/JS glue) | Outside our control; fix in Godot engine. Document only. |
| "An iframe which has both allow-scripts and allow-same-origin can remove its sandboxing" | Browser security warning | Explorer and user apps use allow-same-origin for Godot sessionStorage. Intentional design choice. |
| "Secure Context - Check web server configuration (use HTTPS)" | Godot Web export | Godot requires HTTPS. Use https://shell.local; run `./infra/certs/generate.sh` first. |

---

## Troubleshooting

### Reading logs

- **Gateway:** `docker compose -f infra/docker-compose.dev.yml logs gateway` — JSON logs with `event`, `path`, `subpath`, `durationMs`, `status`. Events: `fs_serve_user_app`, `serve_user_app_error`, `slow_request`.
- **Frontend:** DevTools Console — `[Shell]` prefix for analytics (window_open, app_ready, handshake_timeout, message_rejected). `[AppHost]` for lifecycle (loading, iframe load, APP_READY duration).
- **Vite proxy:** `[Vite user-app proxy]` — request URL, response status, duration, errors.

### "App not responding"

Typical causes:

1. **CSP blocks inline script/style** — Godot Web export uses inline `<style>` and `<script>`. Fixed by `unsafe-inline` in user app CSP (see FP5_SECURITY_DOD).
2. **CSP blocks WebAssembly** — Godot uses `WebAssembly.instantiateStreaming()`. Fixed by `wasm-unsafe-eval` in script-src (see FP5_SECURITY_DOD).
3. **Handshake timeout** — App did not send APP_READY within 2s. Check: CSP blocked boot, script error, wrong postMessage target.
4. **Sandbox** — User apps need `allow-same-origin` for Godot sessionStorage. AppHost grants it for user apps.

### "The Components object is deprecated"

Игнорировать; источник — Godot Web runtime. Исправление в Godot engine.

### Godot requirements

- **HTTPS (Secure Context):** Godot Web export requires HTTPS. Use `https://shell.local` in dev. Run `./infra/certs/generate.sh` once before first compose up.
- Export: HTML5 template with inline scripts/styles and WebAssembly (`wasm-unsafe-eval`) allowed by CSP.
- Must send `APP_READY` via postMessage to parent after boot.
- Large .pck/.wasm — check gateway `slow_request` logs; consider caching.

---

## DoD Checklist (plan stage)

- [x] Scope зафиксирован
- [x] Non-goals зафиксированы
- [x] Security constraints зафиксированы
- [x] Open Questions перечислены
- [x] Milestones M0..M5 зафиксированы
- [x] Не создано новых постоянных docs

---

## Design DoD Checklist (design stage)

- [x] FP5.md не содержит архитектурных противоречий
- [x] hosted route shape зафиксирован (API_FP5_DELTA)
- [x] package-root confinement model зафиксирован
- [x] sandbox flags для user app зафиксированы (FP5_SECURITY_DOD)
- [x] CSP baseline зафиксирован
- [x] protocol additions в PROTOCOL_v0.md определены
- [x] privileged message types явно запрещены
- [x] failure states описаны (UX_FP5_1)
- [x] security checklist собран
- [x] test plan для build собран (FP5_TESTS)
- [x] TEMP docs помечены как TEMP(FP5.1)
- [x] не создано лишних постоянных docs
