# Исправление проблемы с проксированием build файлов (v3) - Финальное решение

## Проблема

При использовании `fetch()` с signed URL и замене hostname с `localhost:9000` на `minio:9000` возникала ошибка **403 Forbidden**, потому что подпись signed URL была создана для конкретного hostname и становилась невалидной при изменении.

## Решение

Вместо использования `fetch()` с signed URL теперь используется **S3Client напрямую** через `GetObjectCommand`. Это позволяет:

1. Использовать внутренний Docker endpoint (`minio:9000`) без проблем с подписью
2. Получать файлы напрямую из S3/MinIO без промежуточных signed URL
3. Правильно обрабатывать ошибки AWS SDK

## Изменения в коде

### До (неправильно):
```typescript
// Генерируем signed URL с публичным адресом
const signedUrl = await this.buildUrlService.getSignedUrlFromKey(s3Key, 3600, s3PublicUrl);

// Пытаемся заменить hostname для fetch из Docker
let fetchUrl = signedUrl;
if (s3PublicUrl !== s3Endpoint) {
  fetchUrl = signedUrl.replace(publicUrlObj.origin, endpointUrlObj.origin);
}
const response = await fetch(fetchUrl); // ❌ 403 Forbidden - подпись невалидна
```

### После (правильно):
```typescript
// Используем S3Client напрямую с внутренним endpoint
const getObjectCommand = new GetObjectCommand({
  Bucket: this.s3Bucket,
  Key: s3Key,
});

const s3Response = await this.s3Client.send(getObjectCommand); // ✅ Работает!

// Конвертируем stream в Buffer или string
if (isTextFile) {
  const chunks: Uint8Array[] = [];
  for await (const chunk of s3Response.Body as any) {
    chunks.push(chunk);
  }
  content = Buffer.concat(chunks).toString('utf-8');
} else {
  const chunks: Uint8Array[] = [];
  for await (const chunk of s3Response.Body as any) {
    chunks.push(chunk);
  }
  content = Buffer.concat(chunks);
}
```

## Преимущества

1. **Нет проблем с подписью** - используем прямой доступ к S3 через S3Client
2. **Работает в Docker** - использует внутренний endpoint (`S3_ENDPOINT`) автоматически
3. **Правильная обработка ошибок** - обрабатываем AWS SDK ошибки (NoSuchKey, AccessDenied)
4. **Более эффективно** - нет необходимости генерировать signed URL для внутренних запросов

## Обработка ошибок

Добавлена правильная обработка ошибок AWS SDK:

```typescript
} catch (error: any) {
  // Handle AWS SDK errors
  if (error.name === 'NoSuchKey' || error.$metadata?.httpStatusCode === 404) {
    statusCode = 404;
    errorMessage = 'File not found in S3';
  } else if (error.name === 'AccessDenied' || error.$metadata?.httpStatusCode === 403) {
    statusCode = 403;
    errorMessage = 'Access denied to file in S3';
  }
  // ...
}
```

## Проверка

После исправлений:

1. **Логи бэкенда** должны показывать:
   ```
   [proxyBuildFile] Fetching file from S3 using S3Client, key: builds/{buildId}/index.html
   ```

2. **Статус ответа** должен быть 200 вместо 403/500

3. **Файлы должны успешно загружаться** из MinIO/S3

## Переменные окружения

Убедитесь, что в Docker Compose правильно настроены:

- `S3_ENDPOINT=http://minio:9000` (внутренний адрес для подключения из контейнера)
- `S3_PUBLIC_URL=http://localhost:9000` (публичный URL для браузера - используется только для signed URL в других местах)
- `S3_BUCKET_ASSETS=birdmaid-builds` (имя bucket)
