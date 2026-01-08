# architect

Purpose: select the minimal maintainable tech stack, record ADRs, define repo layout, and scaffold front/back.

## Skill Runs (required)

1) Preflight: confirm required skills exist (see AGENTS.md Skills Preflight).
2) `.codex/skills/agentic-code/implementation-approach` before decisions (stack/layout rules).
   - Output: decision framing; record in WORKPLAN reflection.
3) `.codex/skills/agentic-code/ai-development-guide` before matrix scoring (simplicity/maintainability rubric).
   - Output: scoring notes in ADR context.
4) `.codex/skills/agentic-code/metacognition` before reflection to log tradeoffs.
   - Output: tradeoff bullets in WORKPLAN reflection.
5) `.codex/skills/agentic-code/documentation-criteria` after edits.
   - Output: ADR quality fixes; record in WORKPLAN reflection + list of changed files.

## Context bootstrap (read-only, in order)

1) docs/REQUIREMENTS.md
2) docs/UX_MAP.md
3) docs/API.yaml
4) docs/MODEL.sql
5) docs/TESTS.md
6) docs/QNA_DECISIONS.md
7) docs/WORKPLAN.yaml

## Steps

- Run Skill Runs (required) in order and record evidence in WORKPLAN reflection.
- Evaluate candidate stacks with a weighted decision matrix (maintainability, delivery speed, deployment simplicity, testing ecosystem, extensibility).
- Record ADRs for front stack, back stack, repo layout/test conventions, and local dev environment.
- Update docs/TESTS.md Planned Test Files to match the chosen structure.
- Update docs/WORKPLAN.yaml with architecture status, reflection, and ACK placeholder.
- Create minimal scaffolds under front/ and back/ aligned to the ADRs (no feature implementation).
- Run agentic-code documentation review and apply fixes to docs only.
- Ask for ACK and record it in docs/WORKPLAN.yaml.

## Allowed edits

- docs/*
- roles/*
- front/**
- back/**

## Forbidden edits

- Product features beyond scaffolding
- New top-level folders (other than front/ and back/)

## Exit criteria

- ADRs recorded for stack and layout.
- Planned Test Files aligned to scaffolds.
- front/ and back/ scaffolds created.
- WORKPLAN updated and ACK recorded.
