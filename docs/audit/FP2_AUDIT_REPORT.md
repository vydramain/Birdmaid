# FP2 Audit Report

**Purpose:** Minimal evidence package for external review (ChatGPT).  
**Scope:** FP2 implementation vs FP2.md, API.yaml, FS_CONTRACT_v0.md.  
**Date:** 2025-02-19  
**Mode:** verify (Gate v4: Gate rescue — domains + open-url + evidence).

---

## Gate v4 Summary (Gate Rescue)

| Gate          | Result    | Notes                                                                            |
| ------------- | --------- | -------------------------------------------------------------------------------- |
| Clean-state   | **PASS**  | `git add back/ vitest.api.config.ts docs/audit/` — impl staged                   |
| Stack start   | **PASS**  | Traefik v3.6.8, minio, gateway (CI=true, passHostHeader for MinIO)               |
| test:api      | **16/16** | All passed (GET + Range instead of HEAD; SigV4 method mismatch fixed)            |
| Presigned URL | **PASS**  | GET validated; HEAD requires presign HEAD — we use GET (browser viewers use GET) |
| **Final**     | **PASS**  | P0 resolved                                                                      |

**Evidence:** See STEP 0–5 outputs below.

**P0 fix:** SigV4 includes HTTP method in canonical request. Presigned URL was signed for GET; test used HEAD → SignatureDoesNotMatch. Changed test to validate with GET (Range: bytes=0-0) instead of HEAD. HEAD would require presign HEAD; we validate with GET because browser viewers use GET.

### STEP 0 — Preflight

```bash
$ docker info
Client: Version 29.2.1, compose 5.0.2
Server: Version 29.2.1, Containers 9, Running 3, Storage overlayfs
```

```bash
$ grep -n "shell.local" /etc/hosts || echo "MISSING_HOSTS"
MISSING_HOSTS
```

**Traefik section (infra/docker-compose.dev.yml):**

- image: traefik:v3.6.8 (upgraded from v3.2 for Docker API 1.44)
- volumes: /var/run/docker.sock:/var/run/docker.sock:ro
- command: --providers.docker.endpoint=unix:///var/run/docker.sock

### STEP 1–2 — Fixes applied

| Fix                      | File                         | Change                                      |
| ------------------------ | ---------------------------- | ------------------------------------------- |
| Traefik Docker API       | infra/docker-compose.dev.yml | traefik:v3.2 → v3.6.8; add endpoint         |
| open-url handler         | back/src/index.ts            | req.json() → req.body                       |
| Presign with public host | back/src/fs.ts, index.ts     | S3Client(FS_S3_PUBLIC_URL) for getSignedUrl |
| passHostHeader           | infra/docker-compose.dev.yml | minio: loadbalancer.passHostHeader=true     |
| CI for pnpm              | infra/docker-compose.dev.yml | gateway: CI=true                            |

### STEP 3 — Health, roots, open-url

```bash
$ curl -i -H "Host: api.shell.local" http://127.0.0.1/health
HTTP/1.1 200 OK
{"status":"ok"}

$ curl -i -H "Host: api.shell.local" http://127.0.0.1/api/fs/roots
HTTP/1.1 200 OK
{"roots":[{"id":"DISK_C","label":"Disk C"},{"id":"APPS","label":"Apps"}]}

$ curl -s -X POST -H "Host: api.shell.local" -H "Content-Type: application/json" \
  -d '{"path":"/@root/DISK_C/readme.txt"}' http://127.0.0.1/api/fs/open-url
{"url":"http://s3.shell.local/birdmaid-dev/roots/DISK_C/readme.txt?X-Amz-...","expiresIn":120}
```

### STEP 3 — Presigned URL proof

**Root cause:** SigV4 includes HTTP method in canonical request. Presigned URL was signed for GET; test used HEAD → SignatureDoesNotMatch. HEAD requires presign HEAD; we validate with GET because browser viewers use GET.

**Fix:** Test changed from GET(url, { method: "HEAD" }) to GET(url, { headers: { Range: "bytes=0-0" } }), expect 200 or 206.

### STEP 4 — test:api

