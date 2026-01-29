/**
 * Windows 95 UI Tokens
 * 
 * Source of truth for Win95 styling tokens.
 * Used by components to ensure consistent Windows 95 aesthetic.
 * 
 * References:
 * - FP7.md: UX Rules Desktop Win95
 * - design/WIN95_UI_KIT.md: Design requirements
 * - design/screenshots/**: Visual references
 * - design/icons/**: Icon references
 */

// ============================================================================
// Colors
// ============================================================================

export const colors = {
  // Base grays (Chicago95 palette)
  gray: '#c0c0c0',           // Main window background
  grayLight: '#dfdfdf',      // Top/left borders (raised)
  grayDark: '#808080',       // Bottom/right borders (sunken)
  grayDarker: '#404040',     // Deepest shadows
  
  // System colors
  white: '#ffffff',           // Text on dark, top/left highlights
  black: '#000000',          // Text, outer borders
  
  // Accent colors
  blue: '#000080',            // Title bar background (start)
  blueLight: '#1084d0',      // Title bar background (end gradient)
  teal: '#008080',            // Desktop background (classic dithered)
  red: '#ff0000',             // Error states, close button hover
  yellow: '#ffff00',          // Tooltips, highlights
  
  // Text colors
  text: '#000000',            // Default text
  textInverse: '#ffffff',     // Text on dark backgrounds (title bar)
  textDisabled: '#808080',   // Disabled text (with text-shadow)
} as const;

// ============================================================================
// Borders (3D Bevels)
// ============================================================================

/**
 * Inset border (sunken panel)
 * Top/left: dark, bottom/right: light
 */
export const borderInset = {
  borderTop: `1px solid ${colors.grayDark}`,
  borderLeft: `1px solid ${colors.grayDark}`,
  borderRight: `1px solid ${colors.white}`,
  borderBottom: `1px solid ${colors.white}`,
  boxShadow: `inset 1px 1px 0 ${colors.black}`,
} as const;

/**
 * Outset border (raised panel)
 * Top/left: light, bottom/right: dark
 */
export const borderOutset = {
  borderTop: `1px solid ${colors.white}`,
  borderLeft: `1px solid ${colors.white}`,
  borderRight: `1px solid ${colors.grayDark}`,
  borderBottom: `1px solid ${colors.grayDark}`,
  boxShadow: `1px 1px 0 ${colors.black}`,
} as const;

/**
 * Window frame border (3D window)
 * Outer: black, inner: 3D bevel
 */
export const borderWindow = {
  borderTop: `1px solid ${colors.grayLight}`,
  borderLeft: `1px solid ${colors.grayLight}`,
  borderRight: `1px solid ${colors.grayDark}`,
  borderBottom: `1px solid ${colors.grayDark}`,
  boxShadow: `1px 1px 0 ${colors.black}, inset 1px 1px ${colors.white}, inset -1px -1px ${colors.grayDarker}`,
} as const;

// ============================================================================
// Window Title Bar
// ============================================================================

export const windowTitleBar = {
  height: 20,                 // 20px height (including padding)
  padding: '2px 4px',         // Internal padding
  fontSize: '12px',           // Font size
  fontWeight: 'bold',         // Bold text
  letterSpacing: '0.5px',     // Letter spacing
  background: `linear-gradient(90deg, ${colors.blue} 0%, ${colors.blueLight} 100%)`,
  color: colors.textInverse,
  margin: '2px',              // Margin from window edge
} as const;

// ============================================================================
// Window Control Buttons (Minimize/Maximize/Close)
// ============================================================================

export const windowControls = {
  // Button size
  size: 18,                   // 18x18px buttons
  gap: 2,                     // 2px gap between buttons
  
  // Button styles
  button: {
    width: '18px',
    height: '18px',
    padding: 0,
    fontSize: '12px',
    lineHeight: '18px',
    textAlign: 'center',
    cursor: 'pointer',
    border: `1px solid ${colors.black}`,
    borderTopColor: colors.white,
    borderLeftColor: colors.white,
    borderRightColor: colors.black,
    borderBottomColor: colors.black,
    boxShadow: `1px 1px 0 ${colors.black}, inset -1px -1px 0 ${colors.grayDark}`,
    background: colors.gray,
    color: colors.text,
  },
  
  // Button active state (pressed)
  buttonActive: {
    borderTopColor: colors.black,
    borderLeftColor: colors.black,
    borderRightColor: colors.white,
    borderBottomColor: colors.white,
    boxShadow: 'none',
    transform: 'translate(1px, 1px)',
  },
  
  // Close button hover (optional red tint)
  closeHover: {
    backgroundColor: colors.red,
    color: colors.white,
  },
} as const;

// ============================================================================
// Desktop Icons
// ============================================================================

