# Repository Structure

This document describes the repository structure after restructuring.

## Overview

Restructuring was done to:
- ✅ Separate source code from agent roles information
- ✅ Separate documentation from temporary/analytical files
- ✅ Create clear navigation between documents
- ✅ Organize specialist agents and workflow roles
- ✅ Simplify to 6 agents and 4 workflow stages
- ✅ Create single file per Feature Pack

## Current Structure

```
Birdmaid/
├── front/                          # Frontend source code (React + Vite + TypeScript)
│   ├── apps/                       # Separate application builds
│   │   └── mobile/                 # Mobile app (Windows Mobile 6.0 style)
│   │       ├── main-mobile.tsx     # Mobile entry point
│   │       ├── MobileApp.tsx       # Main mobile app component
│   │       ├── Launcher.tsx         # WM6 app launcher
│   │       └── viewers/            # Mobile content viewers
│   ├── src/                        # Desktop app source code
│   └── index-mobile.html           # Mobile app HTML entry
├── back/                           # Backend source code (NestJS + MongoDB)
│
├── ai/                             # AI agents and roles
│   ├── agents/                     # Specialist agents (6 agents)
│   │   ├── README.md               # Agent catalog + how to use
│   │   ├── product-lead.md         # Product Lead (PM + Orchestrator)
│   │   ├── designer.md             # Designer (UX + BA)
│   │   ├── analyst.md              # Analyst (Data/Product Analytics)
│   │   ├── engineer.md             # Engineer (Tech Lead/Architect)
│   │   ├── delivery.md              # Delivery (Project Manager)
│   │   └── compliance.md           # Compliance (Legal/Security)
│   │
│   └── roles/                      # Workflow roles (4 stages)
│       ├── README.md               # Workflow roles description
│       ├── plan.md                 # Planning: discovery + plan
│       ├── design.md               # Design: design-first + architecture
│       ├── build.md                # Build: tests-red + implement + tests-green
│       ├── release.md               # Release: gate + acceptance
│       │
│       └── audit/                  # Audit roles
│           ├── analyst.md          # Factual analysis
│           ├── inspector.md        # Code audit
│           └── supervisor.md      # Decision making
│
├── docs/                           # Project documentation
│   ├── README.md                   # Documentation navigation
│   │
│   ├── core/                       # Core documents (sources of truth)
│   │   ├── REQUIREMENTS.md         # Requirements (FR + NFR)
│   │   ├── API.yaml                # OpenAPI contract
│   │   ├── MODEL.sql               # Data model
│   │   ├── UX_MAP.md               # UI Action Map
│   │   ├── TESTS.md                # Test strategy, UAT/BDD, RTM
│   │   ├── QNA_DECISIONS.md        # Questions/answers/ADRs
│   │   └── WORKPLAN.yaml           # FP statuses, stages, risks
│   │
│   └── fps/                        # Feature Pack files (one file per FP)
│       ├── README.md               # FP files description
│       ├── TEMPLATE.md             # Template for new FP
│       ├── FP1.md                  # Browse & Play + Admin Authoring
│       ├── FP2.md                  # Team System and Game Editing
│       ├── FP3.md                  # Windows 95 UI Behavior
│       ├── FP4.md                  # User Accounts & Windows 95 UI
│       └── FP5.md                  # UI/UX Fixes and Polish
│
├── .cursor/                        # Cursor rules
│   └── rules/
│       ├── README.md               # Rules description
│       ├── product-delivery.md    # Basic product delivery rules
│       ├── agent-workflow.md      # Rules for working with agents
│       └── agents.md               # Agent integration rules
│
├── .codex/                         # Skills
│   └── skills/
│       ├── agents/                 # Agent skills (6 skills)
│       │   ├── README.md
│       │   ├── product-lead/SKILL.md
│       │   ├── designer/SKILL.md
│       │   ├── analyst/SKILL.md
│       │   ├── engineer/SKILL.md
│       │   ├── delivery/SKILL.md
│       │   └── compliance/SKILL.md
│       │
│       ├── agentic-code/           # Vendor skills
│       └── birdmaid-*/              # Project-specific skills
│
├── artifacts/                      # Artifacts (not committed)
│
├── AGENTS.md                       # Main workflow rules document
├── README.md                       # Main README
├── STRUCTURE.md                    # This file
├── docker-compose.yml
├── .gitignore
└── LICENSE
```

## Navigation

### Specialist Agents (6 agents)

- **Location:** `ai/agents/`
- **Description:** [ai/agents/README.md](./ai/agents/README.md)
- **Usage:** Called for specific tasks via `@AgentName` in chat
- **Skills:** Each agent has a skill in `.codex/skills/agents/<agent-name>/SKILL.md`

| Agent | File | Skill | Purpose |
|-------|------|-------|---------|
| Product Lead | [product-lead.md](./ai/agents/product-lead.md) | [product-lead](../../.codex/skills/agents/product-lead/SKILL.md) | Product management, strategy, prioritization |
| Designer | [designer.md](./ai/agents/designer.md) | [designer](../../.codex/skills/agents/designer/SKILL.md) | UX design + business analysis |
| Analyst | [analyst.md](./ai/agents/analyst.md) | [analyst](../../.codex/skills/agents/analyst/SKILL.md) | Metrics, analytics, experimentation |
| Engineer | [engineer.md](./ai/agents/engineer.md) | [engineer](../../.codex/skills/agents/engineer/SKILL.md) | Technical implementation, architecture |
| Delivery | [delivery.md](./ai/agents/delivery.md) | [delivery](../../.codex/skills/agents/delivery/SKILL.md) | Release planning, risk management |
| Compliance | [compliance.md](./ai/agents/compliance.md) | [compliance](../../.codex/skills/agents/compliance/SKILL.md) | Security, privacy, compliance |

