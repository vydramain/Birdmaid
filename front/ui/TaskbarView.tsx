import type { TaskbarItemState, ThemeTokenSet } from "../core/types";
import { TaskbarItemView } from "./TaskbarItemView";

interface TaskbarViewProps {
  items: TaskbarItemState[];
  theme: ThemeTokenSet;
  scale: number;
  onItemClick: (windowId: string) => void;
}

export function TaskbarView({ items, theme, scale, onItemClick }: TaskbarViewProps) {
  return (
    <div
      data-testid="taskbar"
      className="wm-taskbar"
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: "var(--wm-taskbar-height, 32px)",
        background: "var(--wm-accent, #0078d4)",
        display: "flex",
        alignItems: "center",
        gap: "var(--wm-gap-1, 4px)",
        padding: "0 var(--wm-padding-2, 8px)",
      }}
    >
      {items.map((item) => (
        <TaskbarItemView
          key={item.windowId}
          item={item}
          theme={theme}
          scale={scale}
          onClick={() => onItemClick(item.windowId)}
        />
      ))}
    </div>
  );
}
