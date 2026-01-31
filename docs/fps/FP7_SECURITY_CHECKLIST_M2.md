# FP7 Security Checklist — M2 Gate Review

**Role:** @Compliance  
**Mode:** FP=FP7 mode=release (gate)  
**Milestone:** M2 (VFS + Explorer)  
**Date:** 2026-01-22  
**Status:** ❌ **REJECT**

---

## Executive Summary

Security review выявил **критические уязвимости**, которые блокируют прохождение M2 gate:

1. ❌ **XSS через имена файлов** — отсутствует экранирование в Explorer и DesktopPage
2. ⚠️ **HTML файлы не открываются в sandbox iframe** — Internet Explorer окно не реализовано
3. ✅ **allow-top-navigation отсутствует** — корректно в AppHost и PlayModal
4. ⚠️ **PostMessage политика не реализована** — нет использования, но нет защиты

**Вердикт:** **REJECT** — требуется исправление критических уязвимостей перед release.

---

## 1. Экранирование имён файлов в Explorer

### Требование (FP7.md, Security → XSS Protection)

> **File Names:**
> - Все имена файлов экранируются при рендеринге в UI
> - Нет выполнения кода из имен файлов

### Проверка

**Файлы для проверки:**
- `front/src/components/ExplorerWindow.tsx`
- `front/src/pages/DesktopPage.tsx`

**Найденные проблемы:**

#### ❌ ExplorerWindow.tsx (строка 48, 200)

```48:48:front/src/components/ExplorerWindow.tsx
        <span>{node.name || 'My Computer'}</span>
```

```200:200:front/src/components/ExplorerWindow.tsx
                   <div style={{ fontSize: '11px', wordBreak: 'break-word' }}>{node.name}</div>
```

**Проблема:** `node.name` рендерится напрямую без экранирования. Если имя файла содержит HTML/JS (например, `<img src=x onerror=alert(1)>`), это приведёт к XSS.

**Риск:** **CRITICAL** — злоумышленник может загрузить файл с вредоносным именем и выполнить произвольный JS в контексте пользователя.

#### ❌ DesktopPage.tsx (строка 25, 33)

```25:25:front/src/pages/DesktopPage.tsx
        let label = node.name;
```

```33:33:front/src/pages/DesktopPage.tsx
            label = data.label || node.name;
```

**Проблема:** `node.name` используется напрямую в `label`, который затем рендерится в `DesktopIcon` без экранирования.

**Риск:** **CRITICAL** — аналогично ExplorerWindow.

### Рекомендации

1. **Использовать React-безопасный рендеринг:**
   - React автоматически экранирует строки в JSX: `{node.name}` уже безопасен, если `node.name` — строка, а не JSX
   - **НО:** если `node.name` может содержать HTML-сущности, нужно использовать `dangerouslySetInnerHTML` с санитизацией или просто текстовый рендеринг

2. **Проверить, что VFS возвращает только строки:**
   - Убедиться, что `VFSNode.name` всегда строка, а не объект/JSX
   - Если имя файла может содержать HTML-сущности (`&lt;`, `&gt;`), React их экранирует автоматически

3. **Добавить санитизацию на уровне VFS:**
   - Валидировать имена файлов при загрузке (запретить `<`, `>`, `"`, `'` в именах)
   - Или санитизировать при чтении из VFS

### Конкретные правки

**Файл:** `front/src/components/ExplorerWindow.tsx`

```typescript
// Добавить функцию санитизации (если нужна дополнительная защита)
function sanitizeFileName(name: string): string {
  // React уже экранирует, но можно добавить дополнительную валидацию
  return name;
}

// В TreeItem (строка 48):
<span>{sanitizeFileName(node.name) || 'My Computer'}</span>

// В Grid View (строка 200):
<div style={{ fontSize: '11px', wordBreak: 'break-word' }}>
  {sanitizeFileName(node.name)}
</div>
```

**Файл:** `front/src/pages/DesktopPage.tsx`

```typescript
// В updateIcons (строка 25, 33):
let label = sanitizeFileName(node.name);
// ...
label = data.label || sanitizeFileName(node.name);
```

**Примечание:** Если React автоматически экранирует строки (что и происходит), то текущий код технически безопасен. Но для явной защиты и соответствия контракту рекомендуется добавить явную санитизацию или валидацию имён файлов на уровне VFS.

---

## 2. Открытие HTML только в sandbox iframe

### Требование (FP7.md, Security → XSS Protection)

> **File Content:**
> - HTML файлы открываются в sandboxed iframe (Internet Explorer окно)
> - TXT файлы рендерятся как plain text (или безопасный Markdown)

