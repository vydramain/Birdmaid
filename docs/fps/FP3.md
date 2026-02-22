# FP3: Explorer App (System App) + Shell Integration

**Status:** plan  
**Created:** 2025-02-20  
**Updated:** 2025-02-20 (pre-design patch)  
**Archived snapshot:** [archive/FP4/](../../archive/FP4/README.md) (2025-02-22)

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

### Security DoD (FP3 + FP3.2)

**Sandbox:** Explorer `allow-scripts allow-same-origin`; User app `allow-scripts`; Viewer `allow-scripts`. Token only in SHELL_CAPS to Explorer windows. Gateway Write API requires X-System-App + X-System-Token. CORS allowlist only. Path policy: writable only C:/My Documents/\*\*; rename same-parent only. FP3.2: no changes to security model.

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

### FS Behavior (Rename, Delete, Zip)

**Rename path rule:** `toPath = dirname(fromPath) + newName` (+ `/` for dir). Explorer: `parentPath = dirname(fromPath)`; `toPath = kind==="dir" ? parentPath + newName + "/" : parentPath + newName`. Cross-parent → 403.

**Delete flow:** Right click → Delete → confirm → spinner instead of label → 204 → tile removed; 4xx/5xx → revert label, log only.

**Zip upload open race:** First open after zip upload may 404 (S3 eventual consistency). Client retry 2–3× with backoff (200–500ms) or gateway retry on open-url.

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

### Protocol Extensions (FP1 § Protocol)

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

## Gate Commands

| Command                      | Required | Suites                                        |
| ---------------------------- | -------- | --------------------------------------------- |
| `git status --porcelain`     | yes      | —                                             |
| `./infra/smoke.sh`           | yes      | —                                             |
| `./infra/test-lint.sh`       | yes      | —                                             |
| `./infra/test-unit.sh`       | no       | FP3 unit optional in DoD                      |
| `./infra/test-api-fp.sh FP3` | yes      | `back/__tests__/fp2/` + `back/__tests__/fp3/` |
| `./infra/test-e2e-fp.sh FP3` | yes      | `e2e/fp3-explorer.spec.ts` (Playwright image) |

**Run gate:** `./infra/gate.sh FP3`

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
- Protocol extensions (SHELL_OPEN) — docs/fps/FP1.md § Protocol.
- Обновление `docs/core/API.yaml` (write endpoints).
- ARCHITECTURE § Dev Domain, infra/README — актуальны.

### Gate Commands

| Command                      | Expected exit   | E2E in DoD | Evidence (M5)        |
| ---------------------------- | --------------- | ---------- | -------------------- |
| `git status --porcelain`     | 0 (empty)       | —          | Commit before gate   |
| `./infra/smoke.sh`           | 0 (PLATFORM OK) | —          | `PLATFORM OK`        |
| `./infra/test-lint.sh`       | 0               | —          | lint + format:check  |
| `./infra/test-api-fp.sh FP3` | 0               | —          | 46 passed            |
| `./infra/test-e2e-fp.sh FP3` | 0               | **yes**    | 30 passed, 0 skipped |

**Canonical (container):** `./infra/gate.sh FP3`. Host-only: `git status`, `./infra/smoke.sh`. Host `pnpm lint/test/etc` prohibited for gate. Prerequisite: `docker compose -f infra/docker-compose.dev.yml up -d`. Any non-zero exit → REJECT. No partial PASS.

**Evidence paths:** `back/__tests__/fp3/*.ts`, `e2e/fp3-explorer.spec.ts`, `front/apps/explorer/main.ts`.

### Hygiene / Gates

- `node tools/check-doc-links.cjs docs/` PASS
- `./infra/smoke.sh` PLATFORM OK
- All Gate Commands exit=0 for PASS (no "Partial PASS", no "known failing", no skipped FP tests)

---

## Non-Scope (FP3)

- Copy/paste, drag-select, hotkeys, Properties
- Реальная Корзина как UX
- Move (cross-parent rename; отдельный endpoint в FP4+). Cross-parent rename treated as move → REJECT in FP3.
- Control Panel / Printers / Dial-Up
- Мультиюзерность / ACL

---

## Evidence (M3)

