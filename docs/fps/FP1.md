# FP1: Shell MVP — окна + таскбар + AppHost

**Status:** plan  
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

| ID | Критерий |
|----|----------|
| A | Доступ по shell.local, SPA routing, /health → 200 |
| B | Desktop, окна (normal/minimized/maximized/closed), close размонтирует iframe |
| C | Drag за titlebar, resize по граням, без дрожания, minWidth/minHeight |
| D | Z-order/focus: клик → active, active chrome, клик по Desktop — фиксированное поведение |
| E | Taskbar: кнопка на окно, клик → focus/restore, подсветка active |
| F | AppHost: iframe + sandbox, handshake (APP_READY, SHELL_CAPS), WINDOW_TITLE обновляет заголовок |

**AC breakdown (для E2E 1:1):**

| AC | Assert |
|----|--------|
| A1 | shell.local открывается |
| A2 | /health = 200 |
| B1 | createWindow создаёт запись в WindowManager |
| B2 | close удаляет запись и iframe из DOM |
| C1 | drag clamp: titlebar остаётся в viewport |
| D1 | клик → active; клик по Desktop → activeId = null |
| E1 | taskbar button → focus/restore; подсветка active |
| F1 | APP_READY → SHELL_CAPS |
| F2 | WINDOW_TITLE → chrome + taskbar title обновлён |

## Questions

| # | Question | Answer | Status |
|---|----------|--------|--------|
| 1 | Клик по Desktop: снимает focus или оставляет последнее окно active? | Клик по Desktop снимает active (activeId = null), z-order сохраняется | closed |
| 2 | Клик по active taskbar button: минимизировать или ничего? | Если active и не minimized → minimize; если minimized → restore+focus | closed |
| 3 | Минимальные sandbox атрибуты для iframe? | sandbox="allow-scripts", без allow-same-origin; без allow-popups/top-navigation/forms | closed |

## Decisions (ADRs)

| # | Decision | Rationale | Status |
|---|----------|-----------|--------|
| 1 | S3 нельзя дергать из браузера | Ключи, CORS, контроль доступа | accepted |
| 2 | Shell ↔ App через postMessage | Жёсткий контракт, sandbox | accepted |
| 3 | Shell владеет окнами, Apps — контентом | Разделение ответственности | accepted |
| 4 | Backend gateway для FS (FP2) | Листинг, signed URLs, виртуальные корни | accepted |
| 5 | Drag bounds: titlebar всегда в viewport (clamp) | Нельзя "утащить" окно и потерять доступ | accepted |
| 6 | Alt+Tab: MRU (most recently used), restore+focus для minimized | Классический UX, предсказуемость | accepted |
| 7 | Handshake timeout 2000ms; placeholder "App not responding" | Детерминизм, отладка | accepted |
| 8 | Dev domain: Traefik + docker-compose | Единый путь, повторяет прод маршрут | accepted |

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

| CTA | Endpoint | State | Page | Mock | Status |
|-----|----------|-------|------|------|--------|
| open_window | — | ui.window_open | Shell | yes | todo |
| drag_window | — | ui.dragging | Shell | yes | todo |
| resize_window | — | ui.resizing | Shell | yes | todo |
| taskbar_click | — | ui.focus/restore | Shell | yes | todo |
| switch_theme | — | ui.theme_changed | Shell | yes | todo |
| switch_scale | — | ui.scale_changed | Shell | yes | todo |

## Architecture

### Components

- **WindowManager:** create/minimize/maximize/close, z-order, focus
- **Taskbar:** список окон, active, restore/minimize
- **AppHost:** iframe, sandbox, postMessage, lifecycle
- **Desktop:** обои, поверхность

### Diagrams

(Будут добавлены в mode=design)

## Customization & Design System (v0)

**Goal:** Поведение Shell (window lifecycle, z-order, focus, таскбар, AppHost) не зависит от визуального дизайна.

**Contract:**
- **Tokens:** вся визуальная геометрия/цвета/типографика/анимации выражены через tokens (CSS variables)
- **Slots:** визуальные компоненты могут быть заменены без изменения ядра (WindowManager/AppHost)
- **Scaling:** scale-factor применяется к chrome/taskbar/fonts через tokens

**Token schema v0 (минимум):**

| Category | Tokens |
|----------|--------|
| Geometry | `--wm-titlebar-height`, `--wm-border-width`, `--wm-taskbar-height`, `--wm-window-min-width`, `--wm-window-min-height` |
| Spacing | `--wm-gap-1`, `--wm-gap-2`, `--wm-padding-1`, `--wm-padding-2` |
| Typography | `--wm-font-family`, `--wm-font-size` |
| Colors | `--wm-bg`, `--wm-fg`, `--wm-border`, `--wm-accent`, `--wm-shadow` |
| Motion | `--wm-anim-duration`, `--wm-anim-ease` |
| Scaling | `--wm-scale` (1.0, 1.25, 1.5, 2.0) |

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
- evidence/demo-notes.md
- evidence/e2e-video.webm или скриншоты
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

| Milestone | Tasks | Status |
|-----------|-------|--------|
| M1 | Доменное имя (hosts + proxy) | todo |
| M2 | Desktop + Window chrome | todo |
| M3 | WindowManager + Taskbar | todo |
| M4 | AppHost + TestApp | todo |
| M4b | ThemeProvider + ScaleProvider (tokens) | todo |
| M5 | Unit + E2E тесты | todo |
| M6 | Release gate | todo |

## Risks

| Risk | Probability | Impact | Mitigation | Status |
|------|-------------|--------|------------|--------|
| Layout thrash при drag/resize | medium | high | transform/translate, requestAnimationFrame | open |
| Pointer events / z-index конфликты | medium | medium | Чёткая иерархия слоёв | open |
| Handshake timeout | low | low | Таймаут N сек, логирование | open |

## Dependencies

- Нет внешних (FP1 изолирован)

## Artifacts

- Coverage: `artifacts/FP1/.../coverage/...`
- Evidence: `evidence/demo-notes.md`, `evidence/e2e-video.webm`

## Что дальше делать (порядок действий)

1. **Dev domain:** shell.local через Traefik (docker-compose) + hosts (M1)
2. **Skeleton implementation:** WindowManager (headless), WindowChrome/Taskbar (views), ThemeProvider + ScaleProvider (tokens), TestApp iframe + postMessage
3. **Тесты:** Unit (state transitions, z-order), E2E (3 окна, drag/resize, taskbar toggle, close, theme/scale switch)

## Handoff на mode=design

**Что подготовить в design:**
- Диаграмма компонентов (Shell: WindowManager, Taskbar, AppHost, Desktop)
- Sequence: Shell ↔ App (handshake, WINDOW_TITLE)
- Таблица sandbox permissions для iframe
- Контракт протокола v0 в docs (APP_READY, SHELL_CAPS, WINDOW_TITLE, ERROR, …)
- Token schema v0 и slots mapping

## Reflection

**What went well:**
- (после build/release)

**Risks:**
- (актуализировать)

**Next focus:**
- mode=design → FP2

## Evidence

- PR: —
- CI: —
- Demo: —
