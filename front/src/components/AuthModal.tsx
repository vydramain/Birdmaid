import { useState } from "react";
import { Win95Modal } from "./win95/Win95Modal";
import { Win95Button } from "./win95/Win95Button";
import { Win95Input } from "./win95/Win95Input";
import { useAuth } from "../contexts/AuthContext";
import type { UserRole } from "../contexts/AuthContext";

type AuthModalProps = {
  open: boolean;
  onClose: () => void;
};

export function AuthModal({ open, onClose }: AuthModalProps) {
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState<UserRole>("Guest");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const auth = useAuth();

  const handleDevAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await auth.devAuth(userId || undefined, role);
      onClose();
      setUserId("");
      setRole("Guest");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Dev auth failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Win95Modal title="Dev Authentication" open={open} onClose={onClose}>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "280px" }}>
        <form onSubmit={handleDevAuth}>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", paddingTop: "4px" }}>
            <label style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "12px" }}>
              User ID (optional):
              <Win95Input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Leave empty to create new user"
              />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "12px" }}>
              Role:
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                style={{
                  padding: "4px",
                  border: "2px inset var(--win-gray)",
                  backgroundColor: "var(--win-white)",
                  fontFamily: "inherit",
                  fontSize: "12px",
                }}
              >
                <option value="Guest">Guest</option>
                <option value="Participant">Participant</option>
                <option value="Organizer">Organizer</option>
              </select>
            </label>
            <Win95Button type="submit" disabled={loading} style={{ marginTop: "4px" }}>
              {loading ? "Authenticating..." : "Authenticate"}
            </Win95Button>
          </div>
        </form>

        {error && (
          <div style={{ color: "red", fontSize: "12px", padding: "6px", backgroundColor: "#ffcccc", marginTop: "4px" }}>
            {error}
          </div>
        )}
      </div>
    </Win95Modal>
  );
}
