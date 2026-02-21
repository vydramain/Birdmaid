# Infra — FP1 + FP2 Dev Domain

**Purpose:** shell.local (FP1), api.shell.local + s3.shell.local (FP2) via Traefik.

**Canonical compose:** `infra/docker-compose.dev.yml` — единственный compose-файл.

---

## What runs in docker-compose.dev.yml

| Service    | Image                     | Domains / Ports                    |
| ---------- | ------------------------- | ---------------------------------- |
| traefik    | traefik:v3.6.8            | :80 (HTTP), :8080 (dashboard)      |
| minio      | minio/minio:latest        | s3.shell.local → :9000             |
| minio-init | minio/mc                  | One-shot: bucket + CORS + fixtures |
| gateway    | node:22-alpine            | api.shell.local → :3000            |
| dev-server | build from Dockerfile.dev | shell.local → :5173                |

**Routing:** Traefik uses Docker labels. shell.local → dev-server, api.shell.local → gateway, s3.shell.local → minio.

---

## Fixtures init

`minio-init` copies `minio/fixtures/` into bucket `birdmaid-dev/roots/`:

- `DISK_C/` — readme.txt, docs/sample.txt
- `APPS/demo-app/` — index.html, asset.png

See [minio/README.md](minio/README.md).

---

## Logs

```bash
docker compose -f infra/docker-compose.dev.yml logs -f gateway
docker compose -f infra/docker-compose.dev.yml logs -f traefik
docker compose -f infra/docker-compose.dev.yml logs -f minio
```

---

## Canonical Gate Commands (4)

Run from repo root. All scripts are idempotent. **PASS = all green; any non-zero exit → REJECT.**

| Command                        | Meaning                                     | Prerequisite |
| ------------------------------ | ------------------------------------------- | ------------ |
| `./infra/smoke.sh`             | Platform health (Traefik, MinIO, gateway)   | compose up   |
| `./infra/test-lint.sh`         | Lint + format:check (container canonical)   | none         |
| `./infra/test-api.sh`          | Full API integration tests (all FP)         | smoke first  |
| `./infra/test-api-fp.sh FP<N>` | API tests scoped to FP2 or FP3              | smoke first  |
| `./infra/test-e2e.sh`          | E2E (Playwright image; shell.local routing) | smoke first  |
| `./infra/test-unit.sh`         | Unit tests (Vitest)                         | none         |
| `./infra/gate.sh [FP]`         | Full gate sequence per FP                   | smoke first  |

### smoke

```bash
./infra/smoke.sh
# or: pnpm smoke
```

Brings up traefik, minio, minio-init, gateway; waits for /health; checks /api/fs/roots. Expected: `PLATFORM OK`.

### lint

```bash
./infra/test-lint.sh
```

Runs `pnpm lint` and `pnpm format:check` in a clean node:22-alpine container. No host deps.

### api

```bash
./infra/test-api.sh           # Full suite (FP2 + FP3)
./infra/test-api-fp.sh FP2    # FP2 only (scoped; FP2 gate)
./infra/test-api-fp.sh FP3     # FP2 + FP3 (FP3 gate)
```

Runs API integration tests in container. **Scoped:** FP2 gate uses `test-api-fp.sh FP2` so FP2 can PASS independently of FP3.

### e2e

```bash
./infra/test-e2e.sh
```

Runs Playwright E2E in `mcr.microsoft.com/playwright` image (avoids libnspr4.so in node:22). Uses `--add-host` for shell.local, api.shell.local, s3.shell.local.

---

## Files

| File                     | Purpose                         |
| ------------------------ | ------------------------------- |
| `docker-compose.dev.yml` | Canonical compose               |
| `Dockerfile.dev`         | dev-server (Vite) image         |
| `minio/`                 | Init script, fixtures, CORS     |
| `smoke.sh`               | Platform health check           |
| `test-lint.sh`           | Lint + format:check (container) |
| `test-api.sh`            | Full API tests (container)      |
| `test-api-fp.sh`         | API tests scoped to FP2/FP3     |
| `test-e2e.sh`            | E2E (Playwright image)          |
| `test-unit.sh`           | Unit tests (container)          |
| `gate.sh`                | Full gate sequence per FP       |

**Prerequisite:** `/etc/hosts` with shell.local, api.shell.local, s3.shell.local. See [docs/dev/DEV_DOMAIN.md](../docs/dev/DEV_DOMAIN.md).
