# FS Contract v0 (FP2)

**Purpose:** Canonical contract for file system operations (list, stat, open-url, roots).  
**Scope:** Read-only. Single bucket + prefixes. Signed URLs only.

---

## 1. Path Scheme

**Format:** `/@root/{ROOT_ID}/path/to/item`

- `ROOT_ID`: Virtual root identifier. Dev roots (fixtures): `DISK_C`, `APPS`
- Path is relative to root; no leading slash after ROOT_ID
- Examples:
  - `/@root/DISK_C/` — root dir
  - `/@root/DISK_C/docs/` — subdir
  - `/@root/DISK_C/docs/readme.txt` — file

---

## 2. Canonicalization Rules

| Rule                   | Description                                         |
| ---------------------- | --------------------------------------------------- |
| Leading slash          | All paths start with `/`                            |
| Dir trailing slash     | Dir paths end with `/` (e.g. `/@root/DISK_C/docs/`) |
| File no trailing slash | File paths never end with `/`                       |
| name                   | Never contains `/`                                  |
| maxLen                 | 1024 characters                                     |
| Forbidden              | `..`, `\`, double slashes `//`                      |
| Decode                 | URL-decode once; reject invalid encoding            |

**Validation order:** decode → reject forbidden → normalize slashes → check length → root isolation.

---

## 3. Root Isolation

- Path **must** start with `/@root/{ROOT_ID}/`
- `ROOT_ID` must exist in `GET /api/fs/roots` response
- Unknown root → **403** (not 400)

---

## 4. isApp Discovery

**Rule:** A directory has `isApp: true` iff `{dir}/index.html` exists.

**Method:** `HEAD` on S3 object `{prefix}{dir}index.html`.

- 200 → `isApp: true`
- 404/other → `isApp: false`

**When:** During `list` for each dir item. FP3 uses this to know what to launch.

---

## 5. MIME Inference Policy

- **Source:** S3 `Content-Type` metadata if set; else infer from extension.
- **Inference:** `application/octet-stream` for unknown types.
- **Unknown MIME:** Return `mime` as-is; client treats as binary. No special handling.

---

## 6. S3 Prefix Mapping

```
bucket: birdmaid-dev
prefixes:
  roots/DISK_C/   → /@root/DISK_C/
  roots/APPS/     → /@root/APPS/
```

Path `/@root/DISK_C/docs/readme.txt` → S3 key `roots/DISK_C/docs/readme.txt`

---

## 7. Examples

```yaml
# list root
GET /api/fs/list?path=/@root/DISK_C/
→ 200
[
  { path: "/@root/DISK_C/apps/", name: "apps", kind: "dir", isApp: true },
  { path: "/@root/DISK_C/docs/", name: "docs", kind: "dir", isApp: false },
  { path: "/@root/DISK_C/readme.txt", name: "readme.txt", kind: "file", size: 42, mime: "text/plain" }
]

# stat file
GET /api/fs/stat?path=/@root/DISK_C/docs/readme.txt
→ 200
{ path: "/@root/DISK_C/docs/readme.txt", name: "readme.txt", kind: "file", size: 42, mime: "text/plain" }

# stat missing
GET /api/fs/stat?path=/@root/DISK_C/docs/nonexistent.txt
→ 404
{ error: { code: "NOT_FOUND", message: "Item not found" } }

# list bad path (traversal)
GET /api/fs/list?path=/@root/DISK_C/../etc/
→ 400
{ error: { code: "BAD_PATH", message: "Invalid path" } }

# list bad root
GET /api/fs/list?path=/@root/UNKNOWN_ROOT/
→ 403
{ error: { code: "ROOT_NOT_FOUND", message: "Root not found" } }

# open-url
POST /api/fs/open-url
{ "path": "/@root/DISK_C/docs/readme.txt", "ttlSec": 120 }
→ 200
{ url: "http://s3.shell.local/birdmaid-dev/roots/DISK_C/docs/readme.txt?X-Amz-...", expiresIn: 120 }

# list empty dir
GET /api/fs/list?path=/@root/APPS/empty/
→ 200
{ items: [] }
```

---

## 8. Error Codes

| Code           | HTTP | When                                        |
| -------------- | ---- | ------------------------------------------- |
| BAD_PATH       | 400  | Invalid format, traversal, length, encoding |
| ROOT_NOT_FOUND | 403  | ROOT_ID not in roots                        |
| NOT_FOUND      | 404  | Path valid but item not in S3               |
| INTERNAL_ERROR | 500  | S3/MinIO error, unhandled exception         |

---

## 9. References

- API.yaml: [docs/core/API.yaml](./API.yaml)
- FP2: [docs/fps/FP2.md](../fps/FP2.md)
- CORS: [docs/core/CORS_SIGNED_URLS.md](./CORS_SIGNED_URLS.md)
