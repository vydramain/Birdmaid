# M0 Gate Checklist: Cleanup Phase

**Версия:** 1.0  
**Дата:** 2026-01-22  
**Связано с:** [FP7.md](./FP7.md), [REWRITE_CHECKLIST.md](../../REWRITE_CHECKLIST.md), [CUTLIST.md](../../CUTLIST.md)

## M0 PASS/REJECT Checklist (10 пунктов)

### 1. React-router удален из продуктовой поверхности
- [ ] `front/src/App.tsx` не использует `Routes`/`Route` из `react-router-dom`
- [ ] `main.tsx` использует `ShellRoot` (не `App.tsx` с маршрутами)
- [ ] Нет импортов `react-router-dom` в компонентах продуктовой поверхности (кроме `legacy/`)
- [ ] Приложение запускается на `/` без маршрутов

**Проверка:**
```bash
grep -r "react-router-dom" front/src --exclude-dir=legacy
# Должно быть пусто (или только в legacy/)
```

### 2. Сайт-страницы удалены или перемещены в legacy
- [ ] `CatalogPage`, `GamePage`, `TeamsPage`, `EditorPage` не используются в продуктовой поверхности
- [ ] Компоненты либо удалены, либо перемещены в `front/src/legacy/`
- [ ] Нет импортов этих компонентов в `main.tsx`, `ShellRoot.tsx`, `DesktopPage.tsx`, `MobilePage.tsx`

**Проверка:**
```bash
grep -r "CatalogPage\|GamePage\|TeamsPage\|EditorPage" front/src --exclude-dir=legacy
# Должно быть пусто (или только в legacy/)
```

### 3. Старые тесты для react-router удалены или перемещены
- [ ] Тесты для маршрутов `/catalog`, `/games/:id`, `/teams`, `/editor/*` удалены или в `front/__tests__/legacy/`
- [ ] Тесты для `CatalogPage`, `GamePage`, `TeamsPage`, `EditorPage` удалены или в `front/__tests__/legacy/`
- [ ] Тесты не падают из-за отсутствующих компонентов

**Проверка:**
```bash
# Тесты в legacy/ не должны запускаться в основной test suite
# Проверить, что нет импортов удаленных компонентов в тестах
grep -r "CatalogPage\|GamePage\|TeamsPage\|EditorPage" front/__tests__ --exclude-dir=legacy
# Должно быть пусто
```

### 4. Dead code удален
- [ ] `front/src/contexts/WindowContext.tsx` удален (если не используется)
- [ ] Старый `front/src/components/WindowManager.tsx` удален (если заменен на `os/wm/WindowManager.tsx`)
- [ ] Нет неиспользуемых импортов в компонентах

**Проверка:**
```bash
# Проверить, что WindowContext не используется
grep -r "WindowContext" front/src --exclude-dir=legacy
# Должно быть пусто (или только упоминания в комментариях)

# Проверить, что старый WindowManager не используется
grep -r "from.*components/WindowManager" front/src
# Должно быть пусто (используется только os/wm/WindowManager)
```

### 5. Приложение запускается без ошибок
- [ ] `npm run dev` запускается без ошибок
- [ ] Приложение открывается на `http://localhost:5173/` (или другом порту)
- [ ] Нет ошибок в консоли браузера (кроме предупреждений о dev mode)
- [ ] Нет ошибок в терминале

**Проверка:**
```bash
cd front && npm run dev
# Открыть браузер, проверить консоль
```

### 6. ShellRoot рендерится корректно
- [ ] `ShellRoot` рендерится на `/`
- [ ] `PlatformContext` определяется правильно (Desktop/Mobile)
- [ ] `DesktopPage` или `MobilePage` рендерятся в зависимости от платформы

**Проверка:**
- Визуально: приложение показывает Desktop или Mobile shell
- В DevTools: `ShellRoot` присутствует в дереве компонентов

### 7. Нет зависимостей react-router-dom в package.json
- [ ] `react-router-dom` не в `dependencies` или `devDependencies` в `front/package.json`
- [ ] Если был удален, выполнен `npm install` для обновления `package-lock.json`

**Проверка:**
```bash
grep "react-router" front/package.json
# Должно быть пусто
```

### 8. Старые тесты не ломают сборку
- [ ] `npm run test` выполняется без ошибок
- [ ] Тесты в `front/__tests__/legacy/` не запускаются автоматически (или помечены как skip)
- [ ] Нет импортов удаленных компонентов в тестах

