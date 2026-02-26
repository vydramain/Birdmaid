# M0 Test Pollution Audit — S3 Artifacts & .gitkeep

**FP:** REPO  
**Mode:** build  
**Date:** 2026-02-26  
**Output:** Audit report only (no code changes)

---

## Queue-safety note

**Gate status at audit time:** RED — 2 FP3 API tests failing:

- `api-fs-write.integration.test.ts` T-A8 (rename dir → 403)
- `api-fs-upload.integration.test.ts` T-M8-Z1 (upload-zip no index.html)

Per queue-safety: fix baseline before implementing cleanup changes.

---

## 1. Suites that create S3 artifacts

### 1.1 Grep: create-folder / upload-file / upload-zip / delete / rename

| File                                                   | Operations                                                               | Creates S3? |
| ------------------------------------------------------ | ------------------------------------------------------------------------ | ----------- |
| `back/__tests__/fp3/api-fs-write.integration.test.ts`  | create-folder, upload-file, upload-zip-app, delete, rename               | **YES**     |
| `back/__tests__/fp3/api-fs-upload.integration.test.ts` | upload-file, upload-zip-app                                              | **YES**     |
| `back/__tests__/fp3/security.integration.test.ts`      | create-folder (expect 403)                                               | **NO**      |
| `back/__tests__/fp3/write-denied.integration.test.ts`  | create-folder (expect 403)                                               | **NO**      |
| `e2e/fp3-explorer.spec.ts`                             | create-folder, upload-file, upload-zip (all **mocked** via `page.route`) | **NO**      |

### 1.2 Exact test files creating fp3-test-_ / fp3-upload-_

| File                                                   | Prefix        | Tests                                                   |
| ------------------------------------------------------ | ------------- | ------------------------------------------------------- |
| `back/__tests__/fp3/api-fs-write.integration.test.ts`  | `fp3-test-`   | T-M5.3, T-M5.4, T-M5.6, T-A7, T-M5.7 (×2), T-A8, T-M5.5 |
| `back/__tests__/fp3/api-fs-upload.integration.test.ts` | `fp3-upload-` | T-C1.1, T-C1.2 (×2), T-M8-Z1, T-C3.1                    |

**Note:** T-C1.2 and T-M8-Z1 expect 415/400 → no S3 create. T-M5.6 and T-A7 delete after create → no leftover. All others leave artifacts.

---

## 2. S3 paths where artifacts are created

**API path scheme:** `/@root/{ROOT_ID}/{suffix}` → S3 key `roots/{ROOT_ID}/{suffix}`

| Test file     | basePath                      | S3 prefix                    |
| ------------- | ----------------------------- | ---------------------------- |
| api-fs-write  | `/@root/DISK_C/My Documents/` | `roots/DISK_C/My Documents/` |
| api-fs-upload | `/@root/DISK_C/My Documents/` | `roots/DISK_C/My Documents/` |

**Exact S3 locations:**

- `roots/DISK_C/My Documents/fp3-test-*` (folders, files)
- `roots/DISK_C/My Documents/fp3-upload-*` (files)
- `roots/DISK_C/My Documents/Новая Папка 3/` (T-A8 create, rename to "Новая Папка 343")
- `roots/DISK_C/My Documents/Новая Папка 343/` (T-A8 rename target — if test passed)

**Bucket:** `birdmaid-dev` (from `FS_S3_BUCKET` in docker-compose)

---

## 3. Cleanup status

### 3.1 afterEach / afterAll

| File                              | beforeAll        | afterEach | afterAll |
| --------------------------------- | ---------------- | --------- | -------- |
| api-fs-write.integration.test.ts  | ✓ (health check) | **none**  | **none** |
| api-fs-upload.integration.test.ts | ✓ (health check) | **none**  | **none** |

### 3.2 Global teardown

**None.** No shared `globalTeardown`, no `afterAll` in a root setup file, no cleanup script.

### 3.3 Per-test cleanup

- T-M5.6, T-A7: create → delete in same test → no leftover
- All other tests: create and never delete

---

## 4. How `.gitkeep` reaches S3

### 4.1 Root cause

1. **Fixtures contain `.gitkeep`** — 9 files in `infra/minio/fixtures/`:
   - `DISK_A/.gitkeep`
   - `DISK_C/My Documents/.gitkeep`
   - `DISK_C/My Documents/VeryLongFolderNameThatExceedsThreeLinesWhenRenderedInTile/.gitkeep`
   - `DISK_C/apps/.gitkeep`
   - `DISK_C/Recycled/.gitkeep`
   - `DISK_C/Temporary Internet Files/.gitkeep`
   - `DISK_C/Program Files/.gitkeep`
   - `DISK_C/WINDOWS/.gitkeep`
   - `DISK_D/.gitkeep`

