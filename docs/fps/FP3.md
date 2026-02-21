# FP3: Explorer App (System App) + Shell Integration

**Status:** plan  
**Created:** 2025-02-20  
**Updated:** 2025-02-20 (pre-design patch)

> **Context:** Shell (FP1) и Gateway FS API (FP2) готовы. FP3 добавляет Explorer как системное приложение в iframe, навигацию по виртуальным дискам, CRUD в user-space, запуск viewer'ов и user apps.

---

## Intent Analysis

### Problem Statement

Пользователю нужен способ просматривать и управлять файлами в виртуальной файловой системе (S3), а также запускать приложения и просматривать файлы (image/video/audio/text). Explorer должен быть системным приложением с расширенными правами, визуально имитировать Windows 98 и интегрироваться с Shell через postMessage.

### User Stories

| #   | Story                                                                                                                 | Priority |
| --- | --------------------------------------------------------------------------------------------------------------------- | -------- |
| 1   | Как пользователь, я хочу открыть "My Computer" двойным кликом по иконке на Desktop и видеть диски A:, C:, D:          | P0       |
| 2   | Как пользователь, я хочу навигировать по папкам (double click), видеть breadcrumbs и адресную строку                  | P0       |
| 3   | Как пользователь, я хочу открыть файл (image/video/audio/text) двойным кликом и видеть его в отдельном viewer-окне    | P0       |
| 4   | Как пользователь, я хочу запустить приложение (папка с index.html) двойным кликом и видеть его в новом окне Shell     | P0       |
| 5   | Как пользователь, я хочу создавать папки, загружать файлы и zip-приложения, удалять и переименовывать в writable зоне | P0       |
| 6   | Как пользователь, я хочу видеть контекстное меню (правый клик) для действий New Folder / Upload / Delete / Rename     | P0       |

### Constraints

