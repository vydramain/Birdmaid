# Questions and Decisions (Q&A / ADRs)

**Purpose:** Open questions and architectural decisions tagged by FP or area. Used by plan/design roles and fp-bootstrap, ux-map-sync skills.

## Questions

| #   | Question                                                            | Answer                                                                                                                                                          | Status | [FP:id] |
| --- | ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ------- |
| 1   | Клик по Desktop: снимает focus или оставляет последнее окно active? | Клик по Desktop снимает active (activeId = null), z-order сохраняется. Причина: предсказуемое поведение для контекстных меню Desktop, не ломает таскбар/Alt-Tab | closed | FP1     |
| 2   | Клик по active taskbar button: минимизировать или ничего?           | Если окно active и не minimized → minimize. Если minimized → restore+focus. Причина: классический UX taskbar, удобный toggle                                    | closed | FP1     |
| 3   | Минимальные sandbox атрибуты для iframe?                            | sandbox="allow-scripts", без allow-same-origin (если не нужно для testapp), без allow-popups/top-navigation/forms. Расширять только через матрицу в FP5         | closed | FP1     |

Tag with `[FP:<id>]` for traceability.

## Decisions (ADRs)

| #   | Decision                                                            | Rationale                               | Status   |
| --- | ------------------------------------------------------------------- | --------------------------------------- | -------- |
| 1   | S3 нельзя дергать из браузера                                       | Ключи, CORS, контроль доступа           | accepted |
| 2   | Shell ↔ App через postMessage                                       | Жёсткий контракт, sandbox               | accepted |
| 3   | Shell владеет окнами, Apps — контентом                              | Разделение ответственности              | accepted |
| 4   | Backend gateway для FS (FP2)                                        | Листинг, signed URLs, виртуальные корни | accepted |
| 5   | Desktop click: activeId = null, z-order preserved                   | Предсказуемость, контекстные меню       | accepted |
| 6   | Taskbar click: active+visible → minimize; minimized → restore+focus | Классический UX, toggle                 | accepted |
| 7   | Sandbox FP1 minimal: allow-scripts only                             | Безопасность; расширять в FP5           | accepted |
| 8   | Drag bounds: titlebar всегда в viewport (clamp)                     | Нельзя "утащить" окно и потерять доступ | accepted |
| 9   | Alt+Tab: MRU, restore+focus для minimized                           | Классический UX                         | accepted |
| 10  | Handshake timeout 2000ms; placeholder "App not responding"          | Детерминизм                             | accepted |
| 11  | Dev domain: Traefik + docker-compose                                | Единый путь, повторяет прод             | accepted |

## References

- Feature Packs: `docs/fps/FP*.md` (Questions / Decisions sections)
- UX Map: [UX_MAP.md](./UX_MAP.md)
