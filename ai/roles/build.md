# build

**Объединяет:** tests-red + implement + tests-green

**Что делает:** Пишет тесты, реализует фичу, делает тесты зелеными.

## Context Bootstrap

1. `docs/fps/FP<N>.md` — единый файл FP
2. `docs/core/API.yaml` — API контракт
3. `docs/core/MODEL.sql` — модель данных
4. `docs/core/UX_MAP.md` — UX map

## Steps

1. **Написать тесты (tests-red):**
   - UAT/BDD сценарии
   - Unit tests
   - Integration tests
   - Записать в `docs/fps/FP<N>.md` → Tests

2. **Реализовать фичу (implement):**
   - Frontend code
   - Backend code
   - Только то, что в UX map для этого FP

3. **Сделать тесты зелеными (tests-green):**
   - Запустить тесты
   - Исправить баги
   - Собрать coverage
   - Сохранить artifacts

4. **Обновить `docs/fps/FP<N>.md`:**
   - Tests (статус)
   - Implementation (статус)
   - Coverage (результаты)

## Allowed edits

- Your project's frontend/backend source and tests (e.g. `front/src/**`, `back/src/**`, `front/__tests__/**`, `back/__tests__/**` when present)
- `docs/fps/FP<N>.md` — обновить статус

## Exit criteria

- Тесты написаны
- Фича реализована
- Тесты зеленые
- Coverage собран
- `docs/fps/FP<N>.md` обновлен

## Пример

```
FP=FP6 mode=build

Tests:
- UAT: User can add comment to game
- Unit: CommentService.create()
- Integration: POST /games/:id/comments

Implementation:
- Backend: comments module ✅
- Frontend: CommentForm component ✅

Coverage:
- Backend: 85%
- Frontend: 90%
```
