# FP3 Tests Plan — Explorer + Shell Integration

**Purpose:** AC → test mapping for FP3 (Explorer system app, write endpoints, security).  
**Method:** Unit (gateway permissions), integration (API write ops), E2E (Playwright).  
**Convention:** Один файл — много итераций. FP3 patchset delta — секция 6. Source of truth: docs/fps/FP3.md.

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

**M3 T-M3.3 note:** E2E verifies new window + iframe with signed URL. Full AC (iframe content loads) requires `127.0.0.1 s3.shell.local` in /etc/hosts (see docs/dev/DEV_DOMAIN.md).

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
| —    | T-M7-U1  | E2E  | Upload multiple: placeholders → success (skipped)                   |
| —    | T-M7-U2  | E2E  | Upload fail: placeholder removed (skipped)                          |
| C2.1 | T-M8-Z1  | Int  | Upload zip without index.html → 400 NO_INDEX_HTML, no partial files |
| —    | T-M8-Z1  | E2E  | Upload zip success → app tile (skipped)                             |
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
| Upload flow        | T-M7: allowlist 415, 2xx integration; E2E T-M7-U1/U2 skipped (filechooser in iframe not supported)          |
| Upload zip flow    | T-M8-Z1: no index.html → 400, no partial; E2E T-M8-Z1 skipped (filechooser)                                 |
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

**Upload UI via filechooser in iframe** — outside E2E scope. Playwright `filechooser` does not fire for inputs inside iframes. T-M7-U1/U2, T-M8-Z1 (E2E) remain skipped.

**Coverage:** Integration tests T-C1.1, T-C1.2, T-C3.1, T-M8-Z1 cover allowlist, 415, 2xx, NO_INDEX_HTML.
