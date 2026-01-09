import { useState } from "react";
import { Win95Modal } from "./win95/Win95Modal";
import { Win95Button } from "./win95/Win95Button";
import { Win95Input } from "./win95/Win95Input";
import { useAuth } from "../contexts/AuthContext";

type AuthModalProps = {
  open: boolean;
  onClose: () => void;
};

type Mode = "login" | "register" | "recovery";

export function AuthModal({ open, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [codeSent, setCodeSent] = useState(false);

  const auth = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await auth.login(identifier, password);
      onClose();
      setIdentifier("");
      setPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      await auth.register(email, login, password);
      onClose();
      setEmail("");
      setLogin("");
      setPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await auth.requestRecovery(recoveryEmail);
      setCodeSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send recovery code");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      await auth.verifyRecovery(recoveryEmail, code, newPassword);
      onClose();
      setRecoveryEmail("");
      setCode("");
      setNewPassword("");
      setCodeSent(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid recovery code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Win95Modal title="Authentication" open={open} onClose={onClose}>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "280px" }}>
        {mode !== "recovery" && (
          <div style={{ display: "flex", borderBottom: "2px solid var(--win-black)", marginBottom: "8px" }}>
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError("");
              }}
              style={{
                flex: 1,
                padding: "4px 8px",
                border: "none",
                borderRight: "1px solid var(--win-black)",
                background: mode === "login" ? "var(--win-gray)" : "var(--win-gray-light)",
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: "12px",
                textAlign: "center",
              }}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("register");
                setError("");
              }}
              style={{
                flex: 1,
                padding: "4px 8px",
                border: "none",
                background: mode === "register" ? "var(--win-gray)" : "var(--win-gray-light)",
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: "12px",
                textAlign: "center",
              }}
            >
              Register
            </button>
          </div>
        )}

        {mode === "login" && (
          <form onSubmit={handleLogin}>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label>
                Email or Username:
                <Win95Input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                />
              </label>
              <label>
                Password:
                <Win95Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </label>
              <div style={{ display: "flex", gap: "8px", justifyContent: "space-between" }}>
                <Win95Button type="submit" disabled={loading}>
                  Login
                </Win95Button>
                <Win95Button
                  type="button"
                  onClick={() => {
                    setMode("recovery");
                    setRecoveryEmail(identifier);
                    setCodeSent(false);
                  }}
                >
                  Forgot Password?
                </Win95Button>
              </div>
            </div>
          </form>
        )}

        {mode === "register" && (
          <form onSubmit={handleRegister}>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label>
                Email:
                <Win95Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </label>
              <label>
                Username:
                <Win95Input type="text" value={login} onChange={(e) => setLogin(e.target.value)} required />
              </label>
              <label>
                Password (min 6 chars):
                <Win95Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </label>
              <Win95Button type="submit" disabled={loading}>
                Register
              </Win95Button>
            </div>
          </form>
        )}

        {mode === "recovery" && (
          <>
            {!codeSent ? (
              <form onSubmit={handleRequestRecovery}>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label>
                    Email:
                    <Win95Input
                      type="email"
                      value={recoveryEmail}
                      onChange={(e) => setRecoveryEmail(e.target.value)}
                      required
                    />
                  </label>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <Win95Button type="submit" disabled={loading}>
                      Send Code
                    </Win95Button>
                    <Win95Button type="button" onClick={() => setMode("login")}>
                      Back to Login
                    </Win95Button>
                  </div>
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerifyRecovery}>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label>
                    Recovery Code:
                    <Win95Input type="text" value={code} onChange={(e) => setCode(e.target.value)} required />
                  </label>
                  <label>
                    New Password (min 6 chars):
                    <Win95Input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </label>
                  <Win95Button type="submit" disabled={loading}>
                    Reset Password
                  </Win95Button>
                </div>
              </form>
            )}
          </>
        )}

        {error && (
          <div style={{ color: "red", fontSize: "12px", padding: "8px", backgroundColor: "#ffcccc" }}>{error}</div>
        )}
      </div>
    </Win95Modal>
  );
}

