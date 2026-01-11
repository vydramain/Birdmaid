# Проверка подключения бэкенда к S3

## Способ 1: Проверка переменных окружения

Проверьте, что переменные S3 правильно установлены в контейнере:

```bash
# Проверить переменные окружения в контейнере бэкенда
docker compose -f docker-compose.prod.yml --env-file .env.prod exec back env | grep S3_

# Должны быть видны:
# S3_ENDPOINT=https://s3.ru-3.storage.selcloud.ru
# S3_REGION=ru-3
# S3_ACCESS_KEY_ID=...
# S3_SECRET_ACCESS_KEY=...
# S3_BUCKET_ASSETS=birdmaid-builds
# S3_PUBLIC_BASE_URL=https://s3.ru-3.storage.selcloud.ru
# S3_FORCE_PATH_STYLE=true
```

## Способ 2: Проверка через Node.js скрипт в контейнере

Выполните простую операцию с S3 прямо в контейнере:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod exec back node -e "
const { S3Client, HeadBucketCommand } = require('@aws-sdk/client-s3');

const s3Client = new S3Client({
  region: process.env.S3_REGION || 'us-east-1',
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || process.env.S3_SECRET_KEY,
  },
  forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true' || process.env.S3_FORCE_PATH_STYLE === undefined,
});

const bucket = process.env.S3_BUCKET_ASSETS || process.env.S3_BUCKET || 'birdmaid-builds';

console.log('Testing S3 connection...');
console.log('Endpoint:', process.env.S3_ENDPOINT);
console.log('Bucket:', bucket);
console.log('Region:', process.env.S3_REGION || 'us-east-1');

s3Client.send(new HeadBucketCommand({ Bucket: bucket }))
  .then(() => {
    console.log('✅ SUCCESS: S3 connection works! Bucket exists and is accessible.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ ERROR: S3 connection failed!');
    console.error('Error:', err.message);
    console.error('Code:', err.Code || err.name);
    process.exit(1);
  });
"
```

## Способ 3: Проверка через логи при загрузке файла

Попробуйте загрузить файл через API и проверьте логи:

```bash
# Загрузите тестовый файл через API (если есть endpoint для загрузки)
# Затем проверьте логи:
docker compose -f docker-compose.prod.yml --env-file .env.prod logs back | grep -i s3

# Ищите сообщения об ошибках или успешных операциях с S3
```

## Способ 4: Проверка через health endpoint (если добавлен S3 check)

Если в health endpoint добавлена проверка S3, просто запросите его:

```bash
curl https://api.birdmaid.su/health
# или
curl http://localhost:3000/health
```

## Способ 5: Проверка через список объектов в bucket

Попробуйте получить список объектов в bucket:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod exec back node -e "
const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3');

const s3Client = new S3Client({
  region: process.env.S3_REGION || 'us-east-1',
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || process.env.S3_SECRET_KEY,
  },
  forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true' || process.env.S3_FORCE_PATH_STYLE === undefined,
});

const bucket = process.env.S3_BUCKET_ASSETS || process.env.S3_BUCKET || 'birdmaid-builds';

s3Client.send(new ListObjectsV2Command({ Bucket: bucket, MaxKeys: 5 }))
  .then((result) => {
    console.log('✅ SUCCESS: S3 connection works!');
    console.log('Bucket:', bucket);
    console.log('Objects found:', result.KeyCount || 0);
    if (result.Contents && result.Contents.length > 0) {
      console.log('Sample objects:');
      result.Contents.slice(0, 5).forEach(obj => {
        console.log('  -', obj.Key, '(', obj.Size, 'bytes)');
      });
    }
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ ERROR: S3 connection failed!');
    console.error('Error:', err.message);
    console.error('Code:', err.Code || err.name);
    process.exit(1);
  });
"
```

## Типичные ошибки и решения

### Ошибка: "Access Denied" или "Forbidden"
- Проверьте правильность `S3_ACCESS_KEY_ID` и `S3_SECRET_ACCESS_KEY`
- Убедитесь, что ключи имеют права на доступ к bucket

### Ошибка: "Bucket does not exist"
- Проверьте правильность имени bucket в `S3_BUCKET_ASSETS`
- Убедитесь, что bucket существует в вашем S3 хранилище

### Ошибка: "Network error" или "Connection refused"
- Проверьте правильность `S3_ENDPOINT`
- Убедитесь, что endpoint доступен из контейнера (проверьте сеть)
- Для Selectel: убедитесь, что используете правильный регион в endpoint

### Ошибка: SSL/TLS ошибки
- Для Selectel может потребоваться установка сертификата (см. `docs/SELECTEL_SSL_FIX.md`)
- Проверьте, что endpoint использует HTTPS

## Быстрая проверка всех настроек

```bash
# Проверка всех S3 переменных одной командой
docker compose -f docker-compose.prod.yml --env-file .env.prod exec back sh -c '
echo "=== S3 Configuration ==="
echo "S3_ENDPOINT: $S3_ENDPOINT"
echo "S3_REGION: $S3_REGION"
echo "S3_BUCKET_ASSETS: $S3_BUCKET_ASSETS"
echo "S3_PUBLIC_BASE_URL: $S3_PUBLIC_BASE_URL"
echo "S3_FORCE_PATH_STYLE: $S3_FORCE_PATH_STYLE"
echo "S3_ACCESS_KEY_ID: ${S3_ACCESS_KEY_ID:0:10}... (hidden)"
echo "S3_SECRET_ACCESS_KEY: ${S3_SECRET_ACCESS_KEY:0:10}... (hidden)"
'
```
