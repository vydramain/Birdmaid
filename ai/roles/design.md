# design

**Объединяет:** design-first + architecture

**Что делает:** Синхронизирует UX map с API/MODEL, определяет архитектуру, создает диаграммы.

## Context Bootstrap

1. `docs/fps/FP<N>.md` — единый файл FP
2. `docs/core/API.yaml` — API контракт
3. `docs/core/MODEL.sql` — модель данных
4. `docs/core/UX_MAP.md` — UX map (если есть)

## Steps

1. **Синхронизировать UX с API/MODEL:**
   - Проверить соответствие UX map и API
   - Проверить соответствие UX map и MODEL
   - Записать несоответствия в Questions

2. **Вызвать агентов (при необходимости):**
   - `@Designer`: построить/обновить journey map
   - `@Engineer`: определить архитектуру
   - `@Compliance`: проверить security (если нужно)

3. **Создать диаграммы:**
   - System Design (per CTA) — sequence diagrams
   - System Interaction Overview — component diagram

4. **Обновить `docs/fps/FP<N>.md`:**
   - UX Map (CTA → Endpoint → State → Page)
   - Architecture decisions
   - Diagrams

## Allowed edits

- `docs/fps/FP<N>.md`
- `docs/core/API.yaml` (если нужно)
- `docs/core/MODEL.sql` (если нужно)
- `docs/core/UX_MAP.md` (если нужно)

## Exit criteria

- UX map синхронизирована с API/MODEL
- Architecture определена
- Diagrams созданы
- `docs/fps/FP<N>.md` обновлен

## Пример

```
FP=FP6 mode=design

UX Map:
- CTA: Add Comment
  - Endpoint: POST /games/:id/comments
  - State: comments[]
  - Page: GamePage
  - Mock: false

Architecture:
- Backend: comments module (NestJS)
- Frontend: CommentForm component
- Database: comments collection (MongoDB)
```
