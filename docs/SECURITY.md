# Birdmaid Security Hardening Guide

Это руководство описывает шаги по защите сервера Birdmaid на базе рекомендаций из [How To Secure A Linux Server](https://github.com/imthenachoman/How-To-Secure-A-Linux-Server).

## Автоматическая установка

Для автоматической установки базовых мер безопасности используйте скрипт:

```bash
sudo bash scripts/harden-server.sh
```

**ВНИМАНИЕ**: Перед запуском убедитесь, что:
1. У вас есть SSH доступ
2. У вас есть пользователь с sudo правами
3. Вы сделали резервную копию важных данных

## Ручная установка

### 1. Базовые меры безопасности

#### 1.1 Обновление системы

```bash
apt update && apt upgrade -y
```

#### 1.2 Установка инструментов безопасности

```bash
apt install -y \
    ufw \
    fail2ban \
    unattended-upgrades \
    apt-listchanges \
    apticron \
    ntp \
    logwatch \
    libpam-pwquality \
    lynis
```

### 2. Настройка SSH

#### 2.1 Использование SSH ключей

**На клиенте** создайте Ed25519 ключ:

```bash
ssh-keygen -t ed25519
```

**Скопируйте публичный ключ на сервер**:

```bash
ssh-copy-id user@your-server-ip
```

#### 2.2 Настройка SSH конфигурации

Отредактируйте `/etc/ssh/sshd_config`:

```bash
sudo nano /etc/ssh/sshd_config
```

Основные настройки безопасности:

```
# Отключить вход root
PermitRootLogin no

# Отключить аутентификацию по паролю (если используете ключи)
PasswordAuthentication no

# Использовать только протокол 2
Protocol 2

# Современные алгоритмы
KexAlgorithms curve25519-sha256@libssh.org,ecdh-sha2-nistp521,ecdh-sha2-nistp384,diffie-hellman-group-exchange-sha256
Ciphers chacha20-poly1305@openssh.com,aes256-gcm@openssh.com,aes128-gcm@openssh.com,aes256-ctr,aes192-ctr,aes128-ctr
MACs hmac-sha2-512-etm@openssh.com,hmac-sha2-256-etm@openssh.com

# Ограничения подключений
MaxAuthTries 3
MaxSessions 2
LoginGraceTime 30
ClientAliveInterval 300
ClientAliveCountMax 0

# Отключить ненужные функции
X11Forwarding no
AllowTcpForwarding no
PermitTunnel no
```

**ВАЖНО**: Перед перезапуском SSH откройте второй терминал, чтобы не потерять доступ!

```bash
sudo systemctl restart sshd
```

### 3. Настройка файрвола (UFW)

```bash
# Установить политики по умолчанию
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Разрешить необходимые порты
sudo ufw allow 22/tcp comment 'SSH'
sudo ufw allow 80/tcp comment 'HTTP'
sudo ufw allow 443/tcp comment 'HTTPS'

# Разрешить исходящий трафик
sudo ufw allow out 53 comment 'DNS'
sudo ufw allow out 123 comment 'NTP'
sudo ufw allow out 80/tcp comment 'HTTP out'
sudo ufw allow out 443/tcp comment 'HTTPS out'

# Включить файрвол
sudo ufw enable
sudo ufw status verbose
```

### 4. Настройка Fail2ban

Fail2ban защищает от брутфорс атак на SSH и другие сервисы.

#### 4.1 Базовая конфигурация

Создайте `/etc/fail2ban/jail.local`:

```ini
[DEFAULT]
# IP адреса для игнорирования (добавьте ваш LAN)
ignoreip = 127.0.0.1/8

# Email для уведомлений
destemail = your-email@example.com
sender = root@your-server

# Действие при блокировке
action = %(action_mwl)s
```

#### 4.2 Jail для SSH

Создайте `/etc/fail2ban/jail.d/ssh.local`:

```ini
[sshd]
enabled = true
banaction = ufw
port = ssh
filter = sshd
logpath = %(sshd_log)s
maxretry = 5
bantime = 3600
findtime = 600
```

#### 4.3 Запуск Fail2ban

```bash
sudo systemctl enable fail2ban
sudo systemctl restart fail2ban
sudo fail2ban-client status
```

### 5. Автоматические обновления безопасности

Настройте автоматические обновления безопасности:

```bash
sudo dpkg-reconfigure -plow unattended-upgrades
```

Или создайте `/etc/apt/apt.conf.d/51birdmaid-unattended-upgrades`:

```
APT::Periodic::Enable "1";
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Download-Upgradeable-Packages "1";
APT::Periodic::AutocleanInterval "7";
APT::Periodic::Unattended-Upgrade "1";

Unattended-Upgrade::Origins-Pattern {
    "o=Debian,a=stable";
    "o=Debian,a=stable-updates";
    "origin=Debian,codename=${distro_codename},label=Debian-Security";
};

Unattended-Upgrade::Mail "root";
Unattended-Upgrade::MailOnlyOnError "false";
Unattended-Upgrade::Remove-Unused-Dependencies "true";
Unattended-Upgrade::Automatic-Reboot "false";
```

### 6. Настройка NTP

Убедитесь, что время сервера синхронизировано:

```bash
# Использовать pool вместо конкретных серверов
sudo sed -i -r -e "s/^((server|pool).*)/# \1/" /etc/ntp.conf
echo "pool pool.ntp.org iburst" | sudo tee -a /etc/ntp.conf

sudo systemctl restart ntp
sudo ntpq -p
```

### 7. Требования к паролям

Настройте требования к паролям в `/etc/pam.d/common-password`:

```
password        requisite                       pam_pwquality.so retry=3 minlen=10 difok=3 ucredit=-1 lcredit=-1 dcredit=-1 ocredit=-1 maxrepeat=3 gecoschec
```

Это требует:
- Минимум 10 символов
- Хотя бы одну заглавную букву
- Хотя бы одну строчную букву
- Хотя бы одну цифру
- Хотя бы один специальный символ
- Максимум 3 повторяющихся символа подряд

### 8. Защита /proc

Добавьте в `/etc/fstab`:

```
proc     /proc     proc     defaults,hidepid=2     0     0
```

Применить без перезагрузки:

```bash
sudo mount -o remount,hidepid=2 /proc
```

### 9. Мониторинг логов (Logwatch)

Настройте ежедневные отчеты по логам:

```bash
sudo nano /etc/cron.daily/00logwatch
```

Измените строку выполнения на:

```bash
/usr/sbin/logwatch --output mail --format html --mailto root --range yesterday --service all
```

### 10. Аудит безопасности (Lynis)

Установите и запустите Lynis для аудита:

```bash
sudo apt install apt-transport-https ca-certificates
sudo wget -O - https://packages.cisofy.com/keys/cisofy-software-public.key | sudo apt-key add -
sudo echo "deb https://packages.cisofy.com/community/lynis/deb/ stable main" | sudo tee /etc/apt/sources.list.d/cisofy-lynis.list
sudo apt update
sudo apt install lynis

# Запустить аудит
sudo lynis audit system
```

## Дополнительные меры безопасности

### Ограничение доступа к sudo

Создайте группу для пользователей с sudo:

```bash
sudo groupadd sudousers
sudo usermod -a -G sudousers your-username

# Настроить sudoers
sudo visudo
# Добавить: %sudousers   ALL=(ALL:ALL) ALL
```

### 2FA для SSH (опционально)

Для дополнительной защиты можно настроить двухфакторную аутентификацию:

```bash
sudo apt install libpam-google-authenticator
google-authenticator
# Следуйте инструкциям

# Настроить PAM
sudo nano /etc/pam.d/sshd
# Добавить: auth       required     pam_google_authenticator.so nullok

# Включить в SSH
sudo nano /etc/ssh/sshd_config
# Добавить: ChallengeResponseAuthentication yes
sudo systemctl restart sshd
```

### Мониторинг портов

Проверьте, какие порты слушает сервер:

```bash
sudo ss -lntup
```

Если видите подозрительные порты или процессы - расследуйте.

## Проверка безопасности

### Проверка конфигурации SSH

```bash
sudo sshd -T | grep -E '(passwordauthentication|permitrootlogin|protocol)'
```

### Проверка Fail2ban

```bash
sudo fail2ban-client status
sudo fail2ban-client status sshd
```

### Проверка UFW

```bash
sudo ufw status verbose
```

### Проверка автоматических обновлений

```bash
sudo unattended-upgrades --dry-run --debug
```

## Рекомендации для Docker окружения

Поскольку Birdmaid работает в Docker:

1. **Не открывайте порты контейнеров на хост** - используйте только reverse proxy (Caddy)
2. **Ограничьте ресурсы контейнеров** - используйте `docker-compose.prod.yml` с лимитами
3. **Используйте read-only файловые системы** где возможно
4. **Регулярно обновляйте Docker образы**
5. **Используйте non-root пользователей в контейнерах** (уже настроено в Dockerfile.prod)

## Мониторинг и алерты

### Настройка email уведомлений

Для получения уведомлений от Fail2ban, logwatch и других сервисов настройте отправку email:

1. Используйте внешний SMTP (Gmail, SendGrid и т.д.)
2. Или настройте локальный MTA (exim4, postfix)

Пример настройки exim4 с Gmail см. в [How To Secure A Linux Server - Gmail and Exim4](https://github.com/imthenachoman/How-To-Secure-A-Linux-Server#gmail-and-exim4-as-mta-with-implicit-tls).

## Чеклист безопасности

- [ ] Система обновлена (`apt update && apt upgrade`)
- [ ] SSH настроен с ключами (не паролями)
- [ ] Root login отключен
- [ ] UFW настроен и включен
- [ ] Fail2ban настроен и работает
- [ ] Автоматические обновления безопасности включены
- [ ] NTP настроен
- [ ] Требования к паролям настроены
- [ ] /proc защищен (hidepid=2)
- [ ] Logwatch настроен
- [ ] Lynis аудит выполнен и проблемы исправлены
- [ ] Email уведомления настроены
- [ ] Резервные копии MongoDB настроены

## Полезные команды

```bash
# Проверить открытые порты
sudo ss -lntup

# Проверить активные соединения
sudo netstat -tulpn

# Проверить логи безопасности
sudo tail -f /var/log/auth.log
sudo tail -f /var/log/fail2ban.log

# Проверить использование диска
df -h
du -sh /var/log/*

# Проверить процессы
ps aux | grep -E '(ssh|fail2ban|ufw)'

# Проверить системные логи
sudo journalctl -xe
```

## Дополнительные ресурсы

- [How To Secure A Linux Server](https://github.com/imthenachoman/How-To-Secure-A-Linux-Server) - полное руководство
- [CIS Benchmarks](https://www.cisecurity.org/cis-benchmarks/) - отраслевые стандарты безопасности
- [Debian Security](https://www.debian.org/security/) - информация о безопасности Debian

## Поддержка

При возникновении проблем:
1. Проверьте логи: `journalctl -xe`
2. Проверьте конфигурацию: `sshd -T`, `fail2ban-client status`
3. Создайте issue в репозитории
