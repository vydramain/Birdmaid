# Twelve-Factor App (применимость к Birdmaid)

**Purpose:** Как принципы [12factor.net](https://12factor.net/) применяются к back (gateway) и infra.

---

## I. Codebase

Один репозиторий, несколько deploy targets (dev, staging, prod). Все артефакты — из одного кода.

- **Birdmaid:** Один репо, `infra/docker-compose.dev.yml` для dev, prod — отдельный deploy.

---

## III. Config

Конфигурация — в переменных окружения, не в коде.

- **Birdmaid:** `.env` в gitignore. Секреты (ключи S3, etc.) — через env.
- **Back:** [back/src/index.ts](../../back/src/index.ts) — читает `process.env`.
- См. [infra/README.md](../../infra/README.md) для dev-переменных.

---

## V. Build, release, run

Чёткое разделение стадий:

1. **Build** — компиляция, сборка артефактов
2. **Release** — build + config, неизменяемый релиз
3. **Run** — запуск процессов

- **Birdmaid:** `pnpm build` → артефакты в `dist/`. Release — образ/артефакт. Run — `node dist/` или Docker.

---

## X. Dev/prod parity

Dev-окружение максимально близко к prod.

- **Birdmaid:** `infra/docker-compose.dev.yml` — Traefik, MinIO, gateway. Те же протоколы и контракты.
- См. [infra/README.md](../../infra/README.md).

---

## Ссылки

- [12factor.net](https://12factor.net/)
- [infra/README.md](../../infra/README.md)
- [back/](../../back/)
