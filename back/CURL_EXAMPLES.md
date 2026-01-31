# VFS/S3 API - cURL Examples

## Prerequisites

1. Start MinIO and backend:
   ```bash
   docker-compose up -d minio minio-init back
   ```

2. Set `AUTH_MODE=dev` in your `.env` file or environment

3. Create a test user in MongoDB (or use existing user ID)

## 1. Dev Auth - Login as Organizer

```bash
# Login and get JWT token
curl -X POST http://localhost:3000/api/auth/dev \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "your-user-id-here",
    "role": "Organizer"
  }'

# Response:
# {
#   "user": {
#     "id": "your-user-id-here",
#     "email": "test@example.com",
#     "login": "testuser",
#     "isSuperAdmin": false,
#     "role": "Organizer"
#   },
#   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
# }

# Save token for subsequent requests
export TOKEN="your-jwt-token-here"
```

## 2. Dev Auth - Login as Guest

```bash
curl -X POST http://localhost:3000/api/auth/dev \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "your-user-id-here",
    "role": "Guest"
  }'

export TOKEN="your-jwt-token-here"
```

## 3. List Files (Guest/Organizer)

```bash
# List root directory
curl -X GET "http://localhost:3000/api/vfs/list?path=/" \
  -H "Authorization: Bearer $TOKEN"

# List Disk C/desktop
curl -X GET "http://localhost:3000/api/vfs/list?path=/Disk%20C/desktop" \
  -H "Authorization: Bearer $TOKEN"

# Response:
# {
#   "items": [
#     {
#       "name": "Disk A",
#       "type": "dir",
#       "path": "/Disk A",
#       "s3Key": "Disk A/"
#     },
#     {
#       "name": "Disk B",
#       "type": "dir",
#       "path": "/Disk B",
#       "s3Key": "Disk B/"
#     },
#     {
#       "name": "Disk C",
#       "type": "dir",
#       "path": "/Disk C",
#       "s3Key": "Disk C/"
#     }
#   ]
# }
```

## 4. Read File (Guest/Organizer)

```bash
# Read a text file
curl -X GET "http://localhost:3000/api/vfs/read?key=/Disk%20C/desktop/file.txt" \
  -H "Authorization: Bearer $TOKEN" \
  -o output.txt

# Read an image
curl -X GET "http://localhost:3000/api/vfs/read?key=/Disk%20C/images/image.png" \
  -H "Authorization: Bearer $TOKEN" \
  -o image.png
```

## 5. Upload File (Organizer Only)

```bash
# Upload a file to Disk C/desktop
curl -X POST "http://localhost:3000/api/vfs/upload?path=/Disk%20C/desktop" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/your/file.txt"

# Response:
# {
#   "key": "Disk C/desktop/file.txt",
#   "item": {
#     "name": "file.txt",
#     "type": "file",
#     "contentType": "txt",
#     "path": "/Disk C/desktop/file.txt",
#     "size": 1234,
#     "modified": "2026-01-22T12:00:00.000Z",
#     "s3Key": "Disk C/desktop/file.txt"
#   }
# }

# Upload an image
curl -X POST "http://localhost:3000/api/vfs/upload?path=/Disk%20C/images" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/image.png"
```

## 6. Move File (Organizer Only)

```bash
# Move file from one location to another
curl -X POST "http://localhost:3000/api/vfs/move" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "oldKey": "/Disk C/desktop/file1.txt",
    "newKey": "/Disk C/desktop/file2.txt"
  }'

# Response:
# {
#   "success": true
# }
```

## 7. Delete File (Organizer Only)

```bash
# Delete a file
curl -X DELETE "http://localhost:3000/api/vfs/delete?key=/Disk%20C/desktop/file.txt" \
  -H "Authorization: Bearer $TOKEN"

# Response:
# {
#   "success": true
# }
```

## 8. RBAC Tests

### Test Guest Cannot Upload

