<script setup lang="ts">
import type { TaskbarItemState, ThemeTokenSet } from "../core/types";
import TaskbarItemView from "./TaskbarItemView.vue";

defineProps<{
  items: TaskbarItemState[];
  theme: ThemeTokenSet;
  scale: number;
}>();

const emit = defineEmits<{
  itemClick: [windowId: string];
}>();
</script>

<template>
  <div data-testid="taskbar" class="wm-taskbar">
    <TaskbarItemView
      v-for="item in items"
      :key="item.windowId"
      :item="item"
      :theme="theme"
      :scale="scale"
      @click="emit('itemClick', item.windowId)"
    />
  </div>
</template>
