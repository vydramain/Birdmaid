---
name: ux-map-sync
description: Sync docs/core/UX_MAP.md with docs/core/API.yaml and docs/core/MODEL.sql and add CTA diagrams; use when aligning UX flow, API, and data model for an FP or feature.
---

# ux-map-sync

## Inputs

- FP id or feature name
- Target CTA list (if provided)

## Steps

1) Read: docs/core/API.yaml, docs/core/MODEL.sql, docs/core/UX_MAP.md, docs/core/QNA_DECISIONS.md, docs/fps/FP<N>.md.
2) Ensure each CTA in docs/core/UX_MAP.md has a mapped Page, Endpoint, State, and mock_status that match docs/core/API.yaml and docs/core/MODEL.sql.
3) Add a CTA overview diagram and a sequenceDiagram for each CTA in docs/core/UX_MAP.md (use Mermaid).
4) Record any gaps or assumptions in docs/core/QNA_DECISIONS.md with [FP:<id>] tags.
5) Update docs/fps/FP<N>.md with UX Map section and sync note.

## Output

- Updated docs/core/UX_MAP.md, docs/core/QNA_DECISIONS.md, docs/fps/FP<N>.md.
