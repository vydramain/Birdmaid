# Анализ Pipeline загрузки обложек в каталоге

## Проблема
В ответе API приходят S3 ключи (`covers/...`) вместо подписанных URL (`http://...`), из-за чего обложки не загружаются в каталоге.

## Pipeline (от запроса до отображения)

### 1. Фронтенд: Запрос данных
**Файл:** `front/src/App.tsx` (строка 247)
```typescript
const data = (await apiClient.json<GameSummary[]>(`/games${query ? `?${query}` : ""}`)) as GameSummary[];
```

**Что происходит:**
- Функция `loadGames()` делает GET запрос на `/games`
- Используется `apiClient.json()` для получения данных
- После получения данных проверяется формат `cover_url` (строки 250-260)

**Логирование:**
- ✅ Есть: `[CatalogPage] ERROR: Received S3 key instead of signed URL...`
- ✅ Есть: `[CatalogPage] Received signed URL for game...`

### 2. API Client: Отправка запроса
**Файл:** `front/src/api/client.ts`
```typescript
const response = await fetch(`${API_BASE_URL}${path}`, {
  ...options,
  headers,
  credentials: 'include',
});
```

**Что происходит:**
- Определяется базовый URL API на основе hostname
- Для IP доступа: `http://192.168.100.35:3000`
- Запрос отправляется с credentials для CORS

### 3. Бэкенд: Контроллер получает запрос
**Файл:** `back/src/games/games.controller.ts` (строка 40)
```typescript
@Get()
@UseGuards(OptionalAuthGuard)
async listGames(...)
```

**Что должно происходить:**
1. Метод вызывается (логирование: `[listGames] ===== METHOD CALLED =====`)
2. Получаются игры из сервиса (логирование: `[listGames] Received X games from service`)
3. Определяется S3 public URL (логирование: `[listGames] Using S3 public URL: ...`)
4. Для каждой игры генерируется signed URL
5. Финальная санитизация удаляет все S3 ключи

**Проблема:** В логах нет сообщений `[listGames]`, что означает:
- ❌ Либо код не выполняется (старая версия)
- ❌ Либо сервер не перезапущен после изменений

### 4. Бэкенд: Сервис возвращает игры
**Файл:** `back/src/games/games.service.ts` (строка 170)
```typescript
return allGames.map((game) => ({
  id: game._id,
  title: game.title,
  cover_url: game.cover_url, // ← Здесь S3 ключ из БД
  ...
}));
```

**Что происходит:**
- Сервис возвращает игры с `cover_url` как S3 ключом из базы данных
- Это нормально - контроллер должен заменить их на signed URLs

### 5. Бэкенд: Генерация signed URLs
**Файл:** `back/src/games/games.controller.ts` (строка 62-132)
```typescript
const gamesWithSignedCovers = await Promise.all(
  games.map(async (game) => {
    // Генерация signed URL для каждой игры
    if (game.cover_url.startsWith("covers/")) {
      const signedUrl = await this.buildUrlService.getSignedUrlFromKey(...);
      coverUrl = signedUrl; // ← Должен быть signed URL
    }
    return { ...game, cover_url: coverUrl };
  })
);
```

**Что должно происходить:**
- Для каждой игры с `cover_url` начинающимся с `covers/` генерируется signed URL
- `BuildUrlService.getSignedUrlFromKey()` создает подписанный URL
- Результат должен быть валидным URL (начинается с `http`)

**Проблема:** В логах видно только одно сообщение от `BuildUrlService`, что означает:
- ❌ Либо код выполняется только для одной игры
- ❌ Либо есть ошибка, которая не логируется

### 6. Бэкенд: Финальная санитизация
**Файл:** `back/src/games/games.controller.ts` (строка 134-144)
```typescript
const sanitizedGames = gamesWithSignedCovers.map((g) => {
  if (g.cover_url && g.cover_url.startsWith('covers/')) {
    // Принудительно удаляем S3 ключи
    return { ...g, cover_url: undefined };
  }
  return g;
});
```

**Что должно происходить:**
- Все S3 ключи должны быть удалены перед возвратом ответа
- Логирование: `[listGames] ⚠️⚠️⚠️ FINAL SANITIZATION: Removing S3 key...`

### 7. Бэкенд: Возврат ответа
**Файл:** `back/src/games/games.controller.ts` (строка 160)
```typescript
return sanitizedGames;
```

**Что должно происходить:**
- Ответ должен содержать только signed URLs или `cover_url: undefined`
- Логирование: `[listGames] ✓ Final response verified: no S3 keys found`

### 8. Фронтенд: Получение ответа
**Файл:** `front/src/App.tsx` (строка 247-260)
```typescript
const data = await apiClient.json<GameSummary[]>(`/games...`);
// Проверка формата cover_url
data.forEach((game) => {
  if (game.cover_url?.startsWith('covers/')) {
    console.error(`[CatalogPage] ERROR: Received S3 key...`);
  }
});
setGames(data);
```

**Что происходит:**
- Данные сохраняются в состояние `games`
- Проверяется формат `cover_url` (логирование есть)

### 9. Фронтенд: Отображение карточек
**Файл:** `front/src/App.tsx` (строка 440-470)
```typescript
{game.cover_url && game.cover_url.startsWith('http') ? (
  <img src={game.cover_url} ... />
) : game.cover_url?.startsWith('covers/') ? (
  <div>Invalid cover URL (S3 key received)</div>
) : (
  <div>No cover</div>
)}
```

**Что происходит:**
- Если `cover_url` начинается с `http` → отображается изображение
- Если `cover_url` начинается с `covers/` → показывается ошибка
- Если `cover_url` отсутствует → показывается "No cover"

## Диагностика проблемы

### Текущее состояние:
1. ✅ Фронтенд правильно отправляет запрос
2. ✅ Фронтенд правильно обрабатывает ответ (логирование работает)
3. ❌ Бэкенд не логирует выполнение `listGames()` метода
4. ❌ В ответе приходят S3 ключи вместо signed URLs

### Возможные причины:
1. **Сервер не перезапущен** - используется старая версия кода
2. **Код не компилируется** - TypeScript ошибки не позволяют запустить новую версию
3. **Кэширование** - где-то кэшируется старый ответ
4. **Проблема с async/await** - `Promise.all` не ждет завершения всех промисов

### Что нужно проверить:
1. ✅ Перезапустить сервер: `docker compose restart back` или `docker compose up --build -d`
2. ✅ Проверить логи сервера при запросе `/games`:
   - Должно быть: `[listGames] ===== METHOD CALLED =====`
   - Должно быть: `[listGames] Received X games from service`
   - Должно быть: `[listGames] Processing game 1/4: ...`
   - Должно быть: `[BuildUrlService] Generated signed URL...` для каждой игры
   - Должно быть: `[listGames] ✓ Final response verified: no S3 keys found`
3. ✅ Проверить ответ API в Network tab браузера
4. ✅ Проверить, что TypeScript компилируется без ошибок

## Решение

После перезапуска сервера должны появиться логи `[listGames]`, которые покажут, на каком этапе происходит проблема.

Если логи не появляются:
- Проверить, что файл `back/src/games/games.controller.ts` содержит новые изменения
- Проверить, что TypeScript компилируется: `cd back && npm run build`
- Проверить, что Docker использует обновленный код