**Проверка:**
```bash
cd front && npm run test
# Все тесты должны проходить (или legacy тесты должны быть skip)
```

### 9. Нет "обычных сайт-страниц" в продуктовой поверхности
- [ ] Нет компонентов, которые рендерятся как "обычные страницы сайта" (не через Shell)
- [ ] Вся навигация происходит через Desktop Icons и Explorer (согласно FP7 контракту)
- [ ] Нет альтернативных путей навигации кроме Shell

**Проверка:**
- Визуально: нет "обычных" страниц с навигацией через URL
- Код: нет компонентов, которые рендерятся вне Shell контекста

### 10. Документация обновлена
- [ ] `CUTLIST.md` задокументирован (что удалено)
- [ ] `REWRITE_CHECKLIST.md` обновлен (M0 задачи выполнены)
- [ ] `FP7.md` соответствует текущему состоянию (если были изменения)

**Проверка:**
- Проверить, что удаленные компоненты/тесты задокументированы в `CUTLIST.md`
- Проверить, что M0 задачи в `REWRITE_CHECKLIST.md` отмечены как выполненные

---

## Красные флаги (что часто забывают убрать)

### 🔴 Критические (блокируют PASS)

1. **React-router импорты в продуктовой поверхности**
   - Часто забывают удалить `import { useNavigate, useParams } from 'react-router-dom'` в компонентах
   - **Проверка:** `grep -r "from 'react-router-dom'" front/src --exclude-dir=legacy`

2. **Ссылки на удаленные компоненты в импортах**
   - Импорты `CatalogPage`, `GamePage`, `TeamsPage`, `EditorPage` в `main.tsx` или других компонентах
   - **Проверка:** `grep -r "CatalogPage\|GamePage\|TeamsPage\|EditorPage" front/src --exclude-dir=legacy`

3. **Маршруты в App.tsx (если файл еще существует)**
   - Если `App.tsx` еще существует, проверить, что там нет `Routes`/`Route`
   - **Проверка:** `grep -r "Routes\|Route" front/src/App.tsx` (если файл существует)

4. **Тесты импортируют удаленные компоненты**
   - Тесты в `front/__tests__/` (не legacy) импортируют удаленные компоненты
   - **Проверка:** `grep -r "CatalogPage\|GamePage\|TeamsPage\|EditorPage" front/__tests__ --exclude-dir=legacy`

5. **Приложение не запускается**
   - Ошибки компиляции из-за отсутствующих импортов
   - **Проверка:** `npm run dev` должен запускаться без ошибок

### 🟡 Важные (могут вызвать проблемы позже)

6. **react-router-dom в package.json**
   - Зависимость не удалена, но не используется
   - **Проверка:** `grep "react-router" front/package.json`

7. **Старые тесты падают**
   - Тесты в `legacy/` падают и ломают CI/CD
   - **Решение:** Пометить как skip или исключить из test suite

8. **WindowContext или старый WindowManager все еще используются**
   - Компоненты импортируют старые версии вместо новых
   - **Проверка:** `grep -r "WindowContext\|from.*components/WindowManager" front/src --exclude-dir=legacy`

9. **Неиспользуемые импорты**
   - Много неиспользуемых импортов после удаления кода
   - **Проверка:** Запустить линтер или проверить вручную

10. **Документация не обновлена**
    - `CUTLIST.md` не отражает реально удаленные файлы
    - `REWRITE_CHECKLIST.md` не обновлен
    - **Проверка:** Сравнить удаленные файлы с документацией

### 🟢 Мелкие (не блокируют, но лучше исправить)

11. **Комментарии с упоминанием react-router**
    - Старые комментарии могут вводить в заблуждение
    - **Проверка:** `grep -r "react-router\|Routes\|Route" front/src --exclude-dir=legacy`

12. **Неиспользуемые типы/интерфейсы**
    - TypeScript типы для удаленных компонентов
    - **Проверка:** Проверить TypeScript ошибки

13. **Неиспользуемые утилиты**
    - Функции-хелперы для react-router навигации
    - **Проверка:** `grep -r "useNavigate\|useParams\|useLocation" front/src --exclude-dir=legacy`

---

## Если REJECT — что исправить первым

### Приоритет 1: Критические ошибки (блокируют запуск)

1. **Приложение не запускается**
   - **Симптом:** `npm run dev` выдает ошибки компиляции
   - **Причина:** Импорты удаленных компонентов или отсутствующие зависимости
   - **Действие:**
     ```bash
     # Найти проблемные импорты
     grep -r "CatalogPage\|GamePage\|TeamsPage\|EditorPage" front/src --exclude-dir=legacy
     # Удалить или заменить импорты
     ```

