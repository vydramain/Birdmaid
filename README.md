# Birdmaid Shell

Browser-based window manager + taskbar + AppHost for iframe applications. Windows 98–like desktop in the browser.

## What Birdmaid does (current)

| Block | Capability | Details |
|-------|------------|---------|
| **Shell / Desktop** | Desktop, taskbar, window chrome | [FP1](docs/fps/FP1.md) |
| **Window manager** | Drag, resize, min/max/close, z-order, focus | [FP1](docs/fps/FP1.md) |
| **Explorer** | File browser (My Computer, A:/C:/D:), breadcrumbs | [FP3](docs/fps/FP3.md) |
| **S3-backed FS** | roots, list, stat, open-url, create/upload/delete/rename | [FP2](docs/fps/FP2.md), [FP3](docs/fps/FP3.md) |
| **Image Viewer** | PNG, JPG, WebP; Prev/Next playlist | [FP4](docs/fps/FP4.md) |
| **Media Player** | MP3, MP4, WebM; audio/video mode | [FP4](docs/fps/FP4.md) |
| **User app packages** | Dir with index.html → launch in sandbox; read-only package root | [FP5](docs/fps/FP5.md) |

**Known limitations:** Godot Web apps require HTTPS (use `https://shell.local`); browser sandbox warning for allow-same-origin (intentional for Godot sessionStorage).

**Docs:** [docs/README.md](docs/README.md) — full feature summary, specs, audit.

---

## Repo layout

See [docs/style/STRUCTURE.md](docs/style/STRUCTURE.md) for target tree. Key areas:

- `front/` — Shell core, UI adapter, protocol
- `back/` — Gateway (FS API, MinIO/S3)
- `infra/` — docker-compose.dev.yml, MinIO fixtures
- `docs/` — [Documentation Index](docs/README.md) — specs, Feature Packs, audit, archive

---

## Quickstart

### How to run locally

1. **Prerequisites:** Docker, `/etc/hosts` entries:
   ```
   127.0.0.1 shell.local api.shell.local s3.shell.local
   ```

2. **Start stack:**
   ```bash
   docker compose -f infra/docker-compose.dev.yml up -d 
   ```

3. **Verify:** `./infra/smoke.sh` → `PLATFORM OK`

4. **Open Shell:** http://shell.local (or `pnpm dev` → http://localhost:5173 for front-only)

**Godot user apps** need HTTPS: run `./infra/certs/generate.sh` once, then use **https://shell.local**.

### How to verify it works

| Command | Expected |
|---------|----------|
| `./infra/smoke.sh` | PLATFORM OK |
| `pnpm test:api` | API tests pass |
| `pnpm test` | Unit tests pass |

See [infra/README.md](infra/README.md), [docs/dev/ARCHITECTURE.md](docs/dev/ARCHITECTURE.md) § Dev Domain.

---

## Demo flow

Steps to show the project to the team:

1. **Open Shell** — http://shell.local (or https://shell.local for Godot apps)
2. **Open Explorer** — Double-click "My Computer" on desktop → Explorer window
3. **Navigate** — C: → My Documents → Images
4. **Open image** — Double-click `sample.jpg` → Image Viewer (Prev/Next playlist)
5. **Open media** — Back in Explorer → Videos → double-click `sample.mp4` → Media Player
6. **User app** (if present) — Upload a zip with `index.html` to My Documents; double-click the extracted folder to launch

**Fixtures:** `infra/minio/fixtures/DISK_C/My Documents/` — Images, Music, Videos. See [infra/minio/README.md](infra/minio/README.md).

---

## Known limitations

- **Godot Web apps** require HTTPS (Secure Context). Use `https://shell.local`; run `./infra/certs/generate.sh` first.
- **Browser sandbox warning** — "allow-scripts and allow-same-origin can remove sandboxing". Intentional for Godot sessionStorage.
- **"Components object deprecated"** — Godot Web runtime; document only.

Details: [docs/fps/FP5.md](docs/fps/FP5.md) § Known Limitations.

---

## Architecture at a glance

| Layer | Description | Doc |
|-------|-------------|-----|
| Front | Shell, AppHost, window manager, React UI | [ARCHITECTURE](docs/dev/ARCHITECTURE.md) § Front |
| Back | Gateway (FS API), S3/MinIO | [ARCHITECTURE](docs/dev/ARCHITECTURE.md) § Back |
| Protocol | postMessage (APP_READY, SHELL_CAPS, OPEN_FILE) | [PROTOCOL_v0](docs/core/PROTOCOL_v0.md) |
| API | roots, list, stat, open-url, CRUD | [API.yaml](docs/core/API.yaml) |

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

- [docs/README.md](docs/README.md) — Documentation index (Feature Packs → core → audit → archive)
- [docs/dev/ARCHITECTURE.md](docs/dev/ARCHITECTURE.md) § Dev Domain — entrypoints
- [infra/README.md](infra/README.md) — Stack, fixtures, logs
- [AGENTS.md](AGENTS.md) — Workflow, agents
