# Agent Skills

Скиллы для агентов-специалистов. Каждый агент имеет свой набор скиллов, которые содержат frameworks, best practices, и quality checklists.

## Структура

Каждый скилл находится в `.codex/skills/agents/<agent-name>/SKILL.md` и содержит:
- Core competencies (основные компетенции)
- Best practices (лучшие практики)
- Frameworks (фреймворки)
- Quality checklists (чек-листы качества)
- Common pitfalls (типичные ошибки)

## Скиллы по агентам

| Агент | Скилл | Описание |
|-------|-------|----------|
| **Product Lead** | [product-lead](./product-lead/SKILL.md) | Product management: strategy, prioritization, stakeholder management, problem framing, outcome definition |
| **Designer** | [designer](./designer/SKILL.md) | UX design and business analysis: journey mapping, requirements, UX principles, business rules |
| **Analyst** | [analyst](./analyst/SKILL.md) | Product analytics: metrics design, data analysis, experimentation, funnel analysis |
| **Engineer** | [engineer](./engineer/SKILL.md) | Technical: feasibility assessment, architecture design, NFR evaluation, code quality |
| **Delivery** | [delivery](./delivery/SKILL.md) | Project delivery: planning, risk management, dependency tracking, communication |
| **Compliance** | [compliance](./compliance/SKILL.md) | Security and compliance: security assessment, privacy compliance, access control, threat modeling |

## Как использовать

Агенты автоматически используют свои скиллы при работе. Скиллы содержат:
- Frameworks для структурирования работы
- Best practices для качественной работы
- Quality checklists для проверки артефактов
- Common pitfalls для избежания ошибок

## Интеграция в агентов

Каждый агент в `ai/agents/<agent-name>.md` содержит секцию "Required Skills", которая указывает на соответствующий скилл. Агент должен запускать этот скилл перед началом работы.
