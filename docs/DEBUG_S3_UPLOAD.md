# Отладка загрузки файлов в S3

## Как проверить, откуда загружаются файлы

### 1. Проверка логов бэкенда при загрузке

После загрузки обложки игры проверьте логи:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod logs back | grep -i "uploadCover"
```

Должны быть видны:
- `[uploadCover] Starting upload for game {id}`
- `S3 Bucket: {bucket_name}`
- `S3 Key: covers/{coverId}.{ext}`
- `✓ Successfully uploaded to S3` или `✗ Failed to upload to S3`

### 2. Проверка логов при получении игры

При запросе игры (`GET /games/:id` или `GET /games`) проверьте логи:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod logs back | grep -i "BuildUrlService\|getSignedUrl"
```

Должны быть видны:
- `[BuildUrlService] Generating signed URL`
- `Bucket: {bucket_name}`
- `Key: covers/{coverId}.{ext}`
- `Generated signed URL for key`

### 3. Проверка в браузере (Network tab)

1. Откройте DevTools → Network
2. Найдите запрос к `/games` или `/games/:id`
3. Посмотрите ответ API — поле `cover_url` должно быть signed URL (начинается с `https://s3.ru-3.storage.selcloud.ru/...`)
4. Найдите запрос к изображению обложки
5. Проверьте URL запроса — должен быть signed URL из S3, а не из бэкенда

### 4. Проверка в Selectel панели

1. Войдите в панель Selectel
2. Перейдите в Object Storage → ваш bucket (`birdmaid-s3`)
3. Проверьте папку `covers/`
4. Должны быть файлы вида `covers/{uuid}.{ext}`

### 5. Проверка через AWS CLI (если настроен)

```bash
# Список объектов в bucket
aws s3 ls s3://birdmaid-s3/covers/ --endpoint-url https://s3.ru-3.storage.selcloud.ru --profile selectel

# Проверка конкретного файла
aws s3 ls s3://birdmaid-s3/covers/{coverId}.{ext} --endpoint-url https://s3.ru-3.storage.selcloud.ru --profile selectel
```

## Типичные проблемы

### Проблема: Файлы загружаются в S3, но не отображаются

**Причина**: Проблема с генерацией signed URL или Access Denied

**Решение**:
1. Проверьте логи `[BuildUrlService]` — есть ли ошибки при генерации signed URL
2. Проверьте права доступа у S3 ключей в панели Selectel
3. Проверьте SSL сертификат (см. `docs/SELECTEL_SSL_FIX.md`)

### Проблема: Файлы не загружаются в S3

**Причина**: Ошибка при `PutObjectCommand`

**Решение**:
1. Проверьте логи `[uploadCover]` — должна быть ошибка
2. Проверьте `S3_ENDPOINT`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` в `.env.prod`
3. Проверьте права доступа у S3 ключей (должны быть права на запись)

### Проблема: В браузере запрос идет на бэкенд вместо S3

**Причина**: Возвращается S3 ключ вместо signed URL

**Решение**:
1. Проверьте логи `[listGames]` или `[getGame]` — должен быть signed URL
2. Проверьте, что `cover_url` в ответе API начинается с `https://`, а не с `covers/`
3. Если видите `⚠️ CRITICAL ERROR: Returning S3 key instead of signed URL` — проблема в генерации signed URL

## Полная проверка потока

1. **Загрузка** (`POST /games/:id/cover`):
   - Файл → бэкенд → S3 (через `PutObjectCommand`)
   - В БД сохраняется S3 ключ `covers/{coverId}.{ext}`

2. **Получение** (`GET /games/:id` или `GET /games`):
   - Из БД читается S3 ключ `covers/{coverId}.{ext}`
   - Генерируется signed URL через `BuildUrlService.getSignedUrlFromKey()`
   - Возвращается signed URL клиенту

3. **Отображение** (браузер):
   - Браузер запрашивает изображение по signed URL напрямую из S3
   - S3 проверяет подпись и возвращает файл

## Команды для быстрой проверки

```bash
# Все логи загрузки
docker compose -f docker-compose.prod.yml --env-file .env.prod logs back | grep -E "uploadCover|BuildUrlService|S3"

# Последние 50 строк логов
docker compose -f docker-compose.prod.yml --env-file .env.prod logs --tail=50 back

# Логи в реальном времени
docker compose -f docker-compose.prod.yml --env-file .env.prod logs -f back
```
