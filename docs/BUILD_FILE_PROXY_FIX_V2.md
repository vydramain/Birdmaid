# Исправление проблемы с проксированием build файлов (v2)

## Проблемы

### 1. Неправильный S3 key: `builds/builds/index.html`
**Причина**: Regex `/builds\/([^\/]+)/` находил первый `builds/` в URL, что приводило к неправильному извлечению buildId.

**Решение**: Используется правильное извлечение пути после bucket name из `build_url`, затем извлекается директория и добавляется `filePath`.

### 2. ECONNREFUSED при fetch() к localhost:9000
**Причина**: В Docker контейнере `localhost:9000` недоступен, нужно использовать внутренний адрес MinIO (`minio:9000`).

**Решение**: При `fetch()` заменяется публичный URL на внутренний endpoint (`S3_ENDPOINT`) для подключения из контейнера.

## Исправления

### 1. Правильное извлечение S3 key из build_url

```typescript
// Старый код (неправильный):
const buildUrlMatch = game.build_url.match(/builds\/([^\/]+)/);
const buildId = buildUrlMatch[1];
const s3Key = `builds/${buildId}/${filePath}`;

// Новый код (правильный):
const buildUrlPattern = new RegExp(`^${escapedPublicUrl}/${escapedBucket}/(.+)$`);
const buildUrlMatch = game.build_url.match(buildUrlPattern);
const buildPath = buildUrlMatch[1]; // "builds/{buildId}/index.html"
const lastSlashIndex = buildPath.lastIndexOf('/');
const buildDir = lastSlashIndex >= 0 ? buildPath.substring(0, lastSlashIndex + 1) : "builds/";
const s3Key = `${buildDir}${filePath}`;
```

### 2. Использование внутреннего адреса MinIO для fetch()

```typescript
// Заменяем публичный URL на внутренний endpoint для fetch из Docker
let fetchUrl = signedUrl;
const s3Endpoint = process.env.S3_ENDPOINT ?? "http://localhost:9000";
if (s3PublicUrl !== s3Endpoint && s3Endpoint.includes("://")) {
  const publicUrlObj = new URL(s3PublicUrl);
  const endpointUrlObj = new URL(s3Endpoint);
  fetchUrl = signedUrl.replace(publicUrlObj.origin, endpointUrlObj.origin);
}
const response = await fetch(fetchUrl);
```

## Проверка

После исправлений:

1. **Логи бэкенда** должны показывать:
   ```
   [proxyBuildFile] build_url: http://localhost:9000/birdmaid-builds/builds/{buildId}/index.html
   [proxyBuildFile] Extracted build_path: builds/{buildId}/index.html, build_dir: builds/{buildId}/, filePath: index.html, s3Key: builds/{buildId}/index.html
   [proxyBuildFile] Using internal endpoint for fetch: http://minio:9000/...
   ```

2. **Статус ответа** должен быть 200 вместо 500

3. **Файл должен успешно загружаться** из S3/MinIO

## Переменные окружения

Убедитесь, что в Docker Compose правильно настроены:

- `S3_ENDPOINT=http://minio:9000` (внутренний адрес для подключения из контейнера)
- `S3_PUBLIC_URL=http://localhost:9000` (публичный URL для браузера)
- `S3_BUCKET_ASSETS=birdmaid-builds` (имя bucket)