```bash
$ docker run --rm --add-host api.shell.local:host-gateway --add-host s3.shell.local:host-gateway \
  -v $(pwd):/app -w /app node:22-alpine sh -c "corepack enable pnpm && pnpm install && pnpm test:api"
 ✓ back/__tests__/fp2/api-fs.integration.test.ts (16 tests) 87ms
 Test Files  1 passed (1)
      Tests  16 passed (16)
   Duration  368ms
```

### STEP 5 — Clean-state

```bash
$ git add back/ vitest.api.config.ts docs/audit/
$ git status --short
 M README.md
 M docs/core/CORS_SIGNED_URLS.md
 ...
A  back/__tests__/fp2/api-fs.integration.test.ts
A  back/src/fs.ts
A  back/src/index.ts
...
A  vitest.api.config.ts
A  docs/audit/FP2_AUDIT_REPORT.md
```

### Evidence: changed files

- infra/docker-compose.dev.yml (Traefik v3.6.8, endpoint, passHostHeader, CI)
- back/src/index.ts (req.body, s3Presign client)
- back/src/fs.ts (presignS3 param, sign with public host)
- back/**tests**/fp2/api-fs.integration.test.ts (HEAD → GET with Range; SigV4 method fix)

---

## Gate v2 Summary

| Gate          | Result      | Blocker                                                                                     |
| ------------- | ----------- | ------------------------------------------------------------------------------------------- |
| Clean-state   | ⚠️ Partial  | `back/`, `vitest.api.config.ts`, `docs/audit/` untracked — part of FP2 impl, need `git add` |
| Stack start   | **BLOCKED** | Docker daemon not running                                                                   |
| test:api      | **BLOCKED** | Requires stack                                                                              |
| Presigned URL | **BLOCKED** | Requires stack                                                                              |
| **Final**     | **REJECT**  | P0: Cannot run stack (Docker daemon down)                                                   |

**P0 Blockers:**

1. Docker daemon not running — `docker info` fails with "failed to connect to the docker API"
2. Stack not started — `docker compose up` cannot run
3. test:api and presigned URL verification cannot execute without stack

**To close Gate:** Start Docker daemon, run steps 2–4 below, insert real outputs into this report.

---

## Gate v3 Summary

| Gate          | Result     | Notes                                                                                      |
| ------------- | ---------- | ------------------------------------------------------------------------------------------ |
| Clean-state   | ⚠️ Partial | impl untracked must be added before merge (`back/`, `vitest.api.config.ts`, `docs/audit/`) |
| Stack start   | **PASS**   | traefik, minio, gateway up (dev-server skipped: Dockerfile path; gateway needs CI=true)    |
| test:api      | **FAIL**   | api.shell.local unreachable (Traefik Docker provider broken: API version mismatch)         |
| Presigned URL | **FAIL**   | POST /api/fs/open-url → 500 `req.json is not a function` (P0: Fastify v5 API)              |
| **Final**     | **REJECT** | P0: test:api + Presigned URL blocked                                                       |

---

## 1. Inventory (file paths)

| Item                  | Path                                                                                         |
| --------------------- | -------------------------------------------------------------------------------------------- |
| FP2 spec              | docs/fps/FP2.md                                                                              |
| API contract          | docs/core/API.yaml                                                                           |
| FS contract           | docs/core/FS_CONTRACT_v0.md                                                                  |
| CORS spec             | docs/core/CORS_SIGNED_URLS.md                                                                |
| Tests plan            | docs/tests/FP2_TESTS.md                                                                      |
| Dev domain            | docs/dev/DEV_DOMAIN.md                                                                       |
| Compose               | infra/docker-compose.dev.yml                                                                 |
| MinIO init            | infra/minio/init.sh                                                                          |
| MinIO CORS            | infra/minio/cors.json                                                                        |
| MinIO fixtures        | infra/minio/fixtures/DISK_C/readme.txt, docs/sample.txt; APPS/demo-app/index.html, asset.png |
| MinIO README          | infra/minio/README.md                                                                        |
| Gateway entry         | back/src/index.ts                                                                            |
| FS service            | back/src/fs.ts                                                                               |
| Path validation       | back/src/path.ts                                                                             |
| API integration tests | back/**tests**/fp2/api-fs.integration.test.ts                                                |
| Vitest API config     | vitest.api.config.ts                                                                         |
| Root package.json     | package.json (test:api: vitest run --config vitest.api.config.ts)                            |

---

## 2. Commands + outputs

### 1) Clean-state check

