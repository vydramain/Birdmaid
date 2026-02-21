# Design Log — FP3 Explorer (итерации)

**Purpose:** Фиксация решений и патчей в процессе design/build FP3. Единый лог для FP3.0, patchset (M5–M9), FP3.2…  
**Created:** 2025-02-20  
**Convention:** Один файл — много итераций. Source of truth: docs/fps/FP3.md; тесты: docs/tests/FP3_TESTS.md.

---

## FP3.0 (initial design)

### Decisions Log

| #      | Date       | Agent    | Decision                                                                                                  | Status |
| ------ | ---------- | -------- | --------------------------------------------------------------------------------------------------------- | ------ |
| DLOG-1 | 2025-02-20 | Delivery | Design Log создан в docs/dev/; новые файлы только в docs/, infra/, front/, back/, tools/ per STRUCTURE.md | done   |
| DLOG-2 | 2025-02-20 | Analyst  | P0 patch list сформирован (см. FP3 Patchset ниже)                                                         | done   |
| DLOG-3 | 2025-02-20 | Delivery | Resolve explorer boot contradiction: Explorer boot NOT via open-url; same-origin only; S3 = fixture       | done   |

### Patch List (P0 first)

1. **D9 Explorer boot:** MVP = Explorer iframe src same-origin (shell.local/apps/explorer/); S3 path for app-discovery only
2. **Path Policy Matrix:** C:/Recycled, C:/Temporary Internet Files → Write ✗ (FP3)
3. **Enforcement:** Explorer MUST same-origin; token only to Explorer windows
4. **Token:** Shell MUST send token ONLY to Explorer; never to user apps/viewers
5. **Roots:** FP3 roots = DISK_A, DISK_C, DISK_D; APPS deprecated for Explorer

---

## FP3 Patchset (post-build gaps, M5–M9)

**Context:** FP3 build частично реализован. Выявлены gaps (A1..D1) в UX, async-flows, upload. Delta без изменения глобального scope.

### Decisions Log

| #      | Date       | Agent      | Decision                                                                                 | Status |
| ------ | ---------- | ---------- | ---------------------------------------------------------------------------------------- | ------ |
| DLOG-4 | 2025-02-21 | Delivery   | Конвенция: один файл — много итераций; FP3 Patchset в FP3.md; Design Log в DESIGN_LOG.md | done   |
| DLOG-5 | 2025-02-21 | Analyst    | FP3 Patchset: Requirements A1..D1, AC, UX flows — в docs/fps/FP3.md                      | done   |
| DLOG-6 | 2025-02-21 | Engineer   | API_FP3_DELTA.md: upload contract, error codes 400/403/413/415; no uncontrolled 500      | done   |
| DLOG-7 | 2025-02-21 | Compliance | FP3_SECURITY_DOD.md: user apps deny upload/write; token Explorer-only; CORS unchanged    | done   |

### Contradictions Scan (FP3 vs patchset)

| Check                 | Result | Notes                                                                  |
| --------------------- | ------ | ---------------------------------------------------------------------- |
| D9 Explorer boot      | ✓ OK   | iframe src = shell.local/apps/explorer/; open-url только для viewers   |
| Token handling        | ✓ OK   | Token только в Explorer; user apps/viewers не получают                 |
| Gateway access matrix | ✓ OK   | user apps deny; viewers signed-url only; без изменений                 |
| Path policy           | ✓ OK   | C:/My Documents/\*\* writable; без изменений                           |
| upload-file 500       | ⚠ Fix  | Backend: добавить allowlist (415); маппинг S3→4xx; NO_INDEX_HTML→400 ✓ |
| upload maxFiles       | ✓ OK   | 1 per request; client 1..10 sequential; API_FP3_DELTA согласован       |

**Конфликтов не найдено.** Требуется backend fix: allowlist + error mapping для upload-file.

### Patch List (FP3 patchset)

1. **A1 Back button:** слева от address bar; история навигации; disabled если пусто
2. **A2 Tile:** фиксированная ширина, квадрат (aspect-ratio: 1); текст до 3 строк, ellipsis; путь в заголовке окна
3. **A3 Blank space:** grid на всю область; RMB в пустой зоне → context menu blank
4. **A4 Shared icons:** Desktop и Explorer — одна компонента (как Win98 desktop)
5. **B1–B3 Rename/Create/Delete:** fully async; spinner pending; apply on success, revert on fail; logs only
6. **C1–C2 Upload:** allowlist ext/mime; placeholder+spinner; no 500 на корректных запросах
7. **D1 State:** restore после minimize сохраняет path

### FP3 M5 — New Folder (Build Output Contract)

**Scope:** Blank context menu → New Folder flow with optimistic placeholder and immediate rename.

| Contract Item   | Behavior                                                                        |
| --------------- | ------------------------------------------------------------------------------- |
| Name generation | "Новая Папка" if none exists; "Новая Папка N" (N=2,3,…) from `currentListItems` |
| 409 retry       | Server 409 → increment N, retry up to K=5                                       |
| Placeholder     | Tile appears immediately with `.fs-tile-spinner`                                |
| Rename flow     | After create success → `startRename(placeholder)`                               |
| Fail handling   | Create fail → remove placeholder, `console.error` only                          |

**DoD (FP3 M5):**

- [x] `suggestNewFolderName()` client-side from `currentListItems`
- [x] `createFolderWithRetry()` with 409 → increment & retry
- [x] Placeholder tile + spinner; transition to rename on success
- [x] Fail: placeholder removed, log only
- [x] E2E T-M5-NF1..NF4 green (create, N, placeholder+spinner, rename input)
- [x] T-M5.3 updated for no-prompt flow

