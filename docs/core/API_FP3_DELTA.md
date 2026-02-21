# API.yaml FP3 Delta Plan

**Purpose:** Plan for extending API.yaml with write endpoints and permission model.  
**Reference:** docs/core/API.yaml (FP2), docs/fps/FP3.md.

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
