# STEP 1 — Snapshot & Classification

## Top-level directories and files

| Path | Classification | Reason |
|------|----------------|--------|
| `.codex/` | **KEEP** | Agent template core: skills (agents, agentic-code, fp-bootstrap, ux-map-sync). birdmaid-ux-modern-baseline → keep as project-specific example or rename to generic. |
| `.cursor/` | **KEEP** | Cursor rules (agents, agent-workflow, product-delivery). |
| `.gitignore` | **KEEP** | Minimal .gitignore for template (no product build artifacts). |
| `AGENTS.md` | **KEEP** | Main workflow entry point. |
| `ai/` | **KEEP** | Agents + roles (plan, design, build, release, audit). |
| `back/` | **DELETE** | Product backend (NestJS, src, tests, Dockerfile, package.json). |
| `CUTLIST.md` | **DELETE** | Product-specific cutline. |
| `docker-compose.yml` | **DELETE** | Product infra. |
| `docs/` | **MIXED** | See docs breakdown below. |
| `FP7_AUTH_CLEANUP_SUMMARY.md` | **DELETE** | Product-specific. |
| `front/` | **DELETE** | Product frontend (src, tests, scripts, husky, lint-staged, eslint-plugin). |
| `LICENSE` | **KEEP** | Optional for template. |
| `PRODUCT_DESCRIPTION.md` | **DELETE** | Product-specific. |
| `README.md` | **MOVE/RENAME** | Replace with new template README (how to use agents, FP, guardrails). |
| `scripts/` | **MOVE** | check-doc-links.cjs → tools/; check-asset-provenance.cjs → DELETE (product assets). |
| `STRUCTURE.md` | **KEEP** | Update after refactor to reflect template structure. |

## docs/ breakdown

| Path | Classification | Reason |
|------|----------------|--------|
| `docs/agents/WORKFLOW.md` | **KEEP** | How to run agents, output contract, guardrails refs. |
| `docs/audit/*` | **DELETE** | FP7-specific audit reports. |
| `docs/compliance/*` | **DELETE** | Product asset policy/provenance (no front/public in template). |
| `docs/CUTLINE_PLAN.md`, `REWRITE_CHECKLIST.md`, `TEST_*.md` | **DELETE** | Product. |
| `docs/debug/` | **DELETE** | Product debug. |
| `docs/design/` | **DELETE** | Product design (WIN95, screenshots, icons). |
| `docs/dev/GUARDRAILS.md` | **KEEP** | Neutralize refs to FP7/front/back; keep structure. |
| `docs/dev/AGENT_CONTRACT_SUMMARY.md` | **KEEP** | Agent output contract; remove product-specific enforcement paths if any. |
| `docs/fps/TEMPLATE.md` | **KEEP** | FP template. |
| `docs/fps/FP_EXAMPLE.md` | **CREATE** | New: cleaned example from FP7 (generic). |
| `docs/fps/RELEASE_GATE_TEMPLATE.md` | **CREATE** | From FP7_RELEASE_GATE.md, neutralized. |
| `docs/fps/FP1.md`–`FP7.md` | **DELETE** | Product FPs; FP7 content → FP_EXAMPLE.md. |
| `docs/fps/FP7_*.md` (gate, security, style refactor) | **DELETE** | Product; gate → RELEASE_GATE_TEMPLATE. |
| `docs/fps/M0_GATE_CHECKLIST.md`, `STYLE_REFACTOR_*`, `README.md` | **KEEP** README only | FPs README keep; rest DELETE. |
| `docs/core/` | **CREATE** | Missing; stubs: REQUIREMENTS.md, WORKPLAN.yaml, UX_MAP.md, API.yaml, MODEL.sql, TESTS.md, QNA_DECISIONS.md. |
| `docs/README.md` | **KEEP** | Update links to template structure. |
| `docs/style/GUIDE_STYLE.md` | **KEEP** | Normalize → STYLE_GUIDE.md or keep name; remove Birdmaid/FP7/WIN95 specifics. |
| `docs/style/*` (CHICAGO95, WIN95_SPEC, EXPLORER_UI, etc.) | **DELETE** | Product UI specs. |
| `docs/tests/` | **DELETE** | Product test contract. |

## Other

| Path | Classification | Reason |
|------|----------------|--------|
| `tools/` | **CREATE** | New dir; check-doc-links.cjs moved here, tools/README.md. |
| `birdmaid-ux-modern-baseline` skill | **KEEP** | Mark as project-specific example or keep for "baseline UX sync" pattern. |

---

# STEP 2 — Target Template Structure

```
/
├── .gitignore
├── AGENTS.md
├── STRUCTURE.md
├── README.md                    # NEW: "How to use this template"
├── LICENSE                      # optional
│
├── ai/
│   ├── agents/
│   │   ├── README.md
│   │   ├── product-lead.md
│   │   ├── designer.md
│   │   ├── analyst.md
│   │   ├── engineer.md
│   │   ├── delivery.md
│   │   └── compliance.md
│   └── roles/
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
├── .cursor/
│   └── rules/
│       ├── README.md
│       ├── agents.md
│       ├── agent-workflow.md
│       └── product-delivery.md
│
├── .codex/
│   └── skills/
│       ├── README.md
│       ├── agents/
│       │   ├── README.md
│       │   ├── product-lead/SKILL.md
│       │   ├── designer/SKILL.md
│       │   ├── analyst/SKILL.md
│       │   ├── engineer/SKILL.md
│       │   ├── delivery/SKILL.md
│       │   └── compliance/SKILL.md
│       ├── agentic-code/        # unchanged (all subdirs)
│       ├── birdmaid-ux-modern-baseline/  # keep as project example or rename
│       ├── fp-bootstrap/
│       └── ux-map-sync/
│
├── docs/
│   ├── README.md
│   ├── agents/
│   │   └── WORKFLOW.md
│   ├── dev/
│   │   ├── GUARDRAILS.md
│   │   └── AGENT_CONTRACT_SUMMARY.md
│   ├── fps/
│   │   ├── README.md
│   │   ├── TEMPLATE.md
│   │   ├── FP_EXAMPLE.md        # NEW (cleaned from FP7)
│   │   └── RELEASE_GATE_TEMPLATE.md  # NEW (neutral from FP7_RELEASE_GATE)
│   ├── core/                    # NEW (all stubs)
│   │   ├── REQUIREMENTS.md
│   │   ├── WORKPLAN.yaml
│   │   ├── UX_MAP.md
│   │   ├── API.yaml
│   │   ├── MODEL.sql
│   │   ├── TESTS.md
│   │   └── QNA_DECISIONS.md
│   └── style/
│       └── STYLE_GUIDE.md       # Single neutral guide (from GUIDE_STYLE, neutralized)
│
└── tools/
    ├── README.md                # NEW: how to run tooling
    └── check-doc-links.cjs      # moved from scripts/, adapt PROJECT_ROOT
```

No: front/, back/, docker-compose.yml, Dockerfile*, scripts/ (removed), docs/audit, docs/compliance, docs/design, docs/debug, docs/tests, product-only docs.
