# Documentation Hub

Canonical entrypoint for Birdmaid documentation. All docs are reachable from here.

## Product Contract

| Document | Purpose |
|----------|---------|
| [FP7](fps/FP7.md) | **Canonical product spec** — shell-only platform, Win95 UI, auth, VFS, content model |

FP7 is the single source of truth for product behavior. If other docs conflict with FP7, FP7 wins.

## Quickstart

- **Local dev:** [README.md](../README.md#local-setup)
- **Docker:** [README.md](../README.md#docker-compose)

## Architecture

| Document | Purpose |
|----------|---------|
| [STRUCTURE.md](../STRUCTURE.md) | Repository structure, navigation |
| [PRODUCT_DESCRIPTION.md](../PRODUCT_DESCRIPTION.md) | Product overview |

## Style System / Win95 Spec

| Document | Purpose |
|----------|---------|
| [GUIDE_STYLE.md](style/GUIDE_STYLE.md) | Style guide, tokens, mixins, guardrails |
| [WIN95_SPEC.md](style/WIN95_SPEC.md) | Win95 UI specification (typography, colors, metrics) |
| [CHICAGO95_UI_CONTRACT.md](style/CHICAGO95_UI_CONTRACT.md) | Chicago95-like UI contract |
| [THEME_CONTRACT.md](style/THEME_CONTRACT.md) | Theme switching |
| [VISUAL_TESTS.md](style/VISUAL_TESTS.md) | Visual regression testing |

## Content Model / VFS Rules

- **VFS rules, RBAC (Guest/Participant/Organizer):** [FP7](fps/FP7.md)
- **Help files (help.txt, admin_help.txt):** authored in [front/src/os/fs/vfs-init.ts](../front/src/os/fs/vfs-init.ts)

## How to Use the Platform (mirrors on-desktop help)

The on-desktop help content is authored in [front/src/os/fs/vfs-init.ts](../front/src/os/fs/vfs-init.ts).

### Guest / Participant (help.txt)

- **Navigation:** Double-click Desktop icons to open files and applications. Use Explorer to browse the file system.
- **Opening files:** Double-click any file to open it in the appropriate viewer (ImageViewer, VideoViewer, Notepad, Internet Explorer).
- **Explorer:** Tree view (left) for folder structure; Grid view (right) for contents. Single-click to select, double-click to open.
- **Login:** Click the User Icon in the Taskbar (bottom right). Use the User Panel to view account information.

### Organizer (admin_help.txt)

- **Content management:** Upload files via Explorer; move and delete files; create folders within system folders.
- **Folder rules:** Create folders anywhere inside Disk A, B, C. Root-level system folders are immutable.
- **System folders:** /Disk C/desktop, /Disk C/images, /Disk C/videos, /Disk C/documents.

## Auth

- **Auth flow (Telegram, DEV MODE, `/api/auth/me`):** [FP7](fps/FP7.md)
- **Auth endpoints:** FP7 Decisions section

## Tests

| Document | Purpose |
|----------|---------|
| [FP7_TEST_CONTRACT.md](tests/FP7_TEST_CONTRACT.md) | FP7 test contract, data-testid, scenarios |
| [VISUAL_TESTS.md](style/VISUAL_TESTS.md) | Visual regression (smoke + Playwright) |

**Run tests:** `cd front && npm test` / `cd back && npm test`

## Agents Workflow

| Document | Purpose |
|----------|---------|
| [AGENTS.md](../AGENTS.md) | Main workflow rules (6 agents, 4 stages) |
| [WORKFLOW.md](agents/WORKFLOW.md) | How to run agents, output contract, guardrails, conflict resolution |

## History (FP1–FP6)

Released Feature Packs (reference only; FP7 is canonical for current product):

| FP | File | Status |
|----|------|--------|
| FP1 | [FP1.md](fps/FP1.md) | released |
| FP2 | [FP2.md](fps/FP2.md) | released |
| FP3 | [FP3.md](fps/FP3.md) | released |
| FP4 | [FP4.md](fps/FP4.md) | released |
| FP5 | [FP5.md](fps/FP5.md) | released |
| FP6 | [FP6.md](fps/FP6.md) | released |

## Other Docs

| Folder/Doc | Purpose |
|------------|---------|
| [fps/](fps/README.md) | Feature Pack catalog, TEMPLATE |
| [dev/](dev/GUARDRAILS.md) | Guardrails, agent contract |
| [design/](design/) | Design references, WIN95 tokens |
| [compliance/](compliance/) | Asset policy, provenance |
| [audit/](audit/) | FP7 compliance, legacy surface map |

## Legacy / Deprecated

- **docs/core/:** Referenced in older docs (REQUIREMENTS, API, MODEL, UX_MAP). For FP7, product contract is consolidated in [FP7](fps/FP7.md). Core docs may be reintroduced later.
- **CUTLIST.md, REWRITE_CHECKLIST.md:** FP7 cutline/rewrite plans — still relevant for implementation tracking.

## Link Validation

Run the doc link checker to verify internal relative links resolve:

```bash
node scripts/check-doc-links.cjs
```

To check only the docs folder:

```bash
node scripts/check-doc-links.cjs docs/
```

External links are not validated (no CI failure if external URLs are down). The script only verifies that internal relative links point to existing files.