```bash
$ git status --short
 M README.md
 M docs/core/CORS_SIGNED_URLS.md
 M docs/dev/DEV_DOMAIN.md
 M docs/fps/FP2.md
 M docs/tests/FP2_TESTS.md
 M infra/README.md
 M infra/docker-compose.dev.yml
 M package.json
?? back/
?? docs/audit/
?? vitest.api.config.ts
```

**Что должно быть tracked (часть FP2 реализации):**

| Path                                        | Status       | Action                                                                    |
| ------------------------------------------- | ------------ | ------------------------------------------------------------------------- |
| `back/`                                     | ?? untracked | `git add back/` — gateway (index.ts, fs.ts, path.ts, package.json, tests) |
| `vitest.api.config.ts`                      | ?? untracked | `git add vitest.api.config.ts` — config для test:api                      |
| `docs/audit/`                               | ?? untracked | `git add docs/audit/` — этот отчёт                                        |
| Modified files (README, FP2, compose, etc.) | M            | `git add` + commit — изменения по FP2                                     |

**Почему `?? back/`:** Код gateway добавлен в M1–M5, но не закоммичен. Для Gate v2 требуется явно добавить в репо: `git add back/ vitest.api.config.ts` (без выполнения коммита — только указание).

### 2) Start stack

#### 1) Docker daemon confirmed

```bash
$ docker info
Client:
 Version:    29.2.1
 Context:    default
 Debug Mode: false
 Plugins:
  buildx: Docker Buildx (Docker Inc.)
    Version:  0.31.1
  compose: Docker Compose (Docker Inc.)
    Version:  5.0.2

Server:
 Containers: 9
  Running: 3
  Paused: 0
  Stopped: 6
 Images: 10
 Server Version: 29.2.1
 Storage Driver: overlayfs
  driver-type: io.containerd.snapshotter.v1
 Logging Driver: json-file
 Cgroup Driver: systemd
 Cgroup Version: 2
 Swarm: inactive
 Runtimes: io.containerd.runc.v2 runc
 Default Runtime: runc
 ...
```

**Docker daemon:** RUNNING. Server section OK.

#### 2) Stack up

```bash
$ docker compose -f infra/docker-compose.dev.yml up -d traefik minio minio-init gateway
# (dev-server skipped: build fails — "open Dockerfile.dev: no such file or directory";
#  dockerfile path in compose expects Dockerfile.dev in repo root, actual file: infra/Dockerfile.dev)

 Network infra_default  Created
 Volume infra_minio_data Created
 Container infra-minio-1       Created
 Container infra-traefik-1     Created
 Container infra-minio-init-1 Created
 Container infra-gateway-1     Created
 Container infra-minio-1       Started
 Container infra-traefik-1     Started
 Container infra-minio-init-1  Started
 Container infra-minio-init-1  Exited
 Container infra-gateway-1     Started
```

```bash
$ docker compose -f infra/docker-compose.dev.yml ps
NAME              IMAGE                COMMAND                  SERVICE   CREATED         STATUS         PORTS
infra-gateway-1   node:22-alpine       "docker-entrypoint.s…"   gateway   ...             Up 2 minutes
infra-minio-1     minio/minio:latest   "/usr/bin/docker-ent…"   minio     ...             Up 3 minutes   9000/tcp
infra-traefik-1   traefik:v3.2         "/entrypoint.sh --ap…"   traefik   ...             Up 3 minutes   0.0.0.0:80->80/tcp, 0.0.0.0:8080->8080/tcp
```

```bash
$ docker compose -f infra/docker-compose.dev.yml logs --tail=200 gateway
gateway-1  | Packages: +160
gateway-1  | Done in 9s using pnpm v10.30.0
gateway-1  | > birdmaid-gateway@0.1.0 dev /app/back
gateway-1  | > tsx watch src/index.ts
gateway-1  | {"level":30,"time":1771523408995,"pid":71,"hostname":"578087eca85f","msg":"Server listening at http://127.0.0.1:3000"}
gateway-1  | {"level":30,"time":1771523408995,"pid":71,"hostname":"578087eca85f","msg":"Server listening at http://10.200.2.4:3000"}
```

**Note:** Gateway requires `CI: "true"` in compose env for `pnpm install` in non-TTY (otherwise `ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY`).

#### 3) Health / Roots (через домены)

**curl api.shell.local (host):**

