---
name: fp-bootstrap
description: Create or refresh FP scope for Birdmaid; use when starting discovery for an FP or when asked to turn an idea into FP artifacts (WORKPLAN, UX_MAP, QNA_DECISIONS).
---

# fp-bootstrap

## Inputs

- FP id (e.g., FP1)
- Short product idea (1-2 paragraphs)

## Steps

1) Read: docs/core/REQUIREMENTS.md, docs/core/API.yaml, docs/core/MODEL.sql, docs/core/UX_MAP.md, docs/core/TESTS.md, docs/core/QNA_DECISIONS.md, docs/core/WORKPLAN.yaml.
2) Create or update docs/fps/FP<N>.md: add scope, risks, timebox, dependencies, and status=plan.
3) Update docs/core/UX_MAP.md: add FP assignment plus a CTA table with Page, Endpoint, State, and mock_status.
4) Update docs/core/QNA_DECISIONS.md: add 5-15 Questions/Gaps tagged [FP:<id>] with suggested default decisions.
5) Summarize changes and request ACK.

## Output

- Created/updated docs/fps/FP<N>.md, docs/core/UX_MAP.md, docs/core/QNA_DECISIONS.md.
