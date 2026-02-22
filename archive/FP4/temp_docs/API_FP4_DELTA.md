# API Delta — FP4 System Viewers & Players

> **TEMP(FP4.1):** MUST MERGE/DELETE ON ARCHIVE FP4; source-of-truth = docs/fps/FP4.md + canonical docs/core/PROTOCOL_v0.md

**Purpose:** Changes to API contract for FP4.  
**Base:** [API.yaml](API.yaml)

---

## 1. Summary

**No new API endpoints.** FP4 uses existing endpoints:

- `GET /api/fs/list` — Explorer lists directory
- `POST /api/fs/open-url` — Explorer requests signed URL per path

Explorer calls open-url **N times** (once per file in playlist). No bulk open-url.

---

## 2. Signed URL Flow

| Step | Endpoint                         | Caller   | Purpose                            |
| ---- | -------------------------------- | -------- | ---------------------------------- |
| 1    | GET /api/fs/list?path=...        | Explorer | List dir, filter by ext            |
| 2    | POST /api/fs/open-url (per path) | Explorer | Get signed URL for each file       |
| 3    | —                                | Explorer | Build playlist [{ path, url }]     |
| 4    | —                                | Explorer | SHELL_OPEN_FILE { path, playlist } |
| 5    | —                                | Shell    | OPEN_FILE to viewer                |

Viewer never calls gateway. Content loaded via signed URL (MinIO) only.

---

## 3. Open-URL Contract (unchanged)

Request: `{ path: string, ttlSec?: number }`  
Response: `{ url: string }`

Existing schema in API.yaml. No changes.

---

## 4. Conclusion

**API_FP4_DELTA: No API changes.** Signed-url flow achieved via existing list + open-url. Explorer (with token) performs all gateway calls; viewers receive only precomputed URLs in OPEN_FILE.
