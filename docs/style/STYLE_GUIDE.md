# Style Guide (Template)

**Purpose:** Canonical style and guardrails for UI implementation. All agents (Cursor and Codex) must follow this document when making style-related changes. Replace sections with your project's design system.

## Structure (example)

Organize styles by:

- **Tokens:** colors, spacing, typography, z-index (variables or CSS custom properties).
- **Mixins / utilities:** reusable patterns (e.g. buttons, inputs, panels).
- **Components:** component-specific classes.

Keep a single entry file (e.g. `index.scss` or main theme file) that imports tokens, mixins, and components.

## Global rules (template)

- Use **relative units** (`rem`, `em`, `%`, `vh`, `vw`) in CSS/SCSS. Avoid absolute units (`px`, `pt`) except where explicitly allowed (e.g. transform/translate for drag).
- Do **not** use `!important`; use selector specificity or structure instead.
- Prefer **CSS classes and tokens** for visual properties; avoid inline styles for colors, spacing, borders, typography unless justified by guardrails (e.g. dynamic layout with allow-tag).
- **Z-index:** use named tokens or layers (e.g. `$z-base`, `$z-modal`) instead of magic numbers.

## Inline styles (if applicable)

If your project allows limited inline styles (e.g. for drag/resize or layout-calc), enforce via:

- A single canonical rule in `docs/dev/GUARDRAILS.md`.
- Required allow-tag format: `reason`, `why`, `revisit`.
- No constant-only inline styles (values must depend on runtime/state where allowed).

## References

- **Guardrails:** [docs/dev/GUARDRAILS.md](../dev/GUARDRAILS.md)
- **FP contract:** `docs/fps/FP*.md` (when working on a specific FP)
