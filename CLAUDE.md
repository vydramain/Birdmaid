# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Birdmaid Shell — browser-based desktop environment simulator (Windows 98-like) with shell, taskbar, window manager, file explorer, and sandboxed iframe apps. Frontend on React/Vite, backend gateway on Fastify with S3/MinIO storage.

## Commands

### Development
```bash
pnpm dev                    # Vite dev server (localhost:5173)
pnpm build                  # TypeScript compile + Vite build
pnpm build:apps             # Build fixture apps (Explorer, Image Viewer, Media Player, Internet Explorer)
```

### Testing
```bash
pnpm test                   # Unit tests (Vitest, JSDOM)
pnpm test:api               # API integration tests (Vitest, Node)
pnpm test:e2e               # E2E tests (Playwright, Chromium)
```

### Linting & Formatting
```bash
pnpm lint                   # ESLint + Stylelint + check-inline-styles (max-warnings 0)
pnpm format                 # Prettier write
pnpm format:check           # Prettier check
pnpm check:styles           # Inline styles policy check
```

### Gate (canonical — container execution)
```bash
./infra/smoke.sh                # Platform health → "PLATFORM OK"
./infra/test-lint.sh            # Lint + format:check in container
./infra/test-unit.sh            # Unit tests in container
./infra/test-api.sh             # Full API tests in container
./infra/test-api-fp.sh FP<N>    # API tests scoped to FP
./infra/test-e2e.sh             # Full E2E in container
./infra/test-e2e-fp.sh FP<N>    # E2E scoped to FP
./infra/gate.sh [FP]            # Full gate sequence
```

Gate requires container scripts; host `pnpm lint`/`pnpm test` are not valid for gate verification.

### Infrastructure
Docker Compose stack: `docker-compose.dev.yml` (Traefik, MinIO, Gateway, Dev-server). Requires `/etc/hosts` entries: `127.0.0.1 shell.local api.shell.local s3.shell.local`.

## Architecture

### Frontend (front/) — Clean Architecture
| Layer | Content | Key files |
|-------|---------|-----------|
| Domain | Entities, types, contracts | `core/types.ts`, `core/protocol.ts` |
| Use cases | Business logic, services | `core/WindowManager.ts` |
| Adapters | Hooks, API clients, postMessage bridge | `core/AppHost.tsx` |
| UI | React components | `Shell.tsx`, `ui/TaskbarView.tsx`, `ui/WindowChromeView.tsx` |

- UI never calls APIs directly — only through adapters/hooks
- Business logic in use cases, not in components
- Shell ↔ iframe communication via postMessage protocol (APP_READY → SHELL_CAPS handshake)

### Backend (back/) — Fastify Gateway
| Layer | Content | Key files |
|-------|---------|-----------|
| Entry-points | Routes, HTTP handlers | `src/index.ts` |
| Domain | FS contract, business logic | `src/fs.ts`, `src/path-policy.ts` |
| Data-access | S3/MinIO client | `src/fs.ts` |

FS API at `/api/fs/` — roots, list, stat, open-url, create-folder, upload, rename, delete. Write operations require `X-System-App` + `X-System-Token` headers.

### Dev Domain Services
| Service | Domain | Port |
|---------|--------|------|
| Frontend | shell.local | 5173 |
| Gateway | api.shell.local | 3000 |
| MinIO | s3.shell.local | 9000 |
| Traefik | :80 | routing |

### FS Path Scheme
Format: `/@root/{ROOT_ID}/path/to/item`. S3 bucket: `birdmaid-dev`, prefixes: `roots/DISK_C/`, `roots/DISK_A/`, `roots/DISK_D/`.

## Testing Structure

Tests organized by Feature Pack (FP):
- **Unit** (`front/__tests__/`): WindowManager, playlist, media player, viewer handshakes
- **API** (`back/__tests__/`): S3 operations, upload allowlist, namespace policy, signed URLs
- **E2E** (`e2e/`): Shell navigation, window management, Explorer, media players

## Style & Conventions

### Commits
Conventional Commits enforced by commitlint: `<type>(<scope>): <description>`. Types: feat, fix, docs, style, refactor, perf, test, chore, ci. Scopes: front, back, docs, infra, e2e, scripts, deps, dev. Header max 100 chars.

### CSS Rules
- Use relative units (`rem`, `em`, `%`, `vh`, `vw`) — no `px` except transform/translate for drag
- No `!important`
- Use CSS custom properties / classes / design tokens — no inline styles with literal values
- `check-inline-styles.cjs` enforces allow-tag policy on pre-commit

### Code Style
- TypeScript strict mode, target ES2022
- Path aliases: `@lib`, `@shared`
- ESLint max-warnings: 0
- Pre-commit: lint-staged (ESLint, Prettier, Stylelint, check-inline-styles)

## Feature Packs & Documentation

Each FP has a single file `docs/fps/FP<N>.md` with scope, requirements, AC, architecture, tests, metrics. Core docs in `docs/core/` (REQUIREMENTS.md, API.yaml, UX_MAP.md, TESTS.md). Dev process in `docs/dev/` (GUARDRAILS.md, COMMITS.md, ARCHITECTURE.md, CODE_REVIEW.md).

## AI Agents & Workflow

6 agents in `ai/agents/` (Product Lead, Designer, Analyst, Engineer, Delivery, Compliance). 4 workflow stages in `ai/roles/` (plan, design, build, release). Invoke: `FP=FP<N> mode=<stage>`. Audit roles in `ai/roles/audit/`.