2. **minio-init copies blindly** — `infra/docker-compose.dev.yml` lines 56–58:

   ```yaml
   mc cp --recursive /minio/fixtures/DISK_A/ myminio/birdmaid-dev/roots/DISK_A/ 2>/dev/null || true
   mc cp --recursive /minio/fixtures/DISK_C/ myminio/birdmaid-dev/roots/DISK_C/ 2>/dev/null || true
   mc cp --recursive /minio/fixtures/DISK_D/ myminio/birdmaid-dev/roots/DISK_D/ 2>/dev/null || true
   ```

   `mc cp --recursive` copies every file, including `.gitkeep`.

3. **upload-with-content-type.sh** — only overwrites media files (webp, png, jpg, mp3, mp4, webm). Does not remove `.gitkeep`.

**Result:** `.gitkeep` files exist in `birdmaid-dev/roots/**` after minio-init.

---

## 5. Recommended namespace and cleanup

### 5.1 Namespace

- **Path:** `C:/My Documents/.test/{runId}/` (or `_tests/` if preferred)
- **S3 prefix:** `roots/DISK_C/My Documents/.test/{runId}/`
- **runId:** `Date.now()` or `crypto.randomUUID()` per suite run
- **Naming:** `fp3-test-{testId}-{timestamp}` or `fp3-test-{op}-{timestamp}`

### 5.2 Cleanup mechanism

1. **Per-test (best effort):** `afterEach` — delete created paths for that test. Fails silently if test crashed before create.
2. **Global (guaranteed):** `afterAll` in each suite — list objects under `.test/{runId}/`, delete all. Use `GET /api/fs/list` + `DELETE /api/fs/delete` per item, or add a test-only `DELETE /api/fs/delete-prefix` if acceptable.
3. **Alternative:** S3 `ListObjectsV2` + `DeleteObjects` in a test helper (requires S3 client in test env; currently tests use HTTP API only).

### 5.3 .gitkeep fix

- **Option A:** Exclude from copy — `find` + `mc cp` only non-.gitkeep files
- **Option B:** Remove after copy — `mc rm` on `**/.gitkeep` in bucket after init
- **Option C:** Replace .gitkeep in fixtures with another mechanism (e.g. `.gitignore` with `!*/` for empty dirs; or a placeholder like `README`)

---

## 6. Summary

| Item                         | Status                                              |
| ---------------------------- | --------------------------------------------------- |
| Suites creating S3 artifacts | 2 (api-fs-write, api-fs-upload)                     |
| E2E creates S3               | No (all mocked)                                     |
| S3 path                      | `roots/DISK_C/My Documents/` (root of My Documents) |
| Cleanup exists               | **No**                                              |
| .gitkeep in S3               | **Yes** — via `mc cp --recursive`                   |
| Recommended namespace        | `.test/{runId}/` under My Documents                 |
| Recommended cleanup          | afterEach (best effort) + afterAll (guaranteed)     |

---

## 7. M1 Implementation (2026-02-26)

### Added

- `back/__tests__/helpers/test-namespace.ts` — `getTestNamespace()` returns `{ runId, basePath }` for `C:/My Documents/.test/<runId>/`
- `back/__tests__/fp3/s3-cleanup.assertion.integration.test.ts` — M1-CLEAN: asserts no fp3-test-_, fp4-test-_, fp3-upload-\* under My Documents
- `back/__tests__/fp3/namespace-policy.test.ts` — M1-NS: asserts polluting tests import `getTestNamespace`

### Baseline fixes (to achieve green before M1)

- `back/__tests__/fp2/api-fs.integration.test.ts` — CORS: accept `*` for signed URL (MinIO/Traefik)
- `back/__tests__/fp3/api-fs-write.integration.test.ts` — T-A8: use fp3-test-\* names; fix path-policy
- `back/src/path-policy.ts` — validateRenameSameParent: fix regex for paths ending with `/`

### M2 Implementation (2026-02-26)

- Refactored `api-fs-write.integration.test.ts` and `api-fs-upload.integration.test.ts` to use `getTestNamespace()` — artifacts under `C:/My Documents/.test/<runId>/`
- Added `afterEach` + `afterAll` cleanup via `cleanupTestNamespace()`
- Added `cleanupPollutionUnderPath()` for legacy pollution; s3-cleanup `beforeAll` runs it
- M1-CLEAN and M1-NS: **green**

### M3 Implementation (2026-02-26)

- `infra/minio/copy-fixtures-exclude-gitkeep.sh` — excludes `.gitkeep`, creates `.emptydir` for empty dirs, removes existing `.gitkeep`
- M3-NO-GITKEEP: **green**

### M4 Re-Audit (2026-02-26)

- M4-CLEAN: `.test/<runId>/` removed — **green**
- Fix: explicit `mc cp` for `sample-image.png` (paths with spaces) in copy script
- Full audit: `docs/audit/REPO_M4_TEST_POLLUTION_AUDIT.md` — **PASS**
