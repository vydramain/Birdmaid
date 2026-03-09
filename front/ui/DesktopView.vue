<script setup lang="ts">
import type { ThemeTokenSet } from "../core/types";

defineProps<{
  theme: ThemeTokenSet;
  scale: number;
}>();

const emit = defineEmits<{
  click: [];
}>();
</script>

<template>
  <div
    data-testid="desktop"
    class="wm-desktop"
    role="presentation"
    @click="emit('click')"
    @mousedown="emit('click')"
  >
    <slot />
  </div>
</template>
