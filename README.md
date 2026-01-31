# Birdmaid

Windows-95-стилизованная веб-платформа в форме псевдо-ОС: пользователь попадает на рабочий стол Windows 95 (desktop) или Windows Mobile 6.0 (mobile), где контент представлен как файловая система. Платформа служит кураторским архивом и витриной: игры с джемов и вне джемов, фото/видео, справочные материалы, запускаемые/открываемые в соответствующих окнах.

Навигация происходит исключительно через Desktop Icons и Explorer — никакого "обычного сайта". Контент открывается в соответствующих окнах (ImageViewer, VideoViewer, Notepad, Internet Explorer, Executor). Организаторы могут создавать/размещать любой контент через VFS, синхронизированный с S3-совместимым хранилищем.

## Current Status

- **FP1**: Browse & Play + Admin Authoring (status: release)
- **FP2**: Team System and Game Editing (status: release)
- **FP3**: Windows 95 UI Behavior (status: release)
- **FP4**: User Accounts & Windows 95 UI (status: release)
- **FP5**: UI/UX Fixes and Polish (status: release)
- **FP6**: Desktop Workspace & Window Manager (status: release)
- **FP7**: Shell-only Platform (status: plan+design) — переписывание на shell-only архитектуру

## Development

### Prerequisites

- Node.js 20+ and npm
- Docker and Docker Compose (для локальной разработки с MongoDB и MinIO)
- MongoDB (опционально, если не используете Docker Compose)
- S3-compatible storage (MinIO для локальной разработки, Selectel S3 для продакшена)

### Local Setup

1. **Клонировать репозиторий:**
   ```bash
   git clone <repository-url>
   cd Birdmaid
   ```

2. **Установить зависимости:**
   ```bash
   # Frontend
   cd front && npm install && cd ..
   
   # Backend
   cd back && npm install && cd ..
   ```

3. **Настроить переменные окружения:**
   
   Backend (создать `back/.env`):
   ```env
   MONGO_URL=mongodb://localhost:27017/birdmaid
   S3_ENDPOINT=http://localhost:9000
   S3_ACCESS_KEY=minioadmin
   S3_SECRET_KEY=minioadmin
   S3_BUCKET=birdmaid-builds
   S3_PUBLIC_URL=http://localhost:9000
   JWT_SECRET=your-secret-key-here
   JWT_EXPIRES_IN=7d
   ```
   
   Frontend (создать `front/.env`):
   ```env
   VITE_API_BASE_URL=http://localhost:3000
   ```

4. **Запустить инфраструктуру (MongoDB + MinIO):**
   ```bash
   docker compose up -d mongo minio minio-init
   ```

5. **Запустить backend:**
   ```bash
   cd back
   npm run start:dev
   ```
   Backend будет доступен на `http://localhost:3000`

6. **Запустить frontend (в отдельном терминале):**
   ```bash
   cd front
   npm run dev
   ```
   Frontend будет доступен на `http://localhost:5173`

### Development Commands

**Frontend:**
- `npm run dev` - запуск dev-сервера с hot reload
- `npm test` - запуск тестов
- `npm run test:watch` - запуск тестов в watch режиме
- `npm run coverage` - генерация coverage отчета
- `npm run build` - сборка production build
- `npm run preview` - предпросмотр production build

**Backend:**
- `npm run start:dev` - запуск dev-сервера с hot reload (ts-node)
- `npm test` - запуск тестов
- `npm run test:ci` - запуск тестов в CI режиме
- `npm run coverage` - генерация coverage отчета
- `npm run build` - сборка TypeScript в JavaScript
- `npm start` - запуск production build

### Code Structure

**Frontend (`front/src/`):**
- `os/` - операционная система (Desktop Shell, Window Manager, VFS)
- `components/` - React компоненты
- `contexts/` - React Context провайдеры
- `api/` - API клиент
- `__tests__/` - тесты, организованные по FP

**Backend (`back/src/`):**
- `auth/` - аутентификация и авторизация
- `vfs/` - виртуальная файловая система (FP7)
- `games/` - управление играми
- `teams/` - управление командами
- `users/` - управление пользователями
- `comments/` - комментарии к играм
- `jam/` - информация о джемах
- `help/` - справка HELP.TXT
- `__tests__/` - тесты, организованные по FP

### Testing

**Запуск всех тестов:**
```bash
# Frontend
cd front && npm test

# Backend
cd back && npm test
```

