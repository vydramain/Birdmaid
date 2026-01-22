import { useState, useEffect, useRef } from "react";
import { apiClient } from "../api/client";
import { HourglassLoader } from "./win95/HourglassLoader";

type GameWindowProps = {
  buildUrl: string | null;
  gameId?: string;
};

export function GameWindow({ buildUrl: buildUrlProp, gameId }: GameWindowProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [buildUrl, setBuildUrl] = useState<string | null>(buildUrlProp);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (buildUrlProp) {
      setBuildUrl(buildUrlProp);
      setLoading(false);
    } else if (gameId) {
      void loadGame();
    } else {
      setError("No game specified");
      setLoading(false);
    }
  }, [buildUrlProp, gameId]);

  const loadGame = async () => {
    if (!gameId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.json<{ build_url?: string | null }>(`/games/${gameId}`);
      if (data.build_url) {
        setBuildUrl(data.build_url);
      } else {
        setError("No build available for this game");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load game");
    } finally {
      setLoading(false);
    }
  };

  const handleIframeLoad = () => {
    setLoading(false);
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "20px" }}>
        <HourglassLoader />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "12px" }}>
        <p style={{ color: "var(--win-red)" }}>Error: {error}</p>
      </div>
    );
  }

  if (!buildUrl) {
    return (
      <div style={{ padding: "12px" }}>
        <p>No build available for this game.</p>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: "600px", position: "relative" }}>
      <iframe
        ref={iframeRef}
        src={buildUrl}
        style={{
          width: "100%",
          height: "100%",
          border: "2px solid var(--win-gray-dark)",
        }}
        onLoad={handleIframeLoad}
        title="Game"
      />
    </div>
  );
}
