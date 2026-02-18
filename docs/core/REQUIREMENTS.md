# Core Requirements

**Purpose:** Single source of truth for functional and non-functional requirements. Referenced by agents (plan, design), FP bootstrap, and UX baseline skills.

## Functional Requirements

- [ ] FR-1: Shell доступен по доменному имени (shell.local в dev)
- [ ] FR-2: Desktop + окна (normal/minimized/maximized/closed)
- [ ] FR-3: Drag/resize окон, z-order, focus
- [ ] FR-4: Taskbar с кнопками окон, focus/restore
- [ ] FR-5: AppHost — iframe с sandbox, handshake (APP_READY, SHELL_CAPS), WINDOW_TITLE

## Non-Functional Requirements

- **Compatibility:** Firefox + Chromium latest
- **Performance:** 10 окон без заметного лага drag/resize; никаких layout thrash
- **Security:** Приложения по умолчанию в sandbox; никакого доступа к S3 ключам из браузера
- **Determinism:** Одинаковое поведение standalone apps и внутри Shell (один протокол, один gateway)

## UX / Design System (Baseline)

- Windows 98-like семантика (без пиксель-перфекционизма)
- **Design System v0:** tokens (geometry, spacing, typography, colors, motion, scale), slots (DesktopView, WindowChromeView, TaskbarView, TaskbarItemView)
- **Theme switch:** две темы (DefaultMock, Win98Mock) переключаются runtime без reload
- **Scale switch:** scale 1.0 ↔ 1.5 меняет titlebar/taskbar/fonts; drag/resize остаётся корректным
- **No magic geometry:** размеры chrome/taskbar/min sizes читаются из tokens

## References

- Feature Packs: `docs/fps/FP*.md`
- UX Map: [UX_MAP.md](./UX_MAP.md)
- API: [API.yaml](./API.yaml)
