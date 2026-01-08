# tests-red

Purpose: define UAT/BDD and RTM, then add failing tests for the FP.

## Skill Runs (required)

1) Preflight: confirm required skills exist (see AGENTS.md Skills Preflight).
2) `.codex/skills/agentic-code/testing-strategy` before SPEC edits (UAT/BDD/RTM structure).
   - Output: coverage expectations; record in WORKPLAN reflection.
3) `.codex/skills/agentic-code/testing` before Planned Test Files (naming/structure).
   - Output: test layout notes in WORKPLAN reflection.
4) `.codex/skills/agentic-code/documentation-criteria` after SPEC edits.
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
- Read docs/WORKPLAN.yaml and switch by `tests_phase`:
  - If `tests_phase` is empty or `spec`: do SPEC only.
  - If `tests_phase` is `code` and ACK exists: do CODE only.

### SPEC phase (no code)

- Write UAT/BDD scenarios and RTM in docs/TESTS.md.
- UAT/BDD MUST include loading/empty/error/responsive states.
- Add Planned Test Files list (no test code yet).
- Update docs/WORKPLAN.yaml with `status: tests-red`, `tests_phase: spec`, reflection, and request ACK.
- Run agentic-code documentation review (skill: documentation-criteria) and apply fixes to docs only.
- Stop after ACK request/record.

### CODE phase (only after ACK)

- Create test files per Planned Test Files and ensure tests are red for expected reasons.
- Save red-run logs under artifacts/<FP>/<date>/logs/*.
- Update docs/WORKPLAN.yaml with `tests_phase: code` and reflection.
- Run agentic-code documentation review (skill: documentation-criteria) and apply fixes to docs only.

## Allowed edits

- docs/TESTS.md
- docs/WORKPLAN.yaml
- Test files

## Forbidden edits

- Product code (front/ or back/)
- docs/API.yaml, docs/MODEL.sql, docs/UX_MAP.md
- New top-level files

## Exit criteria

- SPEC: UAT/BDD and RTM written; Planned Test Files listed; WORKPLAN updated with ACK request/record.
- CODE: Planned test files implemented; red-run logs saved; WORKPLAN updated with `tests_phase: code`.

## Ask for ACK

- Request stakeholder ACK for the test plan and record it in docs/WORKPLAN.yaml.
