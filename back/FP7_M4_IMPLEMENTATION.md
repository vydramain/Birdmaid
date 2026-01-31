# FP7 M4: Backend VFS/S3 API + RBAC Implementation

## Реализовано

### 1. Auth Dev Mode (`/api/auth/dev`)
- ✅ Endpoint доступен только при `AUTH_MODE=dev`
- ✅ Fail-fast проверка в production (заблокирован при `AUTH_MODE=telegram`)
- ✅ Выдаёт JWT токен с ролью пользователя
- ✅ Поддержка параметров `userId` и `role`

### 2. Роль в БД и JWT
- ✅ Добавлено поле `role: 'Guest' | 'Participant' | 'Organizer'` в `UserDoc`
- ✅ Роль включается в JWT токен при генерации
- ✅ Fallback: если роль не задана, используется `isSuperAdmin ? 'Organizer' : 'Guest'`
- ✅ Endpoint `/api/auth/me` возвращает роль пользователя

### 3. S3 Service
- ✅ Абстракция над S3-совместимым хранилищем (MinIO/AWS S3)
- ✅ Операции: `list`, `read`, `upload`, `move`, `delete`, `exists`
- ✅ Поддержка "директорий" (keys ending with `/`)
- ✅ Конфигурация через env переменные

### 4. VFS Controller
- ✅ `GET /api/vfs/list?path=...` - список файлов/папок (Guest+)
- ✅ `GET /api/vfs/read?key=...` - чтение файла (Guest+)
- ✅ `POST /api/vfs/upload?path=...` - загрузка файла (Organizer only)
- ✅ `POST /api/vfs/move` - перемещение файла (Organizer only)
- ✅ `DELETE /api/vfs/delete?key=...` - удаление файла (Organizer only)

### 5. RBAC Проверки
- ✅ Guest/Participant: только read операции (list, read)
- ✅ Organizer: полный контроль (list, read, upload, move, delete)
- ✅ Проверки на уровне VfsService и VfsController

### 6. Immutability System Folders
- ✅ Запрещено удалять root-level system folders (`/Disk A`, `/Disk B`, `/Disk C`)
- ✅ Запрещено перемещать root-level system folders
- ✅ Запрещено загружать файлы напрямую в root-level system folders
- ✅ Organizer может работать внутри system folders (subtree)

### 7. Тесты
- ✅ `auth.dev.test.ts` - тесты dev auth (7 тестов)
- ✅ `vfs.rbac.test.ts` - тесты RBAC (8 тестов)
- ✅ `vfs.immutable-folders.test.ts` - тесты immutability (11 тестов)
- ✅ Всего: 26 тестов, все проходят

## Структура файлов

```
back/src/
├── auth/
│   ├── auth.controller.ts      # + /api/auth/dev, /api/auth/me
│   ├── auth.service.ts          # + devAuth(), generateToken() с role
│   └── dto/
│       └── dev-auth.dto.ts     # новый DTO
├── users/
│   └── users.repository.ts     # + role: UserRole в UserDoc
└── vfs/                        # новый модуль
    ├── vfs.module.ts
    ├── vfs.controller.ts       # VFS endpoints
    ├── vfs.service.ts          # VFS логика + RBAC + immutability
    └── s3.service.ts          # S3 операции

back/__tests__/fp7/
├── auth.dev.test.ts
├── vfs.rbac.test.ts
└── vfs.immutable-folders.test.ts

back/
├── .env.example               # пример конфигурации
└── CURL_EXAMPLES.md           # примеры использования API
```

## Конфигурация

### Environment Variables

```env
# Auth
AUTH_MODE=dev  # 'dev' для локальной разработки, 'telegram' для production
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# S3 (MinIO)
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET_VFS=birdmaid-vfs
S3_REGION=us-east-1
S3_FORCE_PATH_STYLE=true
```

## Использование

### 1. Запуск MinIO локально

```bash
docker-compose up -d minio minio-init
```

### 2. Dev Auth

```bash
# Установить AUTH_MODE=dev
export AUTH_MODE=dev

# Залогиниться как Organizer
curl -X POST http://localhost:3000/api/auth/dev \
  -H "Content-Type: application/json" \
  -d '{"userId": "user-id", "role": "Organizer"}'

# Сохранить токен
export TOKEN="jwt-token-here"
```

### 3. VFS Операции

```bash
# List
curl -X GET "http://localhost:3000/api/vfs/list?path=/" \
  -H "Authorization: Bearer $TOKEN"

# Upload (Organizer only)
curl -X POST "http://localhost:3000/api/vfs/upload?path=/Disk%20C/desktop" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/file.txt"

# Read
curl -X GET "http://localhost:3000/api/vfs/read?key=/Disk%20C/desktop/file.txt" \
  -H "Authorization: Bearer $TOKEN"

# Move (Organizer only)
curl -X POST "http://localhost:3000/api/vfs/move" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"oldKey": "/Disk C/desktop/file1.txt", "newKey": "/Disk C/desktop/file2.txt"}'

# Delete (Organizer only)
curl -X DELETE "http://localhost:3000/api/vfs/delete?key=/Disk%20C/desktop/file.txt" \
  -H "Authorization: Bearer $TOKEN"
```

## Проверка

### Тесты

```bash
cd back
npm test -- __tests__/fp7/
```

### RBAC Проверка

1. Залогиниться как Guest → попробовать upload → должно быть 403
2. Залогиниться как Organizer → upload должен работать

### Immutability Проверка

1. Залогиниться как Organizer
2. Попробовать удалить `/Disk A` → должно быть 403
3. Попробовать загрузить файл в `/Disk C/desktop` → должно работать

## Следующие шаги

- [ ] Интеграция с frontend (VFS синхронизация)
- [ ] Создание системных папок при инициализации S3
- [ ] Поддержка создания папок (mkdir операция)
- [ ] Поддержка переименования (rename операция)
