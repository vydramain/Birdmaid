# Agent Template

Reusable template for **agent-driven product workflow**: 6 specialist agents, 4 workflow stages (plan → design → build → release), Cursor rules, Codex skills, and core docs. No product code—only the structure to run and enforce the workflow.

## Quickstart

### Use agents

In chat (e.g. Cursor), mention an agent or a stage:

- **By agent:** `@Product Lead: определить scope для FP1`  
- **By stage:** `FP=FP1 mode=plan` (then `mode=design`, `mode=build`, `mode=release`)

Each stage reads and updates **one file per FP:** `docs/fps/FP<N>.md`.

### Create a new Feature Pack

1. Copy [docs/fps/TEMPLATE.md](docs/fps/TEMPLATE.md) to `docs/fps/FP<N>.md` (e.g. FP1.md).
2. Fill Scope, Questions, Requirements, UX Map, Architecture, Tests, Plan.
3. Run stages: `FP=FP1 mode=plan` → … → `FP=FP1 mode=release`.
4. For release, use [docs/fps/RELEASE_GATE_TEMPLATE.md](docs/fps/RELEASE_GATE_TEMPLATE.md) as checklist.

### Where things live

| What | Where |
|------|--------|
| Workflow rules | [AGENTS.md](AGENTS.md) |
| How to run agents, guardrails, conflicts | [docs/agents/WORKFLOW.md](docs/agents/WORKFLOW.md) |
| Guardrails (output contract, style) | [docs/dev/GUARDRAILS.md](docs/dev/GUARDRAILS.md), [docs/style/STYLE_GUIDE.md](docs/style/STYLE_GUIDE.md) |
| One FP = one file | `docs/fps/FP<N>.md` (see [FP_EXAMPLE.md](docs/fps/FP_EXAMPLE.md)) |
| Core contracts (API, model, UX map, etc.) | [docs/core/](docs/core/) |
| Agents & roles | [ai/agents/](ai/agents/), [ai/roles/](ai/roles/) |
| Cursor rules | [.cursor/rules/](.cursor/rules/) |
| Codex skills | [.codex/skills/](.codex/skills/) |
| Repo structure | [STRUCTURE.md](STRUCTURE.md) |

## Roles and agents

- **Workflow stages:** plan, design, build, release — see [ai/roles/README.md](ai/roles/README.md).
- **Specialist agents:** Product Lead, Designer, Analyst, Engineer, Delivery, Compliance — see [ai/agents/README.md](ai/agents/README.md). Each has a skill in `.codex/skills/agents/<name>/`.
- **Audit roles:** analyst, inspector, supervisor — in [ai/roles/audit/](ai/roles/audit/).

## Guardrails and output contract

- **Canonical rules:** [docs/dev/GUARDRAILS.md](docs/dev/GUARDRAILS.md). All agents must follow.
- **Style:** [docs/style/STYLE_GUIDE.md](docs/style/STYLE_GUIDE.md). Replace with your design system when you add UI.
- **Output contract:** Every engineering response must include Evidence (files changed), Minimal patch plan, Tests (commands), DoD checklist. See [docs/agents/WORKFLOW.md](docs/agents/WORKFLOW.md) and [docs/dev/AGENT_CONTRACT_SUMMARY.md](docs/dev/AGENT_CONTRACT_SUMMARY.md).

## Core contracts (docs/core)

Fill these for your project so roles and skills have a single source of truth:

- **REQUIREMENTS.md** — FR/NFR  
- **API.yaml** — OpenAPI (or your API contract)  
- **MODEL.sql** — data model (DDL)  
- **UX_MAP.md** — CTA → Endpoint → State → Page  
- **TESTS.md** — test strategy, UAT/BDD  
- **QNA_DECISIONS.md** — questions and ADRs  
- **WORKPLAN.yaml** — FP statuses, milestones, risks  

The template ships minimal stubs. Copy and replace with your content.

## Tooling

- **Doc links:** `node tools/check-doc-links.cjs` or `node tools/check-doc-links.cjs docs/` — checks that internal Markdown links resolve. See [tools/README.md](tools/README.md).

When you add product code, add your own lint/test and (optionally) pre-commit/CI; document commands in your FP or README.

## License

See [LICENSE](LICENSE) if present.
