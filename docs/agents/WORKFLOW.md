# Agents Workflow

**Purpose:** How to run agents, output contract, guardrails, and conflict resolution.  
**References:** [AGENTS.md](../../AGENTS.md), [.cursor/rules/agents.md](../../.cursor/rules/agents.md)

## How to Run Agents

### Invoke by Name

Mention the agent in chat:

```
@Product Lead: нужно определить scope для FP7
@Designer: построить journey map для авторизации
@Engineer: оценить feasibility
```

### Workflow Stages (FP=FPN mode=MODE)

```
FP=FP7 mode=plan    # Планирование: discovery + plan
FP=FP7 mode=design  # Дизайн: design-first + architecture
FP=FP7 mode=build  # Реализация: tests-red → implement → tests-green
FP=FP7 mode=release # Релиз: gate + acceptance
```

Each stage reads and updates `docs/fps/FP<N>.md`.

## Output Contract

Every engineering response must include:

| Field | Description |
|-------|-------------|
| **Evidence** | Files/paths changed |
| **Minimal patch plan** | What was added/changed/removed |
| **Tests** | Commands to run (`npm run lint`, `npm run test`) |
| **DoD checklist** | [ ] Lint passes, [ ] Tests pass, [ ] No new violations |

## Where Guardrails Live

| Document | Purpose |
|----------|---------|
| [docs/dev/GUARDRAILS.md](../dev/GUARDRAILS.md) | Canonical rules (inline styles, units, output contract) |
| [docs/style/GUIDE_STYLE.md](../style/GUIDE_STYLE.md) | Style guide + guardrails policy |
| [docs/fps/FP7.md](../fps/FP7.md) | Product contract (when working on FP7) |

**Engineer hard rules (no exceptions):**

- No lazy allow-tags: allow-tag v2 requires `reason`, `why`, `revisit`
- No `px` in CSS/SCSS (use `rem`); `px` only in transform/translate for drag
- No `!important`
- No constant inline styles (all literals) — even with allow-tag
- No patching docs to justify violations

## When Agents Conflict

1. **Product Lead** has final say on scope and priorities.
2. **Engineer** has final say on technical feasibility and architecture.
3. **Compliance** has final say on security and privacy.
4. Escalate to human: document the conflict in `docs/fps/FP<N>.md` under Questions/Decisions.

## Links

- [AGENTS.md](../../AGENTS.md) — main workflow rules
- [.cursor/rules/agents.md](../../.cursor/rules/agents.md) — Cursor integration
- [ai/agents/README.md](../../ai/agents/README.md) — agent catalog
- [ai/roles/README.md](../../ai/roles/README.md) — workflow roles
