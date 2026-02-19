# Правила работы с агентами в Cursor

Эти правила интегрируют агентов-специалистов в Cursor для упрощенного использования.

## Global Guardrails (MUST follow)

**All agents MUST follow these canonical sources:**
- `docs/dev/GUARDRAILS.md` — canonical rules (output contract, style/units when applicable)
- `docs/style/STYLE_GUIDE.md` — style guide + guardrails policy
- `docs/fps/FP<N>.md` — product contract for the current FP (e.g. docs/fps/FP_EXAMPLE.md as reference)

**Process docs (при разработке):**
- `docs/dev/COMMITS.md` — Conventional Commits (commitlint в pre-commit)
- `docs/dev/CODE_REVIEW.md` — критерии code review
- `docs/dev/ARCHITECTURE.md` — слои front/back, Clean Architecture
- `docs/dev/SECURITY.md` — secrets, deps, Node.js security
- `docs/dev/TWELVE_FACTOR.md` — конфиг через env, 12-factor для back/infra

**Engineer/Developer Hard Rules (no exceptions):**
- No lazy allow-tags: allow-tag v2 requires `reason`, `why`, `revisit`
- No `px` in CSS/SCSS (use `rem`); `px` only in transform/translate for drag
- No `!important`
- No constant inline styles (all literals) — even with allow-tag
- No patching docs to justify violations

**Output Contract (every engineering response):**
- Evidence: files/paths changed
- Minimal patch plan: what was added/changed/removed
- Tests: commands to run (`pnpm lint`, `pnpm test`, `pnpm format:check`)
- DoD checklist: [ ] Lint passes, [ ] Format check passes, [ ] Tests pass, [ ] No new violations

**Pre-commit gates (enforced):** lint-staged → check-inline-styles, ESLint, stylelint, Prettier; commitlint (Conventional Commits).

---

## Команда агентов (6 человек)

1. **@Product Lead** — управляет продуктом, определяет проблему, outcome, приоритеты
2. **@Designer** — UX + BA, строит journey map, требования, прототипы
3. **@Analyst** — метрики, воронки, аналитика, эксперименты
4. **@Engineer** — техническая реализация, feasibility, архитектура, код
5. **@Delivery** — план релиза, координация, зависимости, риски
6. **@Compliance** — комплаенс, безопасность, приватность

## Как использовать в Cursor

### Быстрый способ

Просто упомяни агента в чате:

```
@Product Lead: нужно определить scope для новой фичи
```

```
@Designer: построить journey map для регистрации
```

```
@Engineer: оценить feasibility для комментариев
```

### Подробный способ

Если нужен структурированный запрос:

```
ROLE: Product Lead
TASK: Определить scope для FP6
CONTEXT:
- FP: FP6
- Current state: есть игры, есть пользователи
- Constraints: нужно сделать за 1 неделю
OUTPUT: Problem statement + Prioritized backlog
```

## Workflow-этапы

Для работы над Feature Pack используй этапы:

```
FP=FP6 mode=plan    # Планирование
FP=FP6 mode=design  # Дизайн
FP=FP6 mode=build   # Реализация
FP=FP6 mode=release # Релиз
```

Каждый этап работает с единым файлом `docs/fps/FP<N>.md` — вся информация в одном месте.

## Интеграция с Feature Packs

Агенты автоматически работают с Feature Pack файлами:

- При упоминании `FP=FP6` агент читает `docs/fps/FP6.md`
- При обновлении информации агент обновляет `docs/fps/FP6.md`
- Не нужно копаться в разных файлах — всё в одном месте

## Примеры использования

### Пример 1: Новая фича

```
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

- **Feature Pack:** `docs/fps/FP<N>.md` — единый файл со всей информацией о FP
- **Общие документы:** `docs/core/` — REQUIREMENTS.md, API.yaml, MODEL.sql, UX_MAP.md
- **Процесс:** `docs/dev/` — GUARDRAILS.md, COMMITS.md, CODE_REVIEW.md, ARCHITECTURE.md, SECURITY.md, TWELVE_FACTOR.md
- **Агенты:** `ai/agents/` — промпты агентов
- **Workflow:** `ai/roles/` — этапы работы (plan, design, build, release)
