# FP2 Integration Tests Plan

**Purpose:** AC → test mapping and test scenarios for FP2 (Gateway + FS contract + MinIO).  
**Method:** Integration tests against live API (api.shell.local, s3.shell.local).

---

## 1. AC → Test Mapping

| AC  | Test ID | Description                                                           |
| --- | ------- | --------------------------------------------------------------------- |
| A1  | T-A1    | Gateway accessible at api.shell.local                                 |
| A2  | T-A2    | GET /health returns 200 + JSON { status: "ok" }                       |
| A3  | T-A3    | MinIO API accessible at s3.shell.local                                |
| B1  | T-B1    | GET /api/fs/list?path=/ returns items[] with dir\|file, stable fields |
| B2  | T-B2    | GET /api/fs/stat returns metadata or 404                              |
| B3  | T-B3    | Response structure matches API.yaml (covered by T-B1, T-B2)           |
| C1  | T-C1    | POST /api/fs/open-url returns short-lived URL                         |
| C2  | T-C2    | URL TTL within 60–300 sec, usable for img/audio/video/fetch           |
| C3  | T-C3    | No S3 credentials in response (manual/audit)                          |
| D1  | T-D1    | GET /api/fs/roots returns virtual roots                               |
| D2  | T-D2    | list accepts /@root/DISK_C/... paths (covered by T-B1)                |
| E1  | T-E1    | Only allowlist origins accepted; bad origin → 403                     |
| E2  | T-E2    | CORS on MinIO allows fetch from allowed origin                        |
| F1  | T-F1    | Errors in format { error: { code, message, details? } }               |
| F2  | T-F2    | 404/400/500 per path validity (covered by T-\* below)                 |

---

## 2. Test Scenarios (Integration)

### T-roots-ok

- **AC:** D1
- **Request:** `GET http://api.shell.local/api/fs/roots`
- **Assert:** 200, `roots` array, each has `id`, `label`
- **Example roots:** DISK_C, APPS (from fixtures)

### T-list-root-ok

- **AC:** B1, B3, D2
- **Request:** `GET http://api.shell.local/api/fs/list?path=/@root/DISK_C/`
- **Assert:** 200, `items` array; dirs first, then files; lexicographic within group; each item has `path`, `name`, `kind`

### T-list-sorted

- **AC:** B3
- **Request:** `GET http://api.shell.local/api/fs/list?path=/@root/DISK_C/`
- **Assert:** Order: dirs (apps, docs) before files (readme.txt); stable sort

### T-stat-existing-ok

- **AC:** B2
- **Request:** `GET http://api.shell.local/api/fs/stat?path=/@root/DISK_C/readme.txt`
- **Assert:** 200, `path`, `name`, `kind`, `size`, `mime` (or null)

### T-stat-missing-404

- **AC:** B2, F2
- **Request:** `GET http://api.shell.local/api/fs/stat?path=/@root/DISK_C/nonexistent.txt`
- **Assert:** 404, `{ error: { code: "NOT_FOUND", message: "..." } }`

### T-list-bad-path-400

- **AC:** F2
- **Request:** `GET http://api.shell.local/api/fs/list?path=/@root/DISK_C/../etc/`
- **Assert:** 400, `{ error: { code: "BAD_PATH", ... } }`

### T-list-bad-root-403

- **AC:** F2
- **Request:** `GET http://api.shell.local/api/fs/list?path=/@root/UNKNOWN_ROOT/`
- **Assert:** 403, `{ error: { code: "ROOT_NOT_FOUND", ... } }`

### T-open-url-returns-url

- **AC:** C1, C2
- **Request:** `POST http://api.shell.local/api/fs/open-url` body `{ "path": "/@root/DISK_C/readme.txt" }`
- **Assert:** 200, `url` (string, points to s3.shell.local), `expiresIn` in [60, 300]

### T-open-url-ttl-bounds

- **AC:** C2
- **Request:** `POST .../open-url` body `{ "path": "/@root/DISK_C/readme.txt", "ttlSec": 90 }`
- **Assert:** `expiresIn` in [60, 300]; request with `ttlSec: 30` → clamped to 60

### T-signed-url-get-200

- **AC:** C1, A3
- **Request:** 1) POST open-url for known object; 2) `GET <signed_url>` or `HEAD <signed_url>`
- **Assert:** 200; URL host is s3.shell.local

### T-cors-allowed-origin

- **AC:** E1, E2
- **Request:** `GET http://api.shell.local/api/fs/roots` with `Origin: http://shell.local`
- **Assert:** 200, response includes `Access-Control-Allow-Origin: http://shell.local` (or equivalent)

### T-cors-disallowed-origin

- **AC:** E1
- **Request:** `GET http://api.shell.local/api/fs/roots` with `Origin: http://evil.example`
- **Assert:** 403 or CORS rejection; `request_rejected` in logs

### T-cors-signed-url-browser

- **AC:** E2
- **Manual/optional:** In browser at http://shell.local, load asset via signed URL; Network tab shows 200 from s3.shell.local with CORS headers

---

## 3. Test File Location

- **Integration:** `back/__tests__/fp2/api-fs.integration.test.ts`
- **Runner:** `pnpm test:api`
- **Config:** `vitest.api.config.ts` (node env, 10s timeout)

---

## 4. Fixtures Dependency

Tests assume MinIO init has run (fixtures: DISK_C, APPS). Use `docker compose -f infra/docker-compose.dev.yml up -d` — minio-init service loads fixtures automatically. Manual: `infra/minio/init.sh` or mc commands.

---

## References

- FP2: [docs/fps/FP2.md](../fps/FP2.md)
- API.yaml: [docs/core/API.yaml](../core/API.yaml)
- FS Contract: [docs/core/API.yaml](../core/API.yaml), [docs/dev/ARCHITECTURE.md](../dev/ARCHITECTURE.md)
