# Workflow-роли (упрощенный процесс)

Упрощенный процесс работы над Feature Packs: 4 этапа вместо 8.

## Этапы (4 этапа)

| Этап | Файл | Что делает |
|------|------|-----------|
| **plan** | [plan.md](./plan.md) | Планирование: discovery + plan в одном этапе |
| **design** | [design.md](./design.md) | Дизайн: design-first + архитектура |
| **build** | [build.md](./build.md) | Реализация: tests-red + implement + tests-green |
| **release** | [release.md](./release.md) | Релиз: gate + acceptance |

## Как использовать

В чате напиши:
```
FP=FP6 mode=plan
```

Или:
```
FP=FP6 mode=design
FP=FP6 mode=build
FP=FP6 mode=release
```

## Структура Feature Pack

Каждый FP имеет единый файл `docs/fps/FP<N>.md` со всей информацией:
- Scope
- Status
- Questions/Decisions
- Requirements
- UX Map
- Tests
- Risks
- Dependencies
- Artifacts

**Не нужно копаться в разных файлах** — всё в одном месте.

## Аудит-роли

Для анализа и аудита проекта используйте роли из [audit/](./audit/):

| Role | Файл | Описание |
|------|------|----------|
| **analyst** | [audit/analyst.md](./audit/analyst.md) | Генерация фактологического анализа (что реально сделано) |
| **inspector** | [audit/inspector.md](./audit/inspector.md) | Аудит фактической реализации кода |
| **supervisor** | [audit/supervisor.md](./audit/supervisor.md) | Принятие решений на основе анализа, сокращение scope |

## Связь с агентами

На каждом этапе можно вызывать агентов-специалистов:

- **plan**: Product Lead, Designer, Analyst, Engineer, Delivery
- **design**: Designer, Engineer, Compliance
- **build**: Engineer
- **release**: Product Lead, Delivery, Compliance

См. также: [ai/agents/README.md](../agents/README.md)
