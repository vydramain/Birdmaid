# discovery

Purpose: turn an idea into the minimal FP scope with open questions and discovery notes.

## Skill Runs (required)

1) Preflight: confirm required skills exist (see AGENTS.md Skills Preflight).
2) `.codex/skills/agentic-code/ai-development-guide` before edits for scope framing.
   - Output: scope slice notes; record in WORKPLAN reflection.
3) `.codex/skills/agentic-code/metacognition` before reflection to log top 3 scope risks.
   - Output: risk bullets in WORKPLAN reflection.
4) `.codex/skills/agentic-code/documentation-criteria` after edits.
   - Output: doc fixes applied; record in WORKPLAN reflection + list of changed files.

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
- Select FP: use FP from command or the top planned FP in docs/WORKPLAN.yaml.
- Capture all unknowns and contradictions in docs/QNA_DECISIONS.md under Questions/Gaps tagged [FP:<id>].
- Update docs/UX_MAP.md with missing CTA rows or clarifications for the FP.
- Update docs/WORKPLAN.yaml with discovery status, blockers, and reflection.
- Run agentic-code documentation review (skill: documentation-criteria) and apply fixes to docs only.
- Ask for ACK and record it in docs/WORKPLAN.yaml.

## Allowed edits

- docs/QNA_DECISIONS.md
- docs/UX_MAP.md
- docs/WORKPLAN.yaml

## Forbidden edits

- Product code (front/ or back/)
- docs/API.yaml, docs/MODEL.sql, docs/TESTS.md
- New top-level files

## Exit criteria

- Questions/Gaps captured for the FP.
- UX map is updated for the FP.
- WORKPLAN has discovery status, blockers, reflection, and ACK.

## Ask for ACK

- Request stakeholder ACK for FP scope and record it in docs/WORKPLAN.yaml.
