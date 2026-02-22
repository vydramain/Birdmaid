# FP4 Security DoD — System Viewers & Players

> **TEMP(FP4.1):** MUST MERGE/DELETE ON ARCHIVE FP4; source-of-truth = docs/fps/FP4.md + canonical docs/core/PROTOCOL_v0.md

**Purpose:** Security checklist for FP4 build. Must be satisfied for release.  
**Source:** [FP4.md](../fps/FP4.md), [FP3.md](../fps/FP3.md) § Security

---

## 1. Sandbox Flags

| App         | Sandbox              | Rationale                                           |
| ----------- | -------------------- | --------------------------------------------------- |
| ImageViewer | `allow-scripts` only | No allow-same-origin. Cannot fetch api.shell.local. |
| MediaPlayer | `allow-scripts` only | Same. Content only via signed URL.                  |

**MUST NOT:** `allow-same-origin` for viewers/players. Would allow access to Shell origin.

---

## 2. Token Policy

| Rule                                   | Check                                                       |
| -------------------------------------- | ----------------------------------------------------------- |
| Viewers never receive token            | OPEN_FILE payload has no token field                        |
| SHELL_CAPS with token only to Explorer | Shell routes by window type; viewer windows never get token |
| postMessage targetOrigin               | Never `"*"`; allowlist only                                 |

---

## 3. Allowlist

| Layer            | Allowlist                                                            |
| ---------------- | -------------------------------------------------------------------- |
| MIME             | image/png, image/jpeg, image/webp, audio/mpeg, video/mp4, video/webm |
| Extensions       | .png, .jpg, .jpeg, .webp, .mp3, .mp4, .webm                          |
| Handler registry | Only allowlist MIME → app; unknown → log, no handler                 |

Unsupported MIME: log only, no window, no crash.

---

## 4. Signed-URL Policy

| Rule                              | Check                                          |
| --------------------------------- | ---------------------------------------------- |
| Explorer requests open-url        | Only Explorer (with token) calls gateway       |
| Viewer loads content via URL only | img.src, audio.src, video.src = signed URL     |
| Viewer never calls gateway        | No fetch to api.shell.local from viewer iframe |
| URL TTL                           | Use default or configured ttlSec; URLs expire  |

---

## 5. System App vs User App

| Type                                  | Path                 | Writable     | Gateway |
| ------------------------------------- | -------------------- | ------------ | ------- |
| System app (ImageViewer, MediaPlayer) | C:/Program Files/    | No           | None    |
| User app                              | C:/My Documents/.../ | Yes (parent) | None    |

System apps: read-only in S3. Served from shell.local/apps/ at runtime.

---

## 6. postMessage

| Rule                      | Check                                            |
| ------------------------- | ------------------------------------------------ |
| OPEN_FILE only from Shell | Viewer validates event.origin allowlist          |
| No arbitrary origins      | Shell validates Explorer/viewer source           |
| Payload structure         | initialPath, initialUrl, playlist only; no token |

---

## 7. Path Policy

Playlist paths come from Explorer (list result). Gateway enforces path policy on list and open-url. Viewer does not validate paths; it only uses URLs from trusted Shell.

---

## 8. Checklist (build)

- [ ] ImageViewer iframe: sandbox allow-scripts only
- [ ] MediaPlayer iframe: sandbox allow-scripts only
- [ ] OPEN_FILE: no token in payload
- [ ] Handler registry: allowlist only
- [ ] Unsupported MIME: log, no handler
- [ ] postMessage: allowlist origins, no "\*"
- [ ] Explorer: only app that calls list + open-url for playlist

---

## 9. References

- [FP4.md](../fps/FP4.md) § Security, § Boot & Sandbox
- [FP3.md](../fps/FP3.md) § Security & Permissions
- [PROTOCOL_v0.md](../core/PROTOCOL_v0.md) § FP4
