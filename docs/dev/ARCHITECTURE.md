# Architecture Overview

**Purpose:** Разбиение по логике (Clean Architecture / Bulletproof React). Domain → Use cases → Adapters → UI.

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

Референсы: [clean_arch.md](../../clean_arch.md), [Bulletproof React](https://github.com/alan2207/bulletproof-react)

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
- Конфиг через env vars (см. [TWELVE_FACTOR.md](TWELVE_FACTOR.md))

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

## Ссылки

- [clean_arch.md](../../clean_arch.md)
- [Bulletproof React](https://github.com/alan2207/bulletproof-react)
- [docs/dev/TWELVE_FACTOR.md](TWELVE_FACTOR.md)
