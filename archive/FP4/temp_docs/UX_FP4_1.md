# UX Spec — FP4 System Viewers & Players

> **TEMP(FP4.1):** MUST MERGE/DELETE ON ARCHIVE FP4; source-of-truth = docs/fps/FP4.md + canonical docs/core/PROTOCOL_v0.md

**Purpose:** Text-only UI description for ImageViewer, MediaPlayer (audio/video). Win98/98.css style. No screenshots.  
**Source:** [docs/fps/FP4.md](../fps/FP4.md)  
**Style reference:** [GUIDE_STYLE.md](../style/GUIDE_STYLE.md), 98.css

---

## 1. General UI Principles (98.css / Win98)

### Layout

- **Window structure:** Top (menu/toolbar) → Center (content) → Bottom (status/controls) where applicable.
- **Bevels:** Inset (sunken) for inputs, panels; outset (raised) for buttons.
- **Buttons:** Square or rectangular, small, 3D bevel (raised when idle, pressed when active).
- **Disabled:** Grayed out, no reaction to click.
- **Focus:** Dotted outline (Win98-style focus ring).
- **Units:** rem/em (no px per STYLE_GUIDE). Use design tokens.

### Keyboard (minimum)

| Key   | Action                           |
| ----- | -------------------------------- |
| Space | Play/Pause (audio, video)        |
| Left  | Prev (previous in playlist)      |
| Right | Next (next in playlist)          |
| Esc   | Close window (if Shell supports) |

---

## 2. Image Viewer

### Window

- **Title:** "Picture Viewer" or filename (e.g. "photo.png").
- **Chrome:** Standard Shell window (titlebar, min/max/close). 98.css window frame.

### Layout

- **Top:** Optional toolbar (if any) — FP4 minimal: may be empty or single row.
- **Center:** Image area. Image fits within available space (`object-fit: contain`). Background: neutral gray (e.g. `--win-gray`).
- **Bottom:** Status/control bar.

### Controls

- **Prev:** Arrow-left icon button. Cycles to previous image in playlist. Disabled if playlist length ≤ 1.
- **Next:** Arrow-right icon button. Cycles to next image in playlist. Disabled if playlist length ≤ 1.
- **Status:** "N of M" or filename (e.g. "3 of 12" or "photo.png"). In status bar.

### States

- **Single file:** Prev/Next disabled (or hidden).
- **Multiple files:** Prev/Next enabled; cyclic wrap.
- **Loading:** Placeholder or spinner until image loads.
- **Error:** Fallback text "Unable to load image" (or similar).

### Non-goals (FP4)

- Zoom, pan.
- Toolbar beyond Prev/Next.

---

## 3. Media Player (Audio)

### Window

- **Title:** "Media Player" or filename (e.g. "track.mp3").
- **Chrome:** Standard Shell window. Compact height for audio (transport bar style).

### Layout

- **Top:** Optional minimal toolbar — may be empty.
- **Center:** Transport/control panel (horizontal bar).
- **Bottom:** Optional status (filename, duration if metadata — non-goal for FP4).

### Controls (left to right)

- **Prev:** Arrow-left. Previous in playlist. Stop current → load prev → autoplay.
- **Play:** Play icon. Start or resume.
- **Pause:** Pause icon. Pause playback.
- **Stop:** Stop icon. Stop, seek(0).
- **Next:** Arrow-right. Next in playlist. Stop current → load next → autoplay.
- **Progress bar:** Read-only. Shows current position / duration. No seek in FP4.
- **Mute:** Toggle. Muted: volume 0; unmuted: restore previous value.
- **Volume slider:** 0–100%. Horizontal slider. Right of mute.

### States

- **Playing:** Play disabled (or no-op); Pause enabled.
- **Paused:** Play enabled; Pause no-op.
- **Stopped:** Play enabled; Pause/Stop no-op.
- **Autoplay blocked:** Show "Press Play" message. Play button prominent.
- **Single file:** Prev/Next disabled (or hidden).

### Disabled states

- Prev: disabled when playlist length ≤ 1 or at first and no wrap (cyclic: never disabled).
- Next: same.
- Play: no-op when already playing.
- Pause: no-op when paused or stopped.
- Stop: no-op when stopped.

---

## 4. Media Player (Video)

### Window

- **Title:** "Media Player" or filename (e.g. "video.mp4").
- **Chrome:** Standard Shell window. Larger than audio (video area + controls).

### Layout

- **Top:** Optional minimal toolbar.
- **Center:** Video area. Black background. Video `object-fit: contain` within area.
- **Bottom:** Transport bar (same as audio: Prev, Play, Pause, Stop, Next, progress, mute, volume).

### Controls

- Same as audio: Prev, Play, Pause, Stop, Next, progress (read-only), mute, volume slider.
- **Autoplay on open:** Yes. If blocked → "Press Play".

### States

- Same state machine as audio.
- **Loading:** Black area until video loads.
- **Playing:** Video visible; controls below.

### Non-goals (FP4)

- Fullscreen.
- Subtitle.
- Seek (interactive progress bar).

---

## 5. Visual Tokens (98.css mapping)

| Element    | Token / class                                                 |
| ---------- | ------------------------------------------------------------- |
| Window     | `.win-window-base`, `.win-window`                             |
| Titlebar   | `.win-titlebar`                                               |
| Buttons    | `@include button-default`, `button-active`, `button-disabled` |
| Slider     | Inset track, outset thumb                                     |
| Status bar | Inset panel, `--win-gray-dark` border                         |
| Focus      | Dotted outline (Win98)                                        |

Use `rem` for spacing, borders, font sizes. See [GUIDE_STYLE.md](../style/GUIDE_STYLE.md) conversion table.

---

## 6. References

- [FP4.md](../fps/FP4.md)
- [GUIDE_STYLE.md](../style/GUIDE_STYLE.md)
- [98.css](https://jdan.github.io/98.css/)
