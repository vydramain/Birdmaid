import { useEffect, useRef, useState } from "react";
import { Win95Modal } from "./win95/Win95Modal";
import { HourglassLoader } from "./win95/HourglassLoader";

type PlayModalProps = {
  open: boolean;
  onClose: () => void;
  buildUrl: string | null;
};

export function PlayModal({ open, onClose, buildUrl }: PlayModalProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && buildUrl && iframeRef.current) {
      setLoading(true);
      // Force reload iframe when modal opens
      iframeRef.current.src = "";
      setTimeout(() => {
        if (iframeRef.current && buildUrl) {
          console.log("Loading game from:", buildUrl);
          iframeRef.current.src = buildUrl;
        }
      }, 50);
    } else if (open && !buildUrl) {
      console.warn("PlayModal opened but buildUrl is null or empty");
      setLoading(false);
    }
  }, [open, buildUrl]);

  const handleIframeLoad = () => {
    setLoading(false);
  };

  return (
    <Win95Modal title="Game" open={open} onClose={onClose}>
      <div style={{ 
        width: "calc(90vw - 24px)", 
        height: "calc(90vh - 48px)", 
        minWidth: "600px",
        minHeight: "400px",
        position: "relative", 
        display: "flex", 
        flexDirection: "column", 
        margin: "8px" 
      }}>
        {loading && <HourglassLoader />}
        {buildUrl ? (
          <iframe
            ref={iframeRef}
            src={buildUrl}
            style={{
              width: "100%",
              height: "100%",
              border: "2px solid var(--win-black)",
              background: "#000",
              flex: 1,
              minHeight: 0,
              display: loading ? "none" : "block",
            }}
            title="Game"
            // CRITICAL: allow-same-origin is required for cookies to work in sandboxed iframes.
            // Without it, the iframe has an opaque origin (Origin: null), and cookies with
            // SameSite=Lax won't be sent. With allow-same-origin, the iframe shares the same
            // origin as the parent page, allowing cookies to work properly.
            // However, even with allow-same-origin, some browsers may still send Origin: null
            // for subresource requests, which is why the backend must handle Origin: null
            // with SameSite=None; Secure cookies and ACAO: "null" CORS headers.
            sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-popups"
            allow="fullscreen; autoplay; gamepad"
            onLoad={handleIframeLoad}
            onError={(e) => {
              console.error("Game iframe error:", e);
              setLoading(false);
            }}
          />
        ) : (
          <div style={{ padding: "20px", textAlign: "center" }}>Game build not available</div>
        )}
      </div>
    </Win95Modal>
  );
}