| Item              | Location                                       | Notes                                                                                                                   |
| ----------------- | ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| isApp integration | `back/__tests__/fp3/isapp.integration.test.ts` | list Program Files/Explorer, My Documents/sample-app → isApp true                                                       |
| E2E T-M3.3        | `e2e/fp3-explorer.spec.ts`                     | Double click sample-app → new window with iframe (src signed URL). Content assert requires s3.shell.local in /etc/hosts |
| Explorer dispatch | `front/apps/explorer/main.ts`                  | onItemDblClick: isApp or checkIsApp → SHELL_OPEN(kind=app, path, title)                                                 |
| Shell handler     | `front/Shell.tsx`                              | handleShellOpen: kind=app → open-url → createWindow(src=signed URL)                                                     |
| Security          | `front/core/AppHost.tsx`                       | SHELL_OPEN only when isExplorer && onShellOpen; Shell passes onShellOpen only for Explorer windows                      |

## Evidence (M5)

| Item                     | Location                                              | Notes                                                                                            |
| ------------------------ | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| api-fs-write integration | `back/__tests__/fp3/api-fs-write.integration.test.ts` | create-folder, upload-file, delete, rename same-parent, rename cross-parent 403, upload-zip-app  |
| E2E T-M5.1/T-M5.2/T-M5.3 | `e2e/fp3-explorer.spec.ts`                            | Context menu blank (New Folder, Upload File, Upload Zip), item (Delete, Rename), New Folder flow |
| Gateway write endpoints  | `back/src/index.ts`                                   | create-folder, delete, rename, upload-file, upload-zip-app with token check                      |
| path-policy              | `back/src/path-policy.ts`                             | checkWritable, validateRenameSameParent (cross-parent → 403)                                     |
| Explorer                 | `front/apps/explorer/main.ts`                         | SHELL_CAPS listener (systemToken), context menu, fetchWithToken for write ops                    |

## Evidence (M4)

| Item                   | Location                                                 | Notes                                                                                                         |
| ---------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| open-url integration   | `back/__tests__/fp3/open-url-viewer.integration.test.ts` | POST open-url returns url; GET on url returns 200 (requires stack)                                            |
| E2E T-M4.1             | `e2e/fp3-explorer.spec.ts`                               | Double click sample-image.png → viewer window with iframe src /viewers/image.html?url=...; img has signed URL |
| Explorer file dispatch | `front/apps/explorer/main.ts`                            | onItemDblClick: file + image mime → SHELL_OPEN(kind=file, path, mime, title)                                  |
| Shell viewer handler   | `front/Shell.tsx`                                        | handleShellOpen: kind=file + image/\* → open-url → createWindow(src=/viewers/image.html?url=...)              |
| ImageViewer            | `front/viewers/image.html`                               | Reads url from query, sets img.src; sandbox allow-scripts only (no gateway access)                            |
| Security               | `front/core/AppHost.tsx`                                 | Viewer windows: isExplorer=false → sandbox allow-scripts only; token never sent                               |

---

## FP3 Patchset (Post-Build Gaps, M5–M9)

**Status:** design  
**Created:** 2025-02-21  
**Context:** FP3 build частично реализован; выявлены gaps в UX, async-flows, upload. Delta без изменения глобального scope.  
**Source of truth:** этот раздел; тесты — docs/tests/FP3_TESTS.md.

### FP3 Patchset Before→After (P0/P1)

| #   | Before (current)                | After (patchset)                                                |
| --- | ------------------------------- | --------------------------------------------------------------- |
| 1   | No Back button                  | Back слева от address bar; history stack; disabled если пусто   |
| 2   | Tiles auto-fill, variable width | Фикс. ширина, 3 строки текста, ellipsis                         |
| 3   | RMB только на grid items        | RMB по всей области контента (включая ниже последнего ряда)     |
| 4   | DesktopIcon ≠ Explorer tiles    | Единый набор иконок (folder, file, disk, My Computer)           |
| 5   | Rename: prompt                  | Inline input, Enter/click-out commit, spinner, apply/revert     |
| 6   | Create: prompt для имени        | "Новая Папка" / "Новая Папка N", сразу rename flow              |
| 7   | Delete: confirm → reload        | Spinner pending, remove on success, revert on fail              |
| 8   | Errors: UI message              | Только logs (no toasts)                                         |
| 9   | Upload: 500, no allowlist       | allowlist png/jpg/webp/mp3/mp4/webm; 1..10 files; optimistic UI |
| 10  | Upload zip: как file            | Только zip, 1 файл; rollback on no index.html                   |
| 11  | State lost on minimize          | Path (+ опц. selection) восстанавливается при restore           |