### FP3 M6 — Delete (Build Output Contract)

**Scope:** Item context menu → Delete flow with pending spinner, local removal on success, revert on fail.

| Contract Item           | Behavior                                                                                                            |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Pending                 | Label replaced by `.fs-tile-spinner` (`data-testid="delete-spinner"`)                                               |
| Success (204)           | Tile removed from DOM; `currentListItems` spliced; `data-item-index` reindexed; no `loadAndRenderList` (no flicker) |
| Fail (non-204 or error) | Spinner replaced with label; `console.error` only; no user toast                                                    |
| Confirm                 | `window.confirm` before fetch; E2E stubs via `addInitScript` (iframe confirm not caught by `page.on("dialog")`)     |

**DoD (FP3 M6):**

- [x] Pending: spinner replaces label during DELETE request
- [x] Success: local removal (tile.remove + splice); no list refresh
- [x] Fail: revert label; log only
- [x] E2E T-M6-D1 green (delete success removes item)
- [x] E2E T-M6-D2 green (delete fail reverts)

### FP3 M7 — Upload File (Build Output Contract)

**Scope:** Blank context menu → Upload File; allowlist png/jpg/webp/mp3/mp4/webm; up to 10 files; sequential upload; per-file placeholder + spinner.

| Contract Item | Behavior                                                                                                                     |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Allowlist     | ext: .png, .jpg, .jpeg, .webp, .mp3, .mp4, .webm; mime: image/png, image/jpeg, image/webp, audio/mpeg, video/mp4, video/webm |
| Disallowed    | 415 UNSUPPORTED_MEDIA (before S3 put)                                                                                        |
| Per-file      | Placeholder tile + spinner; sequential (1 request per file); max 10                                                          |
| Success (201) | Placeholder becomes real item; spinner replaced with label                                                                   |
| Fail          | Placeholder removed; `console.error` only                                                                                    |
| Error mapping | S3 NotFound→404, AccessDenied→403, PayloadTooLarge→413, credentials→503; 500 only for unexpected                             |

**DoD (FP3 M7):**

- [x] Gateway: allowlist check before S3 put → 415
- [x] Gateway: S3 error mapping → 4xx
- [x] Explorer: multiple files (max 10), sequential upload, placeholders, success/fail handling
- [x] Integration: T-C1.1 (allowed→201), T-C1.2 (disallowed→415), T-C3.1 (no 500 for valid)
- [ ] E2E T-M7-U1/U2: skipped — filechooser does not fire for iframe file input in Playwright

### FP3 M8 — Upload Zip App (Build Output Contract)

**Scope:** Blank context menu → Upload Zip App; 1 zip per action; placeholder + spinner; server unzip + validate index.html.

| Contract Item        | Behavior                                                           |
| -------------------- | ------------------------------------------------------------------ |
| Per action           | 1 zip only (file picker single)                                    |
| Placeholder          | Dir tile + `.fs-tile-spinner` (`data-testid="upload-zip-spinner"`) |
| Server               | Unzip, validate index.html in root or subdir                       |
| Fail (no index.html) | 400 NO_INDEX_HTML; no partial files (check before upload)          |
| Fail (other)         | Rollback uploaded keys; 4xx/5xx                                    |
| Success (201)        | Placeholder becomes app-dir tile; `isApp: true`                    |
| Fail (client)        | Placeholder removed; `console.error` only                          |

**DoD (FP3 M8):**

- [x] Gateway: NO_INDEX_HTML check before upload; rollback on error during upload
- [x] Explorer: placeholder + spinner; success → app tile; fail → remove, log only
- [x] Integration T-M8-Z1: zip without index.html → 400, no partial files
- [ ] E2E T-M8-Z1: skipped — filechooser in iframe not supported

### FP3 M9 — State persistence (minimize/restore)

**Scope:** Explorer path preserved when window minimized then restored. Iframe not reloaded.

| Contract Item | Behavior                                                                                                  |
| ------------- | --------------------------------------------------------------------------------------------------------- |
| Minimize      | Window chrome gets `display: none`; iframe stays mounted (no reload)                                      |
| Restore       | Window visible again; Explorer state (path) preserved                                                     |
| Shell         | `visibleOrder` includes minimized windows; `WindowChromeView` renders with `display: none` when minimized |

**DoD (FP3 M9):**

- [x] Shell: minimized windows stay in DOM (display:none), iframe not unmounted
- [x] E2E T-D1.1 green (navigate → minimize → restore → same path)

---

## Repo Hygiene Check (STRUCTURE.md)

- [x] docs/fps/FP3.md — основной документ, FP3 Patchset внутри
- [x] docs/tests/FP3_TESTS.md — тест-план, patchset delta внутри
- [x] docs/dev/DESIGN_LOG.md — единый лог (FP3.0, patchset, …)
- [x] docs/core/API_FP3_DELTA.md — API contract (write endpoints + FP3 patchset upload)
- [x] docs/dev/FP3_SECURITY_DOD.md — security checklist
- [ ] Новые файлы: только в разрешённых директориях (проверка по мере добавления)

**Запрещено:** новые compose/Dockerfile вне infra/; мусор в корне. Не плодить отдельные UX_patchset.md, DESIGN_LOG_patchset.md — всё в FP3.md и DESIGN_LOG.md.
