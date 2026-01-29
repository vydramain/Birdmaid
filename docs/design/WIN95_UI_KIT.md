Goal: Generate a Windows 95–style UI kit and key screens for a web “desktop shell” application.

Visual ground truth references (use as style guidance):
- https://guidebookgallery.org/guis/windows/win95
- https://guidebookgallery.org/tutorials/windows95
- https://guidebookgallery.org/screenshots/win95
- https://guidebookgallery.org/articles/windows95isfarfromchicago

Required aesthetic:
- Classic Windows 95 look: neutral gray surfaces, pixel-aligned layout, hard edges.
- 3D bevels: raised/sunken borders (no modern flat UI).
- No rounded corners, no modern drop shadows/glassmorphism, no gradients unless they match Win95.
- Compact spacing, bitmap-like typography feeling.

Core components (UI kit):
- Window frame: title bar, system buttons, borders, resize handles.
- Buttons: raised/sunken, default action emphasis.
- Inputs: text field, checkbox, radio, dropdown, listbox.
- Scrollbars: Win95 style.
- Toolbar / status bar patterns.
- Taskbar (NO start menu): tray area + user icon + local-time clock.

Key screens to generate:
1) Desktop Shell: wallpaper + desktop icons + taskbar (tray + clock).
2) Explorer window: folder tree (left) + file list (right) with file-type icons.
3) Notepad window: opens .txt file.
4) Internet Explorer window: opens .html help page.
5) User Panel window: username + role (Guest/Participant/Organizer) + Log out + (Organizer) Management entry.

Interaction rules:
- Windows cannot be dragged outside the browser viewport (viewport boundary constraint).
- Navigation is ONLY via Desktop Icons + Explorer (no classic website navigation).
- Files open by extension mapping:
  *.app → Executor iframe
  *.txt → Notepad
  *.html → Internet Explorer
  *.png/*.jpg → ImageViewer
  *.mp4 → VideoViewer

Deliverables:
- Design tokens: colors, borders, spacing, typography.
- Components + the 5 screens above in consistent Win95 styling.
