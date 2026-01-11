# Анализ и исправление проблемы с проксированием build файлов

## Проблема

Запросы к `/games/:id/build/index.html?token=...` возвращают статус 0 в Caddy, что означает разрыв соединения до получения ответа от бэкенда.

## Анализ

### Симптомы:
1. В логах Caddy видно запросы со статусом 0 (разрыв соединения)
2. В логах бэкенда нет записей о вызове `proxyBuildFileRoute` для этих запросов
3. Другие эндпоинты API работают нормально (статус 200)

### Возможные причины:

1. **Отсутствие таймаутов в Caddyfile**
   - По умолчанию Caddy имеет ограничения на время ожидания ответа
   - Для больших файлов или медленных ответов от S3 это может привести к разрыву соединения

2. **Неправильная обработка ошибок в NestJS**
   - При использовании `@Res()` декоратора исключения не обрабатываются автоматически
   - Если происходит ошибка до отправки ответа, соединение может зависнуть

3. **Проблемы с маршрутизацией**
   - Роут `:id/build/:file` может не совпадать с путем из-за query параметров
   - NestJS может неправильно обрабатывать пути с query параметрами

## Исправления

### 1. Добавлены таймауты в Caddyfile

```caddyfile
api.${DOMAIN} {
    # Timeouts for large build files and slow responses
    timeouts {
        read 5m          # Максимальное время чтения запроса
        read_header 30s  # Время чтения заголовков
        write 5m         # Максимальное время записи ответа
        idle 2m         # Время ожидания следующего запроса
    }
    
    reverse_proxy back:3000 {
        transport http {
            response_header_timeout 30s  # Время ожидания заголовков от бэкенда
            dial_timeout 10s             # Время установки соединения
        }
        # ... остальные настройки
    }
}
```

### 2. Исправлена обработка ошибок в proxyBuildFile

**До:**
```typescript
} catch (error) {
  console.error(`[proxyBuildFile] Error proxying file:`, error);
  if (error instanceof NotFoundException) {
    throw error;  // ❌ При @Res() это не работает!
  }
  throw new NotFoundException(...);
}
```

**После:**
```typescript
} catch (error) {
  console.error(`[proxyBuildFile] Error proxying file:`, error);
  
  // ✅ Явная отправка ответа при использовании @Res()
  if (res.headersSent) {
    return res.end();
  }
  
  const statusCode = error instanceof NotFoundException ? 404 : 500;
  res.status(statusCode).json({
    statusCode,
    message: ...,
    error: ...
  });
}
```

### 3. Добавлено глобальное логирование запросов

Добавлен middleware в `main.ts` для логирования всех входящих запросов:
```typescript
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[GlobalMiddleware] ${req.method} ${req.url} - Path: ${req.path}, Query:`, req.query);
  next();
});
```

## Проверка исправлений

После деплоя проверьте:

1. **Логи бэкенда** должны показывать:
   ```
   [GlobalMiddleware] GET /games/:id/build/index.html?token=... - Path: /games/:id/build/index.html, Query: { token: '...' }
   [OptionalAuthGuard] Request to: /games/:id/build/index.html?token=..., method: GET
   [proxyBuildFileRoute] ===== ROUTE CALLED =====
   [proxyBuildFile] ===== ENTRY POINT CALLED =====
   ```

2. **Логи Caddy** должны показывать статус 200 вместо 0

3. **Браузер** должен успешно загружать `index.html` игры

## Дополнительные рекомендации

1. **Мониторинг таймаутов**: Если проблема сохраняется, увеличьте таймауты в Caddyfile
2. **Логирование S3**: Добавьте логирование времени ответа от S3 для диагностики медленных запросов
3. **Кэширование**: Рассмотрите возможность кэширования часто запрашиваемых файлов

## Связанные файлы

- `Caddyfile` - конфигурация прокси-сервера
- `back/src/games/games.controller.ts` - контроллер с методом `proxyBuildFile`
- `back/src/main.ts` - точка входа с глобальным middleware
