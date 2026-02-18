# UI Adapter v0 — Slot API and props contract

**Purpose:** Build-ready slot API for Shell views. WindowManager/AppHost do not import CSS/icons directly.  
**Scope:** FP1. Slots from FP1.md.

---

## 1. Slot API

Shell accepts `uiAdapter` (object of view components) or uses default.

```ts
interface UIAdapter {
  DesktopView: React.ComponentType<DesktopViewProps>;
  WindowChromeView: React.ComponentType<WindowChromeViewProps>;
  TaskbarView: React.ComponentType<TaskbarViewProps>;
  TaskbarItemView: React.ComponentType<TaskbarItemViewProps>;
}
```

---

## 2. Props contracts

### 2.1 DesktopView

```ts
interface DesktopViewProps {
  theme: ThemeTokenSet;
  scale: number;
  children?: React.ReactNode;
}
```

### 2.2 WindowChromeView

```ts
interface WindowChromeViewProps {
  window: WindowState;
  isActive: boolean;
  actions: WindowActions;
  theme: ThemeTokenSet;
  scale: number;
  children?: React.ReactNode; // iframe or placeholder
}

interface WindowState {
  id: string;
  title: string;
  state: 'normal' | 'minimized' | 'maximized';
  bounds: { x: number; y: number; width: number; height: number };
  placeholder?: string; // e.g. "App not responding"
}

interface WindowActions {
  onMinimize: () => void;
  onMaximize: () => void;
  onClose: () => void;
  onFocus: () => void;
  onDragStart: (e: React.MouseEvent | React.PointerEvent) => void;
  onResizeStart: (edge: ResizeEdge, e: React.MouseEvent | React.PointerEvent) => void;
}

type ResizeEdge = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';
```

### 2.3 TaskbarView

```ts
interface TaskbarViewProps {
  items: TaskbarItemState[];
  theme: ThemeTokenSet;
  scale: number;
  onItemClick: (windowId: string) => void;
}

interface TaskbarItemState {
  windowId: string;
  title: string;
  isActive: boolean;
  isMinimized: boolean;
}
```

### 2.4 TaskbarItemView

```ts
interface TaskbarItemViewProps {
  item: TaskbarItemState;
  theme: ThemeTokenSet;
  scale: number;
  onClick: () => void;
}
```

### 2.5 ThemeTokenSet

**Single source of truth:** Theme is applied via CSS variables on root (`:root` or Shell container). See THEMING_v0.

```ts
interface ThemeTokenSet {
  bg: string;
  fg: string;
  border: string;
  accent: string;
  shadow: string;
  fontFamily: string;
}
```

**Usage:** `theme: ThemeTokenSet` in props is for **imperative overrides only** (icons, fonts, programmatic fallbacks). Components **must** use CSS vars (`var(--wm-bg)`, etc.) for actual render. Prevents duplication of theme in two places.

---

## 3. Dependency rule

**Rule:** WindowManager and AppHost must NOT import:
- CSS/SCSS files
- Icon assets (SVG, PNG)
- Font files

They may only:
- Use tokens (CSS variables) for styling
- Render slot components via `uiAdapter`
- Pass `theme` and `scale` to slots

Slots (DesktopView, WindowChromeView, etc.) may import their own CSS/icons; core logic does not.

---

## 4. Default adapter

If no `uiAdapter` provided, Shell uses built-in default components that implement the same props contracts.

---

## References

- FP1: [docs/fps/FP1.md](../fps/FP1.md)
- THEMING_v0: [docs/core/THEMING_v0.md](./THEMING_v0.md)
