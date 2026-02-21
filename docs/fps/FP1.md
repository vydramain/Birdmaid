# FP1: Shell MVP — окна + таскбар + AppHost

**Status:** released  
**Created:** 2025-02-18  
**Updated:** 2025-02-18

> **Immutable decisions (FP1):** S3 не из браузера; Shell↔App через postMessage; Shell владеет окнами, Apps — контентом.

## Intent Analysis

Shell — браузерный "оконный менеджер" + "панель задач" + "хост" для iframe-приложений. FP1 доказывает, что рантайм окон устойчивый, тестируемый и запускается по доменному имени.

## Scope

Что входит в этот FP:

- Desktop + Taskbar
- Window chrome (98-style): drag, resize, min/max/close
- Z-order, focus, keyboard ESC/Alt+Tab (минимум)
- AppHost: создание iframe, lifecycle (mount/unmount), handshake
- Тестовое iframe-приложение (APP_READY, WINDOW_TITLE)
- Доступ по доменному имени (shell.local в dev)

Что НЕ входит:

- S3 / FS / Backend Gateway
- Explorer App
- Реальные viewers (image/video/audio/text)

## Acceptance Criteria

| ID  | Критерий                                                                                       |
| --- | ---------------------------------------------------------------------------------------------- |
| A   | Доступ по shell.local, SPA routing, /health → 200                                              |
| B   | Desktop, окна (normal/minimized/maximized/closed), close размонтирует iframe                   |
| C   | Drag за titlebar, resize по граням, без дрожания, minWidth/minHeight                           |
| D   | Z-order/focus: клик → active, active chrome, клик по Desktop — фиксированное поведение         |
| E   | Taskbar: кнопка на окно, клик → focus/restore, подсветка active                                |
| F   | AppHost: iframe + sandbox, handshake (APP_READY, SHELL_CAPS), WINDOW_TITLE обновляет заголовок |

**AC breakdown (для E2E 1:1):**

| AC  | Assert                                           |
| --- | ------------------------------------------------ |
| A1  | shell.local открывается                          |
| A2  | /health = 200                                    |
| B1  | createWindow создаёт запись в WindowManager      |
| B2  | close удаляет запись и iframe из DOM             |
| C1  | drag clamp: titlebar остаётся в viewport         |
| D1  | клик → active; клик по Desktop → activeId = null |
| E1  | taskbar button → focus/restore; подсветка active |
| F1  | APP_READY → SHELL_CAPS                           |
| F2  | WINDOW_TITLE → chrome + taskbar title обновлён   |

### AC → planned tests

| AC  | Test case ID | Assert / coverage                                                            |
| --- | ------------ | ---------------------------------------------------------------------------- |
| A1  | e2e-fp1-a1   | shell.local opens, page loads                                                |
| A2  | e2e-fp1-a2   | GET /health returns 200                                                      |
| B1  | unit-wm-b1   | createWindow adds entry to WindowManager state                               |
| B2  | e2e-fp1-b2   | close removes iframe from DOM, `querySelectorAll('iframe').length` decreases |
| C1  | e2e-fp1-c1   | drag clamp: titlebar stays in viewport                                       |
| D1  | e2e-fp1-d1   | click → active; click Desktop → activeId = null                              |
| E1  | e2e-fp1-e1   | taskbar button → focus/restore; active highlight                             |
| F1  | e2e-fp1-f1   | APP_READY → SHELL_CAPS sent                                                  |
| F2  | e2e-fp1-f2   | WINDOW_TITLE → chrome + taskbar title updated                                |

## Questions

| #   | Question                                                            | Answer                                                                                | Status |
| --- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ------ |
| 1   | Клик по Desktop: снимает focus или оставляет последнее окно active? | Клик по Desktop снимает active (activeId = null), z-order сохраняется                 | closed |
| 2   | Клик по active taskbar button: минимизировать или ничего?           | Если active и не minimized → minimize; если minimized → restore+focus                 | closed |
| 3   | Минимальные sandbox атрибуты для iframe?                            | sandbox="allow-scripts", без allow-same-origin; без allow-popups/top-navigation/forms | closed |

