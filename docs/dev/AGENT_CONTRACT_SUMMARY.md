# Agent Contract Summary

**Version:** 1.1 (template)  
**Purpose:** What each agent must output, must never do, and how violations can be caught once you add product code.

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

| Rule | Applies To | When you have code |
|------|------------|--------------------|
| No `!important` | Engineer, any code changes | Enforce via stylelint or equivalent |
| No absolute units in CSS/SCSS (use `rem`) where defined | Engineer | Enforce via stylelint |
| No constant inline styles (all literals) | Engineer | Enforce via custom script or lint rule |
| No lazy allow-tags (must have reason, why, revisit) | Engineer | Enforce via custom script if you use allow-tag |
| No patching docs to justify violations | All | Manual review |

---

## How to Catch Violations (after you add product code)

- Add lint (ESLint, stylelint) and run in CI.
- Add pre-commit hooks if desired (e.g. husky + lint-staged).
- Document verification commands in your FP or README (e.g. `npm run lint`, `npm run test`).

This template does not ship product-specific enforcement scripts. See [GUARDRAILS.md](./GUARDRAILS.md) and [tools/README.md](../../tools/README.md).

---

## References

- [docs/dev/GUARDRAILS.md](./GUARDRAILS.md)
- [docs/style/STYLE_GUIDE.md](../style/STYLE_GUIDE.md)
- [.cursor/rules/agents.md](../../.cursor/rules/agents.md)
