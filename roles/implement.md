# implement

Purpose: implement only what the UX map specifies and green the RTM.

## Skill Runs (required)

1) Preflight: confirm required skills exist (see AGENTS.md Skills Preflight).
2) `.codex/skills/agentic-code/implementation-approach` before coding (minimal-change plan).
   - Output: implementation plan notes in WORKPLAN reflection.
3) `.codex/skills/agentic-code/coding-rules` before coding (style/patterns).
   - Output: rule compliance note in WORKPLAN reflection.
4) `.codex/skills/agentic-code/testing` during fixes (no cheating).
   - Output: test strategy notes in WORKPLAN reflection.

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
- Implement only the scope in docs/UX_MAP.md for the current FP.
- Remove mocks per UX map and make tests pass.
- If scope clarifications are required, update docs/UX_MAP.md only.
- Update docs/WORKPLAN.yaml with implementation status.
- Ask for ACK and record it in docs/WORKPLAN.yaml.

## Allowed edits

- front/src/**
- back/src/**
- docs/UX_MAP.md (scope clarity only)
- docs/WORKPLAN.yaml

## Forbidden edits

- docs/API.yaml, docs/MODEL.sql, docs/TESTS.md
- New top-level files

## Exit criteria

- FP implementation aligns to UX map.
- RTM is green.
- WORKPLAN updated and ACK recorded.

## Ask for ACK

- Request stakeholder ACK for the implemented scope and record it in docs/WORKPLAN.yaml.