```bash
$ curl -i http://api.shell.local/health
curl: (6) Could not resolve host: api.shell.local
```

(Prerequisite `/etc/hosts` not set; or if set, Traefik returns 404 — Docker provider fails: "client version 1.24 is too old. Minimum supported API version is 1.44".)

**Gateway direct (docker exec / same network):**

```bash
$ docker exec infra-gateway-1 wget -qO- http://127.0.0.1:3000/health
{"status":"ok"}

$ docker exec infra-gateway-1 wget -qO- http://127.0.0.1:3000/api/fs/roots
{"roots":[{"id":"DISK_C","label":"Disk C"},{"id":"APPS","label":"Apps"}]}
```

**Conclusion:** Gateway responds correctly when reached directly. Domain-based access blocked by Traefik/Docker API mismatch.

### 3) Run tests

```bash
$ pnpm test:api
 RUN  v2.1.9 /data/fst/Repositories/vydramain/Birdmaid_v2
 ❯ back/__tests__/fp2/api-fs.integration.test.ts (16 tests | 16 skipped) 5005ms
⎯⎯⎯⎯⎯ Failed Suites 1 ⎯⎯⎯⎯⎯⎯
 FAIL  back/__tests__/fp2/api-fs.integration.test.ts > FP2 API Integration
Error: Prerequisite: docker compose -f infra/docker-compose.dev.yml up -d. api.shell.local must be reachable.
 ❯ back/__tests__/fp2/api-fs.integration.test.ts:25:13
 Test Files  1 failed (1)
      Tests  16 skipped (16)
   Duration  5.33s
 ELIFECYCLE  Command failed with exit code 1
```

**Result:** FAIL — 16 tests skipped. beforeAll fails because api.shell.local is unreachable (Traefik not routing; /etc/hosts may be missing).

**Required for PASS:** api.shell.local must resolve and return 200; then `pnpm test:api` should show 16 passed.

```bash
$ pnpm lint
# PASS (eslint front e2e vite.config.ts playwright.config.ts)
```

### A) Git + versions (reference)

```bash
$ git rev-parse HEAD
e9d993f114534bb3e9d1723edd8cac3cc1f7ffa6

$ node -v
v25.6.1

$ pnpm -v
10.28.2

$ docker --version
Docker version 29.2.1, build a5c7197d72
```

---

## 4. Presigned URL proof (CRITICAL)

### 4.1 Commands (run when stack is up)

```bash
# 1) Get signed URL
RESP=$(curl -s -X POST http://api.shell.local/api/fs/open-url \
  -H "Content-Type: application/json" \
  -d '{"path":"/@root/DISK_C/readme.txt"}')
echo "$RESP"
URL=$(echo "$RESP" | jq -r .url)

# 2) Verify GET
curl -I "$URL"

# 3) Verify CORS
curl -I "$URL" -H "Origin: http://shell.local"
```

### 4.2 Actual outputs

**1) Get signed URL (via gateway direct — api.shell.local unreachable):**

```bash
$ docker run --rm --network infra_default curlimages/curl:latest curl -s -X POST http://gateway:3000/api/fs/open-url \
  -H "Content-Type: application/json" -d '{"path":"/@root/DISK_C/readme.txt"}'
{"error":{"code":"INTERNAL_ERROR","message":"req.json is not a function"}}
```

**JSON response:** 500 — `req.json is not a function`. Fastify v5 uses `req.body`, not `req.json`. P0 blocker.

**Gateway log:**

```
{"level":50,"err":{"type":"TypeError","message":"req.json is not a function","stack":"TypeError: req.json is not a function\n    at Object.<anonymous> (/app/back/src/index.ts:126:27)...
```

**curl -I $URL:** N/A — cannot obtain URL due to 500.

**curl -I $URL -H "Origin: http://shell.local":** N/A.

**If SignatureDoesNotMatch/403/400:** Insert full response and gateway/minio logs here. Code location of host rewrite: `back/src/fs.ts` lines 250–258.

### 4.3 Host rewrite — why it may work or fail

**Current logic:** Presign with endpoint `http://minio:9000`, then replace origin with `http://s3.shell.local`. For strict SigV4, Host is in the canonical request; changing it typically invalidates the signature.

**Possible reasons it works:** MinIO may use path-style signing or relax host validation when path and query match. **Proof required:** `curl -I "$SIGNED_URL"` → 200.

