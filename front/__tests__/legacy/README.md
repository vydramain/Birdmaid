# Legacy Tests

Эти тесты были перемещены в legacy во время Phase 1: Cleanup (M0) - FP7 v2.

## Причина перемещения

Эти тесты тестируют старую архитектуру с react-router маршрутами и сайт-страницами (CatalogPage, GamePage, TeamsPage, EditorPage), которые противоречат shell-only контракту (FP7 v2, Product Surface Contract).

## Что здесь

- Тесты для react-router маршрутов (`/catalog`, `/games/:id`, `/teams`, `/editor/*`)
- Тесты для старых страниц (CatalogPage, GamePage, TeamsPage, EditorPage)
- Тесты для email/password auth (будут удалены после реализации Telegram auth)

## Миграция

Эти тесты можно использовать как референс при миграции функциональности в shell-only модель, но они не должны запускаться в CI/CD, так как тестируют удаленный код.
