/**
 * useDragResize — global mousemove/mouseup handlers for window drag & resize.
 */

import { onMounted, onBeforeUnmount, type Ref } from "vue";
import { getComputedMinSize, type WindowManager } from "../core/WindowManager";
import { analytics } from "../core/analytics";
import type { DragState, ResizeState } from "./useWindowActions";

export function useDragResize(
  wm: WindowManager,
  scale: Ref<number>,
  refresh: () => void,
  clampDrag: (id: string, x: number, y: number) => { x: number; y: number },
  getDragState: () => DragState | null,
  getResizeState: () => ResizeState | null,
  clearDragState: () => void,
  clearResizeState: () => void
) {
  function onMouseMove(e: MouseEvent) {
    const dragStateVal = getDragState();
    if (dragStateVal) {
      const { id, startX, startY, startBounds } = dragStateVal;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      const { x, y } = clampDrag(id, startBounds.x + dx, startBounds.y + dy);
      wm.updateBounds(id, { x, y });
      refresh();
    }
    const resizeStateVal = getResizeState();
    if (resizeStateVal) {
      const { id, edge, startX, startY, startBounds } = resizeStateVal;
      const w = wm.getWindow(id);
      const { width: minW, height: minH } = getComputedMinSize(scale.value, {
        minWidth: w?.minWidth,
        minHeight: w?.minHeight,
      });
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      let { x, y, width, height } = { ...startBounds };
      if (edge.includes("e")) width = Math.max(minW, startBounds.width + dx);
      if (edge.includes("w")) {
        const newWidth = Math.max(minW, startBounds.width - dx);
        x = startBounds.x + startBounds.width - newWidth;
        width = newWidth;
      }
      if (edge.includes("s")) height = Math.max(minH, startBounds.height + dy);
      if (edge.includes("n")) {
        const newHeight = Math.max(minH, startBounds.height - dy);
        y = startBounds.y + startBounds.height - newHeight;
        height = newHeight;
      }
      wm.updateBounds(id, { x, y, width, height });
      refresh();
    }
  }

  function onMouseUp() {
    const dragStateVal = getDragState();
    if (dragStateVal) {
      analytics.drag_end(dragStateVal.id);
    }
    const resizeStateVal = getResizeState();
    if (resizeStateVal) {
      analytics.resize_end(resizeStateVal.id);
    }
    clearDragState();
    clearResizeState();
  }

  onMounted(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  });

  onBeforeUnmount(() => {
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
  });
}
