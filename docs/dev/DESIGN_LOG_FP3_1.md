# Design Log — FP3.1 Delta (mode=design)

**Purpose:** Фиксация решений и патчей в процессе design-фазы FP3.1 (post-FP3 gaps).  
**Created:** 2025-02-21  
**Status:** design in progress

---

## Context

FP3 build частично реализован. Выявлены gaps (A1..D1) в UX, async-flows и upload. FP3.1 — delta без изменения глобального scope платформы.

---

## Decisions Log

| #       | Date       | Agent    | Decision                                                                                                  | Status |
| ------- | ---------- | -------- | --------------------------------------------------------------------------------------------------------- | ------ |
| DLOG-FP31-1 | 2025-02-21 | Delivery | DESIGN_LOG_FP3_1.md создан; новые файлы только в docs/, infra/, front/, back/, tools/ per STRUCTURE.md | done   |
| DLOG-FP31-2 | 2025-02-21 | Analyst  | FP3.1 Delta: Requirements A1..D1, AC, Non-scope, Risks, Analytics, DoD добавлены в FP3.md                 | done   |
| DLOG-FP31-3 | 2025-02-21 | Designer | UX_FP3_1.md: back button, tile layout, full-blank-area, rename/create/delete/upload flows step-by-step   | done   |
| DLOG-FP31-4 | 2025-02-21 | Engineer | API_FP3_DELTA.md: upload-file multipart, maxFiles=10, allowlist ext/mime, error codes 400/403/413/415    | done   |
| DLOG-FP31-5 | 2025-02-21 | Engineer | API: upload-zip maxFiles=1, rollback; rename/create/delete async semantics; no uncontrolled 500         | done   |
| DLOG-FP31-6 | 2025-02-21 | Compliance| FP3_SECURITY_DOD.md: user apps can't call upload/write; token only to Explorer; CORS unchanged          | done   |

---

## Repo Hygiene Check (STRUCTURE.md)

- [x] docs/fps/FP3.md — обновлён FP3.1 Delta
- [x] docs/core/UX_FP3_1.md — создан
- [x] docs/core/API_FP3_DELTA.md — обновлён
- [x] docs/dev/FP3_SECURITY_DOD.md — обновлён
- [x] docs/tests/FP3_TESTS.md — обновлён
- [x] Новые файлы только в разрешённых директориях

**Запрещено:** новые compose/Dockerfile вне infra/; мусор в корне.
