<script setup lang="ts">
/**
 * AppHost — iframe mount/unmount, postMessage bridge per FP1 § Protocol.
 * Origin allowlist, event.source routing, targetOrigin=event.origin, handshake timeout 2000ms.
 */

import { ref, watch, onBeforeUnmount, useTemplateRef } from "vue";
import { isAllowedOrigin, createShellCaps, type ShellMessage } from "./protocol";

const PRIVILEGED_TYPES = ["SHELL_OPEN", "SHELL_OPEN_FILE", "READ_FILE", "LIST_FILES"] as const;
import { analytics } from "./analytics";

const HANDSHAKE_TIMEOUT_MS = 2000;

interface ShellOpenPayload {
  kind: "file" | "app";
  path: string;
  mime?: string;
  title?: string;
}

interface OpenFilePayload {
  initialPath: string;
  initialUrl: string;
  playlist: Array<{ path: string; url: string }>;
}

const props = withDefaults(
  defineProps<{
    windowId: string;
    src: string;
    scale: number;
    theme: string;
    /** FP3: Explorer gets allow-same-origin sandbox + systemToken in SHELL_CAPS */
    isExplorer?: boolean;
    /** FP4: Viewer OPEN_FILE payload. When set, send OPEN_FILE on APP_READY instead of SHELL_CAPS */
    openFilePayload?: OpenFilePayload;
    /** FP5: User app — stricter sandbox, no token, privileged types rejected */
    isUserApp?: boolean;
  }>(),
  {
    isExplorer: false,
    isUserApp: undefined,
  }
);

const emit = defineEmits<{
  titleUpdate: [windowId: string, title: string];
  /** FP3: Called when Explorer sends SHELL_OPEN (only when isExplorer) */
  shellOpen: [payload: ShellOpenPayload];
  /** FP4: Called when Explorer sends SHELL_OPEN_FILE (only when isExplorer) */
  shellOpenFile: [payload: { path: string; playlist: Array<{ path: string; url: string }> }];
}>();

const iframeRef = useTemplateRef<HTMLIFrameElement>("iframeRef");
const placeholder = ref<string | null>("Loading...");

const isUserApp = props.isUserApp ?? props.src.includes("/apps/user/");
const isViewer =
  props.src?.includes("/apps/image-viewer") === true ||
  props.src?.includes("/apps/media-player") === true ||
  props.src?.includes("/apps/internet-explorer") === true;

// Imperative state — no reactivity needed
let handshakeTimer: ReturnType<typeof setTimeout> | null = null;
const sourceToWindowId = new Map<MessageEventSource, string>();
let readyState: { source: MessageEventSource; origin: string } | null = null;

function sendToSource(source: MessageEventSource, origin: string, data: ShellMessage) {
  if (!isAllowedOrigin(origin)) return;
  const win = source as Window;
  if (typeof win.postMessage !== "function") return;
  const targetOrigin = origin === "null" ? "*" : origin;
  win.postMessage(data, targetOrigin);
}

function sendShellCaps() {
  const r = readyState;
  if (!r) return;
  const caps = createShellCaps(props.windowId, props.scale, props.theme, props.isExplorer && !isUserApp);
  sendToSource(r.source, r.origin, caps);
}