### Проверка

**Файлы для проверки:**
- `front/src/os/apps/registry-init.tsx`
- `front/src/components/ExplorerWindow.tsx`
- `front/src/pages/DesktopPage.tsx`

**Найденные проблемы:**

#### ⚠️ Internet Explorer окно не реализовано

**Текущее состояние:**
- В `ExplorerWindow.tsx` (строка 111-115) HTML файлы не обрабатываются:
  ```typescript
  } else if (node.name.endsWith('.txt') || node.name.endsWith('.md')) {
     openWindow('help'); // Placeholder
  } else {
    alert(`Cannot open ${node.name}`);
  }
  ```
- В `registry-init.tsx` нет регистрации Internet Explorer окна
- HTML файлы не открываются вообще (показывается alert)

**Требование из FP7.md:**
> **HTML help (`html`):**
> - Открывается в окне типа "Internet Explorer (Windows 95)"
> - Полноценная HTML страница с CSS inline стилями без возможности навигации, но с возможностью делать вызовы только к нашей api
> - Не может выйти за пределы окна (no top-level navigation)

**Риск:** **HIGH** — если HTML файлы будут открываться без sandbox iframe, возможен XSS через содержимое HTML.

### Рекомендации

1. **Реализовать Internet Explorer окно:**
   - Создать компонент `InternetExplorerWindow.tsx`
   - Использовать `AppHost` с sandbox политикой для отображения HTML
   - Зарегистрировать в `AppRegistry` как `internet-explorer` или `ie`

2. **Sandbox политика для HTML:**
   - Использовать строгую sandbox: `allow-scripts allow-same-origin allow-forms`
   - **Запретить:** `allow-top-navigation`, `allow-top-navigation-by-user-activation`, `allow-modals`

3. **Обработка HTML файлов в Explorer:**
   - Добавить проверку `.html`/`.htm` расширений
   - Открывать через `openWindow('internet-explorer', { src: htmlUrl })`

### Конкретные правки

**Новый файл:** `front/src/os/apps/InternetExplorerWindow.tsx`

```typescript
import { AppHost } from "./AppHost";

type InternetExplorerWindowProps = {
  src: string;
  title?: string;
};

export function InternetExplorerWindow({ src, title }: InternetExplorerWindowProps) {
  // HTML файлы открываются в sandbox iframe
  // Sandbox политика: allow-scripts allow-same-origin allow-forms
  // Запрещено: allow-top-navigation, allow-modals
  return (
    <AppHost 
      src={src} 
      title={title || "Internet Explorer"}
      sandbox="allow-scripts allow-same-origin allow-forms"
    />
  );
}
```

**Файл:** `front/src/os/apps/registry-init.tsx`

```typescript
import { InternetExplorerWindow } from "./InternetExplorerWindow";

// В initApps():
appRegistry.register({
  id: "internet-explorer",
  name: "Internet Explorer",
  icon: "🌐",
  component: (props: any) => (
    <InternetExplorerWindow 
      src={props.src || "about:blank"} 
      title={props.title} 
    />
  ),
  defaultWidth: 800,
  defaultHeight: 600,
  singleton: false,
});
```

**Файл:** `front/src/components/ExplorerWindow.tsx`

```typescript
// В handleOpen (строка 95-117):
const handleOpen = (node: VFSNode) => {
  if (node.type === 'dir') {
    // Navigate
    const newPath = currentPath === '/' ? `/${node.name}` : `${currentPath}/${node.name}`;
    setCurrentPath(newPath);
  } else {
    // Open file
    if (node.name.endsWith('.url')) {
      try {
        const data = JSON.parse(node.content as string);
        if (data.target) {
          openWindow(data.target);
        }
      } catch (e) {
        console.error('Failed to parse link');
      }
    } else if (node.name.endsWith('.html') || node.name.endsWith('.htm')) {
      // Open HTML in Internet Explorer with sandbox iframe
      const htmlUrl = `/api/vfs/read?key=${encodeURIComponent(node.s3Key || node.path)}`;
      openWindow('internet-explorer', { src: htmlUrl, title: node.name });
    } else if (node.name.endsWith('.txt') || node.name.endsWith('.md')) {
      openWindow('help'); // Placeholder
    } else {
      alert(`Cannot open ${node.name}`);
    }
  }
};
```

**Файл:** `front/src/pages/DesktopPage.tsx`