**Запуск тестов для конкретного FP:**
```bash
# Frontend
cd front && npm test fp7

# Backend
cd back && npm test __tests__/fp7/
```

**Coverage:**
```bash
# Frontend
cd front && npm run coverage

# Backend
cd back && npm run coverage
```

### Docker Compose

**Запустить все сервисы:**
```bash
docker compose up --build
```

Или в фоновом режиме:
```bash
docker compose up -d --build
```

**Остановить все сервисы:**
```bash
docker compose down
```

**Просмотр логов:**
```bash
# Все сервисы
docker compose logs -f

# Конкретный сервис
docker compose logs -f back
docker compose logs -f front
```

**Доступные сервисы:**
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3002/health`
- MongoDB: `mongodb://localhost:27017/birdmaid`
- MinIO API: `http://localhost:9002`
- MinIO Console: `http://localhost:9003` (user/pass: `minioadmin`)

> **Примечание:** Порты могут отличаться, если стандартные порты заняты другими сервисами. В этом случае порты автоматически изменяются в `docker-compose.yml`.

## Deployment

### Production Build

**Frontend:**
```bash
cd front
npm run build
# Production build будет в front/dist/
```

**Backend:**
```bash
cd back
npm run build
# Production build будет в back/dist/
```

### Docker Deployment

Проект использует multi-stage Docker builds для оптимизации размера образов.

**Build production images:**
```bash
# Frontend
docker build -f front/Dockerfile.prod -t birdmaid-front:latest ./front

# Backend
docker build -f back/Dockerfile.prod -t birdmaid-back:latest ./back
```

**Environment Variables для Production:**

Backend:
```env
NODE_ENV=production
MONGO_URL=mongodb://your-mongo-host:27017/birdmaid
S3_ENDPOINT=https://s3.storage.selcloud.ru
S3_ACCESS_KEY=your-access-key
S3_SECRET_KEY=your-secret-key
S3_BUCKET=birdmaid-builds
S3_PUBLIC_URL=https://your-bucket.s3.storage.selcloud.ru
JWT_SECRET=your-strong-secret-key
JWT_EXPIRES_IN=7d
```

Frontend:
```env
VITE_API_BASE_URL=https://api.yourdomain.com
```

### Production Checklist

- [ ] Все тесты проходят (`npm test` в обоих проектах)
- [ ] Production build успешно собирается
- [ ] Environment variables настроены
- [ ] MongoDB доступна и настроена
- [ ] S3 storage доступен и bucket создан
- [ ] JWT_SECRET установлен (сильный случайный ключ)
- [ ] Health check endpoint работает (`/health`)
- [ ] CORS настроен правильно (если frontend и backend на разных доменах)
- [ ] SSL/TLS сертификаты настроены
- [ ] Reverse proxy настроен (nginx/traefik)
- [ ] Логирование настроено
- [ ] Мониторинг настроен

## Project Structure

См. [STRUCTURE.md](./STRUCTURE.md) для подробного описания структуры репозитория.

Основные директории:
- `front/` - React + Vite + TypeScript frontend (Windows 95 UI styling)
- `back/` - NestJS backend (MongoDB + S3-compatible storage)
- `docs/core/` - Основные документы проекта (sources of truth)
- `docs/fps/` - Feature Pack файлы (единый файл для каждого FP)
- `ai/agents/` - Агенты-специалисты (6 агентов)
- `ai/roles/` - Workflow-роли (4 этапа: plan, design, build, release)
- `artifacts/` - Test logs, coverage, and evidence (not committed to git)

## Technology Stack

### Frontend
- React 18.2.0
- Vite 5.1.0
- TypeScript 5.4.0
- Vitest for testing
- Windows 95 styled UI components (custom)

### Backend
- NestJS 10.3.0
- MongoDB 6
- S3-compatible storage (MinIO)
- JWT authentication (@nestjs/jwt)

### Infrastructure
- Docker Compose for local development
- MongoDB for data storage
- MinIO for S3-compatible object storage
- Node.js runtime

## Documentation

- **Product Description**: [PRODUCT_DESCRIPTION.md](./PRODUCT_DESCRIPTION.md)
- **Structure**: [STRUCTURE.md](./STRUCTURE.md)
- **Agents Workflow**: [AGENTS.md](./AGENTS.md)
- **Feature Packs**: [docs/fps/README.md](./docs/fps/README.md)
- **Core Documents**: [docs/README.md](./docs/README.md)
