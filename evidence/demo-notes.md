# FP1 Shell MVP — Demo Notes

**Purpose:** Что проверить руками при демо FP1.

## Checklist

- [ ] Shell открывается по http://shell.local/
- [ ] /health возвращает 200
- [ ] Можно создать окно (тестовое приложение в iframe)
- [ ] Окно перетаскивается за titlebar без дрожания
- [ ] Окно ресайзится по граням (min/max размеры соблюдаются)
- [ ] Drag: titlebar всегда остаётся в viewport (clamp)
- [ ] Minimize / restore через taskbar
- [ ] Close удаляет окно и iframe
- [ ] Z-order: клик по окну делает его active
- [ ] Active окно визуально отличается
- [ ] WINDOW_TITLE из iframe обновляет заголовок окна и taskbar
- [ ] 3 окна: drag, resize, taskbar switch — без лага
- [ ] Theme switch: DefaultMock ↔ Win98Mock без reload
- [ ] Scale switch: 1.0 ↔ 1.5 — drag/resize корректны
- [ ] Клик по Desktop снимает active
- [ ] Клик по active taskbar button минимизирует; по minimized — restore
- [ ] Alt+Tab: MRU, minimized → restore+focus
- [ ] Handshake timeout: placeholder "App not responding"

## Customization Evidence (4 скриншота)

- [ ] theme A (DefaultMock) scale 1.0
- [ ] theme A scale 1.5
- [ ] theme B (Win98Mock) scale 1.0
- [ ] theme B scale 1.5

## Evidence

- e2e-video.webm (опционально)
- Скриншоты прохождения E2E
