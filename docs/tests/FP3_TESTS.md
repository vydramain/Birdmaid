# FP3 Tests Plan — Explorer + Shell Integration

**Purpose:** AC → test mapping for FP3 + FP3.2 (Explorer, write endpoints, security, Explorer UX, Shell maximize).  
**Method:** Unit, integration (API), E2E (Playwright).  
**Convention:** Один файл — много итераций. FP3 patchset §6; FP3.2 §9. Source of truth: docs/fps/FP3.md.

---

## 1. AC → Test Mapping

| AC   | Test ID       | Type | Description                                                     |
| ---- | ------------- | ---- | --------------------------------------------------------------- |
| M1.1 | T-M1.1        | E2E  | Desktop has "My Computer" icon                                  |
| M1.2 | T-M1.2        | E2E  | Double click → Explorer window opens                            |
| M1.5 | T-M1.5        | E2E  | Explorer shows A:, C:, D: (roots = DISK_A, DISK_C, DISK_D only) |
| M1   | T-ROOTS       | Int  | GET /api/fs/roots returns only DISK_A, DISK_C, DISK_D; no APPS  |
| M2.1 | T-M2.1        | E2E  | Double click C: → list C:/                                      |
| M2.2 | T-M2.2        | E2E  | C:/ shows system folders + boot files                           |
| M5.1 | T-M5.1        | E2E  | Right click blank → context menu (New Folder, Upload...)        |
| M5.2 | T-M5.2        | E2E  | Right click item → Delete, Rename                               |
| M5.3 | T-M5.3        | Int  | Create folder in C:/My Documents/ → 200                         |
| M5.6 | T-M5.6        | Int  | Delete item in writable path → 200                              |
| M5.7 | T-M5.7        | Int  | Rename same-parent → 200; cross-parent → 403                    |
| M3.3 | T-M3.3        | E2E  | Double click app-dir → new Shell window with app iframe         |
| M4.1 | T-M4.1        | E2E  | Double click image → viewer window opens, img has signed URL    |
| M4   | T-M4-open-url | Int  | POST open-url returns url; GET on url returns 200               |
| M6.1 | T-M6.1        | E2E  | User app fetch(api.shell.local) → 403/blocked                   |
| M6.4 | T-M6.4        | Unit | Write API without token → 403                                   |
| —    | T-PATH        | Unit | Path policy: write to C:/WINDOWS/ → 403                         |
| —    | T-RENAME      | Unit | Rename cross-parent → 403                                       |

---

## 2. Unit Tests

**Location:** `back/__tests__/fp3/`

| File                        | Coverage                                          |
| --------------------------- | ------------------------------------------------- |
| `permissions.test.ts`       | Gateway: caller=app → 403; Explorer+token → allow |
| `path-policy.test.ts`       | Write deny: WINDOWS, Program Files, A:, D:, boot  |
| `rename-validation.test.ts` | dirname(from) === dirname(to); cross-parent → 403 |

**Commands:** `pnpm test -- back/__tests__/fp3/`

---

## 3. Integration Tests

**Location:** `back/__tests__/fp3/`

| File                                      | Coverage                                                   |
| ----------------------------------------- | ---------------------------------------------------------- |
| `api-fs-write.integration.test.ts`        | create-folder, upload-file, delete, rename (writable path) |
| `api-fs-write-denied.integration.test.ts` | write to C:/WINDOWS/ → 403; no token → 403                 |
| `open-url-viewer.integration.test.ts`     | POST open-url for image; GET on url returns 200 (M4)       |

**Fixtures:** MinIO must have DISK_A, DISK_C, DISK_D; DISK_C/My Documents/ writable.

**Commands:** `pnpm test:api` (extends existing suite)

---

## 4. E2E Tests

**Location:** `e2e/fp3-explorer.spec.ts`

| Scenario                    | Steps                                                                               |
| --------------------------- | ----------------------------------------------------------------------------------- |
| My Computer → roots         | Open Shell, double click My Computer, assert A:/C:/D: visible                       |
| Navigate C:/                | Double click C:, assert system folders + boot files                                 |
| Context menu create folder  | Right click blank in My Documents, New Folder, assert created                       |
| Context menu delete         | Right click item, Delete, assert item gone                                          |
| Context menu rename         | Right click item, Rename, change name, assert updated                               |
| Double click image → viewer | Double click image in My Documents, assert viewer window                            |
| Double click app-dir → app  | Double click sample-app in My Documents, assert new window with app iframe (T-M3.3) |
| User app deny               | Load user app iframe, fetch api.shell.local → expect 403/block                      |

**Commands:** `pnpm test:e2e` (or `npx playwright test e2e/fp3-explorer.spec.ts`)

**M3 T-M3.3 note:** E2E verifies new window + iframe with signed URL. Full AC (iframe content loads) requires `127.0.0.1 s3.shell.local` in /etc/hosts (see docs/dev/ARCHITECTURE.md § Dev Domain).

