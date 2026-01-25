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

  // Default secure sandbox
  const sandboxAttr = sandbox || "allow-scripts allow-forms allow-same-origin allow-popups";

  return (
    <div style={{ width: "100%", height: "100%", position: "relative", display: "flex", flexDirection: "column" }}>
      {loading && (
        <div 
          style={{ 
            position: "absolute", 
            top: 0, 
            left: 0, 
            width: "100%", 
            height: "100%", 
            display: "flex", 
            justifyContent: "center", 
            alignItems: "center",
            backgroundColor: "var(--win-white)",
            zIndex: 1 
          }}
        >
          <HourglassLoader />
        </div>
      )}
      
      {error ? (
        <div style={{ padding: "20px", color: "var(--win-red)" }}>
          Error loading application: {error}
        </div>
      ) : (
        <iframe
          src={src}
          title={title || "Application"}
          sandbox={sandboxAttr}
          style={{
            flex: 1,
            border: "none",
            width: "100%",
            height: "100%",
            display: loading ? "none" : "block"
          }}
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
