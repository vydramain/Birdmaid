# Решение проблемы "variable is not set" в Docker Compose

## Проблема

При запуске `docker compose -f docker-compose.prod.yml config` вы видите предупреждения:
```
WARN[0000] The "DOMAIN" variable is not set. Defaulting to a blank string.
WARN[0000] The "S3_ENDPOINT" variable is not set. Defaulting to a blank string.
...
```

Это означает, что Docker Compose не читает файл `.env.prod`.

## Решение

### Вариант 1: Использовать флаг `--env-file` (рекомендуется)

```bash
# Всегда указывайте --env-file .env.prod при работе с docker-compose.prod.yml
docker compose -f docker-compose.prod.yml --env-file .env.prod config
docker compose -f docker-compose.prod.yml --env-file .env.prod build
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d
docker compose -f docker-compose.prod.yml --env-file .env.prod ps
docker compose -f docker-compose.prod.yml --env-file .env.prod logs -f
```

### Вариант 2: Использовать автоматический скрипт

Скрипт `scripts/deploy.sh` автоматически использует `.env.prod`:

```bash
cd /opt/birdmaid
./scripts/deploy.sh --build
```

### Вариант 3: Проверить расположение файла

Убедитесь, что файл `.env.prod` находится в корне проекта (там же, где `docker-compose.prod.yml`):

```bash
cd /opt/birdmaid
ls -la .env.prod docker-compose.prod.yml
# Оба файла должны быть в одной директории
```

### Вариант 4: Использовать стандартное имя `.env`

Docker Compose автоматически читает файл `.env` (без расширения):

```bash
# Создать симлинк или копию
cp .env.prod .env

# Теперь можно использовать без --env-file
docker compose -f docker-compose.prod.yml config
```

⚠️ **Внимание**: Если используете `.env`, убедитесь, что он добавлен в `.gitignore`!

## Проверка

После применения решения проверьте:

```bash
# Должны быть видны все переменные (без предупреждений)
docker compose -f docker-compose.prod.yml --env-file .env.prod config | grep -E "DOMAIN|S3_ENDPOINT|JWT_SECRET"

# Или проверьте конкретные значения:
docker compose -f docker-compose.prod.yml --env-file .env.prod config | grep "DOMAIN:"
# Должно показать реальное значение, а не пустую строку
```

## Что было исправлено

1. ✅ Добавлен `env_file: .env.prod` в `docker-compose.prod.yml` для всех сервисов
2. ✅ Обновлен скрипт `scripts/deploy.sh` для использования `--env-file`
3. ✅ Обновлена документация с явным указанием `--env-file` в командах

## Почему это происходит?

Docker Compose по умолчанию читает файл `.env` (без расширения) из текущей директории. Файл `.env.prod` нужно указывать явно через:
- Флаг `--env-file .env.prod` в команде
- Или параметр `env_file` в `docker-compose.prod.yml` (уже добавлен)

Оба способа работают, но использование флага `--env-file` более явное и надежное.