## Decisions (ADRs)

| #   | Decision                                                       | Rationale                               | Status   |
| --- | -------------------------------------------------------------- | --------------------------------------- | -------- |
| 1   | S3 нельзя дергать из браузера                                  | Ключи, CORS, контроль доступа           | accepted |
| 2   | Shell ↔ App через postMessage                                  | Жёсткий контракт, sandbox               | accepted |
| 3   | Shell владеет окнами, Apps — контентом                         | Разделение ответственности              | accepted |
| 4   | Backend gateway для FS (FP2)                                   | Листинг, signed URLs, виртуальные корни | accepted |
| 5   | Drag bounds: titlebar всегда в viewport (clamp)                | Нельзя "утащить" окно и потерять доступ | accepted |
| 6   | Alt+Tab: MRU (most recently used), restore+focus для minimized | Классический UX, предсказуемость        | accepted |
| 7   | Handshake timeout 2000ms; placeholder "App not responding"     | Детерминизм, отладка                    | accepted |
| 8   | Dev domain: Traefik + docker-compose                           | Единый путь, повторяет прод маршрут     | accepted |

## Requirements

### Use Cases

**Main Flow:**

1. Открыть Shell по shell.local
2. Создать окно (тестовое приложение в iframe)
3. Перетащить окно за titlebar
4. Ресайзнуть окно по граням
5. Minimize / restore через taskbar
6. Close — окно и iframe уничтожаются

**Alternate Flows:**

- Maximize / unmaximize
- ESC / Alt+Tab для focus
- Клик по taskbar button: active+visible → minimize; minimized → restore+focus
- Клик по Desktop → activeId = null (z-order сохраняется)
- Theme switch, scale switch

**Error Flows:**

- Handshake timeout (2000ms) — логирование, окно показывает placeholder "App not responding"

### Business Rules

- minWidth / minHeight чтобы окно не схлопывалось
- Sandbox iframe по умолчанию
- Handshake timeout 2000ms; placeholder текст "App not responding"

### Validations

- **Drag bounds:** окно может частично выходить за viewport, но titlebar всегда остаётся доступным. При drag позиция ограничена так, чтобы область titlebar (24–32px по высоте) всегда пересекалась с viewport (clamp).
- Resize не меньше minWidth/minHeight

## UX Map

| CTA           | Endpoint | State            | Page  | Mock | Status |
| ------------- | -------- | ---------------- | ----- | ---- | ------ |
| open_window   | —        | ui.window_open   | Shell | yes  | todo   |
| drag_window   | —        | ui.dragging      | Shell | yes  | todo   |
| resize_window | —        | ui.resizing      | Shell | yes  | todo   |
| taskbar_click | —        | ui.focus/restore | Shell | yes  | todo   |
| switch_theme  | —        | ui.theme_changed | Shell | yes  | todo   |
| switch_scale  | —        | ui.scale_changed | Shell | yes  | todo   |

## Architecture

### Components

- **WindowManager:** create/minimize/maximize/close, z-order, focus
- **Taskbar:** список окон, active, restore/minimize
- **AppHost:** iframe, sandbox, postMessage, lifecycle
- **Desktop:** обои, поверхность

### Diagrams

See [docs/core/ARCH_DIAGRAMS.md](../core/ARCH_DIAGRAMS.md):

- Component diagram (WindowManager, Desktop, Taskbar, AppHost, Theme/Scale providers)
- Sequence: createWindow → iframe mount → APP_READY → SHELL_CAPS → WINDOW_TITLE
- Focus/z-order update path
- Taskbar click path

## Customization & Design System (v0)

**Goal:** Поведение Shell (window lifecycle, z-order, focus, таскбар, AppHost) не зависит от визуального дизайна.

