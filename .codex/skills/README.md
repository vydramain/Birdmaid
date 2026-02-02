# Codex Skills

Skills for Codex agents. All Codex agents MUST follow the same guardrails as Cursor agents.

## MUST READ (all agents)

- **docs/dev/GUARDRAILS.md** — canonical rules (inline styles, units, output contract)
- **docs/style/GUIDE_STYLE.md** — style guide + guardrails policy
- **docs/fps/FP7.md** — product contract (when working on FP7)

## Output Contract (matches Cursor)

Every Codex agent response that proposes or makes code changes MUST include:
- **Evidence:** files/paths changed
- **Minimal patch plan:** what was added/changed/removed
- **Tests:** commands to run (`npm run lint`, `npm run test`)
- **DoD checklist:** [ ] Lint passes, [ ] Tests pass, [ ] No new violations

## MUST NOT (aligned with guardrails)

- No `!important`
- No absolute units (`px`, etc.) in CSS/SCSS except allowed exceptions
- No constant inline styles (all literals)
- No `reason=layout-calc` without measurement API evidence in file
- No patching docs to justify violations

## Structure

- **agents/** — agent-specific skills (Product Lead, Designer, Analyst, Engineer, Delivery, Compliance)
- **agentic-code/** — vendor/generic skills (coding-rules, testing, etc.)
- **birdmaid-*** — project-specific skills (ux-modern-baseline, fp-bootstrap, ux-map-sync)
