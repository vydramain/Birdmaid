---
name: ux-map-sync
description: Sync docs/UX_MAP.md with docs/API.yaml and docs/MODEL.sql and add CTA diagrams; use when aligning UX flow, API, and data model for an FP or feature.
---

# ux-map-sync

## Inputs

- FP id or feature name
- Target CTA list (if provided)

## Steps

1) Read: docs/API.yaml, docs/MODEL.sql, docs/UX_MAP.md, docs/QNA_DECISIONS.md, docs/WORKPLAN.yaml.
2) Ensure each CTA in docs/UX_MAP.md has a mapped Page, Endpoint, State, and mock_status that match docs/API.yaml and docs/MODEL.sql.
3) Add a CTA overview diagram and a sequenceDiagram for each CTA in docs/UX_MAP.md (use Mermaid).
4) Record any gaps or assumptions in docs/QNA_DECISIONS.md with [FP:<id>] tags.
5) Update docs/WORKPLAN.yaml with a short sync note.

## Output

- Updated docs/UX_MAP.md, docs/QNA_DECISIONS.md, docs/WORKPLAN.yaml.
