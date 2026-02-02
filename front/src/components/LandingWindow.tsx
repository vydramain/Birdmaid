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
      <div className="landing-loading">
        <HourglassLoader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="landing-content landing-error">
        <p className="text-error">Error: {error}</p>
        <Win95Button type="button" onClick={handleClose} className="landing-spacing">
          Close
        </Win95Button>
      </div>
    );
  }

  if (!jam) {
    return (
      <div className="landing-content">
        <p>No upcoming jams at this time.</p>
        <Win95Button type="button" onClick={handleClose} className="landing-spacing">
          Close
        </Win95Button>
      </div>
    );
  }

  return (
    <div className="landing-content">
      <h2 className="landing-heading">{jam.name}</h2>
      <p>
        <strong>Start:</strong> {new Date(jam.startDate).toLocaleDateString()}
      </p>
      <p>
        <strong>End:</strong> {new Date(jam.endDate).toLocaleDateString()}
      </p>
      {jam.description_md && (
        <div className="landing-spacing">
          <p>{jam.description_md}</p>
        </div>
      )}
      {jam.registrationUrl && (
        <div className="landing-spacing">
          <a href={jam.registrationUrl} target="_blank" rel="noopener noreferrer" className="text-link">
            Register here
          </a>
        </div>
      )}
      <Win95Button type="button" onClick={handleClose} className="landing-spacing-lg">
        Close
      </Win95Button>
    </div>
  );
}
