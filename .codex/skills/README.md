# Codex Skills

Skills for Codex agents. All Codex agents MUST follow the same guardrails as Cursor agents.

## MUST READ (all agents)

- **docs/dev/GUARDRAILS.md** — canonical rules (output contract, style/units when applicable)
- **docs/style/STYLE_GUIDE.md** — style guide + guardrails policy
- **docs/fps/FP<N>.md** — product contract for the current FP (see docs/fps/FP_EXAMPLE.md as reference)

## Process docs (при разработке)

- **docs/dev/COMMITS.md** — Conventional Commits
- **docs/dev/CODE_REVIEW.md** — критерии code review
- **docs/dev/ARCHITECTURE.md** — слои front/back
- **docs/style/REPO_RULES.md** § Security — secrets, deps
- **docs/style/REPO_RULES.md** — repo rules, Twelve-Factor

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
