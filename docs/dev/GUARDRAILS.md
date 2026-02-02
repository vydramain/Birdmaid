# Canonical Guardrails — Single Source of Truth

**Version:** 1.0  
**Created:** 2026-02-02  
**Purpose:** One canonical ruleset for all agents (Cursor + Codex). Enforceable via pre-commit + CI.  
**Status:** Active  
**References:** [GUIDE_STYLE.md](../style/GUIDE_STYLE.md), [FP7.md](../fps/FP7.md)

> **All agents (Cursor and Codex) MUST follow this document.** Violations are caught by scripts and CI.

---

## 1. Global MUST / MUST NOT Rules

### MUST
- Follow `docs/dev/GUARDRAILS.md` + `docs/style/GUIDE_STYLE.md` + `docs/fps/FP7.md` when making changes
- Include in every engineering response: **Evidence** (files/paths changed), **Minimal patch plan**, **Tests** (what to run), **DoD checklist**
- Use SCSS classes, mixins, tokens for visual properties (colors, borders, fonts, spacing)
- Use relative units (`rem`, `em`, `%`, `vh`, `vw`, `vmin`, `vmax`, `ch`, `ex`) in CSS/SCSS
- Prefer CSS custom properties for runtime values; apply via classes, not inline batches

### MUST NOT
- Use `!important` in any CSS/SCSS
- Use absolute units (`px`, `pt`, `pc`, `in`, `cm`, `mm`, `q`, `Q`) except explicitly allowed (see Units Policy)
- Use inline styles for visual properties without allow-tag v2
- Use inline styles where all values are literals (even with allow-tag)
- Use `reason=layout-calc` without evidence of measurement APIs in the file
- Patch docs (GUIDE_STYLE, GUARDRAILS, FP7) to justify code violations

---

## 2. Inline Styles Policy v2

### Forbidden (always)
- Inline styles with literal values only (no runtime state, refs, or measurement)
- Inline styles for visual properties: `color`, `backgroundColor`, `borderColor`, `border`, `fontSize`, `fontFamily`, `fontWeight`, `padding`, `margin`, `boxShadow`, `cursor` (except dynamic drag)
- Fixed fullscreen backdrop/overlay (`position: fixed` + `inset: 0` or `top/left/right/bottom: 0`) — use CSS class + z-index token
- Positioning menus/windows with constants (`bottom: 40px`, `left: 4px`, `minWidth: 150px`) — use CSS class + tokens
- `zIndex` magic numbers (4+ digits) — use z-index tokens/classes

### Allow-tag v2 (required format)

```typescript
// inline-style: allowed (reason: drag/resize|layout-calc|performance; why: <runtime source>; revisit: Mx)
```

**Required fields:**
- `reason` — one of: `drag/resize`, `layout-calc`, `performance`
- `why` — brief justification: where the dynamic value comes from (e.g. `mouse position during drag`, `taskbar height measured via ResizeObserver`)
- `revisit` — milestone for review (e.g. `M6`, `FP7`)

**Valid reasons:**
- `drag/resize` — drag and resize operations (transform, left, top, width, height)
- `layout-calc` — computed sizes/positions **only** with evidence of measurement APIs
- `performance` — GPU acceleration (transform, opacity)

### layout-calc evidence requirement

`reason=layout-calc` is valid **only** if the file contains evidence of measurement:
- `getBoundingClientRect`
- `ResizeObserver`
- `window.innerWidth` / `window.innerHeight`
- `visualViewport`
- `clientWidth` / `clientHeight` / `offsetWidth` / `offsetHeight` (from refs)

If no such evidence exists, `layout-calc` is invalid and the inline style is rejected.

### Literal values rule

Inline style with allow-tag is **still forbidden** if all values in `style` are literals (string/number constants) and do not depend on runtime (state, refs, ResizeObserver, getBoundingClientRect, etc.).

### Prefer CSS vars over inline batches

If a runtime value is needed, prefer:
```typescript
// inline-style: allowed (reason: layout-calc; why: taskbar height measured; revisit: FP7)
<div className="start-menu" style={{ ["--taskbar-h" as any]: `${taskbarH}px` }} />
```
```scss
.start-menu { bottom: var(--taskbar-h); }
```

---

## 3. Units Policy

### Forbidden
- `!important` — use proper selector specificity
- Absolute units: `px`, `pt`, `pc`, `in`, `cm`, `mm`, `q`, `Q` in CSS/SCSS

### Allowed exceptions
- `px` in `transform`/`translate`/`translate3d` for drag/resize (runtime coordinates)
- Unitless `0` (e.g. `margin: 0`)

### Preferred
- `rem` for typography, spacing, borders, sizes
- `vh`/`vw` for viewport-dependent layouts
- `%` for relative sizing within containers

---

## 4. Output Contract for Engineering Changes

Every agent response that proposes or makes code changes MUST include:

| Section | Content |
|---------|---------|
| **Evidence** | List of files/paths changed |
| **Minimal patch plan** | What was added/changed/removed |
| **Tests** | Commands to run (e.g. `npm run lint`, `npm run test`) |
| **DoD checklist** | [ ] Lint passes, [ ] Tests pass, [ ] No new violations |

---

## 5. Do Not Patch Docs to Justify Violations

Agents MUST NOT:
- Add exceptions to GUIDE_STYLE.md or GUARDRAILS.md to permit existing violations
- Change acceptance criteria in FP7.md to match non-compliant code
- Add allow-tags or comments that misrepresent the reason for inline styles

Fix the code to comply; do not relax the rules.

---

## 6. Enforcement

| Check | Tool | When |
|-------|------|------|
| Inline styles allow-tag v2 | `front/scripts/check-inline-styles.cjs` | pre-commit (lint-staged) |
| Literal-only inline styles | `check-inline-styles.cjs` | pre-commit |
| layout-calc evidence | `check-inline-styles.cjs` | pre-commit |
| `!important` | stylelint | pre-commit |
| Absolute units (CSS/SCSS) | stylelint | pre-commit |
| Absolute units (inline) | `check-inline-styles.cjs` | pre-commit |

**Verification commands:**
```bash
cd front
npm run lint          # Full lint (eslint + stylelint + check-inline-styles)
npm run lint:canary   # Canary tests (should-fail + should-pass)
```

---

## References

- **Style guide:** [docs/style/GUIDE_STYLE.md](../style/GUIDE_STYLE.md)
- **FP contract:** [docs/fps/FP7.md](../fps/FP7.md)
- **Cursor rules:** [.cursor/rules/agents.md](../../.cursor/rules/agents.md)
- **Codex skills:** [.codex/skills/README.md](../../.codex/skills/README.md)