### 4.4 Code location (host rewrite)

**File:** `back/src/fs.ts` lines 250–258

```typescript
if (publicUrl) {
  try {
    const parsed = new URL(url);
    const base = publicUrl.replace(/\/$/, "");
    url = url.replace(parsed.origin, base);
  } catch {
    // keep original URL if replace fails
  }
}
```

### 4.5 Gateway env vars (from compose)

| Var                   | Value                 |
| --------------------- | --------------------- |
| FS_S3_ENDPOINT        | http://minio:9000     |
| FS_S3_PUBLIC_URL      | http://s3.shell.local |
| FS_S3_BUCKET          | birdmaid-dev          |
| FS_S3_ACCESS_KEY      | minioadmin            |
| FS_S3_SECRET_KEY      | minioadmin            |
| FS_SIGNED_URL_TTL_SEC | 120                   |

**S3 client config** (`back/src/index.ts` lines 15–23):

- endpoint: `process.env.FS_S3_ENDPOINT` → `http://minio:9000`
- region: `us-east-1`
- forcePathStyle: `true`

---

## 5. Contract conformance quick check

### 5.1 Endpoint → handler mapping

| Endpoint              | API.yaml                         | Handler                   |
| --------------------- | -------------------------------- | ------------------------- |
| GET /health           | HealthResponse                   | back/src/index.ts:64–66   |
| GET /api/fs/roots     | RootsResponse                    | back/src/index.ts:72–77   |
| GET /api/fs/list      | FsListResponse, 400/403/500      | back/src/index.ts:79–101  |
| GET /api/fs/stat      | FsStatResponse, 400/403/404/500  | back/src/index.ts:103–122 |
| POST /api/fs/open-url | OpenUrlResponse, 400/403/404/500 | back/src/index.ts:124–152 |

### 5.2 ErrorResponse format

**Example (bad root):**

```json
{ "error": { "code": "ROOT_NOT_FOUND", "message": "Root not found" } }
```

HTTP 403. Matches API.yaml: `{ error: { code, message, details? } }`.

### 5.3 Path rules — bad path → 400

| Example path                | Reason                      |
| --------------------------- | --------------------------- |
| `/@root/DISK_C/../etc/`     | `..` forbidden (path.ts:29) |
| `/@root/DISK_C/` with `\`   | `\` forbidden               |
| `/@root/DISK_C//docs/`      | `//` forbidden              |
| Invalid encoding            | decodeURIComponent throws   |
| Path length > 1024          | BAD_PATH                    |
| Missing `/@root/{ROOT_ID}/` | BAD_PATH                    |

### 5.4 Root isolation — bad root → 403

| Example                                      | Expected                                                              |
| -------------------------------------------- | --------------------------------------------------------------------- |
| `GET /api/fs/list?path=/@root/UNKNOWN_ROOT/` | 403, `{"error":{"code":"ROOT_NOT_FOUND","message":"Root not found"}}` |

Implemented in `back/src/path.ts` lines 52–54: `knownRoots.includes(rootId)`.

---

## 6. Final gate section

### Gate: PASS (Gate v4)

**P0 resolved:** SigV4 method mismatch — presigned URL was signed for GET; test used HEAD → SignatureDoesNotMatch. Changed test to validate with GET (Range: bytes=0-0). HEAD requires presign HEAD; we validate with GET because browser viewers use GET.

**test:api:** 16/16 passed.

### Checklist (all done)

1. ~~Start Docker daemon.~~ ✓
2. ~~Fix Traefik (v3.6.8).~~ ✓
3. ~~Fix open-url (req.body).~~ ✓
4. ~~Add CI=true, passHostHeader.~~ ✓
5. ~~Resolve Presigned URL (P0: HEAD→GET).~~ ✓
6. ~~Run pnpm test:api → 16 passed.~~ ✓

**Optional:** Add `/etc/hosts` for curl from host: `127.0.0.1 shell.local api.shell.local s3.shell.local`

### Known risks (non-blocking)

1. **Host rewrite in presigned URL** — SigV4 may invalidate signature when host changes. Requires empirical proof (step 7).
2. **Dev-only CORS allowlist** — Must not leak to production.
3. **pnpm install in container** — Dev convenience; CI/prod should use built image.
