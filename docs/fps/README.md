# Feature Packs

Единый файл для каждого Feature Pack. Вся информация в одном месте — не нужно копаться в разных файлах.

## Структура

Каждый FP имеет файл `docs/fps/FP<N>.md` со всей информацией:
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

## Как использовать

1. **Создать новый FP:**
   ```
   FP=FP6 mode=plan
   ```
   Создаст `docs/fps/FP6.md` с шаблоном.

2. **Работать с FP:**
   ```
   FP=FP6 mode=design
   FP=FP6 mode=build
   FP=FP6 mode=release
   ```
   Каждый этап обновляет `docs/fps/FP6.md`.

3. **Читать FP:**
   Просто открой `docs/fps/FP<N>.md` — там всё.

## Шаблон

См. [TEMPLATE.md](./TEMPLATE.md) для шаблона нового FP.

## Связь с другими документами

- `docs/core/REQUIREMENTS.md` — общие требования проекта
- `docs/core/API.yaml` — API контракт (общий)
- `docs/core/MODEL.sql` — модель данных (общая)
- `docs/core/UX_MAP.md` — UX map (общая, ссылки на FP)

FP-специфичная информация — в `docs/fps/FP<N>.md`.
