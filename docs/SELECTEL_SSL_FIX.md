# Решение проблемы SSL с Selectel S3

## Проблема: "certificate verify failed: self signed certificate in certificate chain"

Эта ошибка возникает потому, что Selectel использует самоподписанный сертификат в цепочке SSL.

## Решение 1: Установить сертификат Selectel (рекомендуется)

Согласно документации Selectel, нужно установить сертификат GlobalSign:

```bash
# Создайте директорию для сертификатов
mkdir -p ~/.selectel-certs

# Скачайте сертификат GlobalSign Root R6
wget https://secure.globalsign.net/cacert/root-r6.crt -O ~/.selectel-certs/root.crt

# Конвертируйте в PEM формат (если нужно)
openssl x509 -inform der -in ~/.selectel-certs/root.crt -out ~/.selectel-certs/root.pem

# Установите сертификат в систему
cp ~/.selectel-certs/root.pem /usr/local/share/ca-certificates/selectel-root.crt
update-ca-certificates

# Проверьте установку
openssl x509 -in /usr/local/share/ca-certificates/selectel-root.crt -text -noout
```

### Для AWS CLI

```bash
# Добавьте сертификат в конфигурацию AWS CLI
mkdir -p ~/.aws
cat >> ~/.aws/config << EOF
[profile selectel]
region = ru-3
endpoint_url = https://s3.ru-3.storage.selcloud.ru
ca_bundle = /usr/local/share/ca-certificates/selectel-root.crt
EOF
```

### Для Python/boto3

```bash
# Установите переменную окружения
export AWS_CA_BUNDLE=/usr/local/share/ca-certificates/selectel-root.crt

# Или в коде Python:
import boto3
from botocore.client import Config
import ssl
import certifi

# Добавьте сертификат в контекст SSL
ssl_context = ssl.create_default_context(cafile='/usr/local/share/ca-certificates/selectel-root.crt')

s3_client = boto3.client(
    's3',
    endpoint_url='https://s3.ru-3.storage.selcloud.ru',
    aws_access_key_id=ACCESS_KEY,
    aws_secret_access_key=SECRET_KEY,
    region_name='ru-3',
    config=Config(signature_version='s3v4'),
    use_ssl=True,
    verify='/usr/local/share/ca-certificates/selectel-root.crt'
)
```

## Решение 2: Временно отключить проверку SSL (только для настройки!)

⚠️ **ВНИМАНИЕ**: Это небезопасно! Используйте только для первоначальной настройки CORS.

### Для AWS CLI

```bash
# Используйте флаг --no-verify-ssl (не рекомендуется!)
aws s3api put-bucket-cors \
  --bucket birdmaid-s3 \
  --cors-configuration file:///tmp/cors.json \
  --endpoint-url https://s3.ru-3.storage.selcloud.ru \
  --region ru-3 \
  --no-verify-ssl \
  --profile selectel
```

### Для Python/boto3

```python
import boto3
from botocore.client import Config
import ssl

# Создайте небезопасный SSL контекст (только для настройки!)
ssl_context = ssl.create_default_context()
ssl_context.check_hostname = False
ssl_context.verify_mode = ssl.CERT_NONE

s3_client = boto3.client(
    's3',
    endpoint_url='https://s3.ru-3.storage.selcloud.ru',
    aws_access_key_id=ACCESS_KEY,
    aws_secret_access_key=SECRET_KEY,
    region_name='ru-3',
    config=Config(signature_version='s3v4')
)

# Отключите проверку SSL (только для настройки!)
import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
```

## Решение 3: Использовать переменные окружения с отключенной проверкой SSL

```bash
# Установите переменные окружения
export AWS_ACCESS_KEY_ID="ваш_access_key_id"
export AWS_SECRET_ACCESS_KEY="ваш_secret_access_key"
export AWS_DEFAULT_REGION="ru-3"
export AWS_CA_BUNDLE="/usr/local/share/ca-certificates/selectel-root.crt"

# Или временно отключите проверку (НЕ для продакшена!)
export PYTHONHTTPSVERIFY=0  # Только для Python скриптов!

# Примените CORS
aws s3api put-bucket-cors \
  --bucket birdmaid-s3 \
  --cors-configuration file:///tmp/cors.json \
  --endpoint-url https://s3.ru-3.storage.selcloud.ru \
  --region ru-3 \
  --no-verify-ssl
```

## Рекомендуемый порядок действий

1. **Установите сертификат Selectel** (Решение 1)
2. **Настройте CORS** с использованием сертификата
3. **Проверьте**, что CORS работает
4. **Убедитесь**, что проверка SSL включена в продакшене

## Проверка после установки сертификата

```bash
# Проверьте подключение к S3
curl -v https://s3.ru-3.storage.selcloud.ru/birdmaid-s3

# Должно показать успешное SSL handshake без ошибок
```

## Для приложения Birdmaid

После установки сертификата в системе, Node.js (backend) должен автоматически использовать его. Если проблемы остаются, можно указать путь к сертификату через переменную окружения:

```bash
# В .env.prod или docker-compose.prod.yml
NODE_EXTRA_CA_CERTS=/usr/local/share/ca-certificates/selectel-root.crt
```