**Contract:**

- **Tokens:** вся визуальная геометрия/цвета/типографика/анимации выражены через tokens (CSS variables)
- **Slots:** визуальные компоненты могут быть заменены без изменения ядра (WindowManager/AppHost)
- **Scaling:** scale-factor применяется к chrome/taskbar/fonts через tokens

**Token schema v0 (минимум):**

| Category   | Tokens                                                                                                                |
| ---------- | --------------------------------------------------------------------------------------------------------------------- |
| Geometry   | `--wm-titlebar-height`, `--wm-border-width`, `--wm-taskbar-height`, `--wm-window-min-width`, `--wm-window-min-height` |
| Spacing    | `--wm-gap-1`, `--wm-gap-2`, `--wm-padding-1`, `--wm-padding-2`                                                        |
| Typography | `--wm-font-family`, `--wm-font-size`                                                                                  |
| Colors     | `--wm-bg`, `--wm-fg`, `--wm-border`, `--wm-accent`, `--wm-shadow`                                                     |
| Motion     | `--wm-anim-duration`, `--wm-anim-ease`                                                                                |
| Scaling    | `--wm-scale` (1.0, 1.25, 1.5, 2.0)                                                                                    |

**Slots v0 (заменяемые визуальные слои):**

- DesktopView
- WindowChromeView (titlebar + controls + resize handles визуально)
- TaskbarView
- TaskbarItemView

**Units & scaling rule:**

- `--wm-scale` — единственный рычаг масштаба
- Все геометрические токены: `calc(var(--base) * var(--wm-scale))`, напр. `--wm-titlebar-height: calc(var(--wm-titlebar-height-base, 28px) * var(--wm-scale))`
- Запрет: прямые px в chrome/taskbar компонентах (кроме 1px hairline при необходимости)

**Slot API (минимально):**

- Shell принимает `uiAdapter` (объект компонентов) или использует дефолтный
- `uiAdapter.WindowChromeView`, `uiAdapter.TaskbarView`, `uiAdapter.TaskbarItemView`, `uiAdapter.DesktopView`
- Контракт props: `window`, `isActive`, `actions` (minimize/maximize/close/focus), `theme`, `scale`

**Rule:** WindowManager и AppHost не имеют права импортировать CSS/иконки напрямую; только через tokens/slots.

## Tests

### UAT/BDD

- [ ] UAT 1: Открыть 3 окна, перетащить, ресайзнуть, minimize/restore, close
- [ ] UAT 2: Проверить WINDOW_TITLE обновляет заголовок окна и taskbar
- [ ] UAT 3: Close удаляет iframe из DOM
- [ ] UAT 4: Theme switch (DefaultMock ↔ Win98Mock) без reload
- [ ] UAT 5: Scale switch (1.0 ↔ 1.5) — drag/resize остаётся корректным

**Конкретные asserts:**

- После close: `document.querySelectorAll('iframe').length` уменьшается
- После WINDOW_TITLE: taskbar button содержит новый текст
- После theme switch: хотя бы один token `getComputedStyle` изменился
- После scale switch: `getComputedStyle` height titlebar/taskbar изменился

### Test Files

- Unit: `front/__tests__/fp1/WindowManager.test.ts` (z-order, focus, transitions)
- E2E: `e2e/fp1-shell.spec.ts` (Playwright)

### Coverage

- Frontend: целевой минимум по WindowManager

## Definition of Done

**Код:**

- WindowManager (список окон, позиции, состояния, activeId)
- Taskbar (чтение состояния, команды focus/minimize/restore)
- AppHost (iframe, postMessage listeners, удаление при close)
- Sandbox по умолчанию

**Тесты:**

- Unit: z-order/focus, переходы состояний окна
- E2E (Playwright): 3 окна, drag/resize, minimize/restore, close, iframe удалён, WINDOW_TITLE, theme/scale switch

