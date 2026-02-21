# FP3 Tests Plan — Explorer + Shell Integration

**Purpose:** AC → test mapping for FP3 (Explorer system app, write endpoints, security).  
**Method:** Unit (gateway permissions), integration (API write ops), E2E (Playwright).

---

## 1. AC → Test Mapping

| AC   | Test ID  | Type | Description                                                     |
| ---- | -------- | ---- | --------------------------------------------------------------- |
| M1.1 | T-M1.1   | E2E  | Desktop has "My Computer" icon                                  |
| M1.2 | T-M1.2   | E2E  | Double click → Explorer window opens                            |
| M1.5 | T-M1.5   | E2E  | Explorer shows A:, C:, D: (roots = DISK_A, DISK_C, DISK_D only) |
| M1   | T-ROOTS  | Int  | GET /api/fs/roots returns only DISK_A, DISK_C, DISK_D; no APPS  |
| M2.1 | T-M2.1   | E2E  | Double click C: → list C:/                                      |
| M2.2 | T-M2.2   | E2E  | C:/ shows system folders + boot files                           |
| M5.1 | T-M5.1   | E2E  | Right click blank → context menu (New Folder, Upload...)        |
| M5.2 | T-M5.2   | E2E  | Right click item → Delete, Rename                               |
| M5.3 | T-M5.3   | Int  | Create folder in C:/My Documents/ → 200                         |
| M5.6 | T-M5.6   | Int  | Delete item in writable path → 200                              |
| M5.7 | T-M5.7   | Int  | Rename same-parent → 200; cross-parent → 403                    |
| M3.3 | T-M3.3   | E2E  | Double click app-dir → new Shell window with app iframe         |
| M4.1 | T-M4.1   | E2E  | Double click image → viewer window opens, img has signed URL    |
| M4   | T-M4-open-url | Int | POST open-url returns url; GET on url returns 200               |
| M6.1 | T-M6.1   | E2E  | User app fetch(api.shell.local) → 403/blocked                   |
| M6.4 | T-M6.4   | Unit | Write API without token → 403                                   |
| —    | T-PATH   | Unit | Path policy: write to C:/WINDOWS/ → 403                         |
| —    | T-RENAME | Unit | Rename cross-parent → 403                                       |

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

| Scenario                    | Steps                                                          |
| --------------------------- | -------------------------------------------------------------- |
| My Computer → roots         | Open Shell, double click My Computer, assert A:/C:/D: visible  |
| Navigate C:/                | Double click C:, assert system folders + boot files            |
| Context menu create folder  | Right click blank in My Documents, New Folder, assert created  |
| Context menu delete         | Right click item, Delete, assert item gone                     |
| Context menu rename         | Right click item, Rename, change name, assert updated          |
| Double click image → viewer | Double click image in My Documents, assert viewer window       |
| Double click app-dir → app  | Double click sample-app in My Documents, assert new window with app iframe (T-M3.3) |
| User app deny               | Load user app iframe, fetch api.shell.local → expect 403/block |

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
| DISK_C/My Documents/ | sample-image.png, sample.txt (viewer), sample-app/ (index.html for M3 app-dir run)                                                                               |

**Init:** minio-init copies DISK_A, DISK_D, DISK_C. APPS deprecated; gateway roots = A/C/D only. Explorer in S3 (C:/Program Files/Explorer/) is fixture for app-discovery; runtime boot from shell.local/apps/explorer/.

---

## 6. Commands Summary

| Command                            | Purpose                                |
| ---------------------------------- | -------------------------------------- |
| `pnpm test -- back/__tests__/fp3/` | Unit tests (permissions, path, rename) |
| `pnpm test:api`                    | Integration (includes FP3 write)       |
| `pnpm test:e2e`                    | E2E Playwright (fp3-explorer)          |
