# Настройка политики доступа для Selectel S3

## Проблема: Access Denied при доступе к signed URL

Если вы получаете ошибку "Access Denied" при попытке доступа к файлам через signed URL в Selectel, это может быть связано с:

1. **Отсутствием политики доступа на bucket** (редко, но возможно)
2. **Неправильными правами у S3 ключей** (чаще всего)
3. **Неправильной конфигурацией bucket**

## Решение 1: Проверка прав доступа у S3 ключей

**Важно**: Для signed URL нужны правильные credentials с правами на чтение объектов.

1. Войдите в панель Selectel: https://panel.selectel.com/
2. Перейдите в **Object Storage** → **S3 ключи**
3. Найдите ключи, которые используются в `.env.prod`:
   - `S3_ACCESS_KEY_ID`
   - `S3_SECRET_ACCESS_KEY`
4. Проверьте права доступа у этих ключей:
   - Должны быть права на чтение объектов (`s3:GetObject`)
   - Должны быть права на запись объектов (`s3:PutObject`) - для загрузки файлов

## Решение 2: Создание политики доступа для bucket (опционально)

Если проблема сохраняется, можно создать политику доступа для bucket:

### Вариант A: Политика для чтения через signed URL

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowSignedUrlAccess",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::birdmaid-s3/*",
      "Condition": {
        "StringEquals": {
          "s3:signatureversion": "AWS4-HMAC-SHA256"
        }
      }
    }
  ]
}
```

### Вариант B: Политика для ваших S3 ключей

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowS3KeyAccess",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::YOUR_ACCOUNT_ID:user/YOUR_S3_KEY"
      },
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::birdmaid-s3/*"
    }
  ]
}
```

**Примечание**: Для Selectel формат ARN может отличаться. Проверьте документацию Selectel для правильного формата.

### Вариант C: Публичный доступ (НЕ рекомендуется для production)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicRead",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::birdmaid-s3/*"
    }
  ]
}
```

**⚠️ ВНИМАНИЕ**: Эта политика делает все объекты публичными. Используйте только для тестирования!

## Решение 3: Проверка через AWS CLI

Проверьте права доступа через AWS CLI:

```bash
# Проверьте права на чтение объекта
aws s3api head-object \
  --bucket birdmaid-s3 \
  --key builds/b9b87a61-dfe0-4d33-9139-267ccef53ee8/index.html \
  --endpoint-url https://s3.ru-3.storage.selcloud.ru \
  --profile selectel

# Если команда выполняется успешно, значит права есть
# Если получаете Access Denied, значит проблема в правах
```

## Решение 4: Проверка конфигурации в коде

Убедитесь, что в `.env.prod` установлены правильные значения:

```bash
S3_ENDPOINT=https://s3.ru-3.storage.selcloud.ru
S3_REGION=ru-3
S3_ACCESS_KEY_ID=your-real-access-key-id
S3_SECRET_ACCESS_KEY=your-real-secret-access-key
S3_BUCKET_ASSETS=birdmaid-s3
S3_PUBLIC_BASE_URL=https://s3.ru-3.storage.selcloud.ru
S3_FORCE_PATH_STYLE=true
```

## Диагностика

После пересборки бэкенда проверьте логи:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod logs back | grep -i "BuildUrlService\|S3\|bucket"
```

В логах должно быть видно:
- Какой bucket используется
- Какой endpoint используется для подписи
- Полный signed URL

Если signed URL генерируется правильно, но доступ все еще запрещен, проблема скорее всего в:
1. Правах доступа у S3 ключей в Selectel
2. Bucket policy, которая блокирует доступ
3. Неправильном bucket name

## Рекомендация

**Для signed URL обычно НЕ нужна публичная политика bucket**. Достаточно:
1. Правильных credentials (Access Key + Secret Key)
2. Прав доступа у этих ключей на чтение объектов
3. Правильной конфигурации в `.env.prod`

Если проблема сохраняется после проверки прав доступа, попробуйте создать политику доступа по варианту A или B выше.
