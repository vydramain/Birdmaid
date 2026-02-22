# Design Log — FP4 System Viewers & Players

> **TEMP(FP4.1):** MUST MERGE/DELETE ON ARCHIVE FP4; source-of-truth = docs/fps/FP4.md + canonical docs/core/PROTOCOL_v0.md

**Created:** 2025-02-23  
**Purpose:** Design decisions, rejected alternatives, rationale for FP4 (mode=design → build-ready).  
**Source:** [docs/fps/FP4.md](../fps/FP4.md)

---

## 1. Contradictions Scan (FP4 vs FP3)

| #   | Area               | FP3                                              | FP4                                                    | Resolution                                                            |
| --- | ------------------ | ------------------------------------------------ | ------------------------------------------------------ | --------------------------------------------------------------------- |
| 1   | File open protocol | SHELL_OPEN { kind: "file", path, mime?, title? } | SHELL_OPEN_FILE { path, playlist }                     | FP4 supersedes. Explorer sends playlist with precomputed signed URLs. |
| 2   | Viewer boot        | /viewers/image.html?url=... (query)              | shell.local/apps/image-viewer/ + postMessage OPEN_FILE | FP4: system app pattern, postMessage handshake.                       |
| 3   | Sandbox            | Viewer: allow-scripts only                       | ImageViewer, MediaPlayer: allow-scripts only           | Aligned. No allow-same-origin.                                        |
| 4   | Token              | Viewer never gets token                          | Viewers never get token                                | Aligned.                                                              |
| 5   | E2E in gate        | FP3: E2E required                                | FP4: E2E OUT of scope                                  | FP4 design decision. Gate: smoke + unit + integration.                |

**Conclusion:** FP4 extends FP3; no security regression. Protocol evolution is explicit.

---

## 2. Key Decisions

### D-A: Players physical location

**Decision:** S3 fixture `C:/Program Files/Image Viewer/`, `C:/Program Files/Media Player/`. Runtime: `shell.local/apps/image-viewer/`, `shell.local/apps/media-player/` (same-origin URL with Shell).

**Rejected:** S3 boot via open-url for players. Rationale: consistency with Explorer (D9); players are system apps, not arbitrary S3 content.

### D-B: Sandbox for players

**Decision:** `sandbox="allow-scripts"` only (no `allow-same-origin`).

**Rejected:** allow-same-origin. Rationale: viewers/players must NOT access api.shell.local. Content only via signed URL. Aligns with FP3 security model.

### D-C: MIME and handler registry

**Decision:** Shell is single point of truth. `mime.getType(basename(path))` + allowlist + handler registry. Explorer does NOT compute MIME.

**Rejected:** Explorer sends MIME. Rationale: evolution (new types) without Explorer changes.

### D-D: Virtual list source

**Decision:** Explorer builds playlist: list dir → filter by allowlist ext → sort localeCompare → open-url for each → SHELL_OPEN_FILE.

**Rejected:** Shell or viewer fetches list. Rationale: only Explorer has token; viewer has no gateway access.

### D-E: Playlist precomputed URLs

**Decision:** Playlist = `[{ path, url }]` with signed URLs. Prev/Next — local navigation, no gateway calls.

**Rejected:** Viewer requests GET_URL_FOR_PATH on Prev/Next. Rationale: simpler, no postMessage round-trips; URLs already valid for TTL.

### D-F: 2 apps vs 3 apps

**Decision:** ImageViewer + MediaPlayer (mode=audio|video). One Media Player for both.

**Rejected:** Separate Audio Player and Video Player. Rationale: less duplication; mode switch is trivial.

### D-G: Progress bar

**Decision:** Read-only in FP4. Seek — non-goal.

**Rejected:** Interactive seek. Rationale: scope control; can add in future FP.

### D-H: Unsupported MIME

**Decision:** Log only, no crash, no window.

**Rejected:** "Open with…" dialog. Rationale: out of scope; graceful degradation.

---

## 3. Rejected Alternatives

| Alternative                                       | Rejected because                                                           |
| ------------------------------------------------- | -------------------------------------------------------------------------- |
| Bulk open-url API (multiple paths in one request) | Existing open-url is single-path; N calls acceptable; no API change needed |
| Viewer same-origin with Shell                     | Security: would allow fetch to api.shell.local                             |
| Lazy playlist loading                             | Complexity; precomputed simpler for FP4                                    |
| E2E for FP4 gate                                  | Design decision: coverage via unit+integration; E2E deferred               |

---

## 4. References

- [FP4.md](../fps/FP4.md)
- [FP3.md](../fps/FP3.md) § Security
- [GUARDRAILS.md](GUARDRAILS.md) § Gate Semantics
- [FP4_SECURITY_DOD.md](FP4_SECURITY_DOD.md) (archived)
