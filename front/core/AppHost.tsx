/**
 * AppHost — iframe mount/unmount, postMessage bridge per PROTOCOL_v0.
 * Origin allowlist, event.source routing, targetOrigin=event.origin, handshake timeout 2000ms.
 */

import { useEffect, useRef, useCallback, useState } from "react";
import {
  isAllowedOrigin,
  createShellCaps,
  type ShellMessage,
} from "./protocol";
import { analytics } from "./analytics";

const HANDSHAKE_TIMEOUT_MS = 2000;

interface AppHostProps {
  windowId: string;
  src: string;
  scale: number;
  theme: string;
  onTitleUpdate: (windowId: string, title: string) => void;
  contentWindowRef?: (win: Window | null) => void;
}

export function AppHost({
  windowId,
  src,
  scale,
  theme,
  onTitleUpdate,
  contentWindowRef,
}: AppHostProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [placeholder, setPlaceholder] = useState<string | null>("Loading...");
  const handshakeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sourceToWindowIdRef = useRef<Map<MessageEventSource, string>>(new Map());

  const sendToSource = useCallback(
    (source: MessageEventSource, origin: string, data: ShellMessage) => {
      if (!isAllowedOrigin(origin)) return;
      const win = source as Window;
      if (typeof win.postMessage === "function") {
        win.postMessage(data, origin);
      }
    },
    []
  );

  const readyRef = useRef<{ source: MessageEventSource; origin: string } | null>(null);

  const sendShellCaps = useCallback(() => {
    const r = readyRef.current;
    if (!r) return;
    const caps = createShellCaps(windowId, scale, theme);
    sendToSource(r.source, r.origin, caps);
  }, [windowId, scale, theme, sendToSource]);

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
        console.warn("[AppHost] message_rejected", { origin, reason: "origin_not_allowed" });
        return;
      }
      const source = event.source;
      if (!source) return;
      let knownWindowId = sourceToWindowIdRef.current.get(source);
      if (!knownWindowId && iframeRef.current?.contentWindow === source) {
        sourceToWindowIdRef.current.set(source, windowId);
        knownWindowId = windowId;
      }
      if (!knownWindowId) {
        analytics.message_rejected("unknown_source");
        console.warn("[AppHost] message_rejected", { reason: "unknown_source" });
        return;
      }
      const data = event.data as ShellMessage;
      if (!data || typeof data.type !== "string") return;

      if (data.type === "APP_READY") {
        if (handshakeTimerRef.current) {
          clearTimeout(handshakeTimerRef.current);
          handshakeTimerRef.current = null;
        }
        setPlaceholder(null);
        readyRef.current = { source, origin };
        analytics.app_ready(windowId);
        const caps = createShellCaps(windowId, scale, theme);
        sendToSource(source, origin, caps);
        (window as unknown as { __shellCapsSent?: boolean }).__shellCapsSent = true;
      } else if (data.type === "WINDOW_TITLE") {
        const title = data.payload?.title;
        if (typeof title === "string") {
          onTitleUpdate(knownWindowId, title);
        }
      }
    },
    [windowId, scale, theme, onTitleUpdate, sendToSource]
  );

  useEffect(() => {
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
      console.warn("[AppHost] handshake_timeout", { windowId });
    }, HANDSHAKE_TIMEOUT_MS);
    return () => {
      readyRef.current = null;
      if (handshakeTimerRef.current) {
        clearTimeout(handshakeTimerRef.current);
      }
      const iframe = iframeRef.current;
      if (iframe?.contentWindow) {
        sourceToWindowIdRef.current.delete(iframe.contentWindow);
      }
      contentWindowRef?.(null);
    };
  }, [windowId, src, contentWindowRef]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <iframe
      ref={iframeRef}
      src={src}
      title={windowId}
      sandbox="allow-scripts"
      onLoad={onIframeLoad}
      style={{
        width: "100%",
        height: "100%",
        border: "none",
        display: "block",
      }}
    />
      {placeholder && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "var(--wm-bg, #fff)",
            padding: "var(--wm-padding-2, 8px)",
            color: "var(--wm-fg, #333)",
            fontSize: "var(--wm-font-size, 12px)",
          }}
        >
          {placeholder}
        </div>
      )}
    </div>
  );
}
