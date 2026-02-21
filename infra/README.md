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

## Smoke

```bash
./infra/smoke.sh
# or: pnpm smoke
```

Brings up traefik, minio, minio-init, gateway; waits for /health; checks /api/fs/roots. Expected: `PLATFORM OK`.

---

## test:api (canonical)

```bash
./infra/test-api.sh
```

Runs `pnpm test:api` in a clean container. Avoids rollup optional deps / host store issues. **Prerequisite:** stack running (`./infra/smoke.sh` first).

---

## Files

| File                     | Purpose                        |
| ------------------------ | ------------------------------ |
| `docker-compose.dev.yml` | Canonical compose              |
| `Dockerfile.dev`         | dev-server (Vite) image        |
| `minio/`                 | Init script, fixtures, CORS    |
| `smoke.sh`               | Platform health check          |
| `test-api.sh`            | Canonical test:api (container) |

**Prerequisite:** `/etc/hosts` with shell.local, api.shell.local, s3.shell.local. See [docs/dev/DEV_DOMAIN.md](../docs/dev/DEV_DOMAIN.md).
