/**
 * AppHost — iframe mount/unmount, postMessage bridge per FP1 § Protocol.
 * Origin allowlist, event.source routing, targetOrigin=event.origin, handshake timeout 2000ms.
 */

import { useEffect, useLayoutEffect, useRef, useCallback, useState } from "react";
import { isAllowedOrigin, createShellCaps, type ShellMessage } from "./protocol";
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

interface AppHostProps {
  windowId: string;
  src: string;
  scale: number;
  theme: string;
  onTitleUpdate: (windowId: string, title: string) => void;
  contentWindowRef?: (win: Window | null) => void;
  /** FP3: Explorer gets allow-same-origin sandbox + systemToken in SHELL_CAPS */
  isExplorer?: boolean;
  /** FP3: Called when Explorer sends SHELL_OPEN (only when isExplorer) */
  onShellOpen?: (payload: ShellOpenPayload) => void;
  /** FP4: Viewer OPEN_FILE payload. When set, send OPEN_FILE on APP_READY instead of SHELL_CAPS */
  openFilePayload?: OpenFilePayload;
  /** FP4: Called when Explorer sends SHELL_OPEN_FILE (only when isExplorer) */
  onShellOpenFile?: (payload: {
    path: string;
    playlist: Array<{ path: string; url: string }>;
  }) => void;
}

export function AppHost({
  windowId,
  src,
  scale,
  theme,
  onTitleUpdate,
  contentWindowRef,
  isExplorer = false,
  onShellOpen,
  openFilePayload,
  onShellOpenFile,
}: AppHostProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [placeholder, setPlaceholder] = useState<string | null>("Loading...");
  const handshakeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sourceToWindowIdRef = useRef<Map<MessageEventSource, string>>(new Map());

  const sendToSource = useCallback(
    (source: MessageEventSource, origin: string, data: ShellMessage) => {
      if (!isAllowedOrigin(origin)) return;
      const win = source as Window;
      if (typeof win.postMessage !== "function") return;
      const targetOrigin = origin === "null" ? "*" : origin;
      win.postMessage(data, targetOrigin);
    },
    []
  );

  const readyRef = useRef<{ source: MessageEventSource; origin: string } | null>(null);

  const sendShellCaps = useCallback(() => {
    const r = readyRef.current;
    if (!r) return;
    const caps = createShellCaps(windowId, scale, theme, isExplorer);
    sendToSource(r.source, r.origin, caps);
  }, [windowId, scale, theme, isExplorer, sendToSource]);

  useEffect(() => {
    if (readyRef.current) {
      sendShellCaps();
    }
  }, [scale, theme, sendShellCaps]);

  const handleMessage = useCallback(
    (event: MessageEvent) => {
      const origin = event.origin ?? "null";
      if (!isAllowedOrigin(origin)) {
        analytics.message_rejected("origin_not_allowed", origin);
        return;
      }
      const source = event.source;
      if (!source) return;
      const data = event.data as ShellMessage;
      if (data?.type === "FETCH_RESULT" && iframeRef.current?.contentWindow === source) {
        const status = (data.payload as { status?: number })?.status;
        if (typeof status === "number") {
          (window as unknown as { __lastFetchStatus?: number }).__lastFetchStatus = status;
        }
        return;
      }
      let knownWindowId = sourceToWindowIdRef.current.get(source);
      if (!knownWindowId && iframeRef.current?.contentWindow === source) {
        sourceToWindowIdRef.current.set(source, windowId);
        knownWindowId = windowId;
      }
      if (!knownWindowId) {
        analytics.message_rejected("unknown_source");
        return;
      }
      if (!data || typeof data.type !== "string") return;

      if (data.type === "APP_READY") {
        if (handshakeTimerRef.current) {
          clearTimeout(handshakeTimerRef.current);
          handshakeTimerRef.current = null;
        }
        setPlaceholder(null);
        readyRef.current = { source, origin };
        analytics.app_ready(windowId);
        if (openFilePayload) {
          sendToSource(source, origin, {
            type: "OPEN_FILE",
            payload: openFilePayload as unknown as Record<string, unknown>,
            timestamp: Date.now(),
          });
        } else {
          const caps = createShellCaps(windowId, scale, theme, isExplorer);
          sendToSource(source, origin, caps);
        }
        (window as unknown as { __shellCapsSent?: boolean }).__shellCapsSent = true;
      } else if (data.type === "WINDOW_TITLE") {
        const title = data.payload?.title;
        if (typeof title === "string") {
          onTitleUpdate(knownWindowId, title);
        }
      } else if (data.type === "SHELL_OPEN" && isExplorer && onShellOpen) {
        const payload = data.payload as unknown as ShellOpenPayload;
        if (payload && typeof payload.kind === "string" && typeof payload.path === "string") {
          onShellOpen(payload);
        }
      } else if (data.type === "SHELL_OPEN_FILE" && isExplorer && onShellOpenFile) {
        const payload = data.payload as {
          path?: string;
          playlist?: Array<{ path: string; url: string }>;
        };
        if (payload && typeof payload.path === "string" && Array.isArray(payload.playlist)) {
          onShellOpenFile({ path: payload.path, playlist: payload.playlist });
        }
      }
    },
    [
      windowId,
      scale,
      theme,
      isExplorer,
      onTitleUpdate,
      onShellOpen,
      onShellOpenFile,
      openFilePayload,
      sendToSource,
    ]
  );

  // M2: useLayoutEffect so listener is attached before iframe can load (avoids race with cached viewer)
  useLayoutEffect(() => {
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [handleMessage]);

  const onIframeLoad = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const cw = iframe.contentWindow;
    if (cw) {
      sourceToWindowIdRef.current.set(cw, windowId);
      contentWindowRef?.(cw);
    }
  }, [windowId, contentWindowRef]);

  useEffect(() => {
    readyRef.current = null;
    handshakeTimerRef.current = setTimeout(() => {
      handshakeTimerRef.current = null;
      analytics.handshake_timeout(windowId);
      setPlaceholder("App not responding");
    }, HANDSHAKE_TIMEOUT_MS);
    const iframe = iframeRef.current;
    const sourceMap = sourceToWindowIdRef.current;
    return () => {
      readyRef.current = null;
      if (handshakeTimerRef.current) {
        clearTimeout(handshakeTimerRef.current);
      }
      if (iframe?.contentWindow) {
        sourceMap.delete(iframe.contentWindow);
      }
      contentWindowRef?.(null);
    };
  }, [windowId, src, contentWindowRef]);

  return (
    <div className="app-host-root" data-window-id={windowId}>
      <iframe
        key={windowId}
        ref={iframeRef}
        src={src}
        title={windowId}
        sandbox={isExplorer ? "allow-scripts allow-same-origin" : "allow-scripts"}
        onLoad={onIframeLoad}
        className="app-host-iframe"
      />
      {placeholder && <div className="app-host-placeholder">{placeholder}</div>}
    </div>
  );
}
