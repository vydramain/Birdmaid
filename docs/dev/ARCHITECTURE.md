# Architecture — Manifest

**Purpose:** How to structure front and back. Clean Architecture / Bulletproof React. Domain → Use cases → Adapters → UI. Keep in sync with actual code.

---

## Front (Shell, UI)

Целевые слои:

| Слой          | Содержимое                 | Примеры                                                      |
| ------------- | -------------------------- | ------------------------------------------------------------ |
| **Domain**    | Entities, типы, контракты  | `core/types.ts`, `core/protocol.ts`                          |
| **Use cases** | Бизнес-логика, сервисы     | `core/WindowManager.ts`                                      |
| **Adapters**  | Hooks, API-клиенты, bridge | `core/AppHost.tsx` (postMessage), analytics                  |
| **UI**        | Компоненты, представление  | `Shell.tsx`, `ui/TaskbarView.tsx`, `ui/WindowChromeView.tsx` |

Принципы:

- UI не вызывает API напрямую — через адаптеры/hooks
- Бизнес-логика в use cases, не в компонентах
- Framework-специфичный код (React hooks, postMessage) — в adapters

Референсы: [CLEAN_ARCH.md](../style/CLEAN_ARCH.md), [Bulletproof React](https://github.com/alan2207/bulletproof-react)

---

## Back (Gateway)

Целевые слои:

| Слой             | Содержимое                | Примеры                   |
| ---------------- | ------------------------- | ------------------------- |
| **Entry-points** | Routes, HTTP handlers     | `src/index.ts`            |
| **Domain**       | Логика, контракты         | `src/fs.ts` (FS contract) |
| **Data-access**  | S3/MinIO, внешние сервисы | `src/fs.ts` (S3 client)   |

Принципы:

- Routes не содержат бизнес-логику — делегируют в domain
- Конфиг через env vars (см. [REPO_RULES.md](../style/REPO_RULES.md) § Twelve-Factor)

### Dev Domain (Entrypoints)

| Service | Domain                      | Port     |
| ------- | --------------------------- | -------- |
| Front   | shell.local, localhost:5173 | 80, 5173 |
| Gateway | api.shell.local             | 80       |
| MinIO   | s3.shell.local              | 80       |
| Traefik | :80, :8080                  | 80, 8080 |

**Smoke:** `./infra/smoke.sh` → PLATFORM OK. **Hosts:** Add `127.0.0.1 shell.local api.shell.local s3.shell.local` to /etc/hosts. See [infra/README.md](../../infra/README.md).

### FS Path Scheme

- **Format:** `/@root/{ROOT_ID}/path/to/item`
- **Canonicalization:** Leading `/`; dir ends with `/`; no `..`, `\`, `//`; max 1024; root isolation.
- **S3 mapping:** bucket `birdmaid-dev`; prefixes `roots/DISK_C/`, `roots/DISK_A/`, `roots/DISK_D/`.

---

## Структура каталогов

```
front/
├── core/           # Domain + Use cases + Adapters
│   ├── protocol.ts
│   ├── types.ts
│   ├── WindowManager.ts
│   ├── AppHost.tsx
│   └── analytics.ts
├── ui/             # UI components
├── Shell.tsx
└── App.tsx

back/src/
├── index.ts        # Entry-points (routes)
├── fs.ts           # Domain + data-access
└── path.ts
```

---

## CORS & Signed URLs

- **Gateway:** allowlist origins (shell.local, api.shell.local, localhost:5173). No `*`.
- **MinIO:** CORS for signed URL GET. Config: `infra/minio/cors.json`. Allowed: shell.local, api.shell.local, localhost:5173.
- **Write API:** Explorer only; requires X-System-App + X-System-Token.

## Ссылки

- [docs/style/CLEAN_ARCH.md](../style/CLEAN_ARCH.md) — Clean Architecture principles
- [Bulletproof React](https://github.com/alan2207/bulletproof-react)
- [docs/style/REPO_RULES.md](../style/REPO_RULES.md) § Twelve-Factor
