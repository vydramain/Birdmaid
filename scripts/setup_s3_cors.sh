#!/bin/bash
# Скрипт для настройки CORS для S3 bucket (Selectel)
# Использование: ./scripts/setup_s3_cors.sh

set -e

echo "=== Настройка CORS для S3 bucket ==="
echo ""

# Проверка наличия AWS CLI
if command -v aws &> /dev/null; then
    echo "✅ AWS CLI установлен"
    USE_AWS_CLI=true
else
    echo "⚠️  AWS CLI не установлен"
    echo ""
    echo "Выберите способ настройки CORS:"
    echo "  1) Установить AWS CLI и использовать его (рекомендуется)"
    echo "  2) Использовать Python с boto3"
    echo "  3) Настроить через панель Selectel вручную"
    echo ""
    read -p "Ваш выбор (1/2/3): " choice
    
    case $choice in
        1)
            echo ""
            echo "Установка AWS CLI..."
            cd /tmp
            curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" || {
                echo "Ошибка: не удалось скачать AWS CLI"
                exit 1
            }
            apt install -y unzip
            unzip -q awscliv2.zip
            ./aws/install
            rm -rf aws awscliv2.zip
            USE_AWS_CLI=true
            echo "✅ AWS CLI установлен"
            ;;
        2)
            USE_AWS_CLI=false
            USE_PYTHON=true
            ;;
        3)
            echo ""
            echo "Настройте CORS вручную через панель Selectel:"
            echo "  1. Войдите в панель Selectel"
            echo "  2. Перейдите в Object Storage → ваш bucket"
            echo "  3. Найдите раздел CORS"
            echo "  4. Используйте следующие настройки:"
            echo "     - Allowed Origins: *"
            echo "     - Allowed Methods: GET, PUT, POST, HEAD"
            echo "     - Allowed Headers: *"
            echo "     - Exposed Headers: ETag"
            echo "     - Max Age: 3600"
            exit 0
            ;;
        *)
            echo "Неверный выбор"
            exit 1
            ;;
    esac
fi

# Запрос параметров
echo ""
echo "Введите параметры S3:"
read -p "Bucket name: " BUCKET_NAME
read -p "Region (например, ru-3): " REGION
read -p "Access Key ID: " ACCESS_KEY
read -s -p "Secret Access Key: " SECRET_KEY
echo ""

ENDPOINT_URL="https://s3.${REGION}.storage.selcloud.ru"

# Создание CORS конфигурации
# ⚠️ ВАЖНО: Selectel использует "ExposeHeaders" (не "ExposedHeaders")!
CORS_JSON="/tmp/cors-${BUCKET_NAME}.json"
cat > "$CORS_JSON" << 'EOF'
{
  "CORSRules": [
    {
      "AllowedOrigins": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST", "HEAD"],
      "AllowedHeaders": ["*"],
      "ExposeHeaders": ["ETag"],
      "MaxAgeSeconds": 3600
    }
  ]
}
EOF

if [ "$USE_AWS_CLI" = true ]; then
    echo ""
    echo "Проверка SSL сертификата Selectel..."
    
    # Установка SSL сертификата, если еще не установлен
    CA_CERT="/usr/local/share/ca-certificates/selectel-root.crt"
    if [ ! -f "$CA_CERT" ]; then
        echo "Установка SSL сертификата GlobalSign Root R6..."
        mkdir -p /usr/local/share/ca-certificates
        wget -q https://secure.globalsign.net/cacert/root-r6.crt -O /tmp/root-r6.crt || {
            echo "⚠️  Не удалось скачать сертификат, продолжаем без него..."
        }
        if [ -f /tmp/root-r6.crt ]; then
            openssl x509 -inform der -in /tmp/root-r6.crt -out "$CA_CERT" 2>/dev/null || {
                echo "⚠️  Не удалось преобразовать сертификат, продолжаем..."
            }
            update-ca-certificates >/dev/null 2>&1
            rm -f /tmp/root-r6.crt
        fi
    fi
    
    # Установка переменной окружения для AWS CLI
    if [ -f "$CA_CERT" ]; then
        export AWS_CA_BUNDLE="$CA_CERT"
        export REQUESTS_CA_BUNDLE="$CA_CERT"
        export SSL_CERT_FILE="$CA_CERT"
        echo "✅ SSL сертификат настроен"
    else
        echo "⚠️  SSL сертификат не найден, AWS CLI может выдать ошибку SSL"
        echo "   Попробуйте установить сертификат вручную или используйте Python скрипт"
    fi
    
    echo ""
    echo "Настройка AWS CLI профиля..."
    
    # Создать временный профиль
    mkdir -p ~/.aws
    cat >> ~/.aws/credentials << EOF

