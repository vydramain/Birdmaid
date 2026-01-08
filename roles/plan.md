# plan

Purpose: turn discovery outputs into a concrete execution plan for the current FP.

## Skill Runs (required)

1) Preflight: confirm required skills exist (see AGENTS.md Skills Preflight).
2) `.codex/skills/agentic-code/ai-development-guide` before edits for planning heuristics.
   - Output: plan structure choices; record in WORKPLAN reflection.
3) `.codex/skills/agentic-code/metacognition` before reflection for WIP/timebox sanity.
   - Output: sanity notes in WORKPLAN reflection.
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
- Expand the FP section in docs/WORKPLAN.yaml with tasks, risks, and dependencies.
- Confirm any new questions in docs/QNA_DECISIONS.md.
- Ask for ACK and record it in docs/WORKPLAN.yaml.

## Allowed edits

- docs/WORKPLAN.yaml
- docs/QNA_DECISIONS.md

## Forbidden edits

- Product code (front/ or back/)
- docs/API.yaml, docs/MODEL.sql, docs/TESTS.md, docs/UX_MAP.md
- New top-level files

## Exit criteria

- FP plan is concrete and timeboxed.
- Open questions are logged.
- ACK recorded.

## Ask for ACK

- Request stakeholder ACK for the plan and record it in docs/WORKPLAN.yaml.
