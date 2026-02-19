import type { TaskbarItemState, ThemeTokenSet } from "../core/types";

interface TaskbarItemViewProps {
  item: TaskbarItemState;
  theme: ThemeTokenSet;
  scale: number;
  onClick: () => void;
}

export function TaskbarItemView({ item, onClick }: TaskbarItemViewProps) {
  return (
    <button
      type="button"
      className="wm-taskbar-item"
      data-active={item.isActive ? "true" : undefined}
      onClick={onClick}
    >
      {item.title}
    </button>
  );
}
