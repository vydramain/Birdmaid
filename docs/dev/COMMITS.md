# Conventional Commits

**Purpose:** Стандартизация сообщений коммитов. Машинно-обрабатываемые, автогенерация changelog/версий.

---

## Формат

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

---

## Типы (type)

| Тип        | Назначение                           |
| ---------- | ------------------------------------ |
| `feat`     | Новая фича                           |
| `fix`      | Исправление бага                     |
| `docs`     | Только документация                  |
| `style`    | Форматирование, без изменения логики |
| `refactor` | Рефакторинг                          |
| `perf`     | Улучшение производительности         |
| `test`     | Добавление/изменение тестов          |
| `chore`    | Обслуживание (deps, config)          |
| `ci`       | Изменения CI                         |

---

## Scope (опционально)

| Scope     | Область                |
| --------- | ---------------------- |
| `front`   | Frontend (Shell, UI)   |
| `back`    | Gateway, API           |
| `docs`    | Документация           |
| `infra`   | Docker, compose, MinIO |
| `e2e`     | E2E тесты              |
| `scripts` | Скрипты проверок       |
| `deps`    | Зависимости            |
| `dev`     | Dev tooling, process, rules |

---

## Примеры

```
feat(front): add window drag handler
fix(back): correct S3 presign URL expiry
docs: update GUARDRAILS enforcement section
chore(deps): bump eslint to 9.15
ci: add lint job to GitHub Actions
```

---

## Правила (commitlint)

- `header-max-length`: 100 символов
- `type-enum`: только перечисленные типы
- `scope-enum`: только перечисленные scope (scope опционален)

---

## Ссылки

- [Conventional Commits](https://www.conventionalcommits.org/)
- [commitlint.config.js](../../commitlint.config.js)
