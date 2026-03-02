# Repository Structure (Agent Template)

This document describes the **agent-only template** structure. No product frontend/backend or runtime—only agents, roles, skills, rules, and documentation for running an agent-driven workflow.

## Overview

- **6 specialist agents** (Product Lead, Designer, Analyst, Engineer, Delivery, Compliance)
- **4 workflow stages** (plan, design, build, release) + **3 audit roles** (analyst, inspector, supervisor)
- **Single file per Feature Pack** in `docs/fps/FP<N>.md`
- **Core contracts** in `docs/core/` (REQUIREMENTS, API, MODEL, UX_MAP, TESTS, QNA_DECISIONS, WORKPLAN)
- **Cursor rules** in `.cursor/rules/`; **Codex skills** in `.codex/skills/`

## Template Structure

```
/
├── .gitignore
├── AGENTS.md                       # Main workflow rules (6 agents, 4 stages)
├── README.md                       # How to use this template
├── LICENSE                         # Optional
│
├── ai/
│   ├── agents/                     # Specialist agents (6)
│   │   ├── README.md
│   │   ├── product-lead.md
│   │   ├── designer.md
│   │   ├── analyst.md
│   │   ├── engineer.md
│   │   ├── delivery.md
│   │   └── compliance.md
│   └── roles/                      # Workflow + audit
│       ├── README.md
│       ├── plan.md
│       ├── design.md
│       ├── build.md
│       ├── release.md
│       └── audit/
│           ├── analyst.md
│           ├── inspector.md
│           └── supervisor.md
│
├── .cursor/rules/
│   ├── README.md
│   ├── agents.md
│   ├── agent-workflow.md
│   └── product-delivery.md
│
├── .codex/skills/
│   ├── README.md
│   ├── agents/                     # 6 agent skills
│   ├── agentic-code/               # Generic skills (testing, coding-rules, etc.)
│   ├── fp-bootstrap/
│   ├── ux-map-sync/
│   └── birdmaid-ux-modern-baseline/  # Project-specific example
│
├── docs/
│   ├── README.md
│   ├── agents/WORKFLOW.md
│   ├── dev/
│   │   └── GUARDRAILS.md
│   ├── fps/
│   │   ├── README.md
│   │   └── FP_EXAMPLE.md
│   ├── core/                       # Core contracts (fill for your project)
│   │   ├── REQUIREMENTS.md
│   │   ├── WORKPLAN.yaml
│   │   ├── UX_MAP.md
│   │   ├── API.yaml
│   │   ├── MODEL.sql
│   │   ├── TESTS.md
│   │   └── QNA_DECISIONS.md
│   └── style/
│       ├── STRUCTURE.md            # Repo structure (this file)
│       ├── STYLE_GUIDE.md
│       ├── GUIDE_STYLE.md          # Win95 style, inline-style policy
│       ├── CLEAN_ARCH.md           # Clean Architecture guide
│       └── REPO_RULES.md           # Gate, Twelve-Factor, security
│
└── tools/
    ├── README.md
    └── check-doc-links.cjs
```

## Navigation

### Agents & Roles

- **Agents:** [ai/agents/README.md](../../ai/agents/README.md) — call via `@Product Lead`, `@Designer`, etc.
- **Workflow:** [ai/roles/README.md](../../ai/roles/README.md) — use `FP=FP1 mode=plan` (or design, build, release)
- **Audit:** [ai/roles/audit/](../../ai/roles/audit/) — analyst, inspector, supervisor

### Docs & Guardrails

- **Workflow:** [docs/agents/WORKFLOW.md](../agents/WORKFLOW.md)
- **Guardrails:** [docs/dev/GUARDRAILS.md](../dev/GUARDRAILS.md)
- **Style:** [STYLE_GUIDE.md](STYLE_GUIDE.md)
- **Core contracts:** [docs/core/](../core/)
- **FP example:** [docs/fps/FP_EXAMPLE.md](../fps/FP_EXAMPLE.md)

### Cursor & Skills

- **Cursor rules:** [.cursor/rules/README.md](../../.cursor/rules/README.md)
- **Codex skills:** [.codex/skills/README.md](../../.codex/skills/README.md)

### Tooling

- **Tools:** [tools/README.md](../../tools/README.md) — e.g. `node tools/check-doc-links.cjs docs/`

## Entry Points

1. **README.md** — how to use the template, quickstart, where to create FPs
2. **AGENTS.md** — workflow rules, 6 agents, 4 stages, document map
