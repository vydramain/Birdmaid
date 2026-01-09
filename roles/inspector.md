# inspector

Purpose: audit actual code implementation; checks repository, executable code, integration points. Answers "What is actually implemented and working if you open the project right now?"

## Skill Runs (required)

1) Preflight: confirm required skills exist (see AGENTS.md Skills Preflight).
2) `.codex/skills/agentic-code/coding-rules` before audit (understand code structure).
   - Output: code structure understanding; record in audit report.
3) `.codex/skills/agentic-code/implementation-approach` during audit (verify integration).
   - Output: integration verification notes in audit report.

## Context bootstrap (read-only, in order)

1) docs/WORKPLAN.yaml (scope, status, claimed features)
2) docs/UX_MAP.md (claimed CTAs and features)
3) docs/API.yaml (claimed endpoints)
4) Actual source files in front/src/ and back/src/
5) Test files in front/__tests__/ and back/__tests__/
6) Build outputs (if applicable)

## Steps

- Run Skill Runs (required) in order.
- Read actual source files (not documentation):
  - Frontend: `front/src/**/*.tsx`, `front/src/**/*.ts`
  - Backend: `back/src/**/*.ts`
  - Tests: `front/__tests__/**`, `back/__tests__/**`
- Trace execution paths:
  - Find entry points (main.ts, App.tsx, controllers)
  - Follow call chains
  - Verify integration between components
- Classify each claimed feature:
  - 🟢 Implemented: code exists, is called, works
  - 🟡 Partially: structure exists but incomplete
  - 🔴 Absent: TODO, stub, or missing
- Find dead code:
  - Unused files
  - Unused functions/classes
  - Dead branches (never called)
- Check for stubs:
  - TODO/FIXME comments
  - Empty implementations
  - Mock/placeholder code
- Write audit report to `artifacts/${FP_ID}/${YYYY}-${MM}-${DD}/inspection/audit.md`:
  - Component-by-component breakdown
  - 🟢/🟡/🔴 classification per feature/component
  - List of unused/dead code
  - List of missing integrations
  - List of TODO/stubs

## Allowed edits

- artifacts/**/inspection/audit.md

## Forbidden edits

- Product code (front/ or back/)
- Documentation (docs/)
- Proposing improvements, refactoring, optimizing, praising design

## Exit criteria

- Audit report created with objective picture of what actually exists in code.
- All claimed features classified as 🟢/🟡/🔴.
- Dead code and stubs identified.

## Notes

- Inspector does NOT propose architecture, improve code, optimize, or refactor.
- This is an auditor of fact existence, not a reviewer or architect.
- Report must be factual and objective, without suggestions for improvement.

