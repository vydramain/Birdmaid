# Диагностика проблем с DNS и подключением

## Проблема: DNS не резолвит домен

**Симптомы:**
```bash
$ curl https://api.birdmaid.su/health
curl: (6) Could not resolve host: api.birdmaid.su
```

### Решение

1. **Проверьте, что DNS записи созданы:**
   ```bash
   # Установите утилиты для проверки DNS
   apt install -y dnsutils
   
   # Проверьте DNS записи
   nslookup api.birdmaid.su
   host api.birdmaid.su
   dig api.birdmaid.su +short
   ```

2. **Если DNS записи не найдены:**
   - Войдите в панель управления вашего домена (где вы регистрировали домен)
   - Убедитесь, что созданы A-записи:
     - `birdmaid.su` → `YOUR_SERVER_IP`
     - `api.birdmaid.su` → `YOUR_SERVER_IP`
   - Подождите распространения DNS (5-60 минут)

3. **Проверьте DNS на разных серверах:**
   ```bash
   # Используйте публичные DNS серверы
   nslookup api.birdmaid.su 8.8.8.8
   nslookup api.birdmaid.su 1.1.1.1
   ```

4. **Временное решение (для тестирования):**
   ```bash
   # Добавьте записи в /etc/hosts на вашем компьютере (НЕ на сервере!)
   # Это только для локального тестирования
   echo "YOUR_SERVER_IP api.birdmaid.su" >> /etc/hosts
   echo "YOUR_SERVER_IP birdmaid.su" >> /etc/hosts
   ```

## Проблема: Контейнеры не запускаются или не отвечают

### Проверка статуса контейнеров

```bash
# Проверьте статус всех контейнеров
docker compose -f docker-compose.prod.yml --env-file .env.prod ps
# Или: ./scripts/docker-compose-prod.sh ps

# Все контейнеры должны быть в статусе "Up" и "healthy"
```

### Проверка health endpoint backend

```bash
# В alpine образе нет curl, используем node:
docker compose -f docker-compose.prod.yml --env-file .env.prod exec back node -e \
  "require('http').get('http://localhost:3000/health', (r) => {let d='';r.on('data',c=>d+=c);r.on('end',()=>{console.log(d);process.exit(r.statusCode===200?0:1)})})"

# Должно вернуть: {"status":"ok"}
```

### Проверка логов

```bash
# Логи backend
docker compose -f docker-compose.prod.yml --env-file .env.prod logs --tail=100 back

# Логи Caddy (reverse proxy)
docker compose -f docker-compose.prod.yml --env-file .env.prod logs --tail=100 caddy

# Логи всех сервисов
docker compose -f docker-compose.prod.yml --env-file .env.prod logs --tail=50
```

## Проблема: Порт 3000 недоступен с хоста

**Это нормально!** Backend не экспонирует порты наружу, он доступен только через Docker network и reverse proxy (Caddy).

**Правильные способы проверки:**

1. **Через Docker network (изнутри контейнера):**
   ```bash
   docker compose -f docker-compose.prod.yml --env-file .env.prod exec back node -e \
     "require('http').get('http://localhost:3000/health', (r) => {let d='';r.on('data',c=>d+=c);r.on('end',()=>{console.log(d)})})"
   ```

2. **Через reverse proxy (Caddy) на порту 80/443:**
   ```bash
   # Если DNS настроен:
   curl https://api.birdmaid.su/health
   
   # Или через IP (если домена нет):
   curl http://YOUR_SERVER_IP/health
   ```

3. **Проверка портов на хосте:**
   ```bash
   # Должны быть открыты только порты 80 и 443 (Caddy)
   netstat -tlnp | grep -E ':80|:443'
   # Или:
   ss -tlnp | grep -E ':80|:443'
   ```

## Проблема: TLS сертификат не генерируется

**Симптомы:**
- Caddy не может получить сертификат Let's Encrypt
- Ошибки в логах Caddy про ACME

**Решение:**

1. **Проверьте DNS записи (см. выше)**
   - DNS должен резолвить домен на IP сервера
   - Порты 80 и 443 должны быть открыты в файрволе

2. **Проверьте файрвол:**
   ```bash
   # Проверьте правила UFW
   ufw status
   
   # Должны быть открыты порты 80 и 443:
   # 80/tcp                     ALLOW       Anywhere
   # 443/tcp                    ALLOW       Anywhere
   ```

3. **Проверьте логи Caddy:**
   ```bash
   docker compose -f docker-compose.prod.yml --env-file .env.prod logs caddy | grep -i "acme\|certificate\|error"
   ```

4. **Проверьте доступность портов извне:**
   ```bash
   # С другого компьютера или используя онлайн-сервис:
   # https://www.yougetsignal.com/tools/open-ports/
   # Введите IP сервера и порты 80, 443
   ```

## Быстрая диагностика

```bash
# 1. Статус контейнеров
./scripts/docker-compose-prod.sh ps

# 2. Проверка DNS
nslookup api.birdmaid.su
host api.birdmaid.su

# 3. Проверка портов на сервере
ss -tlnp | grep -E ':80|:443'

# 4. Проверка файрвола
ufw status

# 5. Логи Caddy
./scripts/docker-compose-prod.sh logs --tail=50 caddy

# 6. Health check backend
docker compose -f docker-compose.prod.yml --env-file .env.prod exec back node -e \
  "require('http').get('http://localhost:3000/health', (r) => {let d='';r.on('data',c=>d+=c);r.on('end',()=>{console.log(d)})})"
```
