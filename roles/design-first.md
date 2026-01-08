# design-first

Purpose: align UX map with API and data model for the current FP.

## Skill Runs (required)

1) Preflight: confirm required skills exist (see AGENTS.md Skills Preflight).
2) `.codex/skills/agentic-code/implementation-approach` before edits for architectural alignment.
   - Output: alignment notes; record in WORKPLAN reflection.
3) `.codex/skills/agentic-code/metacognition` before reflection to log assumptions as Questions/ADRs.
   - Output: QNA entries; record in WORKPLAN reflection.
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
- Synchronize docs/UX_MAP.md with docs/API.yaml and docs/MODEL.sql.
- Add CTA diagrams and system interaction overview for the FP.
- UX reference generation with Stitch (reference-only):
  - Stakeholder command: `FP=FP1 mode=design-first — generate stitch prompt`
  - Action: compile a Stitch Prompt Pack in `docs/REQUIREMENTS.md` under "## Stitch Prompt Pack (Generated)".
    - Include screens list, UX constraints, layout notes, and token checklist.
  - Prompt template (English):
    - "Design a modern, minimal game catalog and admin authoring UI for a web platform. Screens: CatalogPage, GamePage, AdminGameEditorPage, AdminTagsPage, AdminTeamsPage. Emphasize loading/empty/error states, responsive grid (mobile 1-2 cols, desktop 3-4 cols), CTA hierarchy, and iframe play with fullscreen + fallback. Use MUI Material 3 baseline and provide tokens (color palette, typography scale, spacing, radius, elevation)."
  - Record chosen layout variant (A/B) and extracted tokens.
  - Write tokens to docs/REQUIREMENTS.md under UX / Design System (Baseline).
- Log gaps or assumptions in docs/QNA_DECISIONS.md.
- Update docs/WORKPLAN.yaml with a short design-first note.
- Run agentic-code documentation review (skill: documentation-criteria) and apply fixes to docs only.
- Ask for ACK and record it in docs/WORKPLAN.yaml.

## Allowed edits

- docs/UX_MAP.md
- docs/API.yaml
- docs/MODEL.sql
- docs/QNA_DECISIONS.md
- docs/WORKPLAN.yaml
- docs/REQUIREMENTS.md

## Forbidden edits

- Product code (front/ or back/)
- New top-level files

## Exit criteria

- UX map aligns with API and model.
- Stitch reference captured; tokens recorded in REQUIREMENTS.
- Gaps/assumptions logged.
- WORKPLAN updated and ACK recorded.

## Ask for ACK

- Request stakeholder ACK for the design alignment and record it in docs/WORKPLAN.yaml.