**M4 T-M4.1 note:** Requires `sample-image.png` in My Documents fixture. Run `docker compose -f infra/docker-compose.dev.yml run --rm minio-init` after adding fixtures.

---

## 5. Fixtures Plan (MinIO)

**Location:** `infra/minio/fixtures/`

| Root                 | Content                                                                                                                                                           |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| DISK_A               | Empty (mkdir only)                                                                                                                                                |
| DISK_D               | Empty (mkdir only)                                                                                                                                                |
| DISK_C               | WINDOWS/, Program Files/Explorer/, My Documents/, Recycled/, Temporary Internet Files/; boot files (MSDOS.SYS, etc.); Explorer app (index.html + 98.css + assets) |
| DISK_C/My Documents/ | sample-image.png, sample.txt (viewer), sample-app/ (index.html for M3 app-dir run)                                                                                |

**Init:** minio-init copies DISK_A, DISK_D, DISK_C. APPS deprecated; gateway roots = A/C/D only. Explorer in S3 (C:/Program Files/Explorer/) is fixture for app-discovery; runtime boot from shell.local/apps/explorer/.

---

## 6. FP3 Patchset Test Delta

### 6.1 New AC → Test Mapping (FP3 patchset)

**Mapping 11 gaps → tests:** A1 (Back), A2 (Tile), A3 (Blank RMB), A4 (Shared icons), B1–B3 (Rename/Create/Delete), C1–C2 (Upload), C3 (no 500), D1 (Restore state).

| AC   | Test ID  | Type | Description                                                         |
| ---- | -------- | ---- | ------------------------------------------------------------------- |
| A1.1 | T-A1.1   | E2E  | Back button visible left of address bar                             |
| A1.2 | T-A1.2   | E2E  | Back disabled when history empty                                    |
| A1.3 | T-A1.3   | E2E  | Back click → previous path in history                               |
| A2.1 | T-A2.1   | E2E  | Tile fixed width, text wrap 3 lines, ellipsis                       |
| A3.2 | T-A3.2   | E2E  | RMB in blank area below last row → context menu blank               |
| A4.1 | T-A4.1   | E2E  | My Computer icon same on Desktop and in Explorer                    |
| B1.1 | T-B1.1   | E2E  | Rename: inline input, Enter/click-out commit, Escape cancel         |
| B1.2 | T-B1.2   | E2E  | Rename pending: spinner; success: new name; fail: revert            |
| B2.1 | T-B2.1   | E2E  | New Folder: "Новая Папка" or "Новая Папка N"                        |
| B2.2 | T-B2.2   | E2E  | Placeholder + rename flow immediately                               |
| —    | T-M5-NF1 | E2E  | Create folder when none exists → "Новая Папка"                      |
| —    | T-M5-NF2 | E2E  | Create again → "Новая Папка 2"                                      |
| —    | T-M5-NF3 | E2E  | Placeholder+spinner behavior correct                                |
| —    | T-M5-NF4 | E2E  | Immediate rename input opens                                        |
| B3.1 | T-B3.1   | E2E  | Delete: spinner pending, success: item gone, fail: revert           |
| —    | T-M6-D1  | E2E  | Delete success: item removed from list (mock 204)                   |
| —    | T-M6-D2  | E2E  | Delete fail: item stays visible (mock 403, revert)                  |
| C1.1 | T-C1.1   | Int  | Upload file: allowlist png/jpg/webp/mp3/mp4/webm → 201              |
| C1.2 | T-C1.2   | Int  | Upload file: 415 for disallowed ext/mime                            |
| C3.1 | T-C3.1   | Int  | Valid upload request → 2xx (no 500)                                 |
| —    | T-M7-U1  | E2E  | Upload multiple: placeholders → success                             |
| —    | T-M7-U2  | E2E  | Upload fail: placeholder removed                                    |
| C2.1 | T-M8-Z1  | Int  | Upload zip without index.html → 400 NO_INDEX_HTML, no partial files |
| —    | T-M8-Z1  | E2E  | Upload zip success → app tile                                       |
| C2.1 | T-C2.1   | Int  | Upload zip: 1 file, rollback on no index.html                       |
| C3.1 | T-C3.1   | Int  | Valid upload request → 2xx or 4xx (not 500)                         |
| D1.1 | T-D1.1   | E2E  | Minimize → restore: same path                                       |

### 6.2 New Unit Tests (FP3 patchset)

| File                       | Coverage                                        |
| -------------------------- | ----------------------------------------------- |
| `upload-allowlist.test.ts` | Gateway: reject disallowed ext/mime → 415       |
| `upload-multipart.test.ts` | Multipart parsing, path+file required, maxFiles |

### 6.3 New Integration Tests (FP3 patchset)

