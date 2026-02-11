# Tools

Scripts for documentation and guardrails enforcement in the agent template.

## check-doc-links.cjs

Verifies that internal relative links in Markdown files resolve.

**Usage (from repo root):**

```bash
node tools/check-doc-links.cjs
# or limit to docs:
node tools/check-doc-links.cjs docs/
```

- **Exit 0:** All checked internal links resolve.
- **Exit 1:** One or more broken links (output lists file, link, and resolved path).

Does not check external URLs (http/https). Add more tools here as needed (e.g. link checkers, doc lint).
