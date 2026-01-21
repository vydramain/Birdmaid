# plan

**Объединяет:** discovery + plan

**Что делает:** Определяет scope FP, собирает вопросы, составляет план, расставляет приоритеты.

## Context Bootstrap

1. `docs/fps/FP<N>.md` — единый файл FP (если существует)
2. `docs/core/REQUIREMENTS.md` — общие требования проекта
3. `docs/core/API.yaml` — API контракт
4. `docs/core/MODEL.sql` — модель данных

## Steps

1. **Определить scope:**
   - Что входит в FP?
   - Что не входит?
   - Какие вопросы открыты?

2. **Вызвать агентов (при необходимости):**
   - `@Product Lead`: определить проблему и outcome
   - `@Designer`: построить journey map (если нужно)
   - `@Analyst`: определить метрики (если нужно)
   - `@Engineer`: оценить feasibility (если нужно)
   - `@Delivery`: составить план (если нужно)

3. **Обновить `docs/fps/FP<N>.md`:**
   - Scope
   - Questions (если есть)
   - Plan (milestones, tasks)
   - Risks
   - Dependencies

## Allowed edits

- `docs/fps/FP<N>.md` (создать или обновить)
- `docs/core/QNA_DECISIONS.md` (если нужны ADRs)

## Exit criteria

- Scope определен
- Questions собраны
- Plan составлен
- `docs/fps/FP<N>.md` обновлен

## Пример

```
FP=FP6 mode=plan

Scope: добавить комментарии к играм
Questions:
- Нужна ли модерация?
- Можно ли редактировать комментарии?
Plan:
- Milestone 1: API для комментариев (2 дня)
- Milestone 2: UI для комментариев (2 дня)
- Milestone 3: Тесты (1 день)
```
