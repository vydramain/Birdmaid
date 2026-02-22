# Documentation Index

**Start here** for dev setup, specs, and guardrails.

---

## Start here

| Document                                    | Purpose                                   |
| ------------------------------------------- | ----------------------------------------- |
| [docs/dev/DEV_DOMAIN.md](dev/DEV_DOMAIN.md) | Domains, hosts, ports, smoke, entrypoints |
| [infra/README.md](../infra/README.md)       | What runs in docker-compose, fixtures     |
| [infra/smoke.sh](../infra/smoke.sh)         | One-command platform check (PLATFORM OK)  |

---

## Feature Packs

| Document                               | Purpose                                  |
| -------------------------------------- | ---------------------------------------- |
| [fps/FP1.md](fps/FP1.md)               | FP1 Shell MVP, Evidence                  |
| [fps/FP2.md](fps/FP2.md)               | FP2 Gateway + FS contract, Evidence      |
| [fps/FP3.md](fps/FP3.md)               | FP3 Explorer + Shell (patchset M5–M9)    |
| [fps/FP3_2.md](fps/FP3_2.md)           | FP3.2 Explorer UX & Shell Maximize Fixes |
| [fps/README.md](fps/README.md)         | FP catalog, how to create FPs            |
| [fps/TEMPLATE.md](fps/TEMPLATE.md)     | Blank FP structure                       |
| [fps/FP_EXAMPLE.md](fps/FP_EXAMPLE.md) | Example FP reference                     |

---

## Core contracts

| Document                                         | Purpose                  |
| ------------------------------------------------ | ------------------------ |
| [core/PROTOCOL_v0.md](core/PROTOCOL_v0.md)       | Message types, handshake |
| [core/API.yaml](core/API.yaml)                   | OpenAPI contract         |
| [core/FS_CONTRACT_v0.md](core/FS_CONTRACT_v0.md) | FS API contract          |
| [core/THEMING_v0.md](core/THEMING_v0.md)         | Token schema, themes     |
| [core/UI_ADAPTER_v0.md](core/UI_ADAPTER_v0.md)   | Slot API, props          |
| [core/REQUIREMENTS.md](core/REQUIREMENTS.md)     | FR/NFR                   |
| [core/UX_MAP.md](core/UX_MAP.md)                 | CTA → Endpoint → State   |
| [core/TESTS.md](core/TESTS.md)                   | Test strategy            |
| [core/QNA_DECISIONS.md](core/QNA_DECISIONS.md)   | ADRs                     |

---

## Guardrails & style

| Document                                     | Purpose                                                                       |
| -------------------------------------------- | ----------------------------------------------------------------------------- |
| [dev/GUARDRAILS.md](dev/GUARDRAILS.md)       | Canonical rules, enforcement, **Gate Semantics** (§ PASS only when all green) |
| [dev/CODE_REVIEW.md](dev/CODE_REVIEW.md)     | Code review checklist (Google Eng Practices)                                  |
| [dev/COMMITS.md](dev/COMMITS.md)             | Conventional Commits, commitlint                                              |
| [dev/TWELVE_FACTOR.md](dev/TWELVE_FACTOR.md) | Config, build/release, dev-prod parity                                        |
| [dev/ARCHITECTURE.md](dev/ARCHITECTURE.md)   | Front/back layers, Clean Architecture                                         |
| [dev/SECURITY.md](dev/SECURITY.md)           | Secrets, deps, Node.js security                                               |
| [GUIDE_STYLE.md](../GUIDE_STYLE.md)          | Win95 style, inline-style policy, unit policy                                 |
| [style/STYLE_GUIDE.md](style/STYLE_GUIDE.md) | Style guide (template)                                                        |

---

## Audit & evidence

| Document                                               | Purpose                                                          |
| ------------------------------------------------------ | ---------------------------------------------------------------- |
| [audit/FP2_AUDIT_REPORT.md](audit/FP2_AUDIT_REPORT.md) | FP2 evidence, gate PASS                                          |
| [audit/FP3_AUDIT_REPORT.md](audit/FP3_AUDIT_REPORT.md) | FP3 evidence (M6 + M10), gate PASS; canonical: infra/test-api.sh |
| [archive/FP1/evidence/](../archive/FP1/evidence/)      | FP1 demo notes                                                   |
| [evidence/README.md](../evidence/README.md)            | Tombstone (canonical evidence in archive/)                       |

---

## Agents workflow

| Document                                 | Purpose                             |
| ---------------------------------------- | ----------------------------------- |
| [agents/WORKFLOW.md](agents/WORKFLOW.md) | How to run agents, output contract  |
| [ai/roles/](../ai/roles/)                | plan, design, build, release, audit |

---

## Docs Registry

| Doc                       | Purpose                                               |
| ------------------------- | ----------------------------------------------------- |
| fps/FP3.md                | FP3 spec + patchset (M5–M9); canonical                |
| core/API.yaml             | OpenAPI contract; API_FP3_DELTA temporary until merge |
| core/UX_MAP.md            | CTA → Endpoint → State                                |
| dev/DESIGN_LOG.md         | FP3 decisions, build contracts                        |
| tests/FP3_TESTS.md        | AC→tests mapping                                      |
| fps/FP3_2.md              | FP3.2 Explorer UX & Shell Maximize Fixes              |
| tests/FP3_2_TESTS.md      | FP3.2 AC→tests mapping                                |
| core/FS_BEHAVIOR_FP3_2.md | FP3.2 Rename/Delete/Zip open rules                    |
| dev/FP3_2_SECURITY_DOD.md | FP3.2 Security delta (no user app access expansion)   |
| dev/FP3_SECURITY_DOD.md   | Sandbox, token, CORS                                  |
| audit/FP3_AUDIT_REPORT.md | FP3 evidence (M6 + M10)                               |

---

## Link validation

```bash
node tools/check-doc-links.cjs docs/
```
