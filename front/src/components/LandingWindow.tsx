import { useState, useEffect } from "react";
import { apiClient } from "../api/client";
import { HourglassLoader } from "./win95/HourglassLoader";
import { Win95Button } from "./win95/Win95Button";

type Jam = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  description_md?: string;
  registrationUrl?: string;
};

export function LandingWindow({ onClose }: { onClose?: () => void }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [jam, setJam] = useState<Jam | null>(null);

  useEffect(() => {
    void loadJam();
  }, []);

  const loadJam = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.json<Jam | null>("/jam/current");
      setJam(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load jam info");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    localStorage.setItem("birdmaid_landing_seen", "true");
    if (onClose) {
      onClose();
    }
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
        <Win95Button type="button" onClick={handleClose} style={{ marginTop: "8px" }}>
          Close
        </Win95Button>
      </div>
    );
  }

  if (!jam) {
    return (
      <div style={{ padding: "12px" }}>
        <p>No upcoming jams at this time.</p>
        <Win95Button type="button" onClick={handleClose} style={{ marginTop: "8px" }}>
          Close
        </Win95Button>
      </div>
    );
  }

  return (
    <div style={{ padding: "12px", fontSize: "12px" }}>
      <h2 style={{ marginTop: 0, fontSize: "16px", fontWeight: "bold" }}>{jam.name}</h2>
      <p>
        <strong>Start:</strong> {new Date(jam.startDate).toLocaleDateString()}
      </p>
      <p>
        <strong>End:</strong> {new Date(jam.endDate).toLocaleDateString()}
      </p>
      {jam.description_md && (
        <div style={{ marginTop: "8px" }}>
          <p>{jam.description_md}</p>
        </div>
      )}
      {jam.registrationUrl && (
        <div style={{ marginTop: "8px" }}>
          <a href={jam.registrationUrl} target="_blank" rel="noopener noreferrer" style={{ color: "var(--win-blue)" }}>
            Register here
          </a>
        </div>
      )}
      <Win95Button type="button" onClick={handleClose} style={{ marginTop: "12px" }}>
        Close
      </Win95Button>
    </div>
  );
}
