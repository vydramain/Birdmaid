<script setup lang="ts">
/**
 * DesktopIcon — double-clickable desktop shortcut (FP3 My Computer).
 * FP3.1 A4: Uses shared fs-tile + fs-icon-my-computer (same as Explorer).
 */
import "../shared/fs-tile.css";

defineProps<{
  label: string;
}>();

const emit = defineEmits<{
  activate: [e: MouseEvent];
}>();
</script>

<template>
  <button
    type="button"
    class="desktop-icon fs-tile"
    data-testid="desktop-icon-my-computer"
    :aria-label="label"
    @dblclick="emit('activate', $event)"
  >
    <span
      class="fs-tile-icon fs-icon-my-computer"
      data-testid="my-computer-icon"
      aria-hidden="true"
    />
    <span class="fs-tile-label">{{ label }}</span>
  </button>
</template>
