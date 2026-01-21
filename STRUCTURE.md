# Структура репозитория

Этот документ описывает новую структуру репозитория после реструктуризации.

## Обзор изменений

Реструктуризация выполнена для:
- ✅ Отделения исходного кода от информации по ролям для агентов
- ✅ Отделения документации от временных/аналитических файлов
- ✅ Создания четкой навигации между документами
- ✅ Организации агентов-специалистов и workflow-ролей

## Новая структура

```
gnc/
├── front/                          # Исходный код фронтенда
├── back/                           # Исходный код бэкенда
│
├── ai/                             # AI-агенты и роли
│   ├── agents/                     # Агенты-специалисты
│   │   ├── README.md               # Каталог агентов + как использовать
│   │   ├── product-orchestrator.md
│   │   ├── product-manager.md
│   │   ├── business-analyst.md
│   │   ├── product-designer.md
│   │   ├── ux-researcher.md
│   │   ├── product-analyst.md
│   │   ├── service-designer.md
│   │   ├── tech-lead.md
│   │   ├── delivery-manager.md
│   │   ├── customer-success.md
│   │   └── legal-compliance.md
│   │
│   └── roles/                      # Workflow-роли
│       ├── README.md               # Описание workflow-ролей
│       ├── discovery.md
│       ├── plan.md
│       ├── design-first.md
│       ├── architect.md
│       ├── tests-red.md
│       ├── implement.md
│       ├── tests-green.md
│       ├── gate.md
│       │
│       └── audit/                   # Аудит-роли
│           ├── analyst.md
│           ├── inspector.md
│           └── supervisor.md
│
├── docs/                           # Документация проекта
│   ├── README.md                   # Навигация по документации
│   │
│   ├── core/                       # Основные документы (sources of truth)
│   │   ├── REQUIREMENTS.md
│   │   ├── API.yaml
│   │   ├── MODEL.sql
│   │   ├── UX_MAP.md
│   │   ├── TESTS.md
│   │   ├── QNA_DECISIONS.md
│   │   └── WORKPLAN.yaml
│   │
│   └── archive/                    # Временные/аналитические документы
│       ├── COVER_PIPELINE_ANALYSIS.md
│       ├── FP4_ARCHITECTURE_PLAN.md
│       └── MVP_GAPS.md
│
├── .cursor/                        # Правила для Cursor
│   └── rules/
│       ├── README.md               # Описание правил
│       ├── product-delivery.md     # Базовые правила
│       └── agent-workflow.md       # Правила для работы с агентами
│
├── .codex/                         # Skills (без изменений)
│   └── skills/
│
├── artifacts/                       # Артефакты (без изменений)
│
├── AGENTS.md                       # Главный документ с правилами
├── README.md                       # Главный README
├── STRUCTURE.md                    # Этот файл
├── docker-compose.yml
├── .gitignore
└── LICENSE
```

## Навигация

### Агенты-специалисты
- **Где:** `ai/agents/`
- **Описание:** [ai/agents/README.md](./ai/agents/README.md)
- **Использование:** Вызываются для конкретных задач (PM, BA, UX, Analyst, и т.д.)

### Workflow-роли
- **Где:** `ai/roles/`
- **Описание:** [ai/roles/README.md](./ai/roles/README.md)
- **Использование:** Этапы разработки (discovery, plan, design-first, и т.д.)

### Аудит-роли
- **Где:** `ai/roles/audit/`
- **Описание:** В [ai/roles/README.md](./ai/roles/README.md)
- **Использование:** Анализ и аудит проекта (analyst, inspector, supervisor)

### Документация
- **Где:** `docs/core/` (основные), `docs/archive/` (временные)
- **Описание:** [docs/README.md](./docs/README.md)
- **Использование:** Sources of truth для проекта

### Правила Cursor
- **Где:** `.cursor/rules/`
- **Описание:** [.cursor/rules/README.md](./.cursor/rules/README.md)
- **Использование:** Автоматически применяются Cursor

## Миграция

### Что изменилось

1. **Роли перемещены:**
   - `roles/` → `ai/roles/` (workflow-роли)
   - `roles/analyst.md`, `roles/inspector.md`, `roles/supervisor.md` → `ai/roles/audit/`

2. **Документы перемещены:**
   - `docs/REQUIREMENTS.md` → `docs/core/REQUIREMENTS.md`
   - `docs/API.yaml` → `docs/core/API.yaml`
   - `docs/MODEL.sql` → `docs/core/MODEL.sql`
   - `docs/UX_MAP.md` → `docs/core/UX_MAP.md`
   - `docs/TESTS.md` → `docs/core/TESTS.md`
   - `docs/QNA_DECISIONS.md` → `docs/core/QNA_DECISIONS.md`
   - `docs/WORKPLAN.yaml` → `docs/core/WORKPLAN.yaml`
   - Временные документы → `docs/archive/`

3. **Пути обновлены:**
   - Все упоминания `docs/` в `AGENTS.md` и ролях обновлены на `docs/core/`
   - Все упоминания `roles/` обновлены на `ai/roles/`

### Что нужно сделать

1. **Обновить команды:**
   - Команды `FP=FP1 mode=discovery` остаются без изменений
   - Агент теперь читает `ai/roles/<mode>.md` вместо `roles/<mode>.md`

2. **Обновить ссылки:**
   - Все ссылки на документы должны указывать на `docs/core/`
   - Все ссылки на роли должны указывать на `ai/roles/`

## Связь между компонентами

```
AGENTS.md (главные правила)
    ↓
ai/roles/ (workflow-роли)
    ↓
docs/core/ (документы)
    ↓
ai/agents/ (агенты-специалисты, используются внутри workflow)
    ↓
.cursor/rules/ (правила для Cursor)
```

## Дополнительная информация

- **Главный документ:** [AGENTS.md](./AGENTS.md)
- **Главный README:** [README.md](./README.md)
- **Документация:** [docs/README.md](./docs/README.md)
- **Агенты:** [ai/agents/README.md](./ai/agents/README.md)
- **Роли:** [ai/roles/README.md](./ai/roles/README.md)
- **Правила:** [.cursor/rules/README.md](./.cursor/rules/README.md)
