# Birdmaid Shell

Browser-based window manager + taskbar + AppHost for iframe applications. FP1 (Shell MVP), FP2 (Gateway + FS contract) released.

## Quick start (dev)

1. Add to `/etc/hosts`:
   ```
   127.0.0.1 shell.local api.shell.local s3.shell.local
   ```
2. `pnpm smoke` — поднимает стек и проверяет платформу (PLATFORM OK)
3. `pnpm test:api` — 16 API integration tests

Open http://shell.local (Shell), http://api.shell.local/health (Gateway).

**Standalone (no Docker):** `pnpm dev` → http://localhost:5173

See [docs/dev/DEV_DOMAIN.md](docs/dev/DEV_DOMAIN.md) for details.

## Test run

| Command | Description |
|---------|-------------|
| `pnpm lint` | ESLint (front, e2e, back, configs) |
| `pnpm test` | Unit tests (Vitest, 14) |
| `pnpm test:api` | API integration tests (16; prerequisite: compose up) |
| `pnpm test:e2e` | E2E tests (Playwright, 10) |

**API tests:** Start the stack first: `docker compose -f infra/docker-compose.dev.yml up -d`, then `pnpm test:api`.

## Project structure

| Area | Path |
|------|------|
| Shell core | `front/core/` — WindowManager, AppHost, protocol, analytics, ThemeScaleProvider |
| Gateway | `back/` — FS API (roots, list, stat, open-url), MinIO/S3 |
| UI adapter | `front/ui/` — DesktopView, WindowChromeView, TaskbarView, TaskbarItemView |
| Shell wiring | `front/Shell.tsx`, `front/App.tsx` |
| TestApp | `public/testapp.html` |
| Infra | `infra/` — docker-compose.dev.yml, MinIO fixtures |
| Docs | `docs/` — core specs, fps, dev |

## References

- [docs/fps/FP1.md](docs/fps/FP1.md) — FP1 spec, Evidence
- [docs/fps/FP2.md](docs/fps/FP2.md) — FP2 Gateway + FS contract, Evidence, FP3 handoff
- [AGENTS.md](AGENTS.md) — Workflow, agents, stages
