/**
 * UI Adapter types — FP1 § Customization, THEMING.
 */

export interface ThemeTokenSet {
  bg: string;
  fg: string;
  border: string;
  accent: string;
  shadow: string;
  fontFamily: string;
}

export interface WindowState {
  id: string;
  title: string;
  state: "normal" | "minimized" | "maximized";
  bounds: { x: number; y: number; width: number; height: number };
  placeholder?: string;
}

export type ResizeEdge = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

export interface WindowActions {
  onMinimize: () => void;
  onMaximize: () => void;
  onClose: () => void;
  onFocus: () => void;
  onDragStart: (e: React.MouseEvent | React.PointerEvent) => void;
  onResizeStart: (edge: ResizeEdge, e: React.MouseEvent | React.PointerEvent) => void;
}

export interface TaskbarItemState {
  windowId: string;
  title: string;
  isActive: boolean;
  isMinimized: boolean;
}
