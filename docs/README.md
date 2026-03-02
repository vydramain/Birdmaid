# Documentation Index

**Start here** for dev setup, specs, and guardrails.

**Demo/review:** [README.md](../README.md) — Quickstart, Demo flow, Known limitations. Run stack → open shell.local → follow demo steps.

**Navigation:** [Current functionality](#current-functionality) → [Feature Packs](#feature-packs) → [Core contracts](#core-contracts) → [Audit & evidence](#audit--evidence) → [Archive](#archive)

---

## Current functionality

What the product does today (no development history). Each block links to the FP spec.

| Block | What it does | Spec |
|-------|--------------|------|
| **Shell / Desktop** | Windows 98–like desktop, taskbar, window chrome (titlebar, min/max/close) | [FP1](fps/FP1.md) |
| **Window manager** | Drag, resize, z-order, focus; min/max states | [FP1](fps/FP1.md) |
| **Explorer** | File browser: My Computer, roots (A:/C:/D:), folder navigation, breadcrumbs, context menus | [FP3](fps/FP3.md) |
| **S3-backed file browsing** | Gateway FS API: roots, list, stat, open-url; CRUD in writable zone (create folder, upload, delete, rename) | [FP2](fps/FP2.md), [FP3](fps/FP3.md) |
| **Image Viewer** | System app for PNG/JPG/WebP; Prev/Next playlist; signed URL delivery | [FP4](fps/FP4.md) |
| **Media Player** | System app for MP3/MP4/WebM; audio/video mode; Prev/Next | [FP4](fps/FP4.md) |
| **User app packages** | Dir with index.html = app; double click → launch in sandbox; read-only package root; no token, no privileged bridge | [FP5](fps/FP5.md) |

**Implemented now:** All above. FP1–FP5 released (FP5: discovery, launch, sandbox, path confinement).

**Known limitations:** [FP5](fps/FP5.md) § Known Limitations — Godot HTTPS, sandbox warning, "Components deprecated".

**Future work:** See [fps/](fps/) for FP specs; no product promises.

---

## Start here

| Document                                                                                       | Purpose                                  |
| ---------------------------------------------------------------------------------------------- | ---------------------------------------- |
| [infra/README.md](../infra/README.md), [dev/ARCHITECTURE.md](dev/ARCHITECTURE.md) § Dev Domain | Domains, hosts, ports, smoke             |
| [infra/README.md](../infra/README.md)                                                          | What runs in docker-compose, fixtures    |
| [infra/smoke.sh](../infra/smoke.sh)                                                            | One-command platform check (PLATFORM OK) |

---

## Feature Packs

| Document                               | Purpose                                          |
| -------------------------------------- | ------------------------------------------------ |
| [fps/README.md](fps/README.md)         | FP catalog, how to create FPs                    |
| [fps/FP1.md](fps/FP1.md)               | FP1 Shell MVP                                   |
| [fps/FP2.md](fps/FP2.md)               | FP2 Gateway + FS contract                        |
| [fps/FP3.md](fps/FP3.md)               | FP3 Explorer + Shell (patchset M5–M9, § FP3.2)  |
| [fps/FP4.md](fps/FP4.md)               | FP4 System Viewers & Players (Image/Audio/Video) |
| [fps/FP5.md](fps/FP5.md)               | FP5 User App Packages (released)                |
| [fps/FP_EXAMPLE.md](fps/FP_EXAMPLE.md) | FP template (copy to FP<N>.md)                   |

---

## Core contracts

| Document                                                                   | Purpose                                                          |
| -------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| [fps/FP1.md](fps/FP1.md) § Protocol                                        | Message types, handshake                                         |
| [core/API.yaml](core/API.yaml)                                             | OpenAPI contract                                                 |
| [core/API.yaml](core/API.yaml), [dev/ARCHITECTURE.md](dev/ARCHITECTURE.md) | FS API contract, path scheme                                     |
| [core/PROTOCOL_v0.md](core/PROTOCOL_v0.md)                                 | Shell↔App postMessage (FP1+FP3+FP4)                              |
| [core/THEMING.md](core/THEMING.md)                                         | Token schema, themes                                             |
| [fps/FP1.md](fps/FP1.md) § Customization                                   | Slot API, props                                                  |
| [core/REQUIREMENTS.md](core/REQUIREMENTS.md)                               | FR/NFR                                                           |
| [core/UX_MAP.md](core/UX_MAP.md)                                           | CTA → Endpoint → State                                           |
| [tests/](tests/)                                                           | Test plans (FP2_TESTS, FP3_TESTS); FP4 → fps/FP4.md § Tests Plan |
| [core/QNA_DECISIONS.md](core/QNA_DECISIONS.md)                             | ADR index (FP-specific)                                          |

---

## Guardrails & style

| Document                                              | Purpose                                                                       |
| ----------------------------------------------------- | ----------------------------------------------------------------------------- |
| [dev/GUARDRAILS.md](dev/GUARDRAILS.md)                | Canonical rules, enforcement, **Gate Semantics** (§ PASS only when all green) |
| [dev/CODE_REVIEW.md](dev/CODE_REVIEW.md)              | Code review checklist (Google Eng Practices)                                  |
| [dev/COMMITS.md](dev/COMMITS.md)                      | Conventional Commits, commitlint                                              |
| [style/REPO_RULES.md](style/REPO_RULES.md)            | Repo rules, gate, Twelve-Factor, security                                     |
| [dev/ARCHITECTURE.md](dev/ARCHITECTURE.md)            | Front/back layers, Clean Architecture                                         |
| [style/REPO_RULES.md](style/REPO_RULES.md) § Security | Secrets, deps, CORS                                                           |
| [style/GUIDE_STYLE.md](style/GUIDE_STYLE.md)          | Win95 style, inline-style policy, unit policy                                 |
| [style/STYLE_GUIDE.md](style/STYLE_GUIDE.md)          | Style guide (template)                                                        |

---

## Audit & evidence

| Document                                                       | Purpose                                        |
| -------------------------------------------------------------- | ---------------------------------------------- |
| [audit/FP4_AUDIT_REPORT.md](audit/FP4_AUDIT_REPORT.md)         | FP4 evidence (M1–M4), gate PASS                |
| [audit/FP5_AUDIT_REPORT.md](audit/FP5_AUDIT_REPORT.md)         | FP5 evidence (M4 full pass)                    |
| [audit/RELEASE_PREP_AUDIT.md](audit/RELEASE_PREP_AUDIT.md)     | Release prep R0 audit, R1 cleanup               |
| [audit/REPO_M4_TEST_POLLUTION_AUDIT.md](audit/REPO_M4_TEST_POLLUTION_AUDIT.md) | REPO test pollution re-audit (PASS)   |

---

## Archive

| Document                                               | Purpose                                        |
| ------------------------------------------------------ | ---------------------------------------------- |
| [archive/FP4/](../archive/FP4/README.md)               | FP4 System Viewers & Players (evidence, audit) |
| [archive/REPO/](../archive/REPO/README.md)             | REPO audit artifacts (lint, test pollution)    |
| [evidence/README.md](../evidence/README.md)           | Tombstone (canonical evidence in archive/)     |

---

## Agents workflow

| Document                                 | Purpose                             |
| ---------------------------------------- | ----------------------------------- |
| [agents/WORKFLOW.md](agents/WORKFLOW.md) | How to run agents, output contract  |
| [ai/roles/](../ai/roles/)                | plan, design, build, release, audit |

---

## Docs Registry

| Doc                       | Purpose                                     |
| ------------------------- | ------------------------------------------- |
| fps/FP1.md … FP5.md       | Feature Pack specs (see [Feature Packs](#feature-packs)) |
| core/API.yaml             | OpenAPI contract (FP2+FP3+FP4+FP5)          |
| core/PROTOCOL_v0.md       | postMessage protocol (FP1+FP3+FP4+FP5)      |
| core/UX_MAP.md            | CTA → Endpoint → State                      |
| tests/FP2_TESTS.md, FP3_TESTS.md | AC→tests mapping                    |
| audit/*                   | FP4, FP5, REPO audit reports                |
| archive/FP4/, archive/REPO/ | Archived evidence, superseded artifacts  |

---

## Link validation

```bash
node tools/check-doc-links.cjs docs/
```
