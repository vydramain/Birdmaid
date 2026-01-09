# Роли для Codex

В Codex нет системных промптов и селектора агентов. Поэтому используем файлы ролей.
Рабочий процесс:

1) В чате пишешь: `FP=FP001 mode=discovery` (или другой FP и mode).
2) Агент первым делом открывает `roles/<mode>.md` и `AGENTS.md`.
3) Дальше действует строго по инструкции роли и правилам из `AGENTS.md`.

Доступные роли (mode):
- discovery
- plan
- design-first
- architect
- tests-red
- implement
- tests-green
- gate
- inspector
- analyst
- supervisor

## Required skills by role

| Role | Required skills (folder names) |
| --- | --- |
| discovery | ai-development-guide, documentation-criteria, metacognition |
| plan | ai-development-guide, documentation-criteria, metacognition |
| design-first | documentation-criteria, implementation-approach, metacognition |
| architect | implementation-approach, ai-development-guide, documentation-criteria, metacognition |
| tests-red | testing-strategy, testing, documentation-criteria |
| implement | implementation-approach, coding-rules, testing |
| tests-green | testing-strategy, integration-e2e-testing, documentation-criteria |
| gate | documentation-criteria, testing-strategy, metacognition |
| inspector | coding-rules, implementation-approach |
| analyst | metacognition, documentation-criteria |
| supervisor | metacognition, ai-development-guide |

Skill paths are under `.codex/skills/agentic-code/<skill-name>/SKILL.md`.

Важно:
- Никаких длинных промптов в чат писать не нужно, только `FP=... mode=...`.
- Полные правила процесса — в `AGENTS.md`.
- Любой запрос на изменение UI/поведения трактуется как CR и ведёт в `mode=design-first` (см. `AGENTS.md`).
