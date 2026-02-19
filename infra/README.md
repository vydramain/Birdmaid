# Infra — FP1 + FP2 Dev Domain

**Purpose:** shell.local (FP1), api.shell.local + s3.shell.local (FP2) via Traefik.

**Canonical compose:** `infra/docker-compose.dev.yml` — единственный compose-файл. Все сервисы (Traefik, MinIO, Gateway, dev-server) поднимаются им.

| Файл | Назначение |
|------|------------|
| `docker-compose.dev.yml` | Canonical compose: Traefik + MinIO + Gateway (placeholder) + dev-server |
| `Dockerfile.dev` | Образ dev-server (Vite). Сервис `dev-server` — контейнер, поднимается compose'ом |
| `minio/` | MinIO init, fixtures, CORS (FP2) |

**dev-server:** контейнеризован, собирается из Dockerfile.dev, монтирует репо. Работает на Linux (и macOS/Windows).

**gateway:** M1 — реальный сервер (Node + Fastify) в `back/`, volume mount, без Dockerfile.gateway.

**Prerequisite:** `/etc/hosts` entries for shell.local, api.shell.local, s3.shell.local. See [docs/dev/DEV_DOMAIN.md](../docs/dev/DEV_DOMAIN.md).