function handleMessage(event: MessageEvent) {
  const origin = event.origin ?? "null";
  if (!isAllowedOrigin(origin)) {
    analytics.message_rejected("origin_not_allowed", origin);
    return;
  }
  const source = event.source;
  if (!source) return;
  const data = event.data as ShellMessage;
  if (data?.type === "FETCH_RESULT" && iframeRef.value?.contentWindow === source) {
    const status = (data.payload as { status?: number })?.status;
    if (typeof status === "number") {
      (window as unknown as { __lastFetchStatus?: number }).__lastFetchStatus = status;
    }
    return;
  }
  let knownWindowId = sourceToWindowId.get(source);
  if (!knownWindowId && iframeRef.value?.contentWindow === source) {
    sourceToWindowId.set(source, props.windowId);
    knownWindowId = props.windowId;
  }
  if (!knownWindowId) {
    analytics.message_rejected("unknown_source");
    return;
  }
  if (!data || typeof data.type !== "string") return;

  if (data.type === "APP_READY") {
    if (import.meta.env.DEV && typeof performance?.mark === "function") {
      performance.mark(`app-${props.windowId}-ready`);
      try {
        performance.measure(
          `app-${props.windowId}-load`,
          `app-${props.windowId}-start`,
          `app-${props.windowId}-ready`
        );
        const entries = performance.getEntriesByName(`app-${props.windowId}-load`);
        if (entries[0]?.duration != null && typeof console?.debug === "function") {
          console.debug(
            "[AppHost] APP_READY",
            props.windowId,
            `${Math.round(entries[0].duration)}ms`
          );
        }
      } catch {
        /* ignore */
      }
    }
    if (handshakeTimer) {
      clearTimeout(handshakeTimer);
      handshakeTimer = null;
    }
    placeholder.value = null;
    readyState = { source, origin };
    analytics.app_ready(props.windowId);
    if (props.openFilePayload) {
      sendToSource(source, origin, {
        type: "OPEN_FILE",
        payload: props.openFilePayload as unknown as Record<string, unknown>,
        timestamp: Date.now(),
      });
    } else {
      const caps = createShellCaps(props.windowId, props.scale, props.theme, props.isExplorer && !isUserApp);
      sendToSource(source, origin, caps);
    }
    (window as unknown as { __shellCapsSent?: boolean }).__shellCapsSent = true;
  } else if (data.type === "WINDOW_TITLE") {
    const title = data.payload?.title;
    if (typeof title === "string") {
      emit("titleUpdate", knownWindowId, title);
    }
  } else if (data.type === "ERROR") {
    const msg = data.payload?.message;
    if (typeof msg === "string") {
      placeholder.value = `App error: ${msg}`;
    }
  } else if (isUserApp) {
    const reason = PRIVILEGED_TYPES.includes(data.type as (typeof PRIVILEGED_TYPES)[number])
      ? `user_app_privileged:${data.type}`
      : `user_app_unknown:${data.type}`;
    analytics.message_rejected(reason, origin);
  } else if (data.type === "SHELL_OPEN" && props.isExplorer) {
    const payload = data.payload as unknown as ShellOpenPayload;
    if (payload && typeof payload.kind === "string" && typeof payload.path === "string") {
      emit("shellOpen", payload);
    }
  } else if (data.type === "SHELL_OPEN_FILE" && props.isExplorer) {
    const payload = data.payload as {
      path?: string;
      playlist?: Array<{ path: string; url: string }>;
    };
    if (payload && typeof payload.path === "string" && Array.isArray(payload.playlist)) {
      emit("shellOpenFile", { path: payload.path, playlist: payload.playlist });
    }
  }
}

// Attach message listener synchronously (before DOM mount) — prevents race condition with APP_READY
window.addEventListener("message", handleMessage);

function onIframeLoad() {
  if (import.meta.env.DEV && typeof console?.debug === "function") {
    console.debug("[AppHost] iframe load", props.windowId);
  }
  const iframe = iframeRef.value;
  if (!iframe) return;
  const cw = iframe.contentWindow;
  if (cw) {
    sourceToWindowId.set(cw, props.windowId);
  }
  // User apps (Godot, etc.): inject overflow:hidden to avoid scrollbars
  if (isUserApp) {
    try {
      const doc = iframe.contentDocument;
      if (doc?.body) {
        doc.body.style.overflow = "hidden";
        if (doc.documentElement) doc.documentElement.style.overflow = "hidden";
      }
    } catch {
      /* same-origin required; ignore */
    }
    if (handshakeTimer) {
      clearTimeout(handshakeTimer);
      handshakeTimer = null;
    }
    placeholder.value = null;
  }
}

// Setup handshake timer and performance marks
if (import.meta.env.DEV && typeof performance?.mark === "function") {
  performance.mark(`app-${props.windowId}-start`);
}
if (import.meta.env.DEV && typeof console?.debug === "function") {
  console.debug("[AppHost] loading", props.windowId, props.src);
}
handshakeTimer = setTimeout(() => {
  handshakeTimer = null;
  analytics.handshake_timeout(props.windowId);
  placeholder.value = "App not responding";
}, HANDSHAKE_TIMEOUT_MS);

// Watch for scale/theme changes to resend SHELL_CAPS
watch(
  () => [props.scale, props.theme],
  () => {
    if (readyState) {
      sendShellCaps();
    }
  }
);

const sandboxAttr = (props.isExplorer || isUserApp || isViewer)
  ? "allow-scripts allow-same-origin"
  : "allow-scripts";

onBeforeUnmount(() => {
  window.removeEventListener("message", handleMessage);
  readyState = null;
  if (handshakeTimer) {
    clearTimeout(handshakeTimer);
  }
  if (iframeRef.value?.contentWindow) {
    sourceToWindowId.delete(iframeRef.value.contentWindow);
  }
});
</script>

<template>
  <div class="app-host-root" :data-window-id="windowId">
    <iframe
      :key="windowId"
      ref="iframeRef"
      :src="src"
      :title="windowId"
      :sandbox="sandboxAttr"
      class="app-host-iframe"
      @load="onIframeLoad"
    />
    <div v-if="placeholder" class="app-host-placeholder">{{ placeholder }}</div>
  </div>
</template>
