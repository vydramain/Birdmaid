<script setup lang="ts">
import { computed } from "vue";
import type { WindowState, WindowActions, ResizeEdge } from "../core/types";
import { getComputedMinSize } from "../core/WindowManager";

const props = withDefaults(
  defineProps<{
    window: WindowState;
    isActive: boolean;
    actions: WindowActions;
    theme: { fontFamily: string };
    scale: number;
    minWidth?: number;
    minHeight?: number;
    zIndex?: number;
  }>(),
  { zIndex: 100 }
);

const RESIZE_EDGES: ResizeEdge[] = ["n", "s", "e", "w", "ne", "nw", "se", "sw"];

const isMinimized = computed(() => props.window.state === "minimized");
const isMaximized = computed(() => props.window.state === "maximized");

const computedMinSize = computed(() =>
  getComputedMinSize(props.scale, {
    minWidth: props.minWidth,
    minHeight: props.minHeight,
  })
);

const windowStyle = computed(() => ({
  left: `${props.window.bounds.x}px`,
  top: `${props.window.bounds.y}px`,
  width: `${props.window.bounds.width}px`,
  height: `${props.window.bounds.height}px`,
  zIndex: props.zIndex,
  display: isMinimized.value ? "none" : undefined,
  "--wm-window-min-width-px": `${computedMinSize.value.width}px`,
  "--wm-window-min-height-px": `${computedMinSize.value.height}px`,
}));

function onTitlebarMouseDown(e: MouseEvent) {
  if ((e.target as HTMLElement).closest("button")) return;
  props.actions.onFocus();
  props.actions.onDragStart(e);
}

function onResizeMouseDown(edge: ResizeEdge, e: MouseEvent) {
  e.stopPropagation();
  props.actions.onResizeStart(edge, e);
}
</script>

<template>
  <div
    data-testid="window-chrome"
    class="wm-window"
    :data-active="isActive ? 'true' : undefined"
    :data-minimized="isMinimized ? 'true' : undefined"
    :data-maximized="isMaximized ? 'true' : undefined"
    :style="windowStyle"
  >
    <div
      data-testid="window-titlebar"
      class="wm-titlebar"
      data-draggable
      @mousedown="onTitlebarMouseDown"
    >
      <span data-testid="window-title" class="wm-window-title">
        {{ window.title }}
      </span>
      <div class="wm-titlebar-actions">
        <button
          type="button"
          class="wm-titlebar-btn"
          aria-label="Minimize"
          @click.stop="actions.onMinimize()"
        >
          −
        </button>
        <button
          type="button"
          class="wm-titlebar-btn"
          aria-label="Maximize"
          @click.stop="actions.onMaximize()"
        >
          □
        </button>
        <button
          type="button"
          class="wm-titlebar-btn"
          aria-label="Close"
          @click.stop="actions.onClose()"
        >
          ×
        </button>
      </div>
    </div>
    <div class="wm-window-body">
      <div v-if="window.placeholder" class="wm-window-placeholder">{{ window.placeholder }}</div>
      <slot v-else />
    </div>
    <div
      v-for="edge in RESIZE_EDGES"
      :key="edge"
      class="wm-resize-edge"
      :data-resize-edge="edge"
      :style="isMaximized ? { pointerEvents: 'none' } : undefined"
      @mousedown.stop="onResizeMouseDown(edge, $event)"
    />
  </div>
</template>