| File                                        | Coverage                                             |
| ------------------------------------------- | ---------------------------------------------------- |
| `api-fs-upload.integration.test.ts`         | upload-file allowlist, 415, 413; upload-zip rollback |
| (extend `api-fs-write.integration.test.ts`) | rename 409, create 409, delete 404                   |

### 6.4 New E2E Tests (FP3 patchset)

| Scenario           | Steps                                                                                                       |
| ------------------ | ----------------------------------------------------------------------------------------------------------- |
| Back button        | Navigate C:/ → My Documents; Back → C:/; Back disabled at roots                                             |
| Tile layout        | Assert tile width, text wrap, ellipsis on long name                                                         |
| Blank area context | RMB below last row, assert context menu blank                                                               |
| Rename flow        | Rename item, Enter commit, assert new name; Rename, Escape, assert old                                      |
| Create folder flow | New Folder, assert "Новая Папка", rename inline                                                             |
| Delete flow        | Delete item, assert spinner then gone; T-M6-D1/D2 mock delete API; `addInitScript` stubs `confirm` (iframe) |
| Upload flow        | T-M7: allowlist 415, 2xx integration; E2E T-M7-U1/U2 use setInputFiles on hidden inputs                     |
| Upload zip flow    | T-M8-Z1: no index.html → 400, no partial; E2E T-M8-Z1 uses setInputFiles on upload-zip-input                |
| State persistence  | T-D1.1: minimize → restore → same path                                                                      |
| Upload file        | Upload png, assert tile; upload disallowed ext → 415                                                        |
| State persistence  | Navigate to path, minimize, restore, assert same path                                                       |

---

## 7. Commands Summary

| Command                            | Purpose                                           |
| ---------------------------------- | ------------------------------------------------- |
| `pnpm test -- back/__tests__/fp3/` | Unit tests (permissions, path, rename)            |
| `pnpm test:api`                    | Integration (includes FP3 write)                  |
| `./infra/test-api.sh`              | **Canonical** test:api (container; avoids rollup) |
| `pnpm test:e2e`                    | E2E Playwright (fp3-explorer)                     |

## 8. E2E Upload Policy (FP3 patchset)

**E2E upload uses `setInputFiles` on hidden inputs** — Explorer exposes persistent `input[type=file]` elements (`data-testid="upload-file-input"`, `data-testid="upload-zip-input"`) for Playwright. Tests call `frame.locator('[data-testid="upload-file-input"]').setInputFiles([...])` inside the Explorer iframe; no OS file chooser is used.

**Coverage:** T-M7-U1 (upload files success), T-M7-U2 (upload fail placeholder removed), T-M8-Z1 (upload zip success) run as E2E. Integration tests T-C1.1, T-C1.2, T-C3.1, T-M8-Z1 cover allowlist, 415, 2xx, NO_INDEX_HTML.

---

## 9. FP3.2 AC → Test Mapping (Explorer UX & Shell Maximize)

| AC | Test ID | Type | Description |
|----|---------|------|-------------|
| A1 | T-A1 | E2E | Roots: only A:, C:, D:; no "Computer" tile |
| A2 | T-A2 | E2E | Toolbar sticky; scroll only on file list |
| A3 | T-A3 | E2E | Back button = icon (arrow left), not text |
| A4 | T-A4 | E2E | Folders with index.html → app icon |
| A5 | T-A5 | Int | First open after zip upload → 200 (no 404 race) |
| A6 | T-A6 | E2E | Multi-explorer: path persists on focus change |
| A7 | T-A7 | Int | Delete: request sent, item removed |
| A8 | T-A8 | Int | Rename: toPath = same parent, new basename |
| A9 | T-A9 | E2E | Roots: no toolbar (address bar + back) |
| A10 | T-A10 | Unit | WindowManager: maximize → viewport; unmaximize → restore |

### FP3.2 E2E (e2e/fp3-explorer.spec.ts)

| Scenario | Steps | AC |
|----------|-------|-----|
| T-A1 | Open My Computer, assert only A:, C:, D:; no Computer tile | A1 |
| T-A2 | Navigate to dir, scroll, assert toolbar visible | A2 |
| T-A3 | Assert back = icon (←) | A3 |
| T-A4 | Dir with index.html → app icon | A4 |
| T-A6 | 2 Explorer, navigate, switch focus, paths unchanged | A6 |
| T-A9 | Roots view: no address bar, no back | A9 |

### FP3.2 Integration (back/__tests__/fp3/)

| Scenario | Steps | AC |
|----------|-------|-----|
| T-A5 | Upload zip, POST open-url for index.html → 200 | A5 |
| T-A7 | DELETE /api/fs/delete → 204; list → item gone | A7 |
| T-A8 | PUT rename: toPath = parent/newName → 200 | A8 |

### FP3.2 Unit (front/__tests__/fp1/WindowManager.test.ts)

| Scenario | Steps | AC |
|----------|-------|-----|
| T-A10 | maximize(viewport) → bounds; unmaximize → restore | A10 |
