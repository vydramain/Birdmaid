# API.yaml FP3 Delta Plan

**Purpose:** Plan for extending API.yaml with write endpoints and permission model.  
**Reference:** docs/core/API.yaml (FP2), docs/fps/FP3.md.  
**FP3 patchset:** Upload contract, error codes, no uncontrolled 500.

---

## 1. New Endpoints (Write)

| Method | Path                   | Purpose                                             |
| ------ | ---------------------- | --------------------------------------------------- |
| POST   | /api/fs/create-folder  | Create folder in writable path                      |
| POST   | /api/fs/upload-file    | Multipart upload single file                        |
| POST   | /api/fs/upload-zip-app | Multipart zip; gateway unpacks; validate index.html |
| DELETE | /api/fs/delete         | Delete file or dir                                  |
| PUT    | /api/fs/rename         | Rename (same-parent only)                           |

---

## 2. Request/Response Schemas (to add)

**create-folder:**

- Request: `{ path: string }` (parent dir path)
- Response: 201 + item or 403/409/400

**upload-file:**

- Request: multipart/form-data (file + path)
- Response: 201 + item or 403/409/400

**upload-zip-app:**

- Request: multipart/form-data (zip file + path)
- Response: 201 + item or 403/400 (no index.html → fail, rollback)

**delete:**

- Request: path in body or query
- Response: 204 or 403/404

**rename:**

- Request: `{ fromPath: string, toPath: string }`
- Response: 200 + item or 403/409/400 (cross-parent → 403)

---

## 3. Permission Model

| Endpoint Type                          | Allowed Origin                               | Headers Required                       |
| -------------------------------------- | -------------------------------------------- | -------------------------------------- |
| Read (roots, list, stat, open-url)     | shell.local, api.shell.local, localhost:5173 | —                                      |
| Write (create, upload, delete, rename) | shell.local (Explorer)                       | X-System-App: explorer, X-System-Token |

**Enforcement:** Gateway middleware checks origin + headers. User app → 403.

---

## 4. Path Policy (Gateway MUST enforce)

- **Deny write:** C:/WINDOWS/**, C:/Program Files/**, A:/**, D:/**, boot files, C:/Recycled/**, C:/Temporary Internet Files/**
- **Allow write:** C:/My Documents/\*\* only
- **Rename:** dirname(fromPath) === dirname(toPath); else 403

---

## 5. Roots Change

- FP3: roots = DISK_A, DISK_C, DISK_D only. APPS deprecated; gateway MUST NOT return APPS.
- GET /api/fs/roots returns `[{ id: "DISK_A", label: "Floppy (A:)" }, { id: "DISK_C", label: "(C:)" }, { id: "DISK_D", label: "(D:)" }]`

---

## 6. ZIP Upload Rules

- Gateway accepts multipart zip
- Unpacks to target path
- Validates index.html in root or first level
- Fail → rollback (no partial state)
- Status: 400 if invalid zip, 403 if path not writable

---

## 7. FP3 Patchset API Contract (Upload + Error Mapping)

### 7.1 upload-file (multipart)

**Request:**

- `Content-Type: multipart/form-data`
- Fields: `path` (string, parent dir + filename), `file` (file)
- **maxFiles:** 1 per request (client sends multiple requests for 1..10 files)
- **Allowlist ext:** `.png`, `.jpg`, `.jpeg`, `.webp`, `.mp3`, `.mp4`, `.webm`
- **Allowlist mime:** `image/png`, `image/jpeg`, `image/webp`, `audio/mpeg`, `video/mp4`, `video/webm`
- **Payload limit:** 50MB per file (existing multipart config)

**Response:**

- 201: `{ path, name }`
- 400: BAD_PATH, BAD_REQUEST (multipart malformed, missing path/file)
- 403: PERMISSION_DENIED, POLICY_VIOLATION (path not writable)
- 413: PAYLOAD_TOO_LARGE (file exceeds limit)
- 415: UNSUPPORTED_MEDIA (ext/mime not in allowlist)
- 409: NAME_CONFLICT (file exists, if applicable)

**MUST NOT:** Return 500 for valid multipart request with allowlisted file. Map S3 errors to 4xx where possible.

**FP3 patchset build note:** Backend currently lacks allowlist validation → may return 500 for edge cases. Add ext/mime allowlist check before S3 PutObject; return 415 for disallowed. S3 NotFound/conditional → 404/409.

### 7.2 upload-zip-app (multipart)

**Request:**

- `Content-Type: multipart/form-data`
- Fields: `path` (string, parent dir + folder name/), `file` (zip)
- **maxFiles:** 1
- **Allowlist:** `.zip`, `application/zip`

**Response:**

- 201: `{ path, name }`
- 400: BAD_PATH, BAD_REQUEST, NO_INDEX_HTML (zip invalid or no index.html)
- 403: PERMISSION_DENIED
- 413: PAYLOAD_TOO_LARGE
- 415: UNSUPPORTED_MEDIA (not zip)

**Rollback:** On any error after partial upload, delete uploaded keys. No partial state.

### 7.3 Error Mapping (Gateway MUST)

| Source                      | Map to | Code                            |
| --------------------------- | ------ | ------------------------------- |
| path-policy deny            | 403    | POLICY_VIOLATION                |
| missing/invalid token       | 403    | PERMISSION_DENIED               |
| multipart not received      | 400    | BAD_REQUEST                     |
| path missing/invalid        | 400    | BAD_PATH                        |
| file ext/mime not allowlist | 415    | UNSUPPORTED_MEDIA               |
| file size > limit           | 413    | PAYLOAD_TOO_LARGE               |
| S3 NotFound                 | 404    | NOT_FOUND                       |
| S3 conflict/conditional     | 409    | NAME_CONFLICT                   |
| S3 credentials/endpoint     | 503    | SERVICE_UNAVAILABLE (not 500)   |
| Unexpected                  | 500    | INTERNAL_ERROR (log request id) |

**Logging:** Every error response MUST log: `requestId` (or req.id), `code`, `path` (if applicable).

### 7.4 rename / create-folder / delete (async semantics)

- **rename:** 200 + item on success; 409 if target exists; 404 if source not found.
- **create-folder:** 201 + item; 409 if folder exists.
- **delete:** 204 on success; 404 if not found.

All MUST return controlled 4xx for validation/policy errors. 500 only for unexpected server failure.
