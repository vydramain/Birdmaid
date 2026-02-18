# Birdmaid Shell

Browser-based window manager + taskbar + AppHost for iframe applications. FP1 (Shell MVP) released.

## Dev run (shell.local)

1. Add `127.0.0.1 shell.local` to `/etc/hosts`
2. `docker compose -f docker-compose.dev.yml up -d` (or `docker compose -f infra/docker-compose.dev.yml up -d`)
3. Open http://shell.local

**Standalone (no Docker):** `pnpm dev` → http://localhost:5173

See [docs/dev/DEV_DOMAIN.md](docs/dev/DEV_DOMAIN.md) for details.

## Test run

| Command | Description |
|---------|-------------|
| `pnpm lint` | ESLint (front, e2e, configs) |
| `pnpm test` | Unit tests (Vitest, 14) |
| `pnpm test:e2e` | E2E tests (Playwright, 10) |

## Project structure

| Area | Path |
|------|------|
| Shell core | `front/core/` — WindowManager, AppHost, protocol, analytics, ThemeScaleProvider |
| UI adapter | `front/ui/` — DesktopView, WindowChromeView, TaskbarView, TaskbarItemView |
| Shell wiring | `front/Shell.tsx`, `front/App.tsx` |
| TestApp | `public/testapp.html` |
| Docs | `docs/` — core specs, fps, dev |
| FP1 archive | `archive/FP1/` — evidence, transcripts, reports |

## References

- [docs/fps/FP1.md](docs/fps/FP1.md) — FP1 spec, Freeze Index, Evidence
- [AGENTS.md](AGENTS.md) — Workflow, agents, stages