- **Security:** Explorer — privileged; user apps — no backend access; viewers — signed URL only.
- **Read-only system paths:** C:/WINDOWS/**, C:/Program Files/**, boot files; writable: C:/My Documents/\*\*.
- **Virtual disks model:** A:, C:, D: — реальные директории в S3; A: и D: — пустые, read-only; C: — основной writable space.
- **Explorer location:** C:/Program Files/Explorer/ (read-only, system app).

---

## Scope

### IN — Что входит

- Explorer как system app в iframe (окно "My Computer")
- Навигация по A:, C:, D: и подпапкам
- Листинг с типами: dir, file, app-dir (index.html)
- Контекстные меню: blank → New Folder / Upload File / Upload Zip App; item → Delete / Rename
- Операции в writable зоне: create folder, upload file, upload zip app, delete, rename
- Запрос Shell на открытие viewer'ов и запуск apps (SHELL_OPEN)
- Визуальный стиль Win98 (98.css, local vendoring)
- Theme-aware (CSS vars от Shell)
- Gateway: новые endpoints (create, upload, upload-zip, delete, rename) + permission model
- Fixtures/migration: системные папки, boot files, roots A/C/D

### OUT — Что не входит

- Copy/paste, drag-select, hotkeys, Properties
- Реальная "Корзина" как отдельный UX
- Control Panel / Printers / Dial-Up Networking
- Мультиюзерность / ACL
- Move (cross-parent rename) — P2. Cross-parent rename treated as move → REJECT in FP3.

---

## Questions

| #   | Question                                           | Answer                                                         | Status |
| --- | -------------------------------------------------- | -------------------------------------------------------------- | ------ |
| 1   | Где физически лежит Explorer app в S3?             | C:/Program Files/Explorer/ (read-only)                         | closed |
| 2   | Куда ведёт double click по (C:)?                   | В C:/                                                          | closed |
| 3   | A:/ и D:/ — реальные директории или placeholders?  | Реальные директории в S3, пустые, read-only, в них можно зайти | closed |
| 4   | Zip upload: gateway или Explorer распаковывает?    | Gateway принимает zip и распаковывает                          | closed |
| 5   | Правый клик по item: только Delete или ещё Rename? | Delete + Rename                                                | closed |

---

## Decisions (ADRs)

| #   | Decision                                                                        | Rationale                                                                                                                                                                                                                     | Status   |
| --- | ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| D1  | Explorer — privileged caller; user apps — deny gateway                          | Разделение прав: Explorer имеет полный доступ к FS API; user apps не имеют backend доступа                                                                                                                                    | accepted |
| D2  | Roots A:/C:/D/: A и D — read-only, пустые; C — writable в My Documents          | Модель виртуальных дисков; A/D — placeholder-диски; C — основной workspace                                                                                                                                                    | accepted |
| D3  | App-dir detection: dir с index.html внутри                                      | Правило FP2 (isApp); double click → Shell.RunApp                                                                                                                                                                              | accepted |
| D4  | Zip upload: gateway принимает multipart zip и распаковывает                     | Серверная распаковка; валидация index.html; fail → не оставлять мусор                                                                                                                                                         | accepted |
| D5  | Rename is same-parent only (no directory move)                                  | toPath must remain in same parent; only basename changes. Cross-parent rename treated as move → REJECT in FP3                                                                                                                 | accepted |
| D6  | FS API split: Read (Shell origin) vs Write (Explorer + system token)            | Read API (roots/list/stat/open-url): Shell origin only (shell.local), path-policy. Write API: Explorer only, system token + origin. User apps: deny both (iframe sandbox + CSP + gateway caller=app → deny)                   | accepted |
| D9  | Explorer boot: same-origin only, NOT open-url                                   | Explorer iframe src MUST be shell.local/apps/explorer/. open-url is for viewers and Shell read; NOT for Explorer boot. S3 path C:/Program Files/Explorer/ is fixture + app-discovery (read-only); Option A (S3 boot) deferred | accepted |
| D10 | Explorer delivery: repo → fixtures                                              | Explorer lives in repo (e.g. `front/apps/explorer/`); dev-init copies to `infra/minio/fixtures/.../Program Files/Explorer/`. S3 app = source of truth; "vendored in front" = build artifact for fixtures                      | accepted |
| D7  | App-dir detection: gateway list returns isApp when feasible; fallback lazy stat | Preferred: gateway list returns isApp per dir (HEAD index.html). Fallback: Explorer lazy stat for `{dir}/index.html` on double click if isApp missing                                                                         | accepted |
| D8  | 98.css integration: vendored locally, theme vars override                       | 98.css vendored (no runtime CDN). Explorer tokens from Shell CSS vars (theme/scale). 98.css base → Explorer adapter stylesheet → theme-pack variables. Scale via CSS vars/transform consistent with Shell                     | accepted |

---

## Security & Permissions

### App Types

| Type              | Examples                       | Backend Access                                                 | S3 Scope                                        |
| ----------------- | ------------------------------ | -------------------------------------------------------------- | ----------------------------------------------- |
| **System app**    | Explorer                       | Full FS API (list, read, write, delete, rename, upload, unzip) | User-space + read system paths                  |
| **System viewer** | ImageViewer, VideoViewer, etc. | No gateway                                                     | Read via signed URL only (path passed by Shell) |
| **User app**      | Any dir with index.html        | No gateway                                                     | No S3 outside app root; read own assets only    |

### Backend Access Matrix

**Read API:** Shell origin only (roots/list/stat/open-url). open-url is used for viewer signed URLs and Shell read; **NOT for Explorer boot**. **Write API:** Explorer only, system token required. **User apps:** deny both (caller=app → 403).

| Operation                   | Shell | Explorer     | Viewer                  | User App |
| --------------------------- | ----- | ------------ | ----------------------- | -------- |
| GET /api/fs/roots           | ✓     | ✓            | ✗                       | ✗        |
| GET /api/fs/list            | ✓     | ✓            | ✗                       | ✗        |
| GET /api/fs/stat            | ✓     | ✓            | ✗                       | ✗        |
| POST /api/fs/open-url       | ✓     | ✓            | ✗ (gets URL from Shell) | ✗        |
| POST /api/fs/create-folder  | ✗     | ✓ (writable) | ✗                       | ✗        |
| POST /api/fs/upload-file    | ✗     | ✓ (writable) | ✗                       | ✗        |
| POST /api/fs/upload-zip-app | ✗     | ✓ (writable) | ✗                       | ✗        |
| DELETE /api/fs/delete       | ✗     | ✓ (writable) | ✗                       | ✗        |
| PUT /api/fs/rename          | ✗     | ✓ (writable) | ✗                       | ✗        |

### Enforcement

- **Gateway Read API (roots/list/stat/open-url):** Shell origin (shell.local) OR Explorer with system token. Path-policy enforced. User app → 403. (open-url is for viewers and Shell read; Explorer boot is NOT via open-url. Explorer needs Read for list/stat/roots.)
- **Gateway Write API (create/upload/delete/rename):** Explorer only; requires `X-System-App: explorer` + `X-System-Token: <opaque>`. Origin allowlist. Missing/invalid token → 403 + permission_denied.
- **Shell:** iframe sandbox matrix:
  - Explorer: `allow-scripts` + `allow-same-origin` (Explorer MUST be same-origin with Shell, e.g. shell.local/apps/explorer/, so fetch to api.shell.local uses Shell origin; no token leakage to user apps).
  - User app: `allow-scripts` only (FP1 baseline); no fetch to api.shell.local.
  - Viewer: `allow-scripts`; receives signed URL from Shell; no gateway calls.
- **postMessage:** Allowlist origins, no `"*"`; route by source + origin. New message: `SHELL_OPEN` (Explorer → Shell).

### Path Policy (MUST)

Gateway **MUST** enforce at API layer (not only UI):

- **Deny** any write ops (create/upload/delete/rename/upload-zip) for:
  - `C:/WINDOWS/**`
  - `C:/Program Files/**`
  - `C:/` boot/config files (MSDOS.SYS, IO.SYS, COMMAND.COM, AUTOEXEC.BAT, CONFIG.SYS, BOOTLOG.TXT, SETUPLOG.TXT, SUHDLOG.DAT, WIN386.SWP)
  - `A:/**`
  - `D:/**`
- **Allow** writes only under `C:/My Documents/**`.
- **Status codes:** 403 (policy violation), 409 (name conflict), 400 (invalid path).
- **Path traversal:** Reject `..`, absolute URL, double slashes; normalize before check.
- **Rename:** Gateway MUST validate `dirname(fromPath) === dirname(toPath)`; cross-parent → 403 REJECT.

### Path Policy Matrix

| Path prefix                      | Read | Write   | Who                              |
| -------------------------------- | ---- | ------- | -------------------------------- |
| `C:/` (boot files)               | ✓    | ✗       | Shell, Explorer                  |
| `C:/WINDOWS/**`                  | ✓    | ✗       | Shell, Explorer                  |
| `C:/Program Files/**`            | ✓    | ✗       | Shell, Explorer                  |
| `C:/My Documents/**`             | ✓    | ✓       | Shell, Explorer (write)          |
| `C:/Recycled/**`                 | ✓    | ✗ (FP3) | Read-only in FP3; write deferred |
| `C:/Temporary Internet Files/**` | ✓    | ✗ (FP3) | Read-only in FP3; write deferred |
| `A:/**`                          | ✓    | ✗       | Shell, Explorer                  |
| `D:/**`                          | ✓    | ✗       | Shell, Explorer                  |

---

## Requirements

### Use Cases

**Main Flow:**

1. Double click "My Computer" → Shell открывает окно + iframe Explorer.
2. Explorer показывает A:, C:, D:.
3. Double click C: → переход в C:/, листинг системных папок и boot files.
4. Double click папка → навигация внутри Explorer.
5. Double click файл (image) → Explorer отправляет SHELL_OPEN → Shell открывает ImageViewer с signed URL.
6. Double click app-dir → Explorer отправляет SHELL_OPEN → Shell открывает app в новом окне.
7. Right click blank → New Folder / Upload File / Upload Zip App.
8. Right click item → Delete / Rename.

**Alternate Flows:**

- Address bar / breadcrumbs навигация.
- Up button → parent dir.

**Error Flows:**

- Gateway 403 (permission denied) → Explorer показывает сообщение.
- Zip без index.html → операция fail, папка не создаётся или отправляется в Recycled.
- User app fetch(api.shell.local) → 403 / blocked.

### Business Rules

- Single click: selection only; double click: open (dir/file/app).
- App-dir: dir с index.html; отображается особой иконкой; double click → RunApp.
- Rename: same-parent only; gateway changes basename; cross-parent → 403 REJECT.
- Zip upload: gateway распаковывает; валидация index.html; fail → rollback.

### Validations

- Path validation (FP2 rules): no `..`, `\`, double slashes; max 1024; root isolation.
- Writable path check: только C:/My Documents/\*\* (и allowlisted).
- **Rename:** Gateway MUST validate `dirname(fromPath) === dirname(toPath)`; only basename changes. Cross-parent → 403 REJECT.
- Zip: должен содержать index.html в корне или первой уровне.

---

## UX Map

| CTA              | Endpoint                    | State               | Page     | Mock | Status |
| ---------------- | --------------------------- | ------------------- | -------- | ---- | ------ |
| open_my_computer | —                           | ui.explorer_open    | Shell    | yes  | todo   |
| load_roots       | GET /api/fs/roots           | ui.roots_loaded     | Explorer | yes  | todo   |
| list_dir         | GET /api/fs/list?path=...   | ui.list_loaded      | Explorer | yes  | todo   |
| navigate         | —                           | ui.path_changed     | Explorer | yes  | todo   |
| open_file        | SHELL_OPEN (file)           | ui.viewer_requested | Shell    | yes  | todo   |
| run_app          | SHELL_OPEN (app)            | ui.app_requested    | Shell    | yes  | todo   |
| create_folder    | POST /api/fs/create-folder  | ui.folder_created   | Explorer | yes  | todo   |
| upload_file      | POST /api/fs/upload-file    | ui.file_uploaded    | Explorer | yes  | todo   |
| upload_zip_app   | POST /api/fs/upload-zip-app | ui.app_uploaded     | Explorer | yes  | todo   |
| delete_item      | DELETE /api/fs/delete       | ui.item_deleted     | Explorer | yes  | todo   |
| rename_item      | PUT /api/fs/rename          | ui.item_renamed     | Explorer | yes  | todo   |

---

## UX Spec (Win98)

### Layout

- **Toolbar:** Back / Forward / Up / Copy / Paste (FP3: статичные, disabled).
- **Address bar:** Текущий путь (read-only или editable позже).
- **Main area:** Icon grid (папки, файлы, app-dirs).
- **Status area:** (опционально) количество items, размер.

### Interaction

| Action       | Target       | Result                                                  |
| ------------ | ------------ | ------------------------------------------------------- |
| Single click | item / blank | Selection (focus); не открывает                         |
| Double click | folder       | Navigate into dir                                       |
| Double click | file         | SHELL_OPEN file → Shell opens viewer                    |
| Double click | app-dir      | SHELL_OPEN app → Shell opens app window                 |
| Right click  | blank        | Context menu: New Folder / Upload File / Upload Zip App |
| Right click  | item         | Context menu: Delete / Rename                           |

### Visual Baseline

- **98.css:** Per D8 — vendored in Explorer app (repo `front/apps/explorer/vendor/98.css`); copied to fixtures with Explorer (D10). No runtime CDN.
- **Theme-aware:** Explorer inherits Shell theme tokens (--wm-bg, --wm-fg, etc.) и scale (--wm-scale).
- **Context menu:** Win98-style (98.css), positioning under cursor.

### Rename Flow (FP3)

- Right click item → Rename.
- Inline edit filename (preselected); Enter подтверждает, Escape отмена.
- Name conflict (409): show error, keep edit mode (user may correct or Escape).
- Read-only/system item: Rename disabled in menu OR action returns 403 and show error.

### Explorer UI Components (internal structure)

| Component       | Responsibility                                                      |
| --------------- | ------------------------------------------------------------------- |
| ExplorerRoot    | My Computer view: render A:, C:, D: from roots; handle double click |
| ExplorerFolder  | Folder view: icon grid, selection, double click navigation          |
| Toolbar         | Back/Forward/Up (FP3: disabled); placeholder for future             |
| AddressBar      | Current path display; editable later                                |
| Breadcrumbs     | Path segments; click to navigate                                    |
| StatusBar       | Item count, size (optional)                                         |
| ContextMenu     | Blank: New Folder, Upload File, Upload Zip; Item: Delete, Rename    |
| RenameModal     | Inline or modal rename input; Enter/Escape                          |
| UploadFileModal | File picker; POST to upload-file                                    |
| UploadZipModal  | File picker (zip); POST to upload-zip-app                           |

---

## Architecture

### Explorer Boot Flow (D9)

**FP3 rule:** Explorer iframe src MUST be same-origin with Shell: `shell.local/apps/explorer/` (or equivalent). Explorer is **NOT** loaded via open-url or S3 signed URL.

1. **Src:** Shell sets `iframe.src = shell.local/apps/explorer/` (or `http://shell.local/apps/explorer/index.html`). Vite/dev-server serves Explorer from `front/apps/explorer/`. No open-url, no S3 boot.
2. **Token:** Shell injects system token into Explorer via postMessage handshake (SHELL_CAPS or init message), **never** via querystring. Shell MUST send token ONLY to Explorer windows (identified by window type/source); never to user app or viewer iframes.
3. Explorer stores token and adds `X-System-App: explorer` + `X-System-Token` to Write API requests.

**Explorer in S3 vs served from shell.local:**

| Aspect                                 | In FP3                                                                                 |
| -------------------------------------- | -------------------------------------------------------------------------------------- |
| **Runtime boot**                       | shell.local/apps/explorer/ (same-origin); Vite serves from front/apps/explorer/        |
| **S3 path C:/Program Files/Explorer/** | Fixture + FS model; read-only; used for app-discovery (list shows Explorer as app-dir) |
| **open-url**                           | For viewers (signed URL) and Shell read; NOT for Explorer boot                         |
| **Option A (S3 boot)**                 | Deferred to post-FP3                                                                   |

Build implementation: iframe src = shell.local path; do NOT use open-url for Explorer. Verify Explorer exists in S3 at fixed path as fixture guarantee (dev-init copies it).

### Components

- **Explorer App:** Lives in repo (`front/apps/explorer/`); served at runtime from `shell.local/apps/explorer/` (same-origin). Dev-init copies to `infra/minio/fixtures/DISK_C/Program Files/Explorer/` (D10) for FS model — Explorer appears in list C:/Program Files/ as app-dir; that S3 copy is read-only fixture, not boot source.
- **Shell:** Desktop icon "My Computer", createWindow with Explorer src; handles SHELL_OPEN.
- **Gateway:** FS endpoints (existing + create-folder, upload-file, upload-zip-app, delete, rename); permission middleware.
- **Viewers:** System viewers (ImageViewer минимум); receive signed URL from Shell.

### Gateway Endpoints (FP3 Additions)

| Method | Endpoint               | Purpose                                                    |
| ------ | ---------------------- | ---------------------------------------------------------- |
| POST   | /api/fs/create-folder  | Create folder in writable path                             |
| POST   | /api/fs/upload-file    | Multipart upload single file                               |
| POST   | /api/fs/upload-zip-app | Multipart upload zip; gateway unpacks; validate index.html |
| DELETE | /api/fs/delete         | Delete file or dir                                         |
| PUT    | /api/fs/rename         | Rename (same-parent only; toPath = same dir, new basename) |

### Data Model / Fixtures

**Roots mapping (FP3):**

| Root ID | Label       | S3 Prefix     | Writable               |
| ------- | ----------- | ------------- | ---------------------- |
| DISK_A  | Floppy (A:) | roots/DISK_A/ | No                     |
| DISK_C  | (C:)        | roots/DISK_C/ | Partial (My Documents) |
| DISK_D  | (D:)        | roots/DISK_D/ | No                     |

**Roots policy (FP3):** GET /api/fs/roots returns **only** DISK_A, DISK_C, DISK_D. APPS (FP2) is deprecated for FP3; gateway MUST NOT return APPS. M1 gate: verify roots = A/C/D.

**System paths (C:):**

- `C:/WINDOWS/` — read-only
- `C:/Program Files/` — read-only (Explorer at `C:/Program Files/Explorer/`)
- `C:/My Documents/` — writable
- `C:/Recycled/` — write by Explorer only
- `C:/Temporary Internet Files/` — write by Explorer only
- Boot files in `C:/`: MSDOS.SYS, IO.SYS, COMMAND.COM, AUTOEXEC.BAT, CONFIG.SYS, BOOTLOG.TXT, SETUPLOG.TXT, SUHDLOG.DAT, WIN386.SWP

**Migration/fixtures:** Dev stack создаёт папки и файлы при init. Explorer: repo `front/apps/explorer/` → копируется в `infra/minio/fixtures/DISK_C/Program Files/Explorer/` при dev-init (D10).

### Protocol Extensions (PROTOCOL_v0)

**Explorer → Shell:**

| Type       | Payload                                                                  | When                                   |
| ---------- | ------------------------------------------------------------------------ | -------------------------------------- |
| SHELL_OPEN | `{ kind: "file" \| "app", path: string, mime?: string, title?: string }` | Explorer requests open file or run app |

**Shell → Explorer:**

| Type          | Payload                               | When                                                              |
| ------------- | ------------------------------------- | ----------------------------------------------------------------- |
| EXPLORER_CAPS | `{ roots, systemPaths, permissions }` | After APP_READY (optional; Explorer may fetch roots from gateway) |
| THEME_CHANGED | (existing or via SHELL_CAPS)          | Theme/scale update                                                |
| SCALE_CHANGED | (existing or via SHELL_CAPS)          | —                                                                 |

---

## API + Data Model Mapping

### Explorer → Gateway

| Operation      | Endpoint                    | Writable Check       |
| -------------- | --------------------------- | -------------------- |
| List roots     | GET /api/fs/roots           | —                    |
| List dir       | GET /api/fs/list?path=...   | —                    |
| Stat           | GET /api/fs/stat?path=...   | —                    |
| Open URL       | POST /api/fs/open-url       | —                    |
| Create folder  | POST /api/fs/create-folder  | C:/My Documents/\*\* |
| Upload file    | POST /api/fs/upload-file    | C:/My Documents/\*\* |
| Upload zip app | POST /api/fs/upload-zip-app | C:/My Documents/\*\* |
| Delete         | DELETE /api/fs/delete       | C:/My Documents/\*\* |
| Rename         | PUT /api/fs/rename          | C:/My Documents/\*\* |

### Path Mapping (User ↔ API)

- User sees: `C:/`, `C:/My Documents/`, `A:/`, `D:/`.
- API uses: `/@root/DISK_C/`, `/@root/DISK_C/My Documents/`, `/@root/DISK_A/`, `/@root/DISK_D/`.
- Explorer translates display paths to API paths.

---

## Acceptance Criteria & Milestones

### M1 — My Computer icon launches Explorer

| AC   | Критерий                                                                                                                         |
| ---- | -------------------------------------------------------------------------------------------------------------------------------- |
| M1.1 | На Desktop есть иконка "My Computer"                                                                                             |
| M1.2 | Double click → Shell открывает окно + iframe Explorer                                                                            |
| M1.3 | Explorer отправляет APP_READY; Shell отвечает SHELL_CAPS (или EXPLORER_CAPS)                                                     |
| M1.4 | Заголовок окна: "My Computer"                                                                                                    |
| M1.5 | В Explorer отображается Root с A:, C:, D: (gateway /api/fs/roots возвращает только DISK_A, DISK_C, DISK_D; APPS не возвращается) |

### M2 — Navigate disks and folders

| AC   | Критерий                                                                                                                   |
| ---- | -------------------------------------------------------------------------------------------------------------------------- |
| M2.1 | Double click C: → переход в C:/                                                                                            |
| M2.2 | В C:/ отображаются системные папки (WINDOWS, Program Files, My Documents, Recycled, Temporary Internet Files) и boot files |
| M2.3 | Double click папка → навигация, обновление address/breadcrumbs                                                             |
| M2.4 | Double click A: или D: → переход в корень диска (пустой список или placeholder)                                            |
| M2.5 | Up / Address bar навигация работает                                                                                        |

### M3 — App-dir detection and run app

| AC   | Критерий                                                                              |
| ---- | ------------------------------------------------------------------------------------- |
| M3.1 | В C:/Program Files/ есть папка Explorer (system app)                                  |
| M3.2 | App-dir: isApp в list ИЛИ lazy stat index.html при double click; поведение одинаковое |
| M3.3 | Double click app-dir → Shell открывает новое окно с iframe этого app                  |
| M3.4 | Explorer не открывает app сам — только SHELL_OPEN                                     |

### M4 — Viewers for files

| AC   | Критерий                                                    |
| ---- | ----------------------------------------------------------- |
| M4.1 | Double click image → Shell открывает ImageViewer (минимум)  |
| M4.2 | Viewer получает signed URL через Shell; не вызывает gateway |
| M4.3 | Video/audio/text — аналогично (viewer по mime)              |
| M4.4 | Новое окно Shell для каждого viewer                         |

### M5 — Context menus + operations

| AC   | Критерий                                                                      |
| ---- | ----------------------------------------------------------------------------- |
| M5.1 | Right click blank → New Folder / Upload File / Upload Zip App                 |
| M5.2 | Right click item → Delete / Rename                                            |
| M5.3 | Create folder работает в C:/My Documents/\*\*                                 |
| M5.4 | Upload file добавляет объект в S3, появляется в list                          |
| M5.5 | Upload zip app: gateway распаковывает, валидирует index.html; fail → rollback |
| M5.6 | Delete удаляет item                                                           |
| M5.7 | Rename переименовывает item (same-parent only; move not supported)            |

### M6 — Security gates

| AC   | Критерий                                                                              |
| ---- | ------------------------------------------------------------------------------------- |
| M6.1 | User app fetch(api.shell.local) → 403 / blocked                                       |
| M6.2 | Explorer может вызывать gateway API                                                   |
| M6.3 | Viewer не вызывает gateway; только читает signed URL                                  |
| M6.4 | Gateway: Read API — Shell origin; Write API — Explorer + system token; user app → 403 |

---

## Analytics Events

### Explorer Events

| Event                      | Payload                                                 | When               |
| -------------------------- | ------------------------------------------------------- | ------------------ |
| explorer_open              | —                                                       | Root opened        |
| explorer_navigate          | `{ from, to, method: "dblclick" \| "up" \| "address" }` | Path changed       |
| explorer_select            | `{ path, kind }`                                        | Item selected      |
| explorer_context_menu_open | `{ target: "blank" \| "item", path? }`                  | Context menu shown |
| explorer_create_folder     | `{ parentPath, name, result: "ok" \| "fail", error? }`  | Create folder done |
| explorer_upload_file       | `{ parentPath, type, size, result }`                    | Upload file done   |
| explorer_upload_zip_app    | `{ parentPath, result, hasIndexHtml, error? }`          | Upload zip done    |
| explorer_delete            | `{ path, kind, result }`                                | Delete done        |
| explorer_rename            | `{ fromPath, toPath, result, error? }`                  | Rename done        |
| explorer_open_request      | `{ kind: "file" \| "app", path, targetApp? }`           | SHELL_OPEN sent    |

### Shell Events

| Event                    | Payload                    | When                     |
| ------------------------ | -------------------------- | ------------------------ |
| shell_open_from_explorer | `{ kind, path, windowId }` | Viewer/app window opened |
| shell_open_denied        | `{ reason, path, appId }`  | Open rejected (policy)   |

### Gateway Events

| Event             | Payload                                | When          |
| ----------------- | -------------------------------------- | ------------- |
| fs_create_folder  | path, result, durationMs               | Create folder |
| fs_upload_file    | path, size, result, durationMs         | Upload file   |
| fs_upload_zip_app | path, result, hasIndexHtml, durationMs | Upload zip    |
| fs_delete         | path, result, durationMs               | Delete        |
| fs_rename         | fromPath, toPath, result, durationMs   | Rename        |
| permission_denied | reason, path, caller                   | Write denied  |

---

## Tests

### UAT/BDD

- [ ] UAT 1: Open My Computer, double click C:, see system folders
- [ ] UAT 2: Double click image → viewer window opens
- [ ] UAT 3: Right click blank → create folder → folder appears
- [ ] UAT 4: Right click item → delete → item disappears
- [ ] UAT 5: Right click item → rename → name changes
- [ ] UAT 6: User app fetch(api.shell.local) → deny

### Test Files

- Unit: `back/__tests__/fp3/permissions.test.ts` (gateway permission model)
- Integration: `back/__tests__/fp3/api-fs-write.integration.test.ts`, `back/__tests__/fp3/security.integration.test.ts`, `back/__tests__/fp3/isapp.integration.test.ts`, `back/__tests__/fp3/open-url-viewer.integration.test.ts`
- E2E: `e2e/fp3-explorer.spec.ts` (Playwright; M3 T-M3.3, M6 T-M6.1: user app fetch → 403)

### Coverage

- Gateway: permission checks, write endpoints
- Explorer: navigation, context menu, SHELL_OPEN

---

## Plan / Milestones

| M   | Milestone                                  | Tasks                                                 | Status |
| --- | ------------------------------------------ | ----------------------------------------------------- | ------ |
| M1  | My Computer → Explorer window + root A/C/D | Desktop icon, createWindow Explorer, APP_READY, roots | done   |
| M2  | Navigate C:/ and folders                   | list C:/, system paths, breadcrumbs, A/D              | done   |
| M3  | App-dir + run app                          | isApp, SHELL_OPEN app, Shell opens app window         | done   |
| M4  | Viewers for files                          | SHELL_OPEN file, ImageViewer, signed URL              | done   |
| M5  | Context menus + ops                        | New Folder, Upload, Delete, Rename                    | done   |
| M6  | Security gates                             | User app deny, Explorer allow, Viewer signed-only     | done   |

---

## Risks

| Risk                                    | Probability | Impact | Mitigation                                                      | Status |
| --------------------------------------- | ----------- | ------ | --------------------------------------------------------------- | ------ |
| Explorer iframe CORS to api.shell.local | medium      | high   | Same-origin or allowlist; Explorer served from shell.local path | open   |
| Zip validation edge cases               | low         | medium | Strict index.html check; rollback on fail                       | open   |
| 98.css bundle size                      | low         | low    | Local subset, tree-shake                                        | open   |

---

## Dependencies

- FP1 (Shell, AppHost, postMessage) — done
- FP2 (Gateway, roots, list, stat, open-url) — done
- **MinIO fixtures (MUST):**
  - DISK_A exists (empty), DISK_D exists (empty), DISK_C exists
  - DISK_C contains system folders (WINDOWS, Program Files, My Documents, Recycled, Temporary Internet Files) + boot files
  - Explorer app at `C:/Program Files/Explorer/` — copied from repo during dev-init (D10); fixture for app-discovery only, NOT boot source
  - Gateway returns roots = DISK_A, DISK_C, DISK_D only (APPS deprecated)
  - Read-only policy enforced by gateway regardless of bucket contents

---

## Definition of Done

### Code & Structure

- Explorer реализован как app с index.html в `front/apps/explorer/`; runtime src = shell.local/apps/explorer/ (same-origin). S3 fixture at C:/Program Files/Explorer/ — для app-discovery, не для boot.
- Shell открывает Explorer через iframe src = shell.local/apps/explorer/ (не open-url).
- Никаких новых compose/Dockerfile; всё через `infra/`.

### Tests

- Unit: gateway permissions (explorer ok; user app denied).
- Integration: list roots (A/C/D), list C:/, create folder, upload, delete, rename, zip upload.
- E2E: My Computer → C: → image → viewer; context menu create/delete/rename.
- Security E2E: user app fetch(api.shell.local) → deny.

### Documentation

- `docs/fps/FP3.md` (этот документ).
- Обновление `docs/core/PROTOCOL_v0.md` (SHELL_OPEN, EXPLORER_CAPS).
- Обновление `docs/core/API.yaml` (write endpoints).
- Обновление `docs/dev/DEV_DOMAIN.md` при необходимости.

### Hygiene / Gates

- `node tools/check-doc-links.cjs docs/` PASS
- `./infra/smoke.sh` PLATFORM OK
- Container gate: `pnpm lint` + `pnpm format:check` + `pnpm test:api` + `pnpm test:e2e` (при добавлении)

---

## Non-Scope (FP3)

- Copy/paste, drag-select, hotkeys, Properties
- Реальная Корзина как UX
- Move (cross-parent rename; отдельный endpoint в FP4+). Cross-parent rename treated as move → REJECT in FP3.
- Control Panel / Printers / Dial-Up
- Мультиюзерность / ACL

---

## Evidence (M3)

| Item | Location | Notes |
| ---- | -------- | ----- |
| isApp integration | `back/__tests__/fp3/isapp.integration.test.ts` | list Program Files/Explorer, My Documents/sample-app → isApp true |
| E2E T-M3.3 | `e2e/fp3-explorer.spec.ts` | Double click sample-app → new window with iframe (src signed URL). Content assert requires s3.shell.local in /etc/hosts |
| Explorer dispatch | `front/apps/explorer/main.ts` | onItemDblClick: isApp or checkIsApp → SHELL_OPEN(kind=app, path, title) |
| Shell handler | `front/Shell.tsx` | handleShellOpen: kind=app → open-url → createWindow(src=signed URL) |
| Security | `front/core/AppHost.tsx` | SHELL_OPEN only when isExplorer && onShellOpen; Shell passes onShellOpen only for Explorer windows |

## Evidence (M5)

| Item | Location | Notes |
| ---- | -------- | ----- |
| api-fs-write integration | `back/__tests__/fp3/api-fs-write.integration.test.ts` | create-folder, upload-file, delete, rename same-parent, rename cross-parent 403, upload-zip-app |
| E2E T-M5.1/T-M5.2/T-M5.3 | `e2e/fp3-explorer.spec.ts` | Context menu blank (New Folder, Upload File, Upload Zip), item (Delete, Rename), New Folder flow |
| Gateway write endpoints | `back/src/index.ts` | create-folder, delete, rename, upload-file, upload-zip-app with token check |
| path-policy | `back/src/path-policy.ts` | checkWritable, validateRenameSameParent (cross-parent → 403) |
| Explorer | `front/apps/explorer/main.ts` | SHELL_CAPS listener (systemToken), context menu, fetchWithToken for write ops |

## Evidence (M4)

| Item | Location | Notes |
| ---- | -------- | ----- |
| open-url integration | `back/__tests__/fp3/open-url-viewer.integration.test.ts` | POST open-url returns url; GET on url returns 200 (requires stack) |
| E2E T-M4.1 | `e2e/fp3-explorer.spec.ts` | Double click sample-image.png → viewer window with iframe src /viewers/image.html?url=...; img has signed URL |
| Explorer file dispatch | `front/apps/explorer/main.ts` | onItemDblClick: file + image mime → SHELL_OPEN(kind=file, path, mime, title) |
| Shell viewer handler | `front/Shell.tsx` | handleShellOpen: kind=file + image/* → open-url → createWindow(src=/viewers/image.html?url=...) |
| ImageViewer | `front/viewers/image.html` | Reads url from query, sets img.src; sandbox allow-scripts only (no gateway access) |
| Security | `front/core/AppHost.tsx` | Viewer windows: isExplorer=false → sandbox allow-scripts only; token never sent |

---

## References

- [FP1: Shell MVP](../fps/FP1.md)
- [FP2: Gateway + FS](../fps/FP2.md)
- [PROTOCOL_v0](../core/PROTOCOL_v0.md)
- [THEMING_v0](../core/THEMING_v0.md)
- [UI_ADAPTER_v0](../core/UI_ADAPTER_v0.md)
- [FS_CONTRACT_v0](../core/FS_CONTRACT_v0.md)
- [API.yaml](../core/API.yaml)
- [CORS_SIGNED_URLS](../core/CORS_SIGNED_URLS.md)
- [SANDBOX_MATRIX](../core/SANDBOX_MATRIX.md)
- [DEV_DOMAIN](../dev/DEV_DOMAIN.md)
- [GUARDRAILS](../dev/GUARDRAILS.md)
- [FP2_TESTS](../tests/FP2_TESTS.md)