### FP3 Patchset Requirements (A1..D1)

| ID  | Requirement                                                                                                                                            | Priority |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- |
| A1  | Back button слева от address bar; ведёт на предыдущий путь в истории; disabled если истории нет                                                        | P0       |
| A2  | Tile: фиксированная ширина, квадрат (aspect-ratio: 1); текст меньший, перенос до 3 строк; ellipsis; текст под иконкой; путь в заголовке окна и taskbar | P0       |
| A3  | Blank space: grid занимает всю видимую область; RMB в любой точке пустой области → context menu "blank"                                                | P0       |
| A4  | Desktop и Explorer используют одну и ту же компоненту для иконок (имитация Win98 desktop)                                                              | P0       |
| B1  | Rename: inline input, Enter/click-out commit, spinner pending, apply only on success, revert on fail, logs only                                        | P0       |
| B2  | Create folder: "Новая Папка", auto-increment при конфликте; placeholder + rename сразу; rollback on fail                                               | P0       |
| B3  | Delete: spinner pending, remove on success, revert on fail; logs only                                                                                  | P0       |
| B4  | Errors: только в логах (no UI toasts yet)                                                                                                              | P0       |
| C1  | Upload file: 1..10 файлов; allowlist png/jpg/webp, mp3, mp4/webm; per-file placeholder+spinner; remove on fail                                         | P0       |
| C2  | Upload zip app: только 1; placeholder+spinner; validate index.html + rollback                                                                          | P0       |
| C3  | Upload: no uncontrolled 500; controlled 400/403/413/415; request id + error code в логах                                                               | P0       |
| D1  | Explorer: при minimize/blur и restore/focus сохранять текущий path (минимум path; опционально selection/scroll)                                        | P0       |

### FP3 Patchset Acceptance Criteria

| AC   | Критерий (проверяемый)                                                                |
| ---- | ------------------------------------------------------------------------------------- |
| A1.1 | Back button виден слева от address bar                                                |
| A1.2 | Back disabled когда history пуст                                                      |
| A1.3 | Back click → переход на предыдущий путь в истории (без Shell)                         |
| A2.1 | Tile фиксированной ширины (одинаково для всех)                                        |
| A2.2 | Текст: меньший шрифт, до 3 строк, ellipsis при overflow                               |
| A2.3 | Текст всегда под иконкой                                                              |
| A3.1 | Grid контейнер занимает всю область контента до status bar                            |
| A3.2 | RMB в пустой области (под последним рядом) → context menu blank                       |
| A4.1 | Desktop и Explorer — одна компонента для иконок (folder, file, disk, My Computer)     |
| B1.1 | Rename: label → input inline; Enter или click-out = commit; Escape = cancel           |
| B1.2 | Pending: spinner вместо label; UI не меняет имя до success                            |
| B1.3 | Success: tile показывает новое имя; Fail: откат к старому; ошибка в логах             |
| B2.1 | New Folder: создаётся "Новая Папка" или "Новая Папка N" при конфликте                 |
| B2.2 | Placeholder появляется сразу; сразу запускается rename flow                           |
| B2.3 | Create fail: placeholder исчезает; ошибка в логах                                     |
| B3.1 | Delete: spinner вместо названия пока в полёте                                         |
| B3.2 | Success: item исчезает; Fail: label возвращается; ошибка в логах                      |
| C1.1 | Upload file: 1..10; allowlist png/jpg/webp, mp3, mp4/webm                             |
| C1.2 | Per-file placeholder со spinner; success → реальный tile; fail → placeholder исчезает |
| C2.1 | Upload zip: только 1; placeholder+spinner; success → app-dir tile; fail → исчезает    |
| C3.1 | Корректные upload запросы → 2xx или 4xx (не 500)                                      |
| D1.1 | Minimize → restore: Explorer на том же path                                           |

### FP3 Patchset UX Spec (flows)

