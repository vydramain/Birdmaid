# Birdmaid Shell

Browser-based window manager + taskbar + AppHost for iframe applications. FP1 (Shell MVP), FP2 (Gateway + FS contract) released.

## Repo layout

See [docs/style/STRUCTURE.md](docs/style/STRUCTURE.md) for target tree. Key areas:

- `front/` — Shell core, UI adapter, protocol
- `back/` — Gateway (FS API, MinIO/S3)
- `infra/` — docker-compose.dev.yml, MinIO fixtures
- `docs/` — [Documentation Index](docs/README.md)

---

## Quickstart (dev)

### Prerequisites

- Docker running
- `/etc/hosts` entries:
  ```
  127.0.0.1 shell.local api.shell.local s3.shell.local
  ```
- Node (recommended) + Corepack for host commands

### A) Start stack

```bash
docker compose -f infra/docker-compose.dev.yml up -d traefik minio minio-init gateway
```

### B) Smoke

```bash
./infra/smoke.sh
# or: pnpm smoke
```

Expected: `PLATFORM OK`.

### C) API tests

**Host** (if deps installed):

```bash
pnpm test:api
```

**Canonical container** (if host `pnpm install` fails with EACCES):

```bash
docker run --rm --add-host api.shell.local:host-gateway --add-host s3.shell.local:host-gateway \
  -v $(pwd):/app -w /app node:22 sh -c "git config --global --add safe.directory /app && corepack enable pnpm && pnpm install && pnpm test:api"
```

Expected: 16/16 passed.

### D) Front dev (standalone)

```bash
pnpm dev
```

Open http://localhost:5173 (no Docker required).

### E) Full stack (Shell via Traefik)

Compose also runs `dev-server`. Open http://shell.local after stack is up.

**Godot user apps** require HTTPS (Secure Context). Run once: `./infra/certs/generate.sh`, then use **https://shell.local**.

---

## Verification matrix

| Command             | Purpose                       |
| ------------------- | ----------------------------- |
| `pnpm smoke`        | Platform health (PLATFORM OK) |
| `pnpm lint`         | ESLint + Stylelint            |
| `pnpm format:check` | Prettier check                |
| `pnpm test`         | Unit tests (14)               |
| `pnpm test:api`     | API integration (16)          |
| `pnpm test:e2e`     | E2E (Playwright, 10)          |

---

## Troubleshooting

- **pnpm install EACCES:** See [docs/dev/GUARDRAILS.md](docs/dev/GUARDRAILS.md) — Troubleshooting pnpm EACCES. Use container for verification.
- **Pre-commit:** Requires deps on host. If EACCES, run container check before commit.
- **Domains:** [docs/dev/ARCHITECTURE.md](docs/dev/ARCHITECTURE.md) § Dev Domain, [infra/README.md](infra/README.md).

---

## References

- [docs/README.md](docs/README.md) — Documentation index
- [docs/dev/ARCHITECTURE.md](docs/dev/ARCHITECTURE.md) § Dev Domain — entrypoints
- [infra/README.md](infra/README.md) — Stack, fixtures, logs
- [AGENTS.md](AGENTS.md) — Workflow, agents
