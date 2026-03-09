<script setup lang="ts">
/**
 * Shell — WindowManager + Desktop + Taskbar + AppHost + drag/resize.
 * UX: taskbar toggle, desktop click, titlebar clamp.
 */

import { ref, computed } from "vue";
import { useWindowActions, themeToTokenSet, isExplorerWindow, toWindowState } from "./composables/useWindowActions";
import { useDragResize } from "./composables/useDragResize";
import { useThemeScale } from "./composables/useThemeScale";
import type { ThemeId } from "./core/themePacks";
import DesktopView from "./ui/DesktopView.vue";
import DesktopIcon from "./ui/DesktopIcon.vue";
import WindowChromeView from "./ui/WindowChromeView.vue";
import TaskbarView from "./ui/TaskbarView.vue";
import AppHost from "./core/AppHost.vue";

const themeId = ref<ThemeId>("DefaultMock");
const scale = ref(1.0);

const theme = computed(() => themeToTokenSet(themeId.value));

useThemeScale(themeId, scale);

const {
  wm,
  windows,
  activeId,
  zOrder,
  createWindow,
  openMyComputer,
  handleShellOpen,
  handleShellOpenFile,
  handleDesktopClick,
  handleTaskbarClick,
  handleTitleUpdate,
  clampDrag,
  getActions,
  refresh,
  getDragState,
  getResizeState,
  clearDragState,
  clearResizeState,
} = useWindowActions();

useDragResize(wm, scale, refresh, clampDrag, getDragState, getResizeState, clearDragState, clearResizeState);

const taskbarItems = computed(() =>
  windows.value.map((w) => ({
    windowId: w.id,
    title: w.title,
    isActive: activeId.value === w.id,
    isMinimized: w.state === "minimized",
  }))
);

const visibleOrder = computed(() =>
  zOrder.value.filter((id) => {
    const w = wm.getWindow(id);
    return w && w.state !== "closed";
  })
);

function cycleTheme() {
  themeId.value = themeId.value === "DefaultMock" ? "Win98Mock" : "DefaultMock";
}

function cycleScale() {
  scale.value = scale.value === 1.0 ? 1.5 : 1.0;
}

function getExplorerSrc(w: { id: string; src?: string }) {
  if (!w.src) return w.src;
  if (isExplorerWindow(w.src) && !w.src.includes("X-Amz-Signature")) {
    return `${w.src}${w.src.includes("?") ? "&" : "?"}w=${encodeURIComponent(w.id)}`;
  }
  return w.src;
}
</script>

<template>
  <div class="shell-root">
    <DesktopView :theme="theme" :scale="scale" @click="handleDesktopClick">
      <DesktopIcon
        label="My Computer"
        @activate="($event: MouseEvent) => { $event.stopPropagation(); openMyComputer(); }"
      />
      <div class="shell-toolbar">
        <button
          type="button"
          class="shell-btn"
          @click.stop="createWindow()"
        >
          New window
        </button>
        <button
          type="button"
          class="shell-btn"
          @click.stop="cycleTheme()"
        >
          Switch theme
        </button>
        <button
          type="button"
          class="shell-btn"
          @click.stop="cycleScale()"
        >
          Switch scale
        </button>
      </div>
    </DesktopView>

    <template v-for="(id, idx) in visibleOrder" :key="id">
      <WindowChromeView
        v-if="wm.getWindow(id)"
        :window="toWindowState(wm.getWindow(id)!)"
        :z-index="100 + idx"
        :is-active="activeId === id"
        :actions="getActions(id)"
        :theme="theme"
        :scale="scale"
        :min-width="wm.getWindow(id)!.minWidth"
        :min-height="wm.getWindow(id)!.minHeight"
      >
        <AppHost
          v-if="wm.getWindow(id)!.src"
          :window-id="id"
          :src="getExplorerSrc(wm.getWindow(id)!)!"
          :scale="scale"
          :theme="themeId"
          :is-explorer="isExplorerWindow(wm.getWindow(id)!.src)"
          :open-file-payload="wm.getWindow(id)!.openFilePayload"
          @title-update="handleTitleUpdate"
          @shell-open="isExplorerWindow(wm.getWindow(id)!.src) ? handleShellOpen($event) : undefined"
          @shell-open-file="isExplorerWindow(wm.getWindow(id)!.src) ? handleShellOpenFile($event) : undefined"
        />
      </WindowChromeView>
    </template>

    <TaskbarView
      :items="taskbarItems"
      :theme="theme"
      :scale="scale"
      @item-click="handleTaskbarClick"
    />
  </div>
</template>
