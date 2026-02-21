# Design Log — FP3 Explorer (mode=design)

**Purpose:** Фиксация решений и патчей в процессе design-фазы FP3.  
**Created:** 2025-02-20  
**Status:** design sync done (DLOG-3)

---

## Decisions Log

| #      | Date       | Agent    | Decision                                                                                                  | Status |
| ------ | ---------- | -------- | --------------------------------------------------------------------------------------------------------- | ------ |
| DLOG-1 | 2025-02-20 | Delivery | Design Log создан в docs/dev/; новые файлы только в docs/, infra/, front/, back/, tools/ per STRUCTURE.md | done   |
| DLOG-2 | 2025-02-20 | Analyst  | P0 patch list сформирован (см. FP3 Patchset ниже)                                                         | done   |
| DLOG-3 | 2025-02-20 | Delivery | Resolve explorer boot contradiction: Explorer boot NOT via open-url; same-origin only; S3 = fixture       | done   |

---

## Patch List (P0 first)

1. **D9 Explorer boot:** MVP = Explorer iframe src same-origin (shell.local/apps/explorer/); S3 path for app-discovery only
2. **Path Policy Matrix:** C:/Recycled, C:/Temporary Internet Files → Write ✗ (FP3)
3. **Enforcement:** Explorer MUST same-origin; token only to Explorer windows
4. **Token:** Shell MUST send token ONLY to Explorer; never to user apps/viewers
5. **Roots:** FP3 roots = DISK_A, DISK_C, DISK_D; APPS deprecated for Explorer

---

## Repo Hygiene Check (STRUCTURE.md)

- [x] docs/fps/FP3.md — корректно
- [x] docs/core/\* — core contracts
- [x] docs/dev/\* — dev artifacts (включая DESIGN_LOG.md)
- [x] infra/ — docker-compose, minio fixtures
- [ ] Новые файлы: только в разрешённых директориях (проверка по мере добавления)

**Запрещено:** новые compose/Dockerfile вне infra/; мусор в корне.