2. **React-router импорты в продуктовой поверхности**
   - **Симптом:** Импорты `react-router-dom` в компонентах (не в legacy)
   - **Причина:** Забыли удалить импорты после удаления использования
   - **Действие:**
     ```bash
     # Найти все импорты
     grep -r "from 'react-router-dom'" front/src --exclude-dir=legacy
     # Удалить строки импорта
     ```

3. **Маршруты в App.tsx**
   - **Симптом:** `App.tsx` содержит `Routes`/`Route`
   - **Причина:** Не удалили маршруты при переходе на ShellRoot
   - **Действие:**
     - Удалить `Routes`/`Route` из `App.tsx`
     - Или удалить `App.tsx` полностью, если `main.tsx` использует `ShellRoot`

### Приоритет 2: Важные проблемы (могут вызвать проблемы позже)

4. **Тесты импортируют удаленные компоненты**
   - **Симптом:** `npm run test` падает с ошибками импорта
   - **Причина:** Тесты (не в legacy) импортируют удаленные компоненты
   - **Действие:**
     ```bash
     # Найти проблемные тесты
     grep -r "CatalogPage\|GamePage\|TeamsPage\|EditorPage" front/__tests__ --exclude-dir=legacy
     # Удалить или переместить тесты в legacy/
     ```

5. **react-router-dom в package.json**
   - **Симптом:** Зависимость есть, но не используется
   - **Причина:** Забыли удалить из `package.json`
   - **Действие:**
     ```bash
     # Удалить из package.json
     npm uninstall react-router-dom
     ```

6. **WindowContext или старый WindowManager используются**
   - **Симптом:** Компоненты импортируют старые версии
   - **Причина:** Не обновили импорты после рефакторинга
   - **Действие:**
     ```bash
     # Найти использования
     grep -r "WindowContext\|from.*components/WindowManager" front/src --exclude-dir=legacy
     # Заменить на новые импорты (os/wm/WindowManager)
     ```

### Приоритет 3: Мелкие проблемы (не блокируют, но лучше исправить)

7. **Неиспользуемые импорты**
   - **Симптом:** Много неиспользуемых импортов после удаления кода
   - **Действие:** Запустить линтер или удалить вручную

8. **Документация не обновлена**
   - **Симптом:** `CUTLIST.md` не отражает удаленные файлы
   - **Действие:** Обновить `CUTLIST.md` и `REWRITE_CHECKLIST.md`

---

## Процесс проверки M0 Gate

1. **Запустить проверки:**
   ```bash
   # Проверить react-router импорты
   grep -r "react-router-dom" front/src --exclude-dir=legacy
   
   # Проверить удаленные компоненты
   grep -r "CatalogPage\|GamePage\|TeamsPage\|EditorPage" front/src --exclude-dir=legacy
   
   # Проверить тесты
   grep -r "CatalogPage\|GamePage\|TeamsPage\|EditorPage" front/__tests__ --exclude-dir=legacy
   
   # Проверить package.json
   grep "react-router" front/package.json
   ```

2. **Запустить приложение:**
   ```bash
   cd front && npm run dev
   # Проверить, что запускается без ошибок
   ```

3. **Запустить тесты:**
   ```bash
   cd front && npm run test
   # Проверить, что тесты проходят
   ```

4. **Проверить визуально:**
   - Открыть `http://localhost:5173/`
   - Проверить, что ShellRoot рендерится
   - Проверить консоль браузера на ошибки

5. **Проверить документацию:**
   - `CUTLIST.md` обновлен
   - `REWRITE_CHECKLIST.md` обновлен (M0 задачи выполнены)

---

## Критерии PASS/REJECT

### ✅ PASS (все пункты выполнены)

- Все 10 пунктов чеклиста выполнены
- Нет критических красных флагов
- Приложение запускается без ошибок
- Тесты проходят
- Документация обновлена

### ❌ REJECT (есть проблемы)

- Хотя бы один пункт чеклиста не выполнен
- Есть критические красные флаги
- Приложение не запускается
- Тесты падают
- Документация не обновлена

**Действие при REJECT:**
1. Исправить проблемы по приоритетам (см. "Если REJECT — что исправить первым")
2. Повторить проверку
3. Обновить чеклист

---

**End of M0 Gate Checklist**
