# Theming v0 — tokens, scale, theme packs

**Purpose:** Build-ready token schema and scaling rules. No magic geometry.  
**Scope:** FP1. Design system v0 from FP1.md.

---

## 1. Token Schema v0

### 1.1 Base tokens (unscaled)

| Token | Base value | Description |
|-------|------------|-------------|
| `--wm-titlebar-height-base` | `28px` | Titlebar height before scale |
| `--wm-border-width-base` | `2px` | Window border width |
| `--wm-taskbar-height-base` | `32px` | Taskbar height |
| `--wm-window-min-width-base` | `200px` | Minimum window width |
| `--wm-window-min-height-base` | `150px` | Minimum window height |
| `--wm-gap-1-base` | `4px` | Small gap |
| `--wm-gap-2-base` | `8px` | Medium gap |
| `--wm-padding-1-base` | `4px` | Small padding |
| `--wm-padding-2-base` | `8px` | Medium padding |
| `--wm-font-size-base` | `12px` | Base font size |

### 1.2 Geometry tokens (scaled)

All geometry uses: `calc(var(--base) * var(--wm-scale))`.

| Token | Formula |
|-------|---------|
| `--wm-titlebar-height` | `calc(var(--wm-titlebar-height-base, 28px) * var(--wm-scale))` |
| `--wm-border-width` | `calc(var(--wm-border-width-base, 2px) * var(--wm-scale))` |
| `--wm-taskbar-height` | `calc(var(--wm-taskbar-height-base, 32px) * var(--wm-scale))` |
| `--wm-window-min-width` | `calc(var(--wm-window-min-width-base, 200px) * var(--wm-scale))` |
| `--wm-window-min-height` | `calc(var(--wm-window-min-height-base, 150px) * var(--wm-scale))` |
| `--wm-gap-1` | `calc(var(--wm-gap-1-base, 4px) * var(--wm-scale))` |
| `--wm-gap-2` | `calc(var(--wm-gap-2-base, 8px) * var(--wm-scale))` |
| `--wm-padding-1` | `calc(var(--wm-padding-1-base, 4px) * var(--wm-scale))` |
| `--wm-padding-2` | `calc(var(--wm-padding-2-base, 8px) * var(--wm-scale))` |
| `--wm-font-size` | `calc(var(--wm-font-size-base, 12px) * var(--wm-scale))` |

### 1.3 Non-geometry tokens (no scale)

| Token | Description |
|-------|-------------|
| `--wm-font-family` | Font family (e.g. `system-ui`) |
| `--wm-bg` | Background color |
| `--wm-fg` | Foreground color |
| `--wm-border` | Border color |
| `--wm-accent` | Accent color |
| `--wm-shadow` | Box shadow |
| `--wm-anim-duration` | Animation duration (e.g. `150ms`) |
| `--wm-anim-ease` | Animation easing (e.g. `ease-out`) |

### 1.4 Scale token

| Token | Values | Default |
|-------|--------|---------|
| `--wm-scale` | `1.0`, `1.25`, `1.5`, `2.0` | `1.0` |

---

## 2. Units & scaling rule

**Rule:** Geometry = `calc(base * scale)`.

**Examples:**
1. Titlebar height at scale 1.0: `calc(28px * 1) = 28px`
2. Titlebar height at scale 1.5: `calc(28px * 1.5) = 42px`
3. Taskbar height at scale 1.5: `calc(32px * 1.5) = 48px`

---

## 3. Theme packs

| Token | DefaultMock | Win98Mock |
|-------|-------------|-----------|
| `--wm-bg` | `#f0f0f0` | `#008080` (teal) |
| `--wm-fg` | `#333` | `#000` |
| `--wm-border` | `#ccc` | `#000` |
| `--wm-accent` | `#0078d4` | `#c0c0c0` |
| `--wm-shadow` | `0 2px 8px rgba(0,0,0,0.15)` | `2px 2px 0 #000` |
| `--wm-font-family` | `system-ui` | `"MS Sans Serif", sans-serif` |
| *(geometry)* | same | same |

---

## 4. Scale presets

| Preset | `--wm-scale` |
|--------|--------------|
| Default | `1.0` |
| Large | `1.5` |

FP1 minimum: 1.0 and 1.5. 1.25 and 2.0 optional for later.

---

## 5. Single source of truth: CSS variables

**Rule:** Theme is defined via CSS variables on root (`:root` or Shell container). Components read tokens from `var(--wm-*)` for actual render.

- ThemeProvider/ScaleProvider set CSS variables on root.
- No duplication: theme values live only in CSS (theme packs in THEMING_v0 define the values applied to root).

## 6. No magic geometry

**Rule:** Components must read sizes from tokens, not hardcoded px.

- Titlebar height: `var(--wm-titlebar-height)`
- Taskbar height: `var(--wm-taskbar-height)`
- minWidth/minHeight: `var(--wm-window-min-width)`, `var(--wm-window-min-height)`
- Drag clamp: use `var(--wm-titlebar-height)` for titlebar region

**Forbidden:** `height: 28px`, `min-width: 200px` in chrome/taskbar components.

---

## 7. Testing theme/scale switch

**Asserts (getComputedStyle):**

| Test | Assert |
|------|--------|
| Theme switch | At least one token (e.g. `--wm-bg`) differs between DefaultMock and Win98Mock |
| Scale switch | `getComputedStyle(el).getPropertyValue('--wm-titlebar-height')` or computed height of titlebar element differs between scale 1.0 and 1.5 |
| Scale 1.0 → 1.5 | Titlebar height increases (e.g. 28px → 42px) |

**Example test snippet:**
```ts
const root = document.documentElement;
root.style.setProperty('--wm-scale', '1');
const h1 = getComputedStyle(root).getPropertyValue('--wm-titlebar-height');
root.style.setProperty('--wm-scale', '1.5');
const h2 = getComputedStyle(root).getPropertyValue('--wm-titlebar-height');
expect(h2).not.toBe(h1);
```

---

## References

- FP1: [docs/fps/FP1.md](../fps/FP1.md)
- GUARDRAILS: [docs/dev/GUARDRAILS.md](../dev/GUARDRAILS.md)
