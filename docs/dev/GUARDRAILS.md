# Canonical Guardrails — Single Source of Truth

**Version:** 1.1 (template)  
**Purpose:** One canonical ruleset for all agents (Cursor + Codex).  
**References:** [STYLE_GUIDE.md](../style/STYLE_GUIDE.md), [docs/fps/FP_EXAMPLE.md](../fps/FP_EXAMPLE.md)

> **All agents (Cursor and Codex) MUST follow this document.** When you add product code, enforce these rules via your own tooling (lint, pre-commit, CI).

---

## 1. Global MUST / MUST NOT Rules

### MUST
- Follow `docs/dev/GUARDRAILS.md` + `docs/style/STYLE_GUIDE.md` + the current FP file (`docs/fps/FP<N>.md`) when making changes
- Include in every engineering response: **Evidence** (files/paths changed), **Minimal patch plan**, **Tests** (what to run), **DoD checklist**
- Use classes, mixins, or design tokens for visual properties (colors, borders, fonts, spacing) where the project has a frontend
- Use relative units (`rem`, `em`, `%`, `vh`, `vw`) in CSS/SCSS where applicable
- Prefer CSS custom properties for runtime values; apply via classes, not inline batches

### MUST NOT
- Use `!important` in CSS/SCSS
- Use absolute units (`px`, `pt`, etc.) except where explicitly allowed (e.g. transform/translate for drag)
- Use inline styles for visual properties without project-defined allow-tag (if your project uses one)
- Use inline styles where all values are literals (constants only)
- Patch docs (STYLE_GUIDE, GUARDRAILS, FP file) to justify code violations

---

## 2. Output Contract for Engineering Changes

Every agent response that proposes or makes code changes MUST include:

| Section | Content |
|---------|---------|
| **Evidence** | List of files/paths changed |
| **Minimal patch plan** | What was added/changed/removed |
| **Tests** | Commands to run (e.g. `npm run lint`, `npm run test`) |
| **DoD checklist** | [ ] Lint passes, [ ] Tests pass, [ ] No new violations |

---

## 3. Do Not Patch Docs to Justify Violations

Agents MUST NOT:
- Add exceptions to STYLE_GUIDE.md or GUARDRAILS.md to permit existing violations
- Change acceptance criteria in the current FP file to match non-compliant code
- Add allow-tags or comments that misrepresent the reason for inline styles

Fix the code to comply; do not relax the rules.

---

## 4. Enforcement (your project)

When you add frontend/backend code, add your own enforcement:

- Lint (ESLint, stylelint, or custom scripts) for style and structure
- Pre-commit hooks (e.g. husky + lint-staged) if desired
- CI jobs for tests and lint

This template does not include product-specific scripts (e.g. check-inline-styles). Use [tools/README.md](../../tools/README.md) for doc-only tooling.

---

## References

- **Style guide:** [docs/style/STYLE_GUIDE.md](../style/STYLE_GUIDE.md)
- **FP contract:** `docs/fps/FP<N>.md` (current Feature Pack; see [FP_EXAMPLE.md](../fps/FP_EXAMPLE.md))
- **Cursor rules:** [.cursor/rules/agents.md](../../.cursor/rules/agents.md)
- **Codex skills:** [.codex/skills/README.md](../../.codex/skills/README.md)
