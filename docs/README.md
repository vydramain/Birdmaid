# Документация проекта

Навигация по документации проекта.

## Основные документы (sources of truth)

Основные документы находятся в [`core/`](./core/):

| Документ | Описание |
|---------|----------|
| [REQUIREMENTS.md](./core/REQUIREMENTS.md) | Требования (FR + NFR), constraints (project level) |
| [API.yaml](./core/API.yaml) | OpenAPI contract (single source) |
| [MODEL.sql](./core/MODEL.sql) | SQL/ER model |
| [UX_MAP.md](./core/UX_MAP.md) | UI Action Map: CTA → Endpoint → State → Page (React) → mock_status + FP diagrams |
| [TESTS.md](./core/TESTS.md) | Strategy, UAT/BDD, Acceptance, RTM (YAML: requirement→tests→code) |
| [QNA_DECISIONS.md](./core/QNA_DECISIONS.md) | Questions/answers/gaps + short ADRs (single file) |
| [WORKPLAN.yaml](./core/WORKPLAN.yaml) | FP statuses, stages, risks, ACK/reflection, thresholds, artifacts |

> **Важно:** Новые документы/папки запрещены (кроме artifacts) и должны быть обоснованы ADR в `QNA_DECISIONS.md`.


## Связь с workflow

Все workflow-роли (`ai/roles/`) работают с документами из `core/` и `fps/`:

- **plan** — читает core документы, создает/обновляет `fps/FP<N>.md`
- **design** — синхронизирует UX_MAP с API.yaml и MODEL.sql, обновляет `fps/FP<N>.md`
- **build** — читает `fps/FP<N>.md`, реализует фичу, обновляет статус
- **release** — проверяет готовность, обновляет `fps/FP<N>.md` со статусом released

## Связь с агентами-специалистами

Агенты-специалисты (`ai/agents/`) работают с Feature Pack файлами (`fps/FP<N>.md`):

- **Product Lead** → определяет scope, outcome, приоритеты
- **Designer** → строит journey map, требования, бизнес-правила
- **Analyst** → определяет метрики, события, воронки
- **Engineer** → оценивает feasibility, архитектуру, риски
- **Delivery** → составляет план релиза, управляет рисками
- **Compliance** → проверяет security, privacy, compliance

Все артефакты интегрируются в единый файл `fps/FP<N>.md`.

## Структура документации

```
docs/
├── README.md              # Этот файл
├── core/                   # Основные документы (sources of truth)
│   ├── REQUIREMENTS.md
│   ├── API.yaml
│   ├── MODEL.sql
│   ├── UX_MAP.md
│   ├── TESTS.md
│   ├── QNA_DECISIONS.md
│   └── WORKPLAN.yaml
└── fps/                    # Feature Pack файлы (единый файл для каждого FP)
    ├── README.md
    ├── TEMPLATE.md
    ├── FP1.md             # Browse & Play + Admin Authoring
    ├── FP2.md             # Team System and Game Editing
    ├── FP3.md             # Windows 95 UI Behavior
    ├── FP4.md             # User Accounts & Windows 95 UI
    └── FP5.md             # UI/UX Fixes and Polish
```
