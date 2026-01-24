# release

**Объединяет:** gate + acceptance

**Что делает:** Проводит acceptance review, проверяет готовность, выдает PASS/REJECT.

## Context Bootstrap

1. `docs/fps/FP<N>.md` — единый файл FP
2. `docs/core/TESTS.md` — тесты (если есть)
3. `artifacts/FP<N>/**` — артефакты

## Steps

1. **Проверить готовность:**
   - Все тесты зеленые?
   - Coverage thresholds выполнены?
   - Acceptance criteria выполнены?
   - ADRs записаны?

2. **Вызвать агентов (при необходимости):**
   - `@Product Lead`: проверить outcome
   - `@Delivery`: проверить план
   - `@Compliance`: проверить security (если нужно)

3. **Собрать evidence:**
   - Demo notes
   - Links (PR, CI, ADR)
   - Coverage reports

4. **Обновить `docs/fps/FP<N>.md`:**
   - Status: released
   - Evidence links
   - Reflection

## Allowed edits

- `docs/fps/FP<N>.md` — обновить статус
- `artifacts/FP<N>/**` — сохранить evidence

## Exit criteria

- Acceptance criteria выполнены
- Evidence собрана
- Status: released
- `docs/fps/FP<N>.md` обновлен

## Пример

```
FP=FP6 mode=release

Acceptance:
- ✅ User can add comment
- ✅ User can view comments
- ✅ Comments are persisted
- ✅ Coverage: 85% backend, 90% frontend

Evidence:
- PR: #123
- CI: https://...
- Demo: https://...

Status: released
```
