import { useState } from "react";
import { HourglassLoader } from "../../components/win95/HourglassLoader";

type AppHostProps = {
  src: string;
  title?: string;
  sandbox?: string;
};

export function AppHost({ src, title, sandbox }: AppHostProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Strict sandbox policy for Executor/AppHost (webapp/game content)
  // allow-scripts: Required for game/webapp logic
  // allow-same-origin: Required for access to assets/localStorage
  // allow-forms: Allow form submissions
  // allow-popups: Allow popups (but not top-level navigation)
  // NO allow-top-navigation: Prevent iframe from navigating parent window
  // NO allow-modals: Prevent alert/confirm dialogs
  const sandboxAttr = sandbox || "allow-scripts allow-same-origin allow-forms allow-popups";

  return (
    <div className="apphost-container">
      {loading && (
        <div className="apphost-loading-overlay">
          <HourglassLoader />
        </div>
      )}

      {error ? (
        <div className="apphost-error">Error loading application: {error}</div>
      ) : (
        <iframe
          src={src}
          title={title || "Application"}
          sandbox={sandboxAttr}
          className={`apphost-iframe ${loading ? "apphost-iframe-hidden" : ""}`}
          onLoad={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setError("Failed to load content");
          }}
        />
      )}
    </div>
  );
}
