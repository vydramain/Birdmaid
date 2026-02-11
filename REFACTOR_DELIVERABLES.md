# STEP 7 — Final Deliverables (Agent Template Refactor)

## A) PATCH PLAN

### Deleted (files and directories)

- **Product:** `front/`, `back/` (entire trees)
- **Infra:** `docker-compose.yml`
- **Scripts:** `scripts/` (check-doc-links moved to tools/)
- **Root:** `CUTLIST.md`, `FP7_AUTH_CLEANUP_SUMMARY.md`, `PRODUCT_DESCRIPTION.md`
- **docs:** `docs/audit/`, `docs/compliance/`, `docs/design/`, `docs/debug/`, `docs/tests/`
- **docs root:** `CUTLINE_PLAN.md`, `REWRITE_CHECKLIST.md`, `TEST_FAILURES_REPORT.md`, `TEST_FIXES_FILE_LIST.md`
- **docs/fps:** `FP1.md`–`FP7.md`, `FP7_RELEASE_GATE.md`, `FP7_SECURITY_CHECKLIST_M2.md`, `FP7_STYLE_GUARDRAILS_*.md`, `M0_GATE_CHECKLIST.md`, `STYLE_REFACTOR_*.md`
- **docs/style:** `GUIDE_STYLE.md`, `WIN95_SPEC.md`, `CHICAGO95_*.md`, `EXPLORER_UI_CONTRACT.md`, `DESIGN_SYSTEM_98.css.md`, `ICONS_PIPELINE.md`, `OS_ILLUSION_SCENARIOS.md`, `GAP_REPORT_CHICAGO95.md`, `THEME_CONTRACT.md`, `VISUAL_TESTS.md`

### Created

- **docs/core/:** `REQUIREMENTS.md`, `WORKPLAN.yaml`, `UX_MAP.md`, `API.yaml`, `MODEL.sql`, `TESTS.md`, `QNA_DECISIONS.md` (minimal stubs)
- **docs/style/:** `STYLE_GUIDE.md` (neutral template)
- **docs/fps/:** `FP_EXAMPLE.md`, `RELEASE_GATE_TEMPLATE.md`
- **tools/:** `README.md`, `check-doc-links.cjs` (moved from scripts/, PROJECT_ROOT unchanged)
- **Root:** `README.md` (replaced with template “How to use” content)

### Modified

- **.cursor/rules/agents.md:** GUARDRAILS + GUIDE_STYLE + FP7 → GUARDRAILS + STYLE_GUIDE + FP<N>/FP_EXAMPLE
- **.codex/skills/README.md:** same reference updates
- **.codex/skills/agents/engineer/SKILL.md:** same
- **.codex/skills/agentic-code/coding-rules/SKILL.md:** “Birdmaid project” → “project”; GUIDE_STYLE → STYLE_GUIDE
- **.codex/skills/fp-bootstrap/SKILL.md:** “Birdmaid” → “the project”
- **.codex/skills/birdmaid-ux-modern-baseline/SKILL.md:** added PROJECT-SPECIFIC EXAMPLE comment
- **docs/dev/GUARDRAILS.md:** FP7/front/back/check-inline-styles/lint-staged removed; references → STYLE_GUIDE, FP<N>, tools; VFS section removed; enforcement section made generic
- **docs/dev/AGENT_CONTRACT_SUMMARY.md:** product-specific enforcement paths removed; “when you have code” wording
- **docs/agents/WORKFLOW.md:** FP7 → FP1 in examples; GUIDE_STYLE/FP7 → STYLE_GUIDE, FP<N>/FP_EXAMPLE
- **AGENTS.md:** FP contract link → FP<N>/FP_EXAMPLE; GUIDE_STYLE → STYLE_GUIDE
- **STRUCTURE.md:** rewritten for template (no front/back, added tools, docs/core, FP_EXAMPLE, RELEASE_GATE_TEMPLATE, STYLE_GUIDE)
- **docs/README.md:** rewritten for template (no product, link to core, fps, agents, dev, style)
- **docs/fps/README.md:** added FP_EXAMPLE, RELEASE_GATE_TEMPLATE
- **ai/roles/build.md:** “Allowed edits” → generic “your project’s frontend/backend paths”
- **ai/roles/audit/inspector.md:** “front/src, back/src” → “your project’s frontend/backend source”

---

## B) FINAL TREE