```bash
# Login as Guest
curl -X POST http://localhost:3000/api/auth/dev \
  -H "Content-Type: application/json" \
  -d '{"userId": "user-id", "role": "Guest"}'

export GUEST_TOKEN="guest-jwt-token"

# Try to upload (should fail with 403)
curl -X POST "http://localhost:3000/api/vfs/upload?path=/Disk%20C/desktop" \
  -H "Authorization: Bearer $GUEST_TOKEN" \
  -F "file=@/path/to/file.txt"

# Expected: 403 Forbidden
# {
#   "statusCode": 403,
#   "message": "PermissionDenied: upload requires Organizer role. Current role: Guest",
#   "error": "Forbidden"
# }
```

### Test Guest Cannot Delete

```bash
# Try to delete (should fail with 403)
curl -X DELETE "http://localhost:3000/api/vfs/delete?key=/Disk%20C/desktop/file.txt" \
  -H "Authorization: Bearer $GUEST_TOKEN"

# Expected: 403 Forbidden
```

### Test Guest Can Read

```bash
# Read should work for Guest
curl -X GET "http://localhost:3000/api/vfs/read?key=/Disk%20C/desktop/file.txt" \
  -H "Authorization: Bearer $GUEST_TOKEN"
```

## 9. Immutable Folders Tests

### Test Cannot Delete System Folder (Organizer)

```bash
# Login as Organizer
export TOKEN="organizer-jwt-token"

# Try to delete /Disk A (should fail with 403)
curl -X DELETE "http://localhost:3000/api/vfs/delete?key=/Disk%20A" \
  -H "Authorization: Bearer $TOKEN"

# Expected: 403 Forbidden
# {
#   "statusCode": 403,
#   "message": "PermissionDenied: Cannot delete root-level system folders (/Disk A). System folders are immutable.",
#   "error": "Forbidden"
# }
```

### Test Cannot Move System Folder

```bash
# Try to move /Disk C (should fail with 403)
curl -X POST "http://localhost:3000/api/vfs/move" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "oldKey": "/Disk C",
    "newKey": "/Disk A/Disk C"
  }'

# Expected: 403 Forbidden
```

### Test Can Work Inside System Folders

```bash
# Upload inside system folder (should work)
curl -X POST "http://localhost:3000/api/vfs/upload?path=/Disk%20C/desktop" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/file.txt"

# Delete inside system folder (should work)
curl -X DELETE "http://localhost:3000/api/vfs/delete?key=/Disk%20C/desktop/file.txt" \
  -H "Authorization: Bearer $TOKEN"
```

## 10. Get Current User

```bash
# Get current user info from JWT token
curl -X GET "http://localhost:3000/api/auth/me" \
  -H "Authorization: Bearer $TOKEN"

# Response:
# {
#   "id": "user-id",
#   "email": "test@example.com",
#   "login": "testuser",
#   "isSuperAdmin": false,
#   "role": "Organizer"
# }
```

## 11. Production Mode Test (AUTH_MODE=telegram)

```bash
# Set AUTH_MODE=telegram (or don't set it, defaults to telegram)
# Try dev auth (should fail with 403)
curl -X POST http://localhost:3000/api/auth/dev \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-id",
    "role": "Organizer"
  }'

# Expected: 403 Forbidden
# {
#   "statusCode": 403,
#   "message": "DEV MODE auth is only available when AUTH_MODE=dev",
#   "error": "Forbidden"
# }
```

## Notes

- All VFS endpoints require JWT authentication (Bearer token)
- Guest and Participant roles can only read (list, read)
- Organizer role can do all operations (list, read, upload, move, delete)
- Root-level system folders (`/Disk A`, `/Disk B`, `/Disk C`) are immutable
- Files must be uploaded inside system folders (not to root or system folder itself)
- URL-encode paths with spaces (e.g., `/Disk%20C/desktop`)
