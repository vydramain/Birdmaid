# FP4 Archive — System Viewers & Players

**Archived:** 2025-02-23  
**Canonical:** [docs/fps/FP4.md](../docs/fps/FP4.md)

---

## Index

| Path                         | Content                                                               |
| ---------------------------- | --------------------------------------------------------------------- |
| [evidence/](evidence/)       | Evidence snapshot, key paths                                          |
| [reports/](reports/)         | [FP4_AUDIT_REPORT.md](reports/FP4_AUDIT_REPORT.md) — Security + Audit |
| [temp_docs/](temp_docs/)     | TEMP docs (merged into FP4.md, then archived)                         |
| [transcripts/](transcripts/) | (empty)                                                               |

---

## temp_docs (TEMP(FP4.1) → merged → archived)

| File                | Merged into                               |
| ------------------- | ----------------------------------------- |
| DESIGN_LOG_FP4_1.md | FP4.md § Decisions, Rejected Alternatives |
| UX_FP4_1.md         | FP4.md § UX Flows, GUIDE_STYLE            |
| API_FP4_DELTA.md    | FP4.md § Dependencies (API: no changes)   |
| FP4_TESTS.md        | FP4.md § Tests Plan, AC→test mapping      |
| FP4_SECURITY_DOD.md | FP4.md § Security Checklist               |

### Archive FP4 checklist (on final archive)

- [ ] Merge `archive/FP4/temp_docs/*` into FP4.md or delete
- [ ] Merge or delete `docs/dev/_tmp/FP4_*.md`, `M1_FIX_NOTES.md`
- [ ] Merge or delete `docs/audit/FP4_M0_VIEWERS_AUDIT.md`, `FP4_M1_HANDSHAKE_FIX.md`, `FP4_M2_SIGNED_URL_FIX.md`, `FP4_M3_VIEWER_BEHAVIOR.md`, `FP4_M4_CURSOR_FIX.md`, `FP4_VIEWERS_REPRO_REPORT.md` (TEMP(FP4.1))
- [ ] No TEMP(FP4.1) docs remain in tree

---

## References

- [FP4.md](../docs/fps/FP4.md) — canonical spec
- [PROTOCOL_v0.md](../docs/core/PROTOCOL_v0.md) § FP4
- Gate: `./infra/gate.sh FP4`
