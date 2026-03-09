<script setup lang="ts">
import type { TaskbarItemState } from "../core/types";

defineProps<{
  item: TaskbarItemState;
  theme: { bg: string; fg: string; border: string; accent: string; shadow: string; fontFamily: string };
  scale: number;
}>();

const emit = defineEmits<{
  click: [];
}>();
</script>

<template>
  <button
    type="button"
    class="wm-taskbar-item"
    :data-testid="`taskbar-item-${item.windowId}`"
    :data-window-id="item.windowId"
    :data-active="item.isActive ? 'true' : undefined"
    @click="emit('click')"
  >
    {{ item.title }}
  </button>
</template>
