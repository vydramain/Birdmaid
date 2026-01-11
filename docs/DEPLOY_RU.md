# Инструкция по развертыванию Birdmaid на Debian 12

> **Быстрый старт**: Если у вас уже настроен сервер с Docker, переходите к [Шагу 4: Развертывание приложения](#шаг-4-развертывание-приложения)

## Содержание

1. [Подготовка сервера](#шаг-1-подготовка-сервера)
2. [Настройка DNS](#шаг-2-настройка-dns-если-есть-домен)
3. [Настройка S3](#шаг-3-настройка-s3)
4. [Развертывание приложения](#шаг-4-развертывание-приложения)
5. [Настройка без домена](#шаг-5-настройка-без-домена-только-ip)
6. [Настройка бэкапов](#шаг-6-настройка-бэкапов)
7. [Мониторинг](#шаг-7-мониторинг-и-обслуживание)
8. [Обновление приложения](#шаг-8-обновление-приложения)
9. [Безопасность](#безопасность)
10. [Возможные проблемы](#возможные-проблемы)

## Системные требования

- **ОС**: Debian 12 (Bookworm) 64-bit
- **Минимальные ресурсы**: 1 vCPU, 2 GB RAM, 30 GB SSD
- **Рекомендуемые ресурсы**: 2 vCPU, 4 GB RAM, 40 GB SSD
- **Программное обеспечение**:
  - Docker Engine 24.0+ (установится автоматически)
  - Docker Compose v2.20+ (установится автоматически)
  - Git (для клонирования репозитория)
  - UFW (файрвол, установится автоматически)

## Особенности Debian 12

Debian 12 (Bookworm) включает:
- Python 3.11 по умолчанию
- systemd как init система
- AppArmor для безопасности (опционально)
- Поддержка современных версий Docker и Docker Compose

**Примечание**: Все команды в этой инструкции протестированы на Debian 12. Для других версий Debian могут потребоваться небольшие изменения.

## Пример конфигурации

**ВАЖНО**: Замените все значения ниже на ваши реальные данные!

- **Сервер**: Debian 12, 1 vCPU, 2 GB RAM, 30 GB SSD
- **IP**: `YOUR_SERVER_IP` (например, `192.168.1.100` или ваш публичный IP)
- **S3 Bucket**: `your-bucket-name` (например, `my-birdmaid-bucket`)
- **S3 Endpoint**: `https://s3.YOUR_REGION.storage.selcloud.ru` (например, `https://s3.ru-3.storage.selcloud.ru`)
- **S3 Region**: `YOUR_REGION` (например, `ru-3`)
- **S3 Port**: 443

## Шаг 1: Подготовка сервера

### 1.1 Подключение к серверу

```bash
ssh root@YOUR_SERVER_IP
# или если используете пользователя:
ssh your_user@YOUR_SERVER_IP

# Пример:
# ssh root@192.168.1.100
# ssh deploy@example.com
```

### 1.2 Обновление системы

```bash
# Обновить список пакетов
apt update

# Обновить систему до последних версий
apt upgrade -y

# Установить базовые утилиты для Debian 12
apt install -y \
    curl \
    wget \
    git \
    ufw \
    ca-certificates \
    gnupg \
    lsb-release \
    apt-transport-https \
    software-properties-common

# Проверить версию системы
lsb_release -a
# Должно показать: Debian GNU/Linux 12 (bookworm)
```

### 1.3 Установка Docker и Docker Compose

```bash
# Установка Docker (официальный скрипт для Debian)
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Если используете не-root пользователя, добавьте его в группу docker
# (пропустите, если работаете от root)
usermod -aG docker $USER

# Установка Docker Compose v2 (плагин)
apt install -y docker-compose-plugin

# Включить Docker в автозагрузку
systemctl enable docker
systemctl start docker

# Проверка установки
docker --version
# Ожидается: Docker version 24.0+ или выше

docker compose version
# Ожидается: Docker Compose version v2.20+ или выше

# Проверка работы Docker
docker run --rm hello-world

# ВАЖНО: Если вы добавили пользователя в группу docker,
# выйдите и войдите снова, чтобы изменения вступили в силу
# Или выполните: newgrp docker
```

**Примечания**:
- Если вы используете root, команды `usermod` и `newgrp` не нужны
- Docker Compose v2 работает как плагин: используйте `docker compose` (не `docker-compose`)
- На Debian 12 Docker устанавливается из официального репозитория
- Docker автоматически запускается при загрузке системы (systemd)

**Проверка после установки**:
```bash
# Проверить статус Docker
systemctl status docker

# Проверить версию системы
cat /etc/os-release | grep VERSION
# Должно быть: VERSION="12 (bookworm)"

# Проверить, что Docker работает
docker info | head -20
```

### 1.4 Настройка файрвола (UFW)

```bash
# Установить политики по умолчанию
ufw default deny incoming
ufw default allow outgoing

# Разрешить SSH (ВАЖНО: сделать первым, чтобы не потерять доступ!)
ufw allow 22/tcp comment 'SSH'

# Разрешить HTTP и HTTPS
ufw allow 80/tcp comment 'HTTP'
ufw allow 443/tcp comment 'HTTPS'

# Разрешить исходящий трафик для обновлений и Docker
ufw allow out 53 comment 'DNS'
ufw allow out 123/udp comment 'NTP'
ufw allow out 80/tcp comment 'HTTP out'
ufw allow out 443/tcp comment 'HTTPS out'

# Показать правила перед включением
ufw status verbose

# Включить файрвол (будет запрошено подтверждение)
ufw enable

# Проверить статус
ufw status verbose
```

**ВАЖНО**: Убедитесь, что SSH доступ работает перед включением файрвола!

### 1.5 Настройка swap (рекомендуется для 2GB RAM)

Для серверов с ограниченной памятью рекомендуется настроить swap:

```bash
# Создать swap файл 2GB
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile

# Сделать постоянным
echo '/swapfile none swap sw 0 0' >> /etc/fstab

# Проверить
free -h

# Проверить, что swap активен
swapon --show
```

### 1.6 Базовое усиление безопасности (рекомендуется)

После установки Docker, но перед развертыванием приложения, рекомендуется запустить скрипт усиления безопасности:

```bash
# Клонировать репозиторий (если еще не клонировали)
mkdir -p /opt/birdmaid
cd /opt/birdmaid
git clone https://github.com/vydramain/Birdmaid.git .

# Запустить скрипт безопасности
sudo bash scripts/harden-server.sh
```

**ВАЖНО**: 
- Скрипт настроит SSH, Fail2ban, автоматические обновления и другие меры безопасности
- Перед запуском убедитесь, что у вас есть SSH доступ и пользователь с sudo правами
- После настройки SSH может потребоваться перезапуск - **откройте второй терминал перед перезапуском SSH!**
- Скрипт создаст резервные копии всех изменяемых файлов

**Что настроит скрипт**:
- SSH hardening (отключение root, современные алгоритмы)
- Fail2ban (защита от брутфорс атак)
- Автоматические обновления безопасности
- UFW файрвол (дополнительные правила)
- Требования к паролям
- NTP синхронизацию времени
- Мониторинг логов (logwatch)

Подробнее см. `docs/SECURITY.md`.

## Шаг 2: Настройка DNS (если есть домен)

Если у вас есть домен (например, `birdmaid.ru` или `birdmaid.example.com`):

1. В панели управления DNS вашего домена создайте A-записи:
   - `birdmaid` → `YOUR_SERVER_IP`
   - `api.birdmaid` → `YOUR_SERVER_IP`
   
   **Пример**:
   - `birdmaid` → `192.168.1.100`
   - `api.birdmaid` → `192.168.1.100`

2. Подождите распространения DNS (обычно 5-15 минут)

**Если домена нет**, можно использовать IP напрямую, но TLS не будет работать автоматически. В этом случае нужно будет настроить Caddy вручную или использовать самоподписанный сертификат.

**ВАЖНО**: Замените `YOUR_SERVER_IP` на реальный IP вашего сервера во всех командах ниже!

## Шаг 3: Настройка S3

### 3.1 Получение ключей доступа

1. В панели Selectel перейдите в раздел S3-ключей
2. Создайте новый ключ доступа (если еще не создан)
3. Сохраните:
   - **Access Key ID**
   - **Secret Access Key**

### 3.2 Настройка CORS для bucket

Вам нужно настроить CORS для вашего S3 bucket (например, `my-birdmaid-bucket`), чтобы фронтенд мог загружать файлы.

**Вариант 1: Через AWS CLI (если установлен)**

```bash
# Создайте файл cors.json
cat > /tmp/cors.json << 'EOF'
{
  "CORSRules": [
    {
      "AllowedOrigins": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST", "HEAD"],
      "AllowedHeaders": ["*"],
      "ExposedHeaders": ["ETag"],
      "MaxAgeSeconds": 3600
    }
  ]
}
EOF

# Примените CORS (замените YOUR_BUCKET_NAME, YOUR_REGION, YOUR_ACCESS_KEY и YOUR_SECRET_KEY)
aws s3api put-bucket-cors \
  --bucket YOUR_BUCKET_NAME \
  --cors-configuration file:///tmp/cors.json \
  --endpoint-url https://s3.YOUR_REGION.storage.selcloud.ru \
  --region YOUR_REGION \
  --profile YOUR_PROFILE_NAME

# Пример для Selectel:
# aws s3api put-bucket-cors \
#   --bucket your-bucket-name \
#   --cors-configuration file:///tmp/cors.json \
#   --endpoint-url https://s3.ru-3.storage.selcloud.ru \
#   --region ru-3 \
#   --profile selectel
```

**Вариант 2: Через панель Selectel**

Если в панели есть настройки CORS, используйте:
- **Allowed Origins**: `*` (или конкретный домен, если есть)
- **Allowed Methods**: `GET, PUT, POST, HEAD`
- **Allowed Headers**: `*`
- **Exposed Headers**: `ETag`
- **Max Age**: `3600`

## Шаг 4: Развертывание приложения

### 4.1 Клонирование репозитория

```bash
# Создать директорию (если еще не создана)
sudo mkdir -p /opt/birdmaid
sudo chown $USER:$USER /opt/birdmaid
cd /opt/birdmaid

# Клонировать репозиторий
git clone https://github.com/vydramain/Birdmaid.git .

# Или если репозиторий приватный, используйте SSH:
# git clone git@github.com:vydramain/Birdmaid.git .
```

### 4.2 Настройка переменных окружения

```bash
# Скопировать пример
cp env.prod.example .env.prod

# Отредактировать
nano .env.prod
```

**Заполните `.env.prod` следующими значениями:**

```bash
# Домен (если есть, иначе используйте IP)
DOMAIN=your-domain.com
# ИЛИ если домена нет, используйте IP (но TLS не будет работать):
# DOMAIN=YOUR_SERVER_IP

# MongoDB (не менять)
MONGO_URI=mongodb://mongo:27017/birdmaid

# JWT Secret (сгенерировать: openssl rand -base64 32)
JWT_SECRET=<сгенерируйте_сильный_секрет>

# URLs (замените your-domain.com на ваш домен или IP)
APP_BASE_URL=https://api.birdmaid.your-domain.com
# ИЛИ если домена нет:
# APP_BASE_URL=http://YOUR_SERVER_IP:3000

CORS_ORIGIN=https://birdmaid.your-domain.com
# ИЛИ если домена нет:
# CORS_ORIGIN=http://YOUR_SERVER_IP

VITE_API_BASE_URL=https://api.birdmaid.your-domain.com
# ИЛИ если домена нет:
# VITE_API_BASE_URL=http://YOUR_SERVER_IP:3000

# S3 Configuration (Selectel или другой S3-совместимый сервис)
# ⚠️ ВАЖНО: Замените все значения на ваши реальные данные из панели управления!
S3_ENDPOINT=https://s3.YOUR_REGION.storage.selcloud.ru
S3_REGION=YOUR_REGION
S3_ACCESS_KEY_ID=<ваш_access_key_id_из_панели>
S3_SECRET_ACCESS_KEY=<ваш_secret_access_key_из_панели>
S3_BUCKET_ASSETS=your-bucket-name
S3_PUBLIC_BASE_URL=https://s3.YOUR_REGION.storage.selcloud.ru
S3_FORCE_PATH_STYLE=true

# Пример для Selectel (замените на ваши реальные значения!):
# S3_ENDPOINT=https://s3.ru-3.storage.selcloud.ru
# S3_REGION=ru-3
# S3_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
# S3_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
# S3_BUCKET_ASSETS=my-birdmaid-bucket

# SMTP (опционально, если нужна восстановление пароля)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=noreply@birdmaid.your-domain.com
```

**Важно**: Если домена нет, Caddy не сможет автоматически получить TLS сертификат. В этом случае нужно будет либо:
1. Использовать самоподписанный сертификат
2. Или настроить Caddy вручную для работы без TLS (не рекомендуется для продакшена)

### 4.3 Генерация JWT Secret

```bash
openssl rand -base64 32
```

Скопируйте результат в `JWT_SECRET` в `.env.prod`.

### 4.4 Сборка и запуск

```bash
# Проверить конфигурацию перед запуском
docker compose -f docker-compose.prod.yml config

# Сборка образов (может занять несколько минут)
docker compose -f docker-compose.prod.yml build

# Запуск сервисов
docker compose -f docker-compose.prod.yml up -d

# Проверка статуса всех сервисов
docker compose -f docker-compose.prod.yml ps

# Просмотр логов (Ctrl+C для выхода)
docker compose -f docker-compose.prod.yml logs -f

# Просмотр логов конкретного сервиса
docker compose -f docker-compose.prod.yml logs -f back
docker compose -f docker-compose.prod.yml logs -f front
docker compose -f docker-compose.prod.yml logs -f caddy
docker compose -f docker-compose.prod.yml logs -f mongo
```

**Примечание**: Первый запуск может занять время из-за:
- Скачивания базовых образов (MongoDB, Caddy)
- Сборки образов приложения
- Генерации TLS сертификатов (если есть домен)

### 4.5 Проверка работы

```bash
# Подождать несколько секунд для запуска всех сервисов
sleep 10

# Проверка health endpoint backend (через Docker network)
docker compose -f docker-compose.prod.yml exec back curl http://localhost:3000/health
# Должно вернуть: {"status":"ok"}

# Проверка через reverse proxy (если есть домен)
curl https://api.birdmaid.your-domain.com/health

# Проверка фронтенда
curl -I http://localhost
# Или если есть домен:
curl -I https://birdmaid.your-domain.com

# Проверка заголовков безопасности
curl -I https://birdmaid.your-domain.com | grep -i "x-frame-options\|x-content-type-options\|content-security-policy"

# Проверка TLS сертификата (если есть домен)
openssl s_client -connect birdmaid.your-domain.com:443 -servername birdmaid.your-domain.com < /dev/null
```

**Ожидаемые результаты**:
- Health endpoint возвращает `{"status":"ok"}`
- Фронтенд отвечает с кодом 200
- TLS сертификат валиден (если есть домен)
- Заголовки безопасности присутствуют

## Шаг 5: Настройка без домена (только IP)

Если у вас нет домена, нужно изменить конфигурацию:

### 5.1 Изменить Caddyfile

```bash
nano Caddyfile
```

Замените содержимое на:

```
# Frontend (IP-based, без TLS)
:80 {
    reverse_proxy front:80 {
        header_up Host {host}
        header_up X-Real-IP {remote_host}
        header_up X-Forwarded-For {remote_host}
        header_up X-Forwarded-Proto http
    }
    
    encode gzip zstd
    
    header {
        X-Frame-Options "SAMEORIGIN"
        X-Content-Type-Options "nosniff"
    }
    
    log {
        output stdout
        format console
    }
}

# Backend API (IP-based, без TLS)
:3000 {
    reverse_proxy back:3000 {
        header_up Host {host}
        header_up X-Real-IP {remote_host}
        header_up X-Forwarded-For {remote_host}
        header_up X-Forwarded-Proto http
    }
    
    encode gzip
    
    header {
        Access-Control-Allow-Origin "*"
        Access-Control-Allow-Methods "GET, POST, PATCH, DELETE, PUT, OPTIONS, HEAD"
        Access-Control-Allow-Headers "Content-Type, Authorization, Accept, Origin, X-Requested-With"
        Access-Control-Allow-Credentials "true"
    }
    
    log {
        output stdout
        format console
    }
}
```

### 5.2 Изменить docker-compose.prod.yml

```bash
nano docker-compose.prod.yml
```

В секции `caddy`, измените ports на:

```yaml
ports:
  - "80:80"
  - "3000:3000"
```

И уберите переменную `DOMAIN` из environment секции caddy.

### 5.3 Обновить .env.prod

```bash
# Замените YOUR_SERVER_IP на реальный IP вашего сервера
APP_BASE_URL=http://YOUR_SERVER_IP:3000
CORS_ORIGIN=http://YOUR_SERVER_IP
VITE_API_BASE_URL=http://YOUR_SERVER_IP:3000

# Пример:
# APP_BASE_URL=http://192.168.1.100:3000
# CORS_ORIGIN=http://192.168.1.100
# VITE_API_BASE_URL=http://192.168.1.100:3000
```

## Шаг 6: Настройка бэкапов

### 6.1 Создание cron задачи для бэкапов

```bash
# Открыть crontab
crontab -e

# Добавить строку (бэкап каждый день в 3:00)
0 3 * * * /opt/birdmaid/scripts/backup_mongo.sh >> /var/log/birdmaid-backup.log 2>&1
```

## Шаг 7: Мониторинг и обслуживание

### Просмотр логов

```bash
# Все сервисы (последние 100 строк)
docker compose -f docker-compose.prod.yml logs --tail=100

# Все сервисы (в реальном времени, Ctrl+C для выхода)
docker compose -f docker-compose.prod.yml logs -f

# Конкретный сервис
docker compose -f docker-compose.prod.yml logs -f back
docker compose -f docker-compose.prod.yml logs -f front
docker compose -f docker-compose.prod.yml logs -f mongo
docker compose -f docker-compose.prod.yml logs -f caddy

# Логи за определенный период
docker compose -f docker-compose.prod.yml logs --since 1h
docker compose -f docker-compose.prod.yml logs --since 2024-01-11T10:00:00

# Логи с временными метками
docker compose -f docker-compose.prod.yml logs -t
```

### Проверка статуса сервисов

```bash
# Статус всех сервисов
docker compose -f docker-compose.prod.yml ps

# Детальная информация о сервисе
docker inspect birdmaid-back
docker inspect birdmaid-front
docker inspect birdmaid-mongo
docker inspect birdmaid-caddy

# Health checks
docker inspect birdmaid-back | jq '.[0].State.Health'
docker inspect birdmaid-mongo | jq '.[0].State.Health'
```

### Проверка использования ресурсов

```bash
# Использование диска
df -h
./scripts/check_disk.sh

# Использование памяти
free -h
docker stats --no-stream

# Использование Docker
docker system df
docker system df -v

# Размер volumes
docker volume ls
docker volume inspect birdmaid-mongo-data
```

### Очистка системы

```bash
# Очистить неиспользуемые образы
docker image prune -f

# Очистить неиспользуемые volumes (ОСТОРОЖНО!)
docker volume prune -f

# Полная очистка (удалит все неиспользуемое)
docker system prune -a --volumes

# Очистить старые логи Docker
journalctl --vacuum-time=7d
```

### Мониторинг в реальном времени

```bash
# Использование ресурсов контейнерами
watch -n 2 'docker stats --no-stream'

# Использование диска
watch -n 5 'df -h'

# Использование памяти
watch -n 5 'free -h'

# Статус сервисов
watch -n 5 'docker compose -f docker-compose.prod.yml ps'
```

## Шаг 8: Обновление приложения

### Автоматическое обновление (рекомендуется)

```bash
cd /opt/birdmaid

# Использовать автоматический скрипт
./scripts/deploy.sh --build

# Скрипт выполнит:
# 1. git pull (обновление кода)
# 2. docker compose pull (обновление образов)
# 3. docker compose build (пересборка при необходимости)
# 4. docker compose up -d (перезапуск сервисов)
# 5. docker image prune (очистка старых образов)
```

### Ручное обновление

```bash
cd /opt/birdmaid

# Обновить код
git pull

# Обновить базовые образы (MongoDB, Caddy)
docker compose -f docker-compose.prod.yml pull

# Пересобрать образы приложения (если код изменился)
docker compose -f docker-compose.prod.yml build

# Перезапустить сервисы
docker compose -f docker-compose.prod.yml up -d

# Очистить старые образы (освободить место)
docker image prune -f

# Проверить статус
docker compose -f docker-compose.prod.yml ps
```

### Обновление с проверкой

```bash
cd /opt/birdmaid

# Создать резервную копию текущей версии
git tag backup-$(date +%Y%m%d-%H%M%S)

# Обновить
git pull

# Проверить изменения
git log HEAD..origin/main --oneline

# Если все хорошо, продолжить обновление
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d

# Проверить работоспособность
curl https://api.birdmaid.your-domain.com/health
```

## Безопасность

### Заголовки безопасности

Birdmaid использует Caddy с настроенными заголовками безопасности:
- `X-Frame-Options: SAMEORIGIN` - защита от clickjacking
- `X-Content-Type-Options: nosniff` - предотвращение MIME-sniffing
- `X-XSS-Protection: 1; mode=block` - защита от XSS
- `Content-Security-Policy` - контроль загружаемых ресурсов
- `Permissions-Policy` - ограничение функций браузера
- `Referrer-Policy` - контроль referrer информации

Подробнее см. `docs/SECURITY_HEADERS.md`.

### Усиление безопасности сервера

После развертывания рекомендуется выполнить базовое усиление безопасности:

```bash
cd /opt/birdmaid
sudo bash scripts/harden-server.sh
```

Этот скрипт настроит:
- SSH hardening (отключение root, современные алгоритмы)
- Fail2ban (защита от брутфорс атак)
- Автоматические обновления безопасности
- Дополнительные правила UFW файрвола
- Требования к паролям
- NTP синхронизацию времени
- Мониторинг логов (logwatch)

**ВАЖНО**: Запускайте скрипт безопасности после проверки работоспособности приложения!

Подробное руководство по безопасности: `docs/SECURITY.md`

## Возможные проблемы

### Проблема: Caddy не может получить TLS сертификат

**Симптомы**: В логах Caddy ошибки типа "certificate management error" или "acme: error"

**Решение**: 
```bash
# Проверьте DNS записи
dig birdmaid.your-domain.com
dig api.birdmaid.your-domain.com

# Убедитесь, что порты 80 и 443 открыты
sudo ufw status | grep -E "(80|443)"
sudo ss -tulpn | grep -E ':(80|443)'

# Проверьте логи Caddy
docker compose -f docker-compose.prod.yml logs caddy | grep -i "acme\|certificate\|error"

# Проверьте доступность портов извне
# С другого компьютера:
curl -I http://your-domain.com
curl -I http://api.your-domain.com

# Если порты закрыты, откройте их:
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

**Примечание**: Let's Encrypt требует доступ к порту 80 для проверки домена.

### Проблема: Backend не может подключиться к MongoDB

**Симптомы**: В логах backend ошибки типа "MongoNetworkError" или "ECONNREFUSED"

**Решение**:
```bash
# Проверьте статус MongoDB
docker compose -f docker-compose.prod.yml ps mongo

# Проверьте логи MongoDB
docker compose -f docker-compose.prod.yml logs mongo | tail -50

# Проверьте health check MongoDB
docker inspect birdmaid-mongo | grep -A 10 Health

# Проверьте подключение из backend
docker compose -f docker-compose.prod.yml exec back sh -c \
  "node -e \"const {MongoClient}=require('mongodb'); \
   MongoClient.connect(process.env.MONGO_URL || 'mongodb://mongo:27017/birdmaid').then(()=>console.log('OK')).catch(e=>console.error(e))\""

# Проверьте переменные окружения
docker compose -f docker-compose.prod.yml exec back env | grep MONGO

# Проверьте сеть Docker
docker network inspect birdmaid-network | grep -A 5 mongo
```

### Проблема: S3 загрузки не работают

**Симптомы**: Ошибки при загрузке файлов, ошибки "Access Denied" или "Invalid credentials"

**Решение**:
```bash
# Проверьте логи backend
docker compose -f docker-compose.prod.yml logs back | grep -i s3

# Проверьте переменные окружения
docker compose -f docker-compose.prod.yml exec back env | grep S3_

# Проверьте формат переменных в .env.prod (НЕ показывайте секреты!)
cat .env.prod | grep S3_ | sed 's/=.*/=***HIDDEN***/'

# Убедитесь, что CORS настроен правильно в S3 bucket
# Проверьте через AWS CLI (если установлен, замените YOUR_BUCKET_NAME и YOUR_REGION):
aws s3api get-bucket-cors --bucket YOUR_BUCKET_NAME \
  --endpoint-url https://s3.YOUR_REGION.storage.selcloud.ru \
  --region YOUR_REGION

# Проверьте доступность S3 endpoint (замените YOUR_REGION)
curl -I https://s3.YOUR_REGION.storage.selcloud.ru

# Проверьте права доступа к ключам S3 в панели управления вашего провайдера
```

**Частые причины**:
- Неправильные `S3_ACCESS_KEY_ID` или `S3_SECRET_ACCESS_KEY`
- Неправильный `S3_ENDPOINT` или `S3_REGION`
- CORS не настроен для bucket
- Bucket не существует или имя неправильное

### Проблема: Недостаточно памяти

**Симптомы**: Контейнеры падают, ошибки "OOM" (Out Of Memory)

**Решение**:
```bash
# Проверьте использование памяти
free -h

# Проверьте swap
swapon --show

# Если swap не настроен, настройте его (см. Шаг 1.5)

# Проверьте использование памяти контейнерами
docker stats --no-stream

# Проверьте логи на ошибки памяти
docker compose -f docker-compose.prod.yml logs | grep -i "oom\|memory\|killed"

# Очистите неиспользуемые Docker ресурсы
docker system prune -a --volumes

# Уменьшите лимиты в docker-compose.prod.yml если нужно
```

**Рекомендации**:
- Настройте swap минимум 2GB для серверов с 2GB RAM
- Регулярно очищайте Docker образы и volumes
- Мониторьте использование памяти: `watch -n 5 free -h`

## Чеклист развертывания

Перед запуском в продакшн убедитесь, что выполнено:

- [ ] Система обновлена (`apt update && apt upgrade`)
- [ ] Docker и Docker Compose установлены и работают
- [ ] UFW файрвол настроен и включен
- [ ] Swap настроен (для серверов с 2GB RAM)
- [ ] DNS записи настроены (если есть домен)
- [ ] S3 bucket создан и CORS настроен
- [ ] `.env.prod` заполнен всеми необходимыми переменными
- [ ] JWT_SECRET сгенерирован (сильная случайная строка)
- [ ] Все сервисы запускаются успешно
- [ ] Health endpoint отвечает (`/health`)
- [ ] TLS сертификат получен (если есть домен)
- [ ] Фронтенд загружается корректно
- [ ] Backend API отвечает
- [ ] Загрузка файлов работает (covers/builds)
- [ ] Скрипт бэкапа MongoDB протестирован
- [ ] Ротация логов работает (проверьте размеры логов)
- [ ] Безопасность сервера усилена (`scripts/harden-server.sh`)

## Полезные команды

```bash
# Быстрый статус всех сервисов
docker compose -f docker-compose.prod.yml ps

# Просмотр использования ресурсов
docker stats

# Проверка дискового пространства
df -h
docker system df

# Проверка открытых портов
sudo ss -tulpn | grep -E ':(80|443|22)'

# Проверка логов за последний час
docker compose -f docker-compose.prod.yml logs --since 1h

# Перезапуск всех сервисов
docker compose -f docker-compose.prod.yml restart

# Остановка всех сервисов
docker compose -f docker-compose.prod.yml down

# Остановка с удалением volumes (ОСТОРОЖНО: удалит данные!)
docker compose -f docker-compose.prod.yml down -v
```

## Контакты и поддержка

Если возникли проблемы:
1. Проверьте логи: `docker compose -f docker-compose.prod.yml logs`
2. Проверьте документацию: 
   - `docs/DEPLOY.md` (English)
   - `docs/SECURITY.md` (безопасность)
   - `docs/SECURITY_HEADERS.md` (заголовки безопасности)
3. Проверьте раздел "Возможные проблемы" выше
4. Создайте issue в репозитории: https://github.com/vydramain/Birdmaid/issues