**Back (A1):** Слева от address bar; Win98-style; disabled когда history пуст; click → предыдущий путь (stack).  
**Tile (A2):** Фиксированная ширина, `aspect-ratio: 1`; иконка сверху, текст снизу; `font-size: 0.75rem`, `-webkit-line-clamp: 3`, `text-overflow: ellipsis`. Текущий путь из address bar — в заголовке окна и taskbar.  
**Blank (A3):** Grid `min-height: 100%`/flex-grow; RMB вне `[data-explorer-item]` → context menu blank.  
**Shared icons (A4):** Desktop использует ту же компоненту, что и Explorer (folder, file, disk, My Computer).  
**Rename (B1):** Context menu → Rename → label→input inline, selectAll; Enter/click-out=commit; Escape=cancel; pending=spinner; success/fail=apply/revert.  
**Create folder (B2):** "Новая Папка" или "Новая Папка N"; placeholder сразу; API; success→rename flow; fail→placeholder исчезает.  
**Delete (B3):** Spinner вместо label; success→item gone; fail→revert.  
**Upload file (C1):** 1..10; allowlist png/jpg/webp/mp3/mp4/webm; per-file placeholder+spinner.  
**Upload zip (C2):** 1 zip; placeholder; rollback on fail.  
**State (D1):** currentPath в state; minimize→restore сохраняет path.

### FP3 Patchset Non-Scope

- UI уведомления (toasts) об ошибках — позже
- F2 rename (только context menu Rename в MVP)
- Copy/paste, drag-select, Properties
- Move (cross-parent)

### FP3 Patchset Risks

| Risk                          | Probability | Impact | Mitigation                           |
| ----------------------------- | ----------- | ------ | ------------------------------------ |
| Upload 500 root cause unknown | medium      | high   | API contract + error mapping; logs   |
| History state edge cases      | low         | low    | Minimize path only; no scroll/select |

### FP3 Patchset Analytics Events

| Event                          | Payload                    | When                |
| ------------------------------ | -------------------------- | ------------------- |
| explorer_nav_back              | —                          | Back clicked        |
| explorer_nav_open              | path, kind=dir\|disk       | Path opened         |
| explorer_context_open          | target=blank\|item, path?  | Context menu shown  |
| explorer_rename_start          | path                       | Rename input opened |
| explorer_rename_commit         | fromPath, toPath           | Enter/click-out     |
| explorer_rename_success        | fromPath, toPath           | Server 200          |
| explorer_rename_fail           | fromPath, toPath, error    | Server 4xx/5xx      |
| explorer_create_folder_start   | parentPath                 | New Folder clicked  |
| explorer_create_folder_success | path, name                 | Server 201          |
| explorer_create_folder_fail    | parentPath, error          | Server fail         |
| explorer_delete_start          | path                       | Delete clicked      |
| explorer_delete_success        | path                       | Server 204          |
| explorer_delete_fail           | path, error                | Server fail         |
| explorer_upload_file_start     | count                      | Files selected      |
| explorer_upload_file_success   | count, paths               | All succeeded       |
| explorer_upload_file_fail      | count, failedCount, errors | Some/all failed     |
| explorer_upload_zip_start      | —                          | Zip selected        |
| explorer_upload_zip_success    | path                       | Server 201          |
| explorer_upload_zip_fail       | error                      | Server fail         |

### FP3 Patchset Design Package Index

| Doc                                | Purpose                                                           |
| ---------------------------------- | ----------------------------------------------------------------- |
| [API.yaml](../core/API.yaml)       | Upload contract, allowlist, error codes (FP3 merged)              |
| [FP3_TESTS](../tests/FP3_TESTS.md) | AC→tests mapping, patchset delta (T-A1.x, T-B1.x, T-C1.x, T-D1.1) |
| FP3 § Security DoD                 | Sandbox, token, CORS, path policy (merged)                        |
| FP3 § Patchset                     | Design decisions (merged)                                         |
| [UX_MAP](../core/UX_MAP.md)        | CTA (nav_back), flows ref                                         |

### FP3 Patchset DoD (Design-stage)

- [x] Requirements A1..D1 задокументированы
- [x] UX spec в FP3.md (back, tile, blank, flows)
- [x] API.yaml: upload contract, error codes (merged)
- [x] Security DoD: user apps deny, token Explorer-only (FP3 § Security DoD)
- [x] FP3_TESTS.md: patchset delta
- [x] Patchset decisions in FP3
- [x] UX_MAP.md: nav_back CTA

### FP3 Patchset DoD (Build-stage, reference)

