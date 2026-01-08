---
name: fp-bootstrap
description: Create or refresh FP scope for Birdmaid; use when starting discovery for an FP or when asked to turn an idea into FP artifacts (WORKPLAN, UX_MAP, QNA_DECISIONS).
---

# fp-bootstrap

## Inputs

- FP id (e.g., FP1)
- Short product idea (1-2 paragraphs)

## Steps

1) Read: docs/REQUIREMENTS.md, docs/API.yaml, docs/MODEL.sql, docs/UX_MAP.md, docs/TESTS.md, docs/QNA_DECISIONS.md, docs/WORKPLAN.yaml.
2) Update docs/WORKPLAN.yaml: add or refresh the FP block with scope, risks, timebox, dependencies, and status=discovery.
3) Update docs/UX_MAP.md: add FP assignment plus a CTA table with Page, Endpoint, State, and mock_status.
4) Update docs/QNA_DECISIONS.md: add 5-15 Questions/Gaps tagged [FP:<id>] with suggested default decisions.
5) Summarize changes and request ACK.

## Output

- Updated docs/WORKPLAN.yaml, docs/UX_MAP.md, docs/QNA_DECISIONS.md.
