# Решение проблем с настройкой CORS для S3

## Проблема: "Unable to parse config file: /root/.aws/config"

Эта ошибка возникает, когда файл конфигурации AWS CLI имеет неправильный формат или поврежден.

### Решение 1: Проверить и исправить конфигурацию

```bash
# Проверьте содержимое файла конфигурации
cat ~/.aws/config

# Если файл поврежден или пустой, создайте его заново
mkdir -p ~/.aws
cat > ~/.aws/config << 'EOF'
[profile selectel]
region = ru-3
endpoint_url = https://s3.ru-3.storage.selcloud.ru
EOF

# Проверьте credentials файл
cat ~/.aws/credentials

# Если нужно, создайте/обновите credentials
cat > ~/.aws/credentials << EOF
[selectel]
aws_access_key_id = ВАШ_ACCESS_KEY_ID
aws_secret_access_key = ВАШ_SECRET_ACCESS_KEY
EOF

# Установите правильные права доступа
chmod 600 ~/.aws/credentials
chmod 600 ~/.aws/config
```

### Решение 2: Использовать переменные окружения вместо профиля

```bash
# Установите переменные окружения
export AWS_ACCESS_KEY_ID="ВАШ_ACCESS_KEY_ID"
export AWS_SECRET_ACCESS_KEY="ВАШ_SECRET_ACCESS_KEY"
export AWS_DEFAULT_REGION="ru-3"

# Примените CORS без использования профиля
aws s3api put-bucket-cors \
  --bucket birdmaid-s3 \
  --cors-configuration file:///tmp/cors.json \
  --endpoint-url https://s3.ru-3.storage.selcloud.ru \
  --region ru-3

# Проверьте
aws s3api get-bucket-cors \
  --bucket birdmaid-s3 \
  --endpoint-url https://s3.ru-3.storage.selcloud.ru \
  --region ru-3
```

### Решение 3: Использовать Python (если AWS CLI не работает)

```bash
# Установите Python и boto3
apt install -y python3 python3-pip
pip3 install boto3

# Создайте скрипт
cat > /tmp/setup_cors.py << 'PYEOF'
import boto3
from botocore.client import Config
import json

# ЗАМЕНИТЕ на ваши реальные значения!
ACCESS_KEY = 'ВАШ_ACCESS_KEY_ID'
SECRET_KEY = 'ВАШ_SECRET_ACCESS_KEY'
BUCKET_NAME = 'birdmaid-s3'
ENDPOINT_URL = 'https://s3.ru-3.storage.selcloud.ru'
REGION = 'ru-3'

try:
    s3_client = boto3.client(
        's3',
        endpoint_url=ENDPOINT_URL,
        aws_access_key_id=ACCESS_KEY,
        aws_secret_access_key=SECRET_KEY,
        region_name=REGION,
        config=Config(signature_version='s3v4')
    )
    
    cors_config = {
        'CORSRules': [
            {
                'AllowedOrigins': ['*'],
                'AllowedMethods': ['GET', 'PUT', 'POST', 'HEAD'],
                'AllowedHeaders': ['*'],
                'ExposeHeaders': ['ETag'],  # ⚠️ Selectel использует ExposeHeaders (не ExposedHeaders)
                'MaxAgeSeconds': 3600
            }
        ]
    }
    
    s3_client.put_bucket_cors(
        Bucket=BUCKET_NAME,
        CORSConfiguration=cors_config
    )
    
    print("✅ CORS успешно настроен!")
    
    # Проверка
    response = s3_client.get_bucket_cors(Bucket=BUCKET_NAME)
    print("\nТекущие настройки CORS:")
    print(json.dumps(response['CORSRules'], indent=2, ensure_ascii=False))
    
except Exception as e:
    print(f"❌ Ошибка: {e}")
    import traceback
    traceback.print_exc()
    exit(1)
PYEOF

# Отредактируйте скрипт и замените ключи
nano /tmp/setup_cors.py

# Запустите
python3 /tmp/setup_cors.py
```

### Решение 4: Использовать готовый скрипт из репозитория

```bash
cd /opt/birdmaid
./scripts/setup_s3_cors.sh
```

## Проверка настройки CORS

После настройки CORS проверьте, что он работает:

```bash
# Через AWS CLI
aws s3api get-bucket-cors \
  --bucket birdmaid-s3 \
  --endpoint-url https://s3.ru-3.storage.selcloud.ru \
  --region ru-3

# Или через curl (если bucket публичный)
curl -I -X OPTIONS \
  -H "Origin: https://birdmaid.your-domain.com" \
  -H "Access-Control-Request-Method: PUT" \
  https://s3.ru-3.storage.selcloud.ru/birdmaid-s3/
```

## Частые ошибки

### Ошибка: "Access Denied"
- Проверьте правильность Access Key и Secret Key
- Убедитесь, что у ключей есть права на изменение CORS

### Ошибка: "NoSuchBucket"
- Проверьте правильность имени bucket
- Убедитесь, что bucket существует в указанном регионе

### Ошибка: "Invalid endpoint"
- Проверьте правильность endpoint URL
- Убедитесь, что регион указан правильно
