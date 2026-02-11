# Documentation (Agent Template)

Entry point for template documentation. No product code—only agent workflow, guardrails, and core contract stubs.

## Agents & Workflow

| Document | Purpose |
|----------|---------|
| [AGENTS.md](../AGENTS.md) | Main workflow (6 agents, 4 stages) |
| [WORKFLOW.md](agents/WORKFLOW.md) | How to run agents, output contract, guardrails, conflicts |

## Guardrails & Contract

| Document | Purpose |
|----------|---------|
| [GUARDRAILS.md](dev/GUARDRAILS.md) | Canonical rules for all agents |
| [AGENT_CONTRACT_SUMMARY.md](dev/AGENT_CONTRACT_SUMMARY.md) | What each agent must output / must not do |
| [STYLE_GUIDE.md](style/STYLE_GUIDE.md) | Style guide (template; replace with your design system) |

## Feature Packs

| Document | Purpose |
|----------|---------|
| [fps/README.md](fps/README.md) | FP catalog and how to create FPs |
| [fps/TEMPLATE.md](fps/TEMPLATE.md) | Blank FP structure |
| [fps/FP_EXAMPLE.md](fps/FP_EXAMPLE.md) | Example FP (reference) |
| [fps/RELEASE_GATE_TEMPLATE.md](fps/RELEASE_GATE_TEMPLATE.md) | Release gate checklist template |

## Core Contracts (sources of truth)

Fill these for your project. They are referenced by roles and skills.

| Document | Purpose |
|----------|---------|
| [core/REQUIREMENTS.md](core/REQUIREMENTS.md) | FR/NFR |
| [core/API.yaml](core/API.yaml) | OpenAPI contract |
| [core/MODEL.sql](core/MODEL.sql) | Data model |
| [core/UX_MAP.md](core/UX_MAP.md) | CTA → Endpoint → State → Page |
| [core/TESTS.md](core/TESTS.md) | Test strategy, UAT/BDD |
| [core/QNA_DECISIONS.md](core/QNA_DECISIONS.md) | Questions and ADRs |
| [core/WORKPLAN.yaml](core/WORKPLAN.yaml) | FP statuses, milestones, risks |

## Link validation

From repo root:

```bash
node tools/check-doc-links.cjs
node tools/check-doc-links.cjs docs/
```
