# AGENTS — Упрощенные правила работы

Version: 2.0  
Purpose: упрощенный процесс работы над Feature Packs с командой из 6 агентов и 4 этапов.

## Быстрый старт

### Команда агентов (6 человек)

1. **@Product Lead** — управляет продуктом, определяет проблему, outcome, приоритеты
2. **@Designer** — UX + BA, строит journey map, требования, прототипы
3. **@Analyst** — метрики, воронки, аналитика, эксперименты
4. **@Engineer** — техническая реализация, feasibility, архитектура, код
5. **@Delivery** — план релиза, координация, зависимости, риски
6. **@Compliance** — комплаенс, безопасность, приватность

### Workflow-этапы (4 этапа)

1. **plan** — планирование: discovery + plan
2. **design** — дизайн: design-first + architecture
3. **build** — реализация: tests-red + implement + tests-green
4. **release** — релиз: gate + acceptance

## Как использовать

### Вызов агента

Просто упомяни агента в чате:

```
@Product Lead: нужно определить scope для FP6
```

```
@Designer: построить journey map для комментариев
```

```
@Engineer: оценить feasibility
```

### Работа над Feature Pack

```
FP=FP6 mode=plan    # Планирование
FP=FP6 mode=design  # Дизайн
FP=FP6 mode=build   # Реализация
FP=FP6 mode=release # Релиз
```

## Структура Feature Pack

**Единый файл для каждого FP:** `docs/fps/FP<N>.md`

Вся информация в одном месте:

- Scope (что входит/не входит)
- Questions (открытые вопросы)
- Decisions (ADRs)
- Requirements (use cases, business rules)
- UX Map (CTA → Endpoint → State → Page)
- Architecture (components, diagrams)
- Tests (UAT/BDD, test files, coverage)
- Metrics (success metrics, events)
- Plan (milestones, tasks)
- Risks
- Dependencies
- Artifacts
- Reflection
- Evidence

**Не нужно копаться в разных файлах** — всё в `docs/fps/FP<N>.md`.

## Документы

### Feature Pack файлы

- `docs/fps/FP<N>.md` — единый файл для каждого FP (вся информация)

### Общие документы

- `docs/core/REQUIREMENTS.md` — общие требования проекта
- `docs/core/API.yaml` — API контракт (общий)
- `docs/core/MODEL.sql` — модель данных (общая)
- `docs/core/UX_MAP.md` — UX map (общая, ссылки на FP)
- `docs/core/TESTS.md` — стратегия тестирования (общая)
- `docs/core/QNA_DECISIONS.md` — вопросы и решения (общие)

## Workflow-этапы (детально)

### mode=plan

**Что делает:** Определяет scope FP, собирает вопросы, составляет план.

**Шаги:**

1. Определить scope (что входит/не входит)
2. Собрать открытые вопросы
3. Вызвать агентов при необходимости:
   - `@Product Lead`: определить проблему и outcome
   - `@Designer`: построить journey map (если нужно)
   - `@Analyst`: определить метрики (если нужно)
   - `@Engineer`: оценить feasibility (если нужно)
   - `@Delivery`: составить план (если нужно)
4. Обновить `docs/fps/FP<N>.md`

**Выход:** Scope определен, вопросы собраны, план составлен.

### mode=design

**Что делает:** Синхронизирует UX map с API/MODEL, определяет архитектуру.

**Шаги:**

1. Синхронизировать UX с API/MODEL
2. Вызвать агентов при необходимости:
   - `@Designer`: построить/обновить journey map
   - `@Engineer`: определить архитектуру
   - `@Compliance`: проверить security (если нужно)
3. Создать диаграммы (sequence, component)
4. Обновить `docs/fps/FP<N>.md`

**Выход:** UX map синхронизирована, архитектура определена, диаграммы созданы.

### mode=build

**Что делает:** Пишет тесты, реализует фичу, делает тесты зелеными.

**Шаги:**

1. Написать тесты (UAT/BDD, unit, integration)
2. Реализовать фичу (только то, что в UX map для этого FP)
3. Сделать тесты зелеными
4. Собрать coverage
5. Обновить `docs/fps/FP<N>.md`

**Выход:** Тесты написаны, фича реализована, тесты зеленые, coverage собран.

### mode=release

**Что делает:** Проводит acceptance review, проверяет готовность, выдает PASS/REJECT.

**Шаги:**

1. Проверить готовность (тесты, coverage, acceptance criteria)
2. Вызвать агентов при необходимости:
   - `@Product Lead`: проверить outcome
   - `@Delivery`: проверить план
   - `@Compliance`: проверить security (если нужно)
3. Собрать evidence (demo notes, links, coverage)
4. Обновить `docs/fps/FP<N>.md`

**Выход:** Acceptance criteria выполнены, evidence собрана, status: released.

## Агенты (детально)

См. [ai/agents/README.md](./ai/agents/README.md) для подробного описания каждого агента.

## Правила Cursor

См. [.cursor/rules/agents.md](./.cursor/rules/agents.md) для правил интеграции агентов в Cursor.

## Миграция со старой версии

### Что изменилось

1. **Агенты:** 11 → 6 (объединены похожие роли)
2. **Workflow:** 8 этапов → 4 этапа (объединены похожие этапы)
3. **Документы:** много файлов → единый файл `docs/fps/FP<N>.md` для каждого FP

### Как мигрировать

1. Существующие FP можно оставить в `docs/core/WORKPLAN.yaml`
2. Новые FP создавать в `docs/fps/FP<N>.md`
3. Постепенно мигрировать существующие FP в новый формат

## Примеры

### Пример 1: Новая фича

```
FP=FP6 mode=plan

@Product Lead: нужно определить scope для FP6 - комментарии к играм

@Designer: построить journey map для комментариев

@Analyst: определить метрики для комментариев

@Engineer: оценить feasibility

@Delivery: составить план релиза
```

### Пример 2: Быстрая оценка

```
@Product Lead: нужно понять, делать ли фичу X

@Analyst: как измерим успех

@Engineer: сколько времени займет

@Product Lead: решение + приоритет
```

## Связь с документами

- **Feature Pack:** `docs/fps/FP<N>.md` — единый файл со всей информацией
- **Агенты:** `ai/agents/` — промпты агентов
- **Workflow:** `ai/roles/` — этапы работы
- **Правила:** `.cursor/rules/` — правила для Cursor

## Runtime Rules & Guardrails (non-duplicating)

- **Cursor runtime rules:** [.cursor/rules/agents.md](./.cursor/rules/agents.md)
- **Canonical guardrails:** [docs/dev/GUARDRAILS.md](./docs/dev/GUARDRAILS.md)
- **Style contract:** [docs/style/STYLE_GUIDE.md](./docs/style/STYLE_GUIDE.md)
- **FP contract:** `docs/fps/FP<N>.md` (see [docs/fps/FP_EXAMPLE.md](./docs/fps/FP_EXAMPLE.md))
- **Process docs:** [docs/dev/COMMITS.md](./docs/dev/COMMITS.md), [CODE_REVIEW.md](./docs/dev/CODE_REVIEW.md), [ARCHITECTURE.md](./docs/dev/ARCHITECTURE.md), [SECURITY.md](./docs/dev/SECURITY.md), [TWELVE_FACTOR.md](./docs/dev/TWELVE_FACTOR.md)