```
/
├── .gitignore
├── AGENTS.md
├── LICENSE
├── README.md
├── REFACTOR_PLAN_STEP1_STEP2.md
├── REFACTOR_DELIVERABLES.md
├── STRUCTURE.md
├── ai/
│   ├── agents/
│   │   ├── README.md
│   │   ├── analyst.md
│   │   ├── compliance.md
│   │   ├── delivery.md
│   │   ├── designer.md
│   │   ├── engineer.md
│   │   ├── product-lead.md
│   └── roles/
│       ├── README.md
│       ├── audit/
│       │   ├── analyst.md
│       │   ├── inspector.md
│       │   └── supervisor.md
│       ├── build.md
│       ├── design.md
│       ├── plan.md
│       └── release.md
├── .cursor/rules/
│   ├── README.md
│   ├── agent-workflow.md
│   ├── agents.md
│   └── product-delivery.md
├── .codex/skills/
│   ├── README.md
│   ├── agents/
│   │   ├── README.md
│   │   ├── analyst/SKILL.md
│   │   ├── compliance/SKILL.md
│   │   ├── delivery/SKILL.md
│   │   ├── designer/SKILL.md
│   │   ├── engineer/SKILL.md
│   │   └── product-lead/SKILL.md
│   ├── agentic-code/
│   │   ├── ai-development-guide/SKILL.md
│   │   ├── coding-rules/SKILL.md (+ references/)
│   │   ├── documentation-criteria/SKILL.md
│   │   ├── implementation-approach/SKILL.md
│   │   ├── integration-e2e-testing/SKILL.md
│   │   ├── metacognition/SKILL.md
│   │   ├── testing/SKILL.md (+ references/)
│   │   └── testing-strategy/SKILL.md
│   ├── birdmaid-ux-modern-baseline/SKILL.md
│   ├── fp-bootstrap/SKILL.md
│   └── ux-map-sync/SKILL.md
├── docs/
│   ├── README.md
│   ├── agents/WORKFLOW.md
│   ├── core/
│   │   ├── API.yaml
│   │   ├── MODEL.sql
│   │   ├── QNA_DECISIONS.md
│   │   ├── REQUIREMENTS.md
│   │   ├── TESTS.md
│   │   ├── UX_MAP.md
│   │   └── WORKPLAN.yaml
│   ├── dev/
│   │   ├── AGENT_CONTRACT_SUMMARY.md
│   │   └── GUARDRAILS.md
│   ├── fps/
│   │   ├── FP_EXAMPLE.md
│   │   ├── README.md
│   │   ├── RELEASE_GATE_TEMPLATE.md
│   │   └── TEMPLATE.md
│   └── style/
│       └── STYLE_GUIDE.md
└── tools/
    ├── README.md
    └── check-doc-links.cjs
```

---

## C) SEARCH VALIDATION COMMANDS

Run from repo root.

**1. No product/infra left:**

```bash
# Must return nothing (no matches)
rg -l 'front/|back/|docker-compose|Dockerfile' --glob '!REFACTOR*.md' --glob '!.git*' .
find . -maxdepth 2 -name 'docker-compose*' -o -name 'Dockerfile*' 2>/dev/null | grep -v .git
test -d front && echo "FAIL: front exists" || echo "OK: no front/"
test -d back && echo "FAIL: back exists" || echo "OK: no back/"
test -d scripts && echo "FAIL: scripts exists" || echo "OK: no scripts/"
```

**2. docs/core exists:**

```bash
test -f docs/core/REQUIREMENTS.md && test -f docs/core/API.yaml && test -f docs/core/UX_MAP.md && echo "OK: docs/core stubs present"
```

**3. Internal doc links resolve:**

```bash
node tools/check-doc-links.cjs
node tools/check-doc-links.cjs docs/
# Exit 0 = all internal links resolve
```

---

## D) TEMPLATE README

Content is in **README.md** at repo root. It includes:

- **Quickstart:** how to use agents (FP=&lt;id&gt; mode=plan/design/build/release), where to create FPs
- **Where things live:** AGENTS.md, WORKFLOW, GUARDRAILS, STYLE_GUIDE, docs/core, docs/fps, ai/agents, ai/roles, .cursor, .codex
- **Roles and agents:** workflow stages, specialist agents, audit roles
- **Guardrails and output contract:** canonical rules, style, Evidence / patch plan / Tests / DoD
- **Core contracts:** list of docs/core files and how to fill them
- **Tooling:** `node tools/check-doc-links.cjs` (and that product lint/test is added by the user)
