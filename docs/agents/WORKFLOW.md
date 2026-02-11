# Agents Workflow

**Purpose:** How to run agents, output contract, guardrails, and conflict resolution.  
**References:** [AGENTS.md](../../AGENTS.md), [.cursor/rules/agents.md](../../.cursor/rules/agents.md)

## How to Run Agents

### Invoke by Name

Mention the agent in chat:

```
@Product Lead: нужно определить scope для FP1
@Designer: построить journey map для авторизации
@Engineer: оценить feasibility
```

### Workflow Stages (FP=FPN mode=MODE)

```
FP=FP1 mode=plan    # Планирование: discovery + plan
FP=FP1 mode=design  # Дизайн: design-first + architecture
FP=FP1 mode=build   # Реализация: tests-red → implement → tests-green
FP=FP1 mode=release # Релиз: gate + acceptance
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
| [docs/dev/GUARDRAILS.md](../dev/GUARDRAILS.md) | Canonical rules (output contract, style/units when applicable) |
| [docs/style/STYLE_GUIDE.md](../style/STYLE_GUIDE.md) | Style guide + guardrails policy |
| `docs/fps/FP<N>.md` | Product contract for the current FP (see [FP_EXAMPLE.md](../fps/FP_EXAMPLE.md)) |

**Engineer hard rules (no exceptions):**

- No lazy allow-tags: if using allow-tag, require `reason`, `why`, `revisit`
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
