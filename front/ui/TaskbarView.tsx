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
    <div data-testid="taskbar" className="wm-taskbar">
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
