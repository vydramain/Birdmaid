# Feature Packs

Единый файл для каждого Feature Pack. Вся информация в одном месте — не нужно копаться в разных файлах.

## FP Catalog

| FP | Doc | Status | Audit / Archive |
|----|-----|--------|-----------------|
| FP1 | [FP1.md](FP1.md) | released | — |
| FP2 | [FP2.md](FP2.md) | released | [archive/FP4/](../../archive/FP4/README.md) |
| FP3 | [FP3.md](FP3.md) | released | [archive/FP4/](../../archive/FP4/README.md) |
| FP4 | [FP4.md](FP4.md) | released | [FP4_AUDIT_REPORT](../audit/FP4_AUDIT_REPORT.md), [archive/FP4/](../../archive/FP4/README.md) |
| FP5 | [FP5.md](FP5.md) | released | [FP5_AUDIT_REPORT](../audit/FP5_AUDIT_REPORT.md) |

**Core docs:** [API.yaml](../core/API.yaml), [PROTOCOL_v0.md](../core/PROTOCOL_v0.md), [UX_MAP.md](../core/UX_MAP.md), [REQUIREMENTS.md](../core/REQUIREMENTS.md)

## Структура

Каждый FP имеет файл `docs/fps/FP<N>.md` со всей информацией:

- Scope (что входит/не входит)
- Questions (открытые вопросы)
- Decisions (ADRs)
- Requirements (use cases, business rules)
- UX Map (CTA → Endpoint → State → Page)
- Architecture (components, diagrams)
- Tests (UAT/BDD, test files, coverage)
- Metrics (success metrics, events)
- Plan (milestones, tasks)
- Risks
- Dependencies
- Artifacts
- Reflection
- Evidence

## Как использовать

1. **Создать новый FP:**

   ```
   FP=FP6 mode=plan
   ```

   Создаст `docs/fps/FP6.md` с шаблоном.

2. **Работать с FP:**

   ```
   FP=FP6 mode=design
   FP=FP6 mode=build
   FP=FP6 mode=release
   ```

   Каждый этап обновляет `docs/fps/FP6.md`.

3. **Читать FP:**
   Просто открой `docs/fps/FP<N>.md` — там всё.

## Шаблон и пример

- [FP_EXAMPLE.md](FP_EXAMPLE.md) — шаблон для нового FP (copy to FP<N>.md)
- [docs/style/REPO_RULES.md](../style/REPO_RULES.md) § Release Gate — release gate rules

## Связь с другими документами

- [core/REQUIREMENTS.md](../core/REQUIREMENTS.md) — общие требования проекта
- [core/API.yaml](../core/API.yaml) — API контракт (общий)
- [core/UX_MAP.md](../core/UX_MAP.md) — UX map (общая, ссылки на FP)
- [audit/](../audit/) — audit reports (FP4, FP5, REPO)
- [archive/](../../archive/) — archived evidence (FP4, REPO)

FP-специфичная информация — в `docs/fps/FP<N>.md`.
