# Infra — FP1 Dev Domain

**Purpose:** shell.local via Traefik (ADR#8).

- `docker-compose.dev.yml` — Traefik + dev-server
- `Dockerfile.dev` — dev-server image (requires package.json; build phase adds frontend)

**Prerequisite:** `127.0.0.1 shell.local` in /etc/hosts. See [docs/dev/DEV_DOMAIN.md](../docs/dev/DEV_DOMAIN.md).