**Customization DoD:**

- Theme switch: две темы (DefaultMock, Win98Mock) переключаются runtime без reload
- Scale switch: scale 1.0 ↔ 1.5 меняет titlebar/taskbar/fonts, drag/resize остаётся корректным
- Evidence: 4 скриншота (theme A scale 1.0, theme A scale 1.5, theme B scale 1.0, theme B scale 1.5)
- No magic geometry: размеры chrome/taskbar/min sizes читаются из tokens

**Dev:**

- `pnpm dev` (или аналог)
- shell.local через Traefik + docker-compose (hosts + reverse proxy на фронт dev-server)

**Evidence:**

- docs/fps/FP1.md заполнен
- archive/FP1/evidence/demo-notes.md
- archive/FP1/evidence/e2e-video.webm или скриншоты
- 4 скриншота кастомизации: theme A scale 1.0, theme A scale 1.5, theme B scale 1.0, theme B scale 1.5

## Metrics

### Success Metrics

- North Star: Shell доступен по доменному имени, окна работают без регрессий
- Supporting: время до первого запуска, количество регрессий

### Events

- window_open, window_close, window_minimize, window_restore, window_maximize, window_unmaximize
- window_focus, drag_end, resize_end, taskbar_click
- app_ready, handshake_timeout, message_rejected
- fps_drop_suspected (опционально)

## Plan

| Milestone | Tasks                                                 | Status | Notes                                       |
| --------- | ----------------------------------------------------- | ------ | ------------------------------------------- |
| M1        | Доменное имя (hosts + proxy)                          | done   | package.json, Vite, /health, docker-compose |
| M2        | TESTS-RED (unit + e2e)                                | done   | 14 unit fail, A1/A2 e2e pass, B2..F2 fail   |
| M3        | WindowManager + Desktop + Taskbar + AppHost + TestApp | done   | Implement                                   |
| M4        | ThemeProvider + ScaleProvider (tokens)                | done   | CSS vars, 2 themes, 2 scales                |
| M5        | TESTS-GREEN + analytics                               | done   | Fix tests, add events                       |
| M6        | Security + UX check + Release gate                    | done   | Compliance, DoD                             |

## Risks

| Risk                               | Probability | Impact | Mitigation                                 | Status |
| ---------------------------------- | ----------- | ------ | ------------------------------------------ | ------ |
| Layout thrash при drag/resize      | medium      | high   | transform/translate, requestAnimationFrame | open   |
| Pointer events / z-index конфликты | medium      | medium | Чёткая иерархия слоёв                      | open   |
| Handshake timeout                  | low         | low    | Таймаут N сек, логирование                 | open   |

## Dependencies

- Нет внешних (FP1 изолирован)

## Artifacts

- Coverage: `artifacts/FP1/.../coverage/...`
- Evidence: `archive/FP1/evidence/demo-notes.md`, `archive/FP1/evidence/e2e-video.webm`

## Что дальше делать (порядок действий)

1. **Dev domain:** shell.local через Traefik (docker-compose) + hosts (M1)
2. **Skeleton implementation:** WindowManager (headless), WindowChrome/Taskbar (views), ThemeProvider + ScaleProvider (tokens), TestApp iframe + postMessage
3. **Тесты:** Unit (state transitions, z-order), E2E (3 окна, drag/resize, taskbar toggle, close, theme/scale switch)

## Handoff на mode=design (DONE)

**Design artifacts (build-ready):**

