# Решение проблемы SSL с AWS CLI для Selectel S3

## Проблема

AWS CLI выдает ошибку:
```
SSL validation failed for https://s3.ru-3.storage.selcloud.ru/...
certificate verify failed: self signed certificate in certificate chain
```

Это происходит потому, что AWS CLI использует Python и его SSL библиотеку, которая может не использовать системные сертификаты автоматически.

## Решение 1: Указать путь к сертификату через переменную окружения (рекомендуется)

```bash
# 1. Убедитесь, что сертификат установлен
ls -la /usr/local/share/ca-certificates/selectel-root.crt

# Если файла нет, установите его:
mkdir -p /usr/local/share/ca-certificates
wget https://secure.globalsign.net/cacert/root-r6.crt -O /tmp/root-r6.crt
openssl x509 -inform der -in /tmp/root-r6.crt -out /usr/local/share/ca-certificates/selectel-root.crt
update-ca-certificates
rm /tmp/root-r6.crt

# 2. Установите переменные окружения для AWS CLI
export AWS_CA_BUNDLE=/usr/local/share/ca-certificates/selectel-root.crt
export REQUESTS_CA_BUNDLE=/usr/local/share/ca-certificates/selectel-root.crt
export SSL_CERT_FILE=/usr/local/share/ca-certificates/selectel-root.crt

# 3. Теперь AWS CLI должен работать
aws s3api put-bucket-cors \
  --bucket birdmaid-s3 \
  --cors-configuration file:///tmp/cors.json \
  --endpoint-url https://s3.ru-3.storage.selcloud.ru \
  --region ru-3
```

## Решение 2: Использовать Python скрипт (более надежно)

```bash
# Установите Python и boto3 (если еще не установлены)
apt install -y python3 python3-pip
pip3 install boto3

# Создайте скрипт
cat > /tmp/setup_cors.py << 'PYEOF'
import boto3
from botocore.client import Config
import os

ACCESS_KEY = 'YOUR_ACCESS_KEY_ID'  # Замените на ваш ключ
SECRET_KEY = 'YOUR_SECRET_ACCESS_KEY'  # Замените на ваш секретный ключ
BUCKET_NAME = 'birdmaid-s3'
ENDPOINT_URL = 'https://s3.ru-3.storage.selcloud.ru'
REGION = 'ru-3'

# Определение пути к сертификату
CA_SELECTEL = '/usr/local/share/ca-certificates/selectel-root.crt'
CA_BUNDLE = '/etc/ssl/certs/ca-certificates.crt'

if os.path.exists(CA_SELECTEL):
    verify_cert = CA_SELECTEL
elif os.path.exists(CA_BUNDLE):
    verify_cert = CA_BUNDLE
else:
    verify_cert = True

s3_client = boto3.client(
    's3',
    endpoint_url=ENDPOINT_URL,
    aws_access_key_id=ACCESS_KEY,
    aws_secret_access_key=SECRET_KEY,
    region_name=REGION,
    config=Config(signature_version='s3v4'),
    verify=verify_cert
)

cors_config = {
    'CORSRules': [
        {
            'AllowedOrigins': ['*'],
            'AllowedMethods': ['GET', 'PUT', 'POST', 'HEAD'],
            'AllowedHeaders': ['*'],
            'ExposeHeaders': ['ETag'],
            'MaxAgeSeconds': 3600
        }
    ]
}

try:
    s3_client.put_bucket_cors(Bucket=BUCKET_NAME, CORSConfiguration=cors_config)
    print("✅ CORS настроен!")
    
    response = s3_client.get_bucket_cors(Bucket=BUCKET_NAME)
    import json
    print("\nТекущие настройки CORS:")
    print(json.dumps(response['CORSRules'], indent=2, ensure_ascii=False))
except Exception as e:
    print(f"❌ Ошибка: {e}")
    import traceback
    traceback.print_exc()
PYEOF

# Отредактируйте скрипт и замените YOUR_ACCESS_KEY_ID и YOUR_SECRET_ACCESS_KEY
nano /tmp/setup_cors.py

# Запустите скрипт
python3 /tmp/setup_cors.py
```

## Решение 3: Временное отключение проверки SSL (только для одноразовой настройки!)

⚠️ **ВНИМАНИЕ**: Это небезопасно! Используйте ТОЛЬКО для одноразовой настройки CORS, затем удалите переменную.

```bash
export PYTHONHTTPSVERIFY=0

aws s3api put-bucket-cors \
  --bucket birdmaid-s3 \
  --cors-configuration file:///tmp/cors.json \
  --endpoint-url https://s3.ru-3.storage.selcloud.ru \
  --region ru-3

# После успешной настройки удалите переменную
unset PYTHONHTTPSVERIFY
```

## ⚠️ КРИТИЧНО: Безопасность

Если вы показали свои реальные ключи доступа в команде или выводе терминала:

1. **Немедленно смените ключи доступа в панели Selectel:**
   - Войдите в панель Selectel
   - Перейдите в Object Storage → Управление S3-ключами
   - Удалите старые ключи и создайте новые

2. **Никогда не показывайте ключи в командах:**
   - Используйте переменные окружения: `export AWS_ACCESS_KEY_ID="..."` (но не показывайте вывод)
   - Или используйте профили AWS CLI: `aws configure --profile selectel`
   - Или редактируйте скрипты в редакторе, а не через `cat` с ключами

3. **Проверьте историю команд:**
   ```bash
   history | grep AWS
   # Удалите команды с ключами из истории
   ```

## Автоматический скрипт

Используйте готовый скрипт из репозитория:

```bash
./scripts/setup_s3_cors.sh
```

Он автоматически установит сертификат и настроит CORS через AWS CLI или Python.
