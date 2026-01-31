# Theme System Demo

## Overview

Theme system позволяет переключать темы без изменения компонентов. Темизация реализована через CSS custom properties (CSS variables) и data-attribute на root элементе.

## Quick Start

### 1. Запустить приложение

```bash
cd front
npm run dev
```

### 2. Переключение темы в браузере

Откройте консоль браузера (F12) и выполните:

```javascript
// Переключить на high-contrast тему
document.documentElement.setAttribute('data-theme', 'win95-high-contrast');

// Вернуться к default теме
document.documentElement.setAttribute('data-theme', 'win95-default');
// или
document.documentElement.removeAttribute('data-theme');
```

### 3. Использование theme helper

```typescript
import { setTheme, getTheme } from '@/utils/theme';

// Переключить тему
setTheme('win95-high-contrast');

// Получить текущую тему
const currentTheme = getTheme(); // 'win95-default' | 'win95-high-contrast'
```

## Available Themes

### win95-default (Default)
- **Background:** Gray (#c0c0c0)
- **Desktop:** Teal (#008080)
- **Borders:** Gray shades (#808080, #dfdfdf)
- **Text:** Black (#000000)

### win95-high-contrast (High Contrast)
- **Background:** White (#ffffff) - более яркий фон
- **Desktop:** Bright Cyan (#00ffff) - яркий циан вместо teal
- **Borders:** Pure Black (#000000) - чисто черные границы
- **Text:** Black (#000000)
- **Accent colors:** Более насыщенные цвета для лучшей видимости

## Visual Differences

При переключении между темами вы должны увидеть:

1. **Desktop background:** Teal → Bright Cyan
2. **Window backgrounds:** Gray → White
3. **Borders:** Gray shades → Pure Black
4. **Overall contrast:** Умеренный → Высокий

## Testing

### Manual Test

1. Запустите приложение
2. Откройте консоль браузера
3. Выполните команды переключения темы
4. Проверьте, что цвета меняются без перезагрузки страницы

### Automated Test (Future)

```bash
# TODO: Добавить тесты для проверки переключения тем
npm test theme.test.ts
```

## Implementation Details

- **Theme files:** `front/src/styles/themes/_win95-*.scss`
- **Theme helper:** `front/src/utils/theme.ts`
- **Entry point:** `front/src/styles/index.scss` (импортируется в `main.tsx`)

## References

- [THEME_CONTRACT.md](../docs/style/THEME_CONTRACT.md) - Theme contract
- [GUIDE_STYLE.md](../docs/style/GUIDE_STYLE.md) - Style guide