| Artifact       | Path                                                               | Content                                                                                 |
| -------------- | ------------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| Protocol v0    | [docs/core/PROTOCOL_v0.md](../core/PROTOCOL_v0.md)                 | Message types, payload schema, origin rules, handshake state machine, examples, metrics |
| Sandbox matrix | [docs/core/SANDBOX_MATRIX.md](../core/SANDBOX_MATRIX.md)           | appType=fp1-testapp, sandbox attrs, allow list, FP5 extension note                      |
| Theming v0     | [docs/core/THEMING_v0.md](../core/THEMING_v0.md)                   | Token schema, scale, theme packs, no magic geometry, test asserts                       |
| UI Adapter v0  | [docs/core/UI_ADAPTER_v0.md](../core/UI_ADAPTER_v0.md)             | Slot API, props contract, TypeScript types                                              |
| Arch diagrams  | [docs/core/ARCH_DIAGRAMS.md](../core/ARCH_DIAGRAMS.md)             | Component + sequence diagrams                                                           |
| Dev domain     | [docs/dev/DEV_DOMAIN.md](../dev/DEV_DOMAIN.md)                     | shell.local, /etc/hosts, ports, commands, /health                                       |
| Docker Compose | [infra/docker-compose.dev.yml](../../infra/docker-compose.dev.yml) | Traefik + dev-server (ADR#8), canonical                                                 |

**AC → planned tests:** see table below.

## Reflection

**What went well:**

- M1–M6 milestones completed; all tests green
- Security (sandbox, postMessage) and UX (taskbar, desktop, clamp) соответствуют spec
- Analytics events wired; release gate PASS

**Risks:**

- protocol.ts localhost/127.0.0.1 prefix match — acceptable for dev; prod hardening in FP2+
- Layout thrash, pointer events — mitigated by current implementation; monitor

**Next focus:**

- mode=design → FP2

## Evidence

### M1 (dev-domain shell.local) — done

**Files added/changed:**

- `package.json` — pnpm, vite, react
- `vite.config.ts` — Vite + React, /health middleware (enforce: pre)
- `tsconfig.json`, `tsconfig.node.json` — TypeScript
- `index.html` — SPA entry
- `front/main.tsx`, `front/App.tsx`, `front/index.css` — Shell placeholder
- `infra/docker-compose.dev.yml` — Traefik + dev-server (canonical)
- `docs/dev/DEV_DOMAIN.md` — hosts, ports, commands, /health

**Commands:**

- `pnpm dev` — dev server on :5173
- `curl http://localhost:5173/health` → `{"status":"ok"}`
- `docker compose -f infra/docker-compose.dev.yml up -d` — Traefik + dev-server (canonical)
- `http://shell.local` — requires `127.0.0.1 shell.local` in /etc/hosts (see [DEV_DOMAIN.md](../dev/DEV_DOMAIN.md))

**Test commands (M2):**

- `pnpm lint`, `pnpm test`, `pnpm test:e2e` — to be added in M2

**DoD checklist (M1):**

- [x] shell.local открывается в браузере (после `127.0.0.1 shell.local` в /etc/hosts + `docker compose up`)
- [x] GET http://shell.local/health → 200
- [x] В репо есть compose + дока по запуску ([DEV_DOMAIN.md](../dev/DEV_DOMAIN.md))

### M2 (TESTS-RED) — done

**Files added/changed:**

- `front/core/WindowManager.ts` — stub (throws Not implemented)
- `front/__tests__/fp1/WindowManager.test.ts` — 14 unit tests (AC B1, transitions, z-order, focus, updateBounds)
- `e2e/fp1-shell.spec.ts` — E2E A1..F2, theme/scale asserts
- `vitest.config.ts` — Vitest + jsdom
- `playwright.config.ts` — Playwright baseURL, webServer
- `eslint.config.js` — ESLint flat config
- `front/index.css` — tokens for scale test (--wm-titlebar-height-base, --wm-scale)

**Test results (tests-red):**

- Unit: 14 failed (Not implemented)
- E2E: A1 ✓, A2 ✓, B2 ✗, C1 ✗, D1 ✗, E1 ✗, F1 ✗, F2 ✗, theme skip, scale ✓

**Commands:**

- `pnpm lint` — ESLint (front, e2e, vite.config, playwright.config)
- `pnpm test` — unit (Vitest, front/**tests**/fp1/)
- `pnpm test:e2e` — E2E (Playwright, e2e/fp1-shell.spec.ts)

**DoD checklist (M2 tests-red):**

- [x] Unit тесты существуют и падают по делу (Not implemented)
- [x] E2E существуют; A1/A2 проходят, остальные падают ожидаемо
- [x] Команды запуска тестов задокументированы

### M3 (IMPLEMENT core) — done

**Files added/changed:**

- `front/core/WindowManager.ts` — full implementation (create, close, minimize, maximize, restore, focus, z-order, updateBounds, onTaskbarItemClick)
- `front/core/types.ts` — UI Adapter types (ThemeTokenSet, WindowState, WindowActions, TaskbarItemState)
- `front/core/protocol.ts` — allowlist, createShellCaps
- `front/core/AppHost.tsx` — iframe mount, postMessage bridge (origin allowlist, event.source routing, targetOrigin=event.origin, handshake 2000ms)
- `front/ui/DesktopView.tsx`, `WindowChromeView.tsx`, `TaskbarView.tsx`, `TaskbarItemView.tsx` — default slot components
- `front/Shell.tsx` — Shell wiring (WM + Desktop + Taskbar + AppHost, drag/resize, clamp)
- `public/testapp.html` — TestApp (APP_READY, WINDOW_TITLE)
- `front/index.css` — THEMING_v0 tokens
- `front/App.tsx` — uses Shell

**Test results (M3):**

- Unit: 14 passed
- E2E: A1 ✓, A2 ✓, B2 ✓, C1 ✓, D1 ✓, E1 ✓, F1 ✓, F2 ✓, theme skip, scale ✓

**DoD checklist (M3):**

- [x] Окна реально создаются/закрываются/фокусируются
- [x] Taskbar отображает окна и переключает состояния по UX rules
- [x] iframe появляется и исчезает при open/close
- [x] PROTOCOL_v0 соблюдён (allowlist, event.source, targetOrigin, timeout)
- [x] Без магической геометрии: размеры из tokens (THEMING_v0)

### M4 (Theme/Scale) — done

**Files added/changed:**

- `front/core/themePacks.ts` — DefaultMock, Win98Mock (THEMING_v0)
- `front/core/ThemeScaleProvider.tsx` — applies theme + scale tokens to root
- `front/core/AppHost.tsx` — resend SHELL_CAPS when theme/scale changes (readyRef)
- `front/Shell.tsx` — ThemeScaleProvider, theme/scale state, Switch theme/scale buttons

**Test results (M4):**

- E2E: Theme switch ✓, Scale switch ✓ (computedStyle asserts pass)

**DoD checklist (M4):**

- [x] 2 темы переключаются (DefaultMock ↔ Win98Mock)
- [x] scale 1.0/1.5 переключается
- [x] computedStyle asserts из e2e выполняются
- [x] resend SHELL_CAPS при смене theme/scale реализован

### M5 (TESTS-GREEN + analytics) — done

**Files added/changed:**

- `front/core/analytics.ts` — events module (emit, getBuffer, clearBuffer), console.debug + buffer (max 200)
- `front/core/WindowManager.ts` — analytics.window_open/close/minimize/restore/maximize/unmaximize/focus, taskbar_click
- `front/Shell.tsx` — analytics.drag_end, analytics.resize_end (on mouseUp)
- `front/core/AppHost.tsx` — analytics.app_ready, handshake_timeout, message_rejected

**Events (PROTOCOL_v0 mapping):**

| Event             | Source                           | Payload         |
| ----------------- | -------------------------------- | --------------- |
| window_open       | WindowManager.createWindow       | windowId        |
| window_close      | WindowManager.close              | windowId        |
| window_minimize   | WindowManager.minimize           | windowId        |
| window_restore    | WindowManager.restore            | windowId        |
| window_maximize   | WindowManager.maximize           | windowId        |
| window_unmaximize | WindowManager.unmaximize         | windowId        |
| window_focus      | WindowManager.focus              | windowId        |
| drag_end          | Shell.onMouseUp (after drag)     | windowId        |
| resize_end        | Shell.onMouseUp (after resize)   | windowId        |
| taskbar_click     | WindowManager.onTaskbarItemClick | windowId        |
| app_ready         | AppHost (APP_READY received)     | windowId        |
| handshake_timeout | AppHost (timeout)                | windowId        |
| message_rejected  | AppHost (origin/source reject)   | reason, origin? |

**Test results (M5):**

- `pnpm lint` — PASS
- `pnpm test` — 14 unit PASS
- `pnpm test:e2e` — 10 E2E PASS

**Commands:**

- `pnpm lint` — ESLint (front, e2e, vite.config, playwright.config)
- `pnpm test` — unit (Vitest, front/**tests**/fp1/)
- `pnpm test:e2e` — E2E (Playwright, e2e/fp1-shell.spec.ts)

**DoD checklist (M5):**

- [x] pnpm lint PASS
- [x] unit PASS (14)
- [x] e2e PASS (10)
- [x] События эмитятся в ключевых точках (window\_\*, drag_end, resize_end, taskbar_click, app_ready, handshake_timeout, message_rejected)

### M6 (Release gate prep) — done

**Security checklist (@Compliance):**

| Check                        | SANDBOX_MATRIX / PROTOCOL_v0                                                                | Implementation                                                           | Result |
| ---------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | ------ |
| iframe sandbox               | `allow-scripts` only; no allow-same-origin, allow-popups, allow-top-navigation, allow-forms | AppHost.tsx: `sandbox="allow-scripts"`                                   | PASS   |
| postMessage targetOrigin     | Never use `"*"`                                                                             | AppHost: `win.postMessage(data, origin)` — uses event.origin             | PASS   |
| Origin allowlist             | Configured list                                                                             | protocol.ts: ALLOWED_ORIGINS + isAllowedOrigin                           | PASS   |
| Routing by event.source      | event.source must equal contentWindow for some windowId                                     | AppHost: sourceToWindowIdRef, iframeRef.contentWindow check              | PASS   |
| unknown_source rejection     | message_rejected, log, ignore                                                               | AppHost: `!knownWindowId` → analytics.message_rejected("unknown_source") | PASS   |
| origin_not_allowed rejection | message_rejected, log, ignore                                                               | AppHost: `!isAllowedOrigin(origin)` → analytics.message_rejected         | PASS   |

**Note:** protocol.ts allows `origin.startsWith("http://localhost")` / `origin.startsWith("http://127.0.0.1")` — acceptable for FP1 dev; consider explicit allowlist for prod (FP2+).

**UX checklist (@Product Lead + @Designer):**

| Check              | FP1 Q2 / ADR#5 / Requirements                        | Implementation                                      | E2E          | Result |
| ------------------ | ---------------------------------------------------- | --------------------------------------------------- | ------------ | ------ |
| Taskbar toggle     | active+visible → minimize; minimized → restore+focus | WindowManager.onTaskbarItemClick                    | E1           | PASS   |
| Desktop click      | activeId = null, z-order preserved                   | Shell.handleDesktopClick → wm.focusDesktop          | D1           | PASS   |
| Titlebar clamp     | titlebar always in viewport                          | Shell.clampDrag (minY=0, maxY=vh-th, minX, maxX)    | C1           | PASS   |
| Theme/scale switch | no break of drag/resize                              | ThemeScaleProvider, tokens; E2E theme/scale asserts | theme, scale | PASS   |

**Release gate:**

| Criterion           | Status  |
| ------------------- | ------- |
| pnpm lint           | PASS    |
| unit (14)           | PASS    |
| e2e (10)            | PASS    |
| Security checklist  | PASS    |
| UX checklist        | PASS    |
| Evidence documented | done    |
| demo-notes          | updated |

**Gate decision: PASS**

**Reasons:**

- All acceptance criteria (A–F) covered by green tests
- Security: sandbox, postMessage, allowlist, routing, rejections соответствуют SANDBOX_MATRIX и PROTOCOL_v0
- UX: taskbar toggle, desktop click, titlebar clamp, theme/scale switch соответствуют FP1 decisions
- No functional changes required; scope met

**Commands:**

- `pnpm lint` — ESLint
- `pnpm test` — unit (Vitest)
- `pnpm test:e2e` — E2E (Playwright)

**DoD checklist (M6):**

- [x] Security checklist PASS
- [x] UX checklist PASS
- [x] FP1 release gate заполнен
- [x] Gate decision: PASS

---

## FP1 Freeze Index

**Purpose:** Canonical snapshot for external review and FP2+ handoff. No code changes after freeze.

### Key implementation files

| Component            | Path                                |
| -------------------- | ----------------------------------- |
| WindowManager        | `front/core/WindowManager.ts`       |
| AppHost              | `front/core/AppHost.tsx`            |
| protocol / allowlist | `front/core/protocol.ts`            |
| analytics            | `front/core/analytics.ts`           |
| ThemeScaleProvider   | `front/core/ThemeScaleProvider.tsx` |
| theme packs          | `front/core/themePacks.ts`          |
| Shell                | `front/Shell.tsx`                   |
| DesktopView          | `front/ui/DesktopView.tsx`          |
| WindowChromeView     | `front/ui/WindowChromeView.tsx`     |
| TaskbarView          | `front/ui/TaskbarView.tsx`          |
| TaskbarItemView      | `front/ui/TaskbarItemView.tsx`      |
| TestApp              | `public/testapp.html`               |

### Key design documents

| Doc            | Path                          |
| -------------- | ----------------------------- |
| PROTOCOL v0    | `docs/core/PROTOCOL_v0.md`    |
| THEMING v0     | `docs/core/THEMING_v0.md`     |
| UI_ADAPTER v0  | `docs/core/UI_ADAPTER_v0.md`  |
| SANDBOX_MATRIX | `docs/core/SANDBOX_MATRIX.md` |
| ARCH_DIAGRAMS  | `docs/core/ARCH_DIAGRAMS.md`  |
| DEV_DOMAIN     | `docs/dev/DEV_DOMAIN.md`      |

### Archive

| Item        | Path                                                 |
| ----------- | ---------------------------------------------------- |
| FP1 archive | `archive/FP1/`                                       |
| evidence    | `archive/FP1/evidence/demo-notes.md`                 |
| transcripts | `archive/FP1/transcripts/` (optional, copy manually) |
| reports     | `archive/FP1/reports/` (optional)                    |

### Gate Commands

| Command                  | Expected exit   | E2E in DoD |
| ------------------------ | --------------- | ---------- |
| `git status --porcelain` | 0 (empty)       | —          |
| `./infra/smoke.sh`       | 0 (PLATFORM OK) | —          |
| `./infra/test-lint.sh`   | 0               | —          |
| `./infra/test-unit.sh`   | 0 (unit)        | —          |
| `./infra/test-e2e.sh`    | 0               | **yes**    |

**Canonical (container):** `./infra/gate.sh FP1`. Host-only: `git status`, `./infra/smoke.sh`. Host `pnpm lint/test/etc` prohibited for gate. Prerequisite: `docker compose -f infra/docker-compose.dev.yml up -d`.

### Verification commands

| Command                             | Expected          |
| ----------------------------------- | ----------------- |
| `pnpm lint`                         | PASS (0 warnings) |
| `pnpm test`                         | 14 unit PASS      |
| `pnpm test:e2e`                     | 10 E2E PASS       |
| `curl http://localhost:5173/health` | `{"status":"ok"}` |
