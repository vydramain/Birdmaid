# Code Review — Manifest

**Purpose:** How to conduct code review. Rules from [Google Engineering Practices](https://google.github.io/eng-practices/). Keep checklist current.

---

## 1. Принципы

### Маленькие CL/PR

- Один логический change на PR
- Легко ревьюить за 15–30 минут
- Если PR >400 строк — рассмотреть разбиение

### Ясные причины

- В описании: **что** изменилось и **зачем**
- Не только "fix" или "update" — конкретика
- Ссылка на FP/issue, если есть

### Читаемость > умность

- Код должен быть понятен без комментариев
- Простое решение лучше "умного"
- Имена переменных/функций — говорящие

---

## 2. Checklist для автора (перед отправкой)

- [ ] `pnpm check:styles` проходит (или входит в `pnpm lint`)
- [ ] `pnpm lint` проходит
- [ ] `pnpm format:check` проходит
- [ ] `pnpm test` проходит (unit)
- [ ] Описание PR: что и зачем
- [ ] Self-review: перечитал diff, убрал мусор

---

## 3. Checklist для ревьюера

| Что проверить | Как                                        |
| ------------- | ------------------------------------------ |
| Логика        | Корректность, edge cases                   |
| Тесты         | Есть ли тесты на новый код                 |
| Стиль         | Соответствие GUARDRAILS, STYLE_GUIDE       |
| Безопасность  | Нет ли утечки секретов, невалидного ввода  |
| Документация  | Обновлены ли docs при изменении контрактов |

---

## 4. Ссылки

- [Google Code Reviewer's Guide](https://google.github.io/eng-practices/review/reviewer/)
- [Google Change Author's Guide](https://google.github.io/eng-practices/review/developer/)
- [docs/dev/GUARDRAILS.md](GUARDRAILS.md)
