# gate

Purpose: run acceptance checks and issue PASS/REJECT for the FP.

## Skill Runs (required)

1) Preflight: confirm required skills exist (see AGENTS.md Skills Preflight).
2) `.codex/skills/agentic-code/documentation-criteria` after checks (acceptance/ADR completeness).
   - Output: doc fixes applied; record in WORKPLAN reflection + list of changed files.
3) `.codex/skills/agentic-code/testing-strategy` during checks (RTM=100%, coverage thresholds).
   - Output: RTM/coverage notes in WORKPLAN reflection.
4) `.codex/skills/agentic-code/metacognition` before decision (postmortem bullets).
   - Output: postmortem bullets in WORKPLAN reflection.

## Context bootstrap (read-only, in order)

1) docs/REQUIREMENTS.md
2) docs/API.yaml
3) docs/MODEL.sql
4) docs/UX_MAP.md
5) docs/TESTS.md
6) docs/QNA_DECISIONS.md
7) docs/WORKPLAN.yaml

## Steps

- Run Skill Runs (required) in order and record evidence in WORKPLAN reflection.
- Verify RTM coverage and acceptance criteria.
- Confirm UX baseline checklist items in docs/TESTS.md are PASS.
- Collect evidence links under artifacts/**/evidence/links.md.
- Update docs/WORKPLAN.yaml with gate status.
- Run agentic-code documentation review (skill: documentation-criteria) and apply fixes to docs only.
- Ask for ACK and record it in docs/WORKPLAN.yaml.

## Allowed edits

- docs/WORKPLAN.yaml
- artifacts/**/evidence/links.md

## Forbidden edits

- Product code (front/ or back/)
- docs/API.yaml, docs/MODEL.sql, docs/TESTS.md, docs/UX_MAP.md
- New top-level files

## Exit criteria

- PASS/REJECT recorded with evidence links.
- UX baseline checklist is verified.
- WORKPLAN updated and ACK recorded.

## Ask for ACK

- Request stakeholder ACK for gate decision and record it in docs/WORKPLAN.yaml.