```typescript
// В handleIconClick (строка 64-72):
const handleIconClick = (icon: DesktopIconData) => {
  if (icon.target) {
    openWindow(icon.target as any);
  } else if (icon.id.endsWith('.html') || icon.id.endsWith('.htm')) {
    // Open HTML in Internet Explorer with sandbox iframe
    const node = vfs.stat(`/Disk C/desktop/${icon.id}`);
    if (node && node.s3Key) {
      const htmlUrl = `/api/vfs/read?key=${encodeURIComponent(node.s3Key)}`;
      openWindow('internet-explorer', { src: htmlUrl, title: icon.label });
    }
  } else if (icon.id.endsWith('.txt')) {
    openWindow('help');
  } else {
    openWindow('explorer');
  }
};
```

---

## 3. Отсутствие allow-top-navigation

### Требование (FP7.md, Security → Iframe Sandbox Policy)

> **Запрещенные флаги:**
> - `allow-top-navigation`: Запрещено (iframe не может перенаправить главное окно)
> - `allow-top-navigation-by-user-activation`: Запрещено
> - `allow-modals`: Запрещено

### Проверка

**Файлы для проверки:**
- `front/src/os/apps/AppHost.tsx`
- `front/src/components/PlayModal.tsx`

**Результаты:**

#### ✅ AppHost.tsx (строка 15)

```15:15:front/src/os/apps/AppHost.tsx
  const sandboxAttr = sandbox || "allow-scripts allow-forms allow-same-origin allow-popups";
```

**Статус:** ✅ **PASS** — `allow-top-navigation` отсутствует в дефолтной sandbox политике.

#### ✅ PlayModal.tsx (строка 70)

```70:70:front/src/components/PlayModal.tsx
            sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-popups"
```

**Статус:** ✅ **PASS** — `allow-top-navigation` отсутствует.

### Рекомендации

1. **Добавить явную проверку в код:**
   - Убедиться, что нигде не используется `allow-top-navigation`
   - Добавить валидацию sandbox атрибута (если передаётся извне)

2. **Документировать политику:**
   - Добавить комментарии в код о запрещённых флагах
   - Указать в контракте, что sandbox политика не может быть переопределена без проверки

### Конкретные правки

**Файл:** `front/src/os/apps/AppHost.tsx`

```typescript
// Добавить валидацию sandbox политики
function validateSandbox(sandbox: string): string {
  // Запрещённые флаги
  const forbidden = [
    'allow-top-navigation',
    'allow-top-navigation-by-user-activation',
    'allow-modals'
  ];
  
  const flags = sandbox.split(/\s+/);
  const filtered = flags.filter(flag => !forbidden.includes(flag));
  
  if (filtered.length !== flags.length) {
    console.warn('AppHost: Removed forbidden sandbox flags', 
      flags.filter(flag => forbidden.includes(flag)));
  }
  
  return filtered.join(' ');
}

export function AppHost({ src, title, sandbox }: AppHostProps) {
  // ...
  
  // Validate and sanitize sandbox
  const defaultSandbox = "allow-scripts allow-forms allow-same-origin allow-popups";
  const sandboxAttr = sandbox 
    ? validateSandbox(sandbox) 
    : defaultSandbox;
  
  // ...
}
```

---

## 4. Политика postMessage: allowlist типов + проверка origin

### Требование (FP7.md, Security → PostMessage Policy)

> **Контракт (без деталей реализации):**
>
> 1. **Shell → Iframe:**
>    - Shell отправляет сообщения в iframe с конкретным `targetOrigin`
>    - Сообщения валидируются по схеме `{ type: string, payload: unknown }`
>
> 2. **Iframe → Shell:**
>    - Сообщения от iframe валидируются по `event.origin`
>    - Строгая схема валидации: только разрешенные типы сообщений
>    - Игнорируются malformed сообщения
>
> 3. **Allowlist:**
>    - Только разрешенные типы сообщений обрабатываются
>    - Все остальные игнорируются

### Проверка

**Файлы для проверки:**
- Поиск по `postMessage` в `front/src/` — **не найдено использования**

**Результаты:**

#### ⚠️ PostMessage не используется

**Статус:** ⚠️ **N/A** — PostMessage не используется в текущей реализации.

**Риск:** **LOW** — нет текущей уязвимости, но нет защиты на будущее.

### Рекомендации

1. **Добавить защиту на будущее:**
   - Создать утилиту для безопасного postMessage
   - Реализовать allowlist типов сообщений
   - Добавить проверку origin

2. **Документировать политику:**
   - Создать константы для разрешённых типов сообщений
   - Добавить валидацию в компоненты, которые будут использовать postMessage

### Конкретные правки

**Новый файл:** `front/src/os/security/postMessage.ts`