- [ ] Все AC покрыты тестами (unit+api+e2e где уместно)
- [ ] Нет 500 на корректных upload (2xx/4xx)
- [ ] Ошибки операций логируются (без UI)
- [ ] Desktop/Explorer — один источник иконок
- [ ] Back button работает и покрыт e2e
- [ ] Placeholders/spinners для rename/create/delete/upload
- [ ] Restore после minimize сохраняет path

---

## Pre-FP4 TODO

- [x] API_FP3_DELTA merged into docs/core/API.yaml

**Docs consolidation:** FP3 patchset (M5–M9) merged into FP3; no separate patchset entity. Audit: docs/audit/FP3_AUDIT_REPORT.md (M6 + M10).

---

## FP3.2 Explorer UX & Shell Maximize Fixes

**Context:** Follow-up к FP3. Решает 10 выявленных UX/API/Shell issues.

### Problem Statement (10 issues)

| #   | Issue                             | Fix                                       |
| --- | --------------------------------- | ----------------------------------------- |
| 1   | Roots: tile "Computer" в корне    | Только A:, C:, D:; без Computer tile      |
| 2   | Scroll скрывает toolbar           | Sticky toolbar; scroll только у tiles     |
| 3   | Back = текст                      | Back = иконка ←                           |
| 4   | App-dir = folder icon             | App icon (fs-icon-app)                    |
| 5   | Первый open после zip → 404       | Retry до 200                              |
| 6   | Multi-explorer: path сбрасывается | State persist при focus/blur              |
| 7   | Delete не отправляет запрос       | Delete → fetch DELETE; spinner; tile gone |
| 8   | Rename toPath wrong (nested)      | toPath = dirname(fromPath) + newName      |
| 9   | Roots: toolbar показан            | Toolbar скрыт в roots                     |
| 10  | Maximize не работает              | bounds = viewport; unmaximize → restore   |

### FP3.2 Acceptance Criteria (A1..A10)

| AC  | Subsystem     | Критерий                                    |
| --- | ------------- | ------------------------------------------- |
| A1  | Explorer      | Roots: только A:, C:, D:; нет Computer tile |
| A2  | Explorer      | Toolbar sticky; scroll только у списка      |
| A3  | Explorer      | Back = иконка ←                             |
| A4  | App-discovery | Папки с index.html → app icon               |
| A5  | App open      | Первый open после zip → 200 (retry)         |
| A6  | Explorer      | Multi-explorer: path сохраняется при focus  |
| A7  | FS write      | Delete: запрос отправляется, item исчезает  |
| A8  | FS write      | Rename: toPath = parent + newBasename       |
| A9  | Explorer      | Roots: нет toolbar                          |
| A10 | Shell         | Maximize → viewport; unmaximize → restore   |

### FP3.2 Evidence

| Item                   | Location                                  |
| ---------------------- | ----------------------------------------- |
| Roots/toolbar          | `front/apps/explorer/main.ts`             |
| Delete/Rename          | `front/apps/explorer/main.ts`             |
| WindowManager maximize | `front/core/WindowManager.ts`             |
| Shell maximize         | `front/Shell.tsx`                         |
| App icon               | `front/shared/fs-tile.css` `.fs-icon-app` |
| Retry                  | `front/Shell.tsx`, `back/src/fs.ts`       |

Tests: см. [FP3_TESTS.md](../tests/FP3_TESTS.md) § FP3.2.

---

## References

- [FP1: Shell MVP](FP1.md)
- [FP2: Gateway + FS](FP2.md)
- [API.yaml](../core/API.yaml) — upload contract, error codes (FP3)
- [FP3_TESTS](../tests/FP3_TESTS.md) — тест-план, patchset delta
- FP3 § Patchset — design decisions
- [FP1 § Protocol](FP1.md) (SHELL_OPEN)
- [THEMING](../core/THEMING.md)
- FP1 § Customization (UI slots)
- [ARCHITECTURE](../dev/ARCHITECTURE.md) (FS path scheme)
- [API.yaml](../core/API.yaml)
- [ARCHITECTURE](../dev/ARCHITECTURE.md) (CORS)
- FP3 § Security (sandbox matrix)
- [ARCHITECTURE](../dev/ARCHITECTURE.md) § Dev Domain
- [GUARDRAILS](../dev/GUARDRAILS.md)
- [FP2_TESTS](../tests/FP2_TESTS.md)
