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
      data-active={item.isActive ? "true" : undefined}
      onClick={onClick}
      style={{
        height: "calc(var(--wm-taskbar-height, 32px) - 8px)",
        padding: "0 var(--wm-padding-2, 8px)",
        background: item.isActive ? "rgba(255,255,255,0.3)" : "transparent",
        border: "1px solid transparent",
        borderRadius: "2px",
        color: "#fff",
        fontSize: "var(--wm-font-size, 12px)",
        fontFamily: "var(--wm-font-family)",
        cursor: "pointer",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        maxWidth: 200,
      }}
    >
      {item.title}
    </button>
  );
}