### Workflow Roles (4 stages)

- **Location:** `ai/roles/`
- **Description:** [ai/roles/README.md](./ai/roles/README.md)
- **Usage:** `FP=FP6 mode=plan` (or design, build, release)

| Stage | File | What it does |
|-------|------|--------------|
| plan | [plan.md](./ai/roles/plan.md) | Planning: discovery + plan |
| design | [design.md](./ai/roles/design.md) | Design: design-first + architecture |
| build | [build.md](./ai/roles/build.md) | Implementation: tests-red + implement + tests-green |
| release | [release.md](./ai/roles/release.md) | Release: gate + acceptance |

### Audit Roles

- **Location:** `ai/roles/audit/`
- **Description:** In [ai/roles/README.md](./ai/roles/README.md)
- **Usage:** Analysis and audit of project

| Role | File | Purpose |
|------|------|---------|
| analyst | [audit/analyst.md](./ai/roles/audit/analyst.md) | Factual analysis (what's actually done) |
| inspector | [audit/inspector.md](./ai/roles/audit/inspector.md) | Code audit |
| supervisor | [audit/supervisor.md](./ai/roles/audit/supervisor.md) | Decision making, scope cutting |

### Documentation

- **Core documents:** `docs/core/` — sources of truth
  - [docs/README.md](./docs/README.md)
- **Feature Pack files:** `docs/fps/` — one file per FP with all information
  - [docs/fps/README.md](./docs/fps/README.md)

### Cursor Rules

- **Location:** `.cursor/rules/`
- **Description:** [.cursor/rules/README.md](./.cursor/rules/README.md)
- **Usage:** Automatically applied by Cursor

### Agent Skills

- **Location:** `.codex/skills/agents/`
- **Description:** [.codex/skills/agents/README.md](./.codex/skills/agents/README.md)
- **Usage:** Each agent automatically uses its skill before starting work

## Migration from Old Structure

### What Changed

1. **Agents simplified:**
   - **Before:** 11 agents (Product Orchestrator, Product Manager, Business Analyst, Product Designer, UX Researcher, Product Analyst, Service Designer, Tech Lead, Delivery Manager, Customer Success, Legal/Compliance)
   - **After:** 6 agents (Product Lead, Designer, Analyst, Engineer, Delivery, Compliance)

2. **Workflow stages simplified:**
   - **Before:** 8 stages (discovery, plan, design-first, architect, tests-red, implement, tests-green, gate)
   - **After:** 4 stages (plan, design, build, release)

3. **Roles moved:**
   - `roles/` → `ai/roles/` (workflow roles)
   - `roles/analyst.md`, `roles/inspector.md`, `roles/supervisor.md` → `ai/roles/audit/`

4. **Documents reorganized:**
   - `docs/REQUIREMENTS.md` → `docs/core/REQUIREMENTS.md`
   - `docs/API.yaml` → `docs/core/API.yaml`
   - `docs/MODEL.sql` → `docs/core/MODEL.sql`
   - `docs/UX_MAP.md` → `docs/core/UX_MAP.md`
   - `docs/TESTS.md` → `docs/core/TESTS.md`
   - `docs/QNA_DECISIONS.md` → `docs/core/QNA_DECISIONS.md`
   - `docs/WORKPLAN.yaml` → `docs/core/WORKPLAN.yaml`
   - **New:** `docs/fps/FP<N>.md` — single file per FP with all information

5. **Paths updated:**
   - All references to `docs/` in `AGENTS.md` and roles updated to `docs/core/`
   - All references to `roles/` updated to `ai/roles/`

6. **New additions:**
   - Agent skills in `.codex/skills/agents/`
   - Cursor rules in `.cursor/rules/`
   - Feature Pack files in `docs/fps/`

### What You Need to Do

1. **Update commands:**
   - Commands `FP=FP6 mode=plan` work as before
   - Agent now reads `ai/roles/<mode>.md` instead of `roles/<mode>.md`

2. **Update references:**
   - All document references should point to `docs/core/`
   - All role references should point to `ai/roles/`
   - Use `docs/fps/FP<N>.md` for Feature Pack information

3. **Use agents:**
   - Call agents via `@AgentName` in chat
   - Agents automatically use their skills from `.codex/skills/agents/`

## Component Relationships

```
AGENTS.md (main workflow rules)
    ↓
ai/roles/ (workflow stages: plan, design, build, release)
    ↓
docs/fps/FP<N>.md (single file per FP with all information)
    ↓
docs/core/ (core documents: sources of truth)
    ↓
ai/agents/ (specialist agents, used within workflow)
    ↓
.codex/skills/agents/ (agent skills: frameworks, best practices)
    ↓
.cursor/rules/ (Cursor rules: automatic application)
```

## Additional Information

- **Main document:** [AGENTS.md](./AGENTS.md)
- **Main README:** [README.md](./README.md)
- **Documentation:** [docs/README.md](./docs/README.md)
- **Agents:** [ai/agents/README.md](./ai/agents/README.md)
- **Roles:** [ai/roles/README.md](./ai/roles/README.md)
- **Rules:** [.cursor/rules/README.md](./.cursor/rules/README.md)
- **Agent Skills:** [.codex/skills/agents/README.md](./.codex/skills/agents/README.md)
