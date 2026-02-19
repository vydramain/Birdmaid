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

| Section                | Content                                                |
| ---------------------- | ------------------------------------------------------ |
| **Evidence**           | List of files/paths changed                            |
| **Minimal patch plan** | What was added/changed/removed                         |
| **Tests**              | Commands to run (e.g. `npm run lint`, `npm run test`)  |
| **DoD checklist**      | [ ] Lint passes, [ ] Tests pass, [ ] No new violations |

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

## 5. Enforcement (Birdmaid)

### Pre-commit (lint-staged)

Runs on staged files only. Blocks commit if:

- **TS/TSX:** `scripts/check-inline-styles.cjs` (allow-tag v2, no px in inline styles), ESLint, Prettier
- **CSS/SCSS:** Stylelint (no `!important`, no `px`), Prettier
- **Assets (front/public/):** `scripts/check-asset-provenance.cjs` (placeholder)

See [GUIDE_STYLE.md](../../GUIDE_STYLE.md) for inline-style policy, unit policy, canary checks.

### Gate (manual / CI)

| Command             | Purpose                             |
| ------------------- | ----------------------------------- |
| `pnpm lint`         | ESLint + Stylelint (max-warnings=0) |
| `pnpm format:check` | Prettier check                      |
| `pnpm test:api`     | API integration tests (16/16)       |
| `./infra/smoke.sh`  | Platform health (PLATFORM OK)       |
| `.husky/commit-msg` | commitlint (Conventional Commits)   |

CI: `.github/workflows/ci.yml` — lint, format:check, test, audit.

### PNPM build scripts (container/CI)

For reproducible `pnpm test:api` in container:

```bash
corepack enable pnpm && pnpm install && pnpm test:api
```

Node 22+, pnpm via corepack. If optional deps (e.g. rollup) fail, see [REPO_HYGIENE_PLAN.md](REPO_HYGIENE_PLAN.md) W2.4.

### Troubleshooting pnpm EACCES

If `pnpm install` fails on host with EACCES (permission denied on node_modules or store):

1. **Repo-local store:** `.npmrc` has `store-dir=.pnpm-store`. After adding this, remove old store and reinstall:

   ```bash
   rm -rf node_modules .pnpm-store
   pnpm install
   ```

   Ensure `.pnpm-store/` is in .gitignore (already done).

2. **Ownership:** If node_modules was created by Docker/root:

   ```bash
   sudo chown -R $(whoami) node_modules .pnpm-store
   ```

   Or: `rm -rf node_modules .pnpm-store && pnpm install`.

3. **Container fallback (canonical):** Pre-commit on host will fail until EACCES is fixed. Use container for verification before commit:
   ```bash
   docker run --rm --add-host api.shell.local:host-gateway --add-host s3.shell.local:host-gateway \
     -v $(pwd):/app -w /app node:22 sh -c "git config --global --add safe.directory /app && corepack enable pnpm && pnpm install && pnpm lint && pnpm format:check && pnpm test:api && bash .husky/pre-commit"
   ```

### Pre-commit policy

Pre-commit requires deps installed on host (`pnpm lint:staged`). If host `pnpm install` fails (EACCES), run the container check above before commit. No full `test:api` on pre-commit (too slow).

### Format policy

W2.1 did a **one-time** Prettier sweep. Going forward: format only via `pnpm format` on files changed in PR, or use lint-staged (Prettier runs on staged files). Avoid mass format sweeps.

### Enforced now vs TODO

| Check                            | Status                                                                                                |
| -------------------------------- | ----------------------------------------------------------------------------------------------------- |
| ESLint + Stylelint               | Enforced (pre-commit, lint)                                                                           |
| Prettier                         | Enforced (format:check)                                                                               |
| check-inline-styles.cjs          | Enforced (lint-staged)                                                                                |
| check-asset-provenance.cjs       | **TODO / warning-only** — placeholder, always exit 0; add real checks when ASSET_PROVENANCE.md exists |
| check-primitives-enforcement.cjs | Not in lint-staged; run manually if needed                                                            |
| eslint-plugin-style-guardrails   | **TODO** — not enforced; add when plugin available                                                    |
| front/index.css stylelint        | Temporary exception (.stylelintignore until FP7)                                                      |

---

## References

- **Style guide:** [docs/style/STYLE_GUIDE.md](../style/STYLE_GUIDE.md)
- **FP contract:** `docs/fps/FP<N>.md` (current Feature Pack; see [FP_EXAMPLE.md](../fps/FP_EXAMPLE.md))
- **Cursor rules:** [.cursor/rules/agents.md](../../.cursor/rules/agents.md)
- **Codex skills:** [.codex/skills/README.md](../../.codex/skills/README.md)
- **Process:** [CODE_REVIEW.md](CODE_REVIEW.md), [TWELVE_FACTOR.md](TWELVE_FACTOR.md), [COMMITS.md](COMMITS.md)
- **Architecture:** [ARCHITECTURE.md](ARCHITECTURE.md)
- **Security:** [SECURITY.md](SECURITY.md)