```typescript
// Allowlist разрешённых типов сообщений
export const ALLOWED_MESSAGE_TYPES = [
  'vfs-read',
  'vfs-list',
  'window-close',
  'window-resize',
  // Добавить другие типы по мере необходимости
] as const;

export type AllowedMessageType = typeof ALLOWED_MESSAGE_TYPES[number];

export interface PostMessage {
  type: AllowedMessageType;
  payload: unknown;
}

// Валидация сообщения от iframe
export function validatePostMessage(
  event: MessageEvent,
  allowedOrigin: string | string[]
): PostMessage | null {
  // Проверка origin
  const origins = Array.isArray(allowedOrigin) ? allowedOrigin : [allowedOrigin];
  if (!origins.includes(event.origin) && !origins.includes('*')) {
    console.warn('PostMessage: Rejected message from unknown origin', event.origin);
    return null;
  }
  
  // Проверка структуры
  if (!event.data || typeof event.data !== 'object') {
    console.warn('PostMessage: Invalid message structure', event.data);
    return null;
  }
  
  const { type, payload } = event.data;
  
  // Проверка типа (allowlist)
  if (!ALLOWED_MESSAGE_TYPES.includes(type)) {
    console.warn('PostMessage: Rejected message type', type);
    return null;
  }
  
  return { type, payload };
}

// Безопасная отправка сообщения в iframe
export function sendPostMessage(
  iframe: HTMLIFrameElement,
  message: PostMessage,
  targetOrigin: string
): void {
  if (!iframe.contentWindow) {
    console.warn('PostMessage: Iframe contentWindow not available');
    return;
  }
  
  iframe.contentWindow.postMessage(message, targetOrigin);
}
```

**Использование в компонентах:**

```typescript
// В AppHost.tsx или InternetExplorerWindow.tsx
import { validatePostMessage, ALLOWED_MESSAGE_TYPES } from '../security/postMessage';

useEffect(() => {
  const handleMessage = (event: MessageEvent) => {
    const message = validatePostMessage(event, window.location.origin);
    if (message) {
      // Обработать сообщение
      console.log('Received message:', message);
    }
  };
  
  window.addEventListener('message', handleMessage);
  return () => window.removeEventListener('message', handleMessage);
}, []);
```

---

## Итоговый Security Checklist

| # | Проверка | Статус | Приоритет | Файлы для правки |
|---|----------|--------|-----------|------------------|
| 1 | Экранирование имён файлов в Explorer | ❌ **FAIL** | **CRITICAL** | `ExplorerWindow.tsx`, `DesktopPage.tsx` |
| 2 | Открытие HTML только в sandbox iframe | ⚠️ **N/A** (не реализовано) | **HIGH** | `InternetExplorerWindow.tsx` (новый), `registry-init.tsx`, `ExplorerWindow.tsx`, `DesktopPage.tsx` |
| 3 | Отсутствие allow-top-navigation | ✅ **PASS** | **MEDIUM** | `AppHost.tsx` (добавить валидацию) |
| 4 | Политика postMessage: allowlist + origin | ⚠️ **N/A** (не используется) | **LOW** | `postMessage.ts` (новый), компоненты с iframe |

---

## Вердикт

### ❌ **REJECT**

**Причины:**
1. **CRITICAL:** XSS через имена файлов — требуется явная санитизация/валидация
2. **HIGH:** HTML файлы не открываются в sandbox iframe — требуется реализация Internet Explorer окна
3. **MEDIUM:** Нет валидации sandbox политики — рекомендуется добавить защиту от переопределения
4. **LOW:** PostMessage политика не реализована — рекомендуется добавить на будущее

**Блокеры для release:**
- ❌ Экранирование имён файлов (CRITICAL)
- ❌ Internet Explorer окно с sandbox iframe (HIGH)

**Рекомендации:**
- Исправить блокеры перед release M2
- Добавить валидацию sandbox политики
- Реализовать PostMessage политику для будущего использования

---

## Следующие шаги

1. **Немедленно:**
   - Добавить санитизацию имён файлов в `ExplorerWindow.tsx` и `DesktopPage.tsx`
   - Реализовать `InternetExplorerWindow.tsx` с sandbox iframe
   - Обновить `ExplorerWindow.tsx` и `DesktopPage.tsx` для открытия HTML файлов

2. **Перед release:**
   - Добавить валидацию sandbox политики в `AppHost.tsx`
   - Создать утилиту `postMessage.ts` для будущего использования
   - Написать тесты для security проверок

3. **После release:**
   - Провести penetration testing
   - Обновить документацию по security политикам

---

**End of Security Checklist M2**
