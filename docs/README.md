# Documentation Index

**Start here** for dev setup, specs, and guardrails.

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
| [fps/FP1.md](fps/FP1.md)               | FP1 Shell MVP, Evidence                          |
| [fps/FP2.md](fps/FP2.md)               | FP2 Gateway + FS contract, Evidence              |
| [fps/FP3.md](fps/FP3.md)               | FP3 Explorer + Shell (patchset M5–M9)            |
| [fps/FP3.md](fps/FP3.md) § FP3.2       | Explorer UX & Shell Maximize Fixes               |
| [fps/FP4.md](fps/FP4.md)               | FP4 System Viewers & Players (Image/Audio/Video) |
| [fps/README.md](fps/README.md)         | FP catalog, how to create FPs                    |
| [fps/FP_EXAMPLE.md](fps/FP_EXAMPLE.md) | FP template (copy to FP<N>.md)                   |
| [fps/FP_EXAMPLE.md](fps/FP_EXAMPLE.md) | Example FP reference                             |

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

| Document                                               | Purpose                                                   |
| ------------------------------------------------------ | --------------------------------------------------------- |
| [archive/FP4/](../archive/FP4/README.md)               | FP4 System Viewers & Players (evidence, audit)            |
| [audit/FP4_AUDIT_REPORT.md](audit/FP4_AUDIT_REPORT.md) | FP4 evidence (M1–M4), gate PASS                           |
| [evidence/README.md](../evidence/README.md)            | Tombstone (canonical evidence in archive/)                |

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
| fps/FP3.md                | FP3 spec + patchset (M5–M9); canonical      |
| fps/FP4.md                | FP4 System Viewers & Players; archive/FP4/  |
| core/API.yaml             | OpenAPI contract (FP2+FP3+FP4)              |
| core/PROTOCOL_v0.md       | postMessage protocol (FP1+FP3+FP4)          |
| core/UX_MAP.md            | CTA → Endpoint → State                      |
| fps/FP3.md § Patchset     | FP3 design decisions (merged)               |
| tests/FP3_TESTS.md        | AC→tests mapping                            |
| fps/FP3.md § FP3.2        | Explorer UX & Shell Maximize Fixes (merged) |
| fps/FP3.md § FS Behavior  | Rename/Delete/Zip rules (merged)            |
| fps/FP3.md § Security DoD | Sandbox, token, CORS (merged)               |
| audit/FP4_AUDIT_REPORT.md | FP4 evidence (M1–M4)                        |

---

## Link validation

```bash
node tools/check-doc-links.cjs docs/
```
