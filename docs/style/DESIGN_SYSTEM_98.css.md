# FP7 Design System — 98.css Reference

**Version:** 1.0  
**Created:** 2026-02-07  
**Purpose:** Design system для FP7, неприкословно опирающийся на 98.css  
**Status:** Mandatory (обязательный референс для FP7)  
**Source:** [98.css](https://jdan.github.io/98.css/) — A design system for building faithful recreations of old UIs

> **⚠️ MANDATORY:** Референс 98.css является **обязательным** для FP7. Все компоненты, tokens и поведение должны соответствовать 98.css семантике и визуальным правилам.

---

## 1. Референс: 98.css

| Свойство | Значение |
|----------|----------|
| **URL** | https://jdan.github.io/98.css/ |
| **GitHub** | https://github.com/jdan/98.css |
| **npm** | `npm install 98.css` |
| **Описание** | A design system for building faithful recreations of old UIs (Windows 98) |
| **Особенности** | Semantic HTML, no JavaScript, accessibility-first |
| **Ориентация** | Win98-inspired, совместим с Win95 эстетикой |

**Принципы 98.css (обязательны к соблюдению):**
- **Semantic HTML:** `<button>` для кнопок, `<input type="checkbox">` с `<label for="...">`, `<select>` для dropdowns
- **Accessibility:** `aria-label` для icon buttons (Close, Minimize, Maximize, Restore, Help)
- **No JavaScript:** Только CSS, без JS-зависимостей
- **Override-friendly:** Можно переопределять стили, сохраняя общий вид

---

## 2. Маппинг: 98.css ↔ Birdmaid FP7

### 2.1 Window (Окно)

| 98.css | Birdmaid FP7 | Примечание |
|--------|--------------|------------|
| `.window` | `.win-window-base`, `.win-window`, `.win-window-frame` | Raised outer + inner border, padding |
| `.title-bar` | `.win-titlebar` | Caption bar |
| `.title-bar-text` | `.win-titlebar .title` | Заголовок окна |
| `.title-bar-controls` | `.win-window-controls` | Кнопки minimize/maximize/close |
| `.title-bar.inactive` | `.win-titlebar` (data-state="inactive") | Серый title bar для неактивного окна |
| `.window-body` | `.win-content`, `.win-window-content` | Содержимое окна |
| `button[aria-label="Close"]` | `.win-caption-button.win-caption-button-close` | Кнопка закрытия |
| `button[aria-label="Minimize"]` | `.win-caption-button` (minimize) | — |
| `button[aria-label="Maximize"]` | `.win-caption-button` (maximize) | — |
| `button[aria-label="Restore"]` | `.win-caption-button` (restore) | — |
| `button[aria-label="Help"]` | `.win-caption-button` (help) | — |
| `.minimize`, `.maximize`, `.close`, `.restore`, `.help` | Соответствующие классы для иконок | Для локализации aria-label |

**98.css структура окна:**
```html
<div class="window" style="width: 300px">
  <div class="title-bar">
    <div class="title-bar-text">A Complete Window</div>
    <div class="title-bar-controls">
      <button aria-label="Minimize"></button>
      <button aria-label="Maximize"></button>
      <button aria-label="Close"></button>
    </div>
  </div>
  <div class="window-body">
    <p>There's so much room for activities!</p>
  </div>
</div>
```

### 2.2 Button (Кнопка)

| 98.css | Birdmaid FP7 | Примечание |
|--------|--------------|------------|
| `<button>` | `@include button-default` | 75px min-width, 23px height, 12px horizontal padding |
| `button.default` | Primary/accept button | Дополнительная обводка для default action |
| `button:active` | `@include button-active` | Sunken borders, translate(1px, 1px) |
| `button:disabled` | `@include button-disabled` | Washed out appearance |
| `button:focus` | Dotted border 4px inset | Focus indicator |

**98.css спецификация кнопки:**
- Standard: 75px wide × 23px tall
- Raised outer and inner border
- 12px horizontal padding by default
- Pressed: raised → sunken borders
- Disabled: same raised border, washed out label
- Focus: dotted border, 4px within contents

### 2.3 Form Controls

| 98.css | Birdmaid FP7 | Примечание |
|--------|--------------|------------|
| `input[type="checkbox"]` + `label[for="..."]` | Checkbox + label | Sunken panel, check icon when selected |
| `input[type="radio"]` + `label[for="..."]` | Radio + label | Option buttons |
| `input[type="text"]` | `@include input-text` | Text box (inset bevel) |
| `textarea` | Textarea | Inset bevel |
| `select` | Dropdown | — |
| `input[type="range"]` | Slider | — |
| `.field-row` | Layout utility | Spacing between inputs |
| `.field-row-stacked` | Stacked layout | Label above input |
| `fieldset` + `legend` | GroupBox | Sunken outer, raised inner border |

### 2.4 Tree View

| 98.css | Birdmaid FP7 | Примечание |
|--------|--------------|------------|
| `ul.tree-view` | `.explorer-tree` | Tree list |
| `ul.tree-view li` | Tree item | — |
| Nested `ul` | Child nodes | Dotted border, indentation |
| `details` + `summary` | Expandable sections | — |

**98.css tree structure:**
```html
<ul class="tree-view">
  <li>Table of Contents</li>
  <li>What is web development?</li>
  <li>
    CSS
    <ul>
      <li>Selectors</li>
      <li>Specificity</li>
      <li>Properties</li>
    </ul>
  </li>
  <li>
    <details open>
      <summary>JavaScript</summary>
      <ul>
        <li>...</li>
      </ul>
    </details>
  </li>
</ul>
```

### 2.5 Table View

| 98.css | Birdmaid FP7 | Примечание |
|--------|--------------|------------|
| `div.sunken-panel` + `table` | Explorer grid/list | Inset border, overflow |
| `table.interactive` | — | Pointer cursor on hover |
| `tr.highlighted` | Selected row | Blue background |

### 2.6 Status Bar

| 98.css | Birdmaid FP7 | Примечание |
|--------|--------------|------------|
| `.status-bar` | Explorer status bar | — |
| `.status-bar-field` | Status field | — |

### 2.7 Tabs

| 98.css | Birdmaid FP7 | Примечание |
|--------|--------------|------------|
| `menu[role="tablist"]` | Tab list | — |
| `li[role="tab"]` | Tab item | — |
| `[aria-selected="true"]` | Active tab | — |
| `menu[role="tablist"].multirows` | Multi-row tabs | — |
| `div[role="tabpanel"]` | Tab content | — |

### 2.8 Field Borders

| 98.css | Birdmaid FP7 | Примечание |
|--------|--------------|------------|
| `.field-border` | Work area | Sunken outer + inner |
| `.field-border-disabled` | Disabled work area | — |
| `.status-field-border` | Dynamic content | Sunken outer only |

### 2.9 Progress Indicator

| 98.css | Birdmaid FP7 | Примечание |
|--------|--------------|------------|
| `.progress-indicator` | Progress bar | Solid |
| `.progress-indicator.segmented` | Segmented bar | — |
| `.progress-indicator-bar` | Bar fill | `style="width: 40%"` |

---

## 3. Token Mapping: 98.css → Birdmaid Tokens

98.css использует CSS custom properties. Birdmaid themes (`_win95-default.scss`) уже определяют эквиваленты:

| 98.css (implicit) | Birdmaid Token | Value |
|-------------------|----------------|-------|
| Button face | `--win-gray` | #c0c0c0 |
| Button highlight | `--win-gray-light` | #dfdfdf |
| Button shadow | `--win-gray-dark` | #808080 |
| Button dk shadow | `--win-gray-darker` | #404040 |
| Window | `--win-gray` | #c0c0c0 |
| Window text | `--win-text` | #000000 |
| Window frame | `--win-black` | #000000 |
| Active title | `--win-blue` → `--win-blue-light` | #000080 → #1084d0 |
| Inactive title | `--win-gray` | #c0c0c0 |
| App workspace | `--win-gray` | #c0c0c0 |

**Ориентир:** 98.css ориентирован на Windows 98, Birdmaid — на Chicago95 (Win95). Палитры совместимы.

---

## 4. Обязательные правила из 98.css

### 4.1 Semantic HTML (обязательно)

- **Button:** `<button>` или `<input type="submit">` / `<input type="reset">`
- **Checkbox:** `<input type="checkbox" id="x">` + `<label for="x">Label</label>`
- **Radio:** `<input type="radio" name="g" id="x">` + `<label for="x">Label</label>`
- **Text:** `<input type="text" id="x">` + `<label for="x">Label</label>`
- **Textarea:** `<textarea id="x">` + `<label for="x">Label</label>`
- **Select:** `<select>` + `<option>`
- **Icon buttons:** `aria-label="Close"`, `aria-label="Minimize"`, etc.

### 4.2 Accessibility (обязательно)

- Все input элементы имеют соответствующий `<label for="id">`
- Icon-only кнопки имеют `aria-label`
- Tab list: `role="tablist"`, `role="tab"`, `aria-selected`

### 4.3 Layout (98.css)

- **field-row:** Горизонтальная группа input + label с consistent spacing
- **field-row-stacked:** Label над input (vertical layout)
- **fieldset + legend:** Group box для группировки controls

### 4.4 No-Web Rules (из CHICAGO95_UI_CONTRACT)

- `border-radius: 0` — никаких скруглений
- Без blur, glassmorphism, smooth animations
- Instant state changes или < 100ms linear

---

## 5. Компоненты FP7: Checklist соответствия 98.css

| Компонент | 98.css Compliance | Действие |
|-----------|-------------------|----------|
| Window Frame | ✅ | title-bar, window-body, controls |
| Taskbar | ⚠️ | Нет в 98.css — использовать field-border + outset |
| Desktop Icons | ⚠️ | Нет в 98.css — использовать button-like outset |
| Explorer Tree | ✅ | tree-view semantics |
| Explorer Grid | ✅ | sunken-panel + table |
| Start Menu | ⚠️ | Popup menu — использовать field-border + menu styling |
| Context Menu | ⚠️ | Аналогично Start Menu |
| Buttons | ✅ | Прямое соответствие |
| Inputs | ✅ | field-row, inset bevel |
| Login Window | ✅ | window + window-body + buttons |
| Logout Dialog | ✅ | window + window-body + buttons |

**Легенда:** ✅ — прямое соответствие; ⚠️ — расширение (98.css не покрывает, но визуал согласован)

---

## 6. Design Decisions (ADR)

### ADR-DS1: 98.css как canonical reference

**Решение:** 98.css (https://jdan.github.io/98.css/) является обязательным референсом для FP7 design system.

**Контекст:** FP7 требует аутентичную Win95/Win98 эстетику. 98.css — проверенная OSS библиотека с semantic HTML и accessibility.

**Последствия:**
- Все новые компоненты должны следовать 98.css семантике
- Маппинг классов и tokens документирован в этом файле
- Отклонения допустимы только для компонентов, не охваченных 98.css (Taskbar, Desktop Icons)

### ADR-DS2: Birdmaid class naming vs 98.css

**Решение:** Birdmaid использует префикс `win-` и свой namespace (`.win-window-base`, `.win-titlebar`) вместо прямого импорта 98.css.

**Контекст:** FP7 имеет theme system, guardrails (rem, no !important), и специфичные компоненты (Taskbar, Explorer). Прямой импорт 98.css создал бы конфликты.

**Последствия:**
- Маппинг 98.css → Birdmaid classes обязателен
- Визуальный результат должен быть идентичен 98.css

### ADR-DS3: Semantic HTML обязателен

**Решение:** Все form controls и interactive элементы должны использовать semantic HTML как в 98.css (button, input+label, select, etc.).

**Контекст:** 98.css стилизует semantic HTML. Использование div вместо button ломает accessibility и визуал.

**Последствия:**
- Не использовать `<div role="button">` где достаточно `<button>`
- Все inputs с labels, icon buttons с aria-label

---

## 7. References

| Document | Purpose |
|----------|---------|
| [98.css](https://jdan.github.io/98.css/) | Canonical visual reference |
| [98.css GitHub](https://github.com/jdan/98.css) | Source, issues |
| [GUIDE_STYLE.md](./GUIDE_STYLE.md) | Style guide, tokens, mixins |
| [WIN95_SPEC.md](./WIN95_SPEC.md) | Metrics, colors, states |
| [CHICAGO95_UI_CONTRACT.md](./CHICAGO95_UI_CONTRACT.md) | No-Web rules, OS illusion |
| [FP7.md](../fps/FP7.md) | FP7 contract |

---

## Version History

- **v1.0 (2026-02-07):** Initial design system with 98.css as mandatory reference
