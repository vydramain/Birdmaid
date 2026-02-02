# Agent Contract Summary

**Version:** 1.0  
**Created:** 2026-02-02  
**Purpose:** What each agent must output, must never do, and how violations are caught.

---

## What Each Agent MUST Output

| Agent | Output Contract |
|-------|-----------------|
| **All (engineering changes)** | Evidence (files/paths), Minimal patch plan, Tests (commands), DoD checklist |
| **Product Lead** | Problem statement, Prioritized backlog, ASSUMPTIONS, IN/OUT scope |
| **Designer** | Journey map, Requirements, UI states, Edge cases |
| **Analyst** | Metrics, Events, Funnel analysis |
| **Engineer** | Feasibility, Architecture, NFR checklist, Implementation plan, Code (if implementing) |
| **Delivery** | Plan, Risks, Dependencies, Mitigations |
| **Compliance** | Security assessment, Privacy checklist |

---

## What Each Agent MUST NOT Do

| Rule | Applies To | Enforcement |
|------|------------|-------------|
| No `!important` | Engineer, any code changes | stylelint |
| No `px` in CSS/SCSS (use `rem`) | Engineer | stylelint |
| No constant inline styles (all literals) | Engineer | check-inline-styles.cjs |
| No lazy allow-tags (must have reason, why, revisit) | Engineer | check-inline-styles.cjs |
| No `reason=layout-calc` without measurement API evidence | Engineer | check-inline-styles.cjs |
| No patching docs to justify violations | All | Manual review |
| No absolute units in inline styles (except transform/translate) | Engineer | check-inline-styles.cjs |
| No fixed fullscreen backdrop via inline | Engineer | check-inline-styles.cjs |
| No zIndex magic numbers (4+ digits) | Engineer | check-inline-styles.cjs |

---

## How Violations Are Caught

| Violation | Tool | When |
|-----------|------|------|
| `!important` | stylelint | pre-commit, CI |
| Absolute units (CSS/SCSS) | stylelint | pre-commit, CI |
| Inline style without allow-tag v2 | check-inline-styles.cjs | pre-commit, CI |
| Inline style all literals (even with allow-tag) | check-inline-styles.cjs | pre-commit, CI |
| layout-calc without measurement evidence | check-inline-styles.cjs | pre-commit, CI |
| Absolute units in inline | check-inline-styles.cjs | pre-commit, CI |
| Fixed backdrop, zIndex magic | check-inline-styles.cjs | pre-commit, CI |

**Verification:**
```bash
cd front
npm run lint          # Full lint
npm run lint:canary   # Canary tests (should-fail + should-pass)
```

---

## References

- [docs/dev/GUARDRAILS.md](./GUARDRAILS.md)
- [docs/style/GUIDE_STYLE.md](../style/GUIDE_STYLE.md)
- [.cursor/rules/agents.md](../../.cursor/rules/agents.md)
