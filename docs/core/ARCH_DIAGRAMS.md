# Architecture Diagrams — Shell MVP (FP1)

**Purpose:** Component and sequence diagrams for build.  
**Scope:** FP1 only.

---

## 1. Component diagram

```mermaid
flowchart TB
    subgraph Shell
        WM[WindowManager]
        Desktop[Desktop]
        Taskbar[Taskbar]
        AppHost[AppHost]
        ThemeProvider[ThemeProvider]
        ScaleProvider[ScaleProvider]
    end

    subgraph UIAdapter
        DesktopView[DesktopView]
        WindowChromeView[WindowChromeView]
        TaskbarView[TaskbarView]
        TaskbarItemView[TaskbarItemView]
    end

    WM --> Desktop
    WM --> Taskbar
    WM --> AppHost
    WM --> WindowChromeView
    Taskbar --> TaskbarView
    TaskbarView --> TaskbarItemView
    Desktop --> DesktopView
    AppHost --> WindowChromeView
    ThemeProvider --> DesktopView
    ThemeProvider --> WindowChromeView
    ThemeProvider --> TaskbarView
    ScaleProvider --> ThemeProvider
```

**ASCII alternative:**

```
+------------------+     +------------------+
|  ThemeProvider   |     |  ScaleProvider   |
+--------+---------+     +--------+---------+
         |                        |
         v                        v
+------------------+     +------------------+
|     Desktop      |<----|   WindowManager  |
+--------+---------+     +--------+---------+
         |                        |
         v                        v
+------------------+     +------------------+
|   DesktopView    |     |     Taskbar      |
+------------------+     +--------+---------+
                          |       |
                          v       v
                 +------------------+
                 |   TaskbarView    |
                 +--------+---------+
                          |
                          v
                 +------------------+
                 | TaskbarItemView  |
                 +------------------+

+------------------+
|    AppHost       |<---- WindowManager
+--------+---------+
         |
         v
+------------------+
| WindowChromeView |
+------------------+
```

---

## 2. Sequence: createWindow → handshake → WINDOW_TITLE

```mermaid
sequenceDiagram
    participant User
    participant WM as WindowManager
    participant AH as AppHost
    participant Iframe as App iframe

    User->>WM: createWindow(src)
    WM->>AH: mount iframe(src)
    AH->>Iframe: load
    Note over AH: state = waiting_ready, timer 2000ms
    Iframe->>AH: postMessage(APP_READY)
    AH->>WM: APP_READY received
    AH->>Iframe: postMessage(SHELL_CAPS)
    Note over AH: state = ready
    Iframe->>AH: postMessage(WINDOW_TITLE)
    AH->>WM: update title
    WM->>WM: chrome + taskbar updated
```

**Timeout path:**

```mermaid
sequenceDiagram
    participant WM as WindowManager
    participant AH as AppHost
    participant Iframe as App iframe

    WM->>AH: mount iframe(src)
    AH->>Iframe: load
    Note over AH: state = waiting_ready, timer 2000ms
    Note over Iframe: (no APP_READY)
    Note over AH: timeout 2000ms
    AH->>AH: show "App not responding"
    AH->>AH: log handshake_timeout
```

---

## 3. Focus / z-order update path

```mermaid
sequenceDiagram
    participant User
    participant Chrome as WindowChromeView
    participant WM as WindowManager
    participant Taskbar as TaskbarView

    User->>Chrome: click titlebar
    Chrome->>WM: onFocus(windowId)
    WM->>WM: set activeId = windowId, bring to top (z-order)
    WM->>Chrome: re-render (isActive)
    WM->>Taskbar: re-render (active highlight)
```

---

## 4. Theme/scale switch → iframe notification

**Rule (FP1):** On theme or scale switch, Shell resends `SHELL_CAPS` to all ready iframes. No new message types (THEME_CHANGED/SCALE_CHANGED).

```mermaid
sequenceDiagram
    participant User
    participant Shell
    participant ThemeProvider
    participant AH as AppHost
    participant Iframe1 as App iframe 1
    participant Iframe2 as App iframe 2

    User->>Shell: switch theme / scale
    Shell->>ThemeProvider: update tokens
    Shell->>AH: theme/scale changed
    AH->>Iframe1: postMessage(SHELL_CAPS)
    AH->>Iframe2: postMessage(SHELL_CAPS)
    Note over Iframe1,Iframe2: Apps apply new theme/scale
```

**Rationale:** Standalone app and app-in-Shell behave the same; single protocol path.

---

## 5. Taskbar click path

```mermaid
sequenceDiagram
    participant User
    participant Taskbar as TaskbarView
    participant Item as TaskbarItemView
    participant WM as WindowManager

    User->>Item: click
    Item->>Taskbar: onClick(windowId)
    Taskbar->>WM: onItemClick(windowId)
    alt active + not minimized
        WM->>WM: minimize(windowId)
    else minimized
        WM->>WM: restore(windowId), set activeId
    end
    WM->>Taskbar: re-render
```

---

## References

- FP1: [docs/fps/FP1.md](../fps/FP1.md)
- PROTOCOL_v0: [docs/core/PROTOCOL_v0.md](./PROTOCOL_v0.md)
- UI_ADAPTER_v0: [docs/core/UI_ADAPTER_v0.md](./UI_ADAPTER_v0.md)