export const desktopIcons = {
  // Grid layout
  grid: {
    columnGap: 8,             // 8px horizontal gap between icons
    rowGap: 16,               // 16px vertical gap between icons
    padding: 8,               // 8px padding from desktop edges
  },
  
  // Icon container
  icon: {
    width: 48,                 // 48x48px icon container
    height: 48,
    backgroundColor: colors.gray,
    border: `2px outset ${colors.grayLight}`,
    marginBottom: 4,          // 4px gap to label
  },
  
  // Icon label
  label: {
    fontSize: '11px',         // 11px font size
    textAlign: 'center' as const,
    maxWidth: 64,             // 64px max width for label
    color: colors.text,
    lineHeight: '1.2',
  },
  
  // Icon spacing (clickable area)
  spacing: {
    padding: 8,               // 8px padding around icon+label
    cursor: 'pointer',
  },
  
  // Icon selected state (optional)
  selected: {
    backgroundColor: colors.blue,
    color: colors.textInverse,
  },
} as const;

// ============================================================================
// Buttons
// ============================================================================

export const buttons = {
  // Default button
  default: {
    padding: '4px 12px',      // Vertical 4px, horizontal 12px
    fontSize: '11px',         // 11px font size
    minWidth: 20,             // Minimum 20px width
    border: `1px solid ${colors.black}`,
    borderTopColor: colors.white,
    borderLeftColor: colors.white,
    borderRightColor: colors.black,
    borderBottomColor: colors.black,
    boxShadow: `1px 1px 0 ${colors.black}, inset -1px -1px 0 ${colors.grayDark}`,
    background: colors.gray,
    color: colors.text,
    cursor: 'pointer',
    textAlign: 'center' as const,
  },
  
  // Button active (pressed)
  active: {
    borderTopColor: colors.black,
    borderLeftColor: colors.black,
    borderRightColor: colors.white,
    borderBottomColor: colors.white,
    boxShadow: 'none',
    transform: 'translate(1px, 1px)',
  },
  
  // Button disabled
  disabled: {
    color: colors.textDisabled,
    textShadow: `1px 1px ${colors.white}`,
    cursor: 'not-allowed',
  },
} as const;

// ============================================================================
// Input Fields
// ============================================================================

export const inputs = {
  // Text input (inset)
  text: {
    padding: '4px 6px',       // 4px vertical, 6px horizontal
    fontSize: '11px',         // 11px font size
    background: colors.white,
    ...borderInset,
    color: colors.text,
  },
  
  // Textarea (inset)
  textarea: {
    padding: '4px 6px',
    fontSize: '11px',
    background: colors.white,
    ...borderInset,
    color: colors.text,
    fontFamily: 'inherit',
  },
} as const;

// ============================================================================
// Taskbar
// ============================================================================

export const taskbar = {
  height: 40,                 // 40px height
  backgroundColor: colors.gray,
  borderTop: `2px solid ${colors.white}`,
  borderBottom: `2px solid ${colors.grayDark}`,
  padding: '0 8px',          // 8px horizontal padding
  zIndex: 10000,             // Always on top
  
  // Tray area (right side)
  tray: {
    gap: 8,                   // 8px gap between tray items
    padding: '0 4px',        // 4px padding around tray items
  },
  
  // Tray icon
  trayIcon: {
    width: 24,                // 24x24px tray icon
    height: 24,
    cursor: 'pointer',
  },
  
  // Clock
  clock: {
    fontSize: '11px',
    color: colors.text,
    padding: '0 4px',
  },
} as const;

// ============================================================================
// Typography
// ============================================================================

export const typography = {
  fontFamily: '"MS Sans Serif", "Tahoma", sans-serif',
  fontSize: {
    small: '10px',            // Tooltips, small labels
    normal: '11px',           // Default text, buttons, inputs
    medium: '12px',           // Title bar, menu items
    large: '14px',            // Headings (if needed)
  },
  fontWeight: {
    normal: 'normal',
    bold: 'bold',
  },
  lineHeight: {
    tight: '1.2',
    normal: '1.4',
    relaxed: '1.6',
  },
} as const;

// ============================================================================
// Spacing
// ============================================================================

export const spacing = {
  xs: 2,                      // 2px - minimal spacing
  sm: 4,                      // 4px - small spacing
  md: 8,                      // 8px - medium spacing
  lg: 12,                     // 12px - large spacing
  xl: 16,                     // 16px - extra large spacing
} as const;

// ============================================================================
// Shadows (Win95 style only)
// ============================================================================

export const shadows = {
  // Window shadow (when focused/elevated)
  window: `4px 4px 10px rgba(0,0,0,0.5)`,
  
  // Button shadow (outset)
  button: `1px 1px 0 ${colors.black}, inset -1px -1px 0 ${colors.grayDark}`,
  
  // Inset shadow
  inset: `inset 1px 1px 0 ${colors.black}`,
  
  // Outset shadow
  outset: `1px 1px 0 ${colors.black}`,
} as const;

// ============================================================================
// Export all tokens
// ============================================================================

export const win95Tokens = {
  colors,
  borders: {
    inset: borderInset,
    outset: borderOutset,
    window: borderWindow,
  },
  windowTitleBar,
  windowControls,
  desktopIcons,
  buttons,
  inputs,
  taskbar,
  typography,
  spacing,
  shadows,
} as const;

export default win95Tokens;
