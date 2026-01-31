# Mobile App (Windows Mobile 6.0 Style)

Отдельное мобильное приложение в стиле Windows Mobile 6.0.

## Структура

- `main-mobile.tsx` - точка входа мобильного приложения
- `MobileApp.tsx` - главный компонент приложения
- `Launcher.tsx` - лаунчер приложений (WM6 стиль)
- `viewers/` - просмотрщики контента:
  - `MobileViewer.tsx` - роутер для выбора viewer
  - `ImageViewer.tsx` - просмотр изображений
  - `VideoViewer.tsx` - просмотр видео
  - `TextViewer.tsx` - просмотр текстовых файлов
  - `HtmlViewer.tsx` - просмотр HTML
  - `WebappViewer.tsx` - просмотр webapp/game

## Команды запуска

### Development

```bash
# Запустить мобильное приложение в dev режиме
npm run dev:mobile

# Приложение будет доступно на http://localhost:5174
```

### Build

```bash
# Собрать мобильное приложение
npm run build:mobile

# Результат будет в dist/ (отдельно от desktop)
```

### Preview

```bash
# Предпросмотр собранного мобильного приложения
npm run preview:mobile
```

## Использование

Мобильное приложение использует те же API/auth/vfs, что и desktop:

- **VFS**: Читает контент из `/Disk C/desktop` (как desktop)
- **Auth**: Использует тот же AuthContext и API
- **Viewers**: Открывает контент в WM6-стилизованных просмотрщиках

## Тесты

```bash
# Запустить тесты мобильного приложения
npm test mobile.boot.test.tsx
```

## Отличия от Desktop

- Отдельная сборка и entry point
- WM6 стилистика вместо Win95
- Лаунчер приложений вместо Desktop Icons
- Полноэкранные viewers вместо окон
- Один viewer за раз (не multi-window)
