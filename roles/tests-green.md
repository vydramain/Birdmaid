# tests-green

Purpose: run tests, collect coverage, and store artifacts for the FP.

## Skill Runs (required)

1) Preflight: confirm required skills exist (see AGENTS.md Skills Preflight).
2) `.codex/skills/agentic-code/testing-strategy` before running tests (coverage + artifacts).
   - Output: coverage expectations in WORKPLAN reflection.
3) `.codex/skills/agentic-code/integration-e2e-testing` before any e2e (mark N/A if none).
   - Output: e2e note in WORKPLAN reflection.
4) `.codex/skills/agentic-code/documentation-criteria` after evidence docs.
   - Output: demo-notes clarity fixes in WORKPLAN reflection + list of changed files.

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
- Run the test suite and collect coverage.
- Store artifacts under artifacts/<FP>/<date>/.
- Write demo-notes.txt with demo steps and results.
- Update docs/WORKPLAN.yaml with test results.
- Ask for ACK and record it in docs/WORKPLAN.yaml.

## Allowed edits

- docs/WORKPLAN.yaml
- artifacts/**
- demo-notes.txt

## Forbidden edits

- Product code (front/ or back/)
- docs/API.yaml, docs/MODEL.sql, docs/TESTS.md, docs/UX_MAP.md
- New top-level files

## Exit criteria

- Tests executed with artifacts saved.
- WORKPLAN updated and ACK recorded.

## Ask for ACK

- Request stakeholder ACK for test results and record it in docs/WORKPLAN.yaml.