[selectel-temp]
aws_access_key_id = ${ACCESS_KEY}
aws_secret_access_key = ${SECRET_KEY}
EOF
    
    cat >> ~/.aws/config << EOF

[profile selectel-temp]
region = ${REGION}
endpoint_url = ${ENDPOINT_URL}
EOF
    
    echo ""
    echo "Применение CORS конфигурации..."
    aws s3api put-bucket-cors \
        --bucket "$BUCKET_NAME" \
        --cors-configuration "file://${CORS_JSON}" \
        --endpoint-url "$ENDPOINT_URL" \
        --region "$REGION" \
        --profile selectel-temp || {
        echo "❌ Ошибка при применении CORS"
        echo ""
        echo "Если ошибка связана с SSL, попробуйте:"
        echo "  1. Установить сертификат вручную (см. docs/DEPLOY_RU.md)"
        echo "  2. Использовать Python скрипт (выберите вариант 2 при запуске этого скрипта)"
        echo "  3. Временно отключить проверку SSL: export PYTHONHTTPSVERIFY=0 (небезопасно!)"
        exit 1
    }
    
    echo "✅ CORS настроен!"
    echo ""
    echo "Проверка настроек CORS:"
    aws s3api get-bucket-cors \
        --bucket "$BUCKET_NAME" \
        --endpoint-url "$ENDPOINT_URL" \
        --region "$REGION" \
        --profile selectel-temp
    
    # Удалить временный профиль (опционально)
    read -p "Удалить временный профиль AWS CLI? (y/n): " remove_profile
    if [ "$remove_profile" = "y" ]; then
        sed -i '/\[selectel-temp\]/,/^$/d' ~/.aws/credentials
        sed -i '/\[profile selectel-temp\]/,/^$/d' ~/.aws/config
        echo "✅ Временный профиль удален"
    fi
    
elif [ "$USE_PYTHON" = true ]; then
    echo ""
    echo "Проверка Python и boto3..."
    
    if ! command -v python3 &> /dev/null; then
        echo "Установка Python3..."
        apt install -y python3 python3-pip
    fi
    
    if ! python3 -c "import boto3" 2>/dev/null; then
        echo "Установка boto3..."
        pip3 install boto3
    fi
    
    echo ""
    echo "Проверка SSL сертификата Selectel..."
    
    # Установка SSL сертификата, если еще не установлен
    CA_CERT="/usr/local/share/ca-certificates/selectel-root.crt"
    if [ ! -f "$CA_CERT" ]; then
        echo "Установка SSL сертификата GlobalSign Root R6..."
        mkdir -p /usr/local/share/ca-certificates
        wget -q https://secure.globalsign.net/cacert/root-r6.crt -O /tmp/root-r6.crt || {
            echo "⚠️  Не удалось скачать сертификат"
        }
        if [ -f /tmp/root-r6.crt ]; then
            openssl x509 -inform der -in /tmp/root-r6.crt -out "$CA_CERT" 2>/dev/null || {
                echo "⚠️  Не удалось преобразовать сертификат"
            }
            update-ca-certificates >/dev/null 2>&1
            rm -f /tmp/root-r6.crt
        fi
    fi
    
    echo ""
    echo "Применение CORS через Python..."
    
    python3 << PYEOF
import boto3
from botocore.client import Config
import os

# Определение пути к сертификату
CA_SELECTEL = '/usr/local/share/ca-certificates/selectel-root.crt'
CA_BUNDLE = '/etc/ssl/certs/ca-certificates.crt'

if os.path.exists(CA_SELECTEL):
    verify_cert = CA_SELECTEL
elif os.path.exists(CA_BUNDLE):
    verify_cert = CA_BUNDLE
else:
    verify_cert = True  # Использовать системные сертификаты

try:
    s3_client = boto3.client(
        's3',
        endpoint_url='${ENDPOINT_URL}',
        aws_access_key_id='${ACCESS_KEY}',
        aws_secret_access_key='${SECRET_KEY}',
        region_name='${REGION}',
        config=Config(signature_version='s3v4'),
        verify=verify_cert
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
        Bucket='${BUCKET_NAME}',
        CORSConfiguration=cors_config
    )
    
    print("✅ CORS настроен!")
    
    # Проверка
    response = s3_client.get_bucket_cors(Bucket='${BUCKET_NAME}')
    print("\nТекущие настройки CORS:")
    import json
    print(json.dumps(response['CORSRules'], indent=2))
    
except Exception as e:
    print(f"❌ Ошибка: {e}")
    exit(1)
PYEOF
fi

echo ""
echo "=== Готово ==="
echo "CORS настроен для bucket: ${BUCKET_NAME}"
