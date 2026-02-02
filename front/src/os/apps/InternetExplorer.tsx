import { useEffect, useState } from "react";
import { VFSNode } from "../fs/VirtualFileSystem";
import { HourglassLoader } from "../../components/win95/HourglassLoader";

type InternetExplorerProps = {
  content?: {
    node?: VFSNode;
    path?: string;
    src?: string; // Direct URL (for API-loaded content)
  };
};

/**
 * Internet Explorer: Windows 95 style HTML viewer
 * - HTML content in sandboxed iframe
 * - No top-level navigation
 * - Can only call our API
 */
export function InternetExplorer({ content }: InternetExplorerProps) {
  const [htmlSrc, setHtmlSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadHTML = async () => {
      setLoading(true);
      setError(null);

      try {
        // If direct src URL provided, use it
        if (content?.src) {
          setHtmlSrc(content.src);
          setLoading(false);
          return;
        }

        // If VFS node provided, create blob URL
        if (content?.node && content.node.type === "file") {
          const fileContent = content.node.content;
          if (fileContent instanceof Blob) {
            const blobUrl = URL.createObjectURL(fileContent);
            setHtmlSrc(blobUrl);
            setLoading(false);
            return () => {
              URL.revokeObjectURL(blobUrl);
            };
          } else if (typeof fileContent === "string") {
            // If it's a string (URL or HTML), create blob URL
            const blob = new Blob([fileContent], { type: "text/html" });
            const blobUrl = URL.createObjectURL(blob);
            setHtmlSrc(blobUrl);
            setLoading(false);
            return () => {
              URL.revokeObjectURL(blobUrl);
            };
          }
        }

        // If path provided, try to load from API
        if (content?.path) {
          // TODO: Load from API endpoint when VFS/S3 integration is ready
          setError("HTML loading from path not yet implemented");
          setLoading(false);
          return;
        }

        setError("No HTML source provided");
        setLoading(false);
      } catch (err) {
        console.error("Error loading HTML:", err);
        setError(err instanceof Error ? err.message : "Failed to load HTML");
        setLoading(false);
      }
    };

    loadHTML();
  }, [content]);

  if (loading) {
    return (
      <div className="viewer-loading">
        <HourglassLoader />
      </div>
    );
  }

  if (error) {
    return <div className="viewer-error">Error: {error}</div>;
  }

  if (!htmlSrc) {
    return <div className="viewer-empty">No HTML content to display</div>;
  }

  // Strict sandbox policy for HTML content
  // For Telegram OAuth: need allow-same-origin to allow oauth.telegram.org to work
  // For local HTML: allow-scripts, allow-same-origin for API calls
  // allow-forms: Allow form submissions
  // allow-popups: Allow popups (but not top-level navigation)
  // NO allow-top-navigation: Prevent iframe from navigating parent window
  // NO allow-modals: Prevent alert/confirm dialogs
  // Note: For Telegram OAuth, we need to allow same-origin for oauth.telegram.org
  // This is safe because Telegram OAuth uses postMessage for callback
  const isTelegramOAuth = content?.src?.includes('oauth.telegram.org');
  const sandboxPolicy = isTelegramOAuth
    ? "allow-scripts allow-same-origin allow-forms allow-popups"
    : "allow-scripts allow-same-origin allow-forms allow-popups";

  // Note: Telegram OAuth callback is handled in AuthContext via window.addEventListener('message')
  // The iframe will receive postMessage from Telegram, and we forward it to parent window
  // But actually, Telegram sends postMessage directly to parent window, not to iframe
  // So we don't need to handle it here - AuthContext will handle it

  return (
    <div data-testid="ie-window" className="viewer-ie-container">
      <iframe
        data-testid="ie-window-iframe"
        src={htmlSrc}
        title={content?.node?.name || "HTML Content"}
        sandbox={sandboxPolicy}
        className="viewer-iframe"
        onLoad={() => setLoading(false)}
        onError={() => {
          setError("Failed to load HTML content");
          setLoading(false);
        }}
      />
    </div>
  );
}
