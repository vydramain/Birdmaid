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
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "280px", borderTop: mode !== "recovery" ? "2px solid var(--win-black)" : "none" }}>
        {mode !== "recovery" && (
          <div style={{ 
            display: "flex", 
            marginBottom: "0",
            marginTop: "-8px",
            marginLeft: "-8px",
            marginRight: "-8px",
            position: "relative",
            zIndex: 1
          }}>
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError("");
              }}
              style={{
                flex: 1,
                padding: "6px 12px",
                border: mode === "login" ? "2px solid var(--win-black)" : "2px solid var(--win-gray-dark)",
                borderBottom: mode === "login" ? "none" : "2px solid var(--win-black)",
                background: mode === "login" ? "var(--win-gray)" : "var(--win-gray-light)",
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: "12px",
                textAlign: "center",
                position: "relative",
                marginBottom: mode === "login" ? "-2px" : "0",
                zIndex: mode === "login" ? 2 : 1,
                boxShadow: mode === "login" ? "none" : "inset 1px 1px 0 var(--win-white), inset -1px -1px 0 var(--win-gray-darker)",
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
                padding: "6px 12px",
                border: mode === "register" ? "2px solid var(--win-black)" : "2px solid var(--win-gray-dark)",
                borderBottom: mode === "register" ? "none" : "2px solid var(--win-black)",
                borderLeft: mode === "register" ? "2px solid var(--win-black)" : "1px solid var(--win-gray-dark)",
                background: mode === "register" ? "var(--win-gray)" : "var(--win-gray-light)",
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: "12px",
                textAlign: "center",
                position: "relative",
                marginBottom: mode === "register" ? "-2px" : "0",
                zIndex: mode === "register" ? 2 : 1,
                boxShadow: mode === "register" ? "none" : "inset 1px 1px 0 var(--win-white), inset -1px -1px 0 var(--win-gray-darker)",
              }}
            >
              Register
            </button>
          </div>
        )}

        {mode === "login" && (
          <form onSubmit={handleLogin}>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", paddingTop: "4px" }}>
              <label style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "12px" }}>
                Email or Username:
                <Win95Input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                />
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "12px" }}>
                Password:
                <Win95Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </label>
              <div style={{ display: "flex", gap: "8px", justifyContent: "space-between", marginTop: "4px" }}>
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
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", paddingTop: "4px" }}>
              <label style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "12px" }}>
                Email:
                <Win95Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "12px" }}>
                Username:
                <Win95Input type="text" value={login} onChange={(e) => setLogin(e.target.value)} required />
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "12px" }}>
                Password (min 6 chars):
                <Win95Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </label>
              <Win95Button type="submit" disabled={loading} style={{ marginTop: "4px" }}>
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
                  <label style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "12px" }}>
                    Email:
                    <Win95Input
                      type="email"
                      value={recoveryEmail}
                      onChange={(e) => setRecoveryEmail(e.target.value)}
                      required
                    />
                  </label>
                  <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
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
                  <label style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "12px" }}>
                    Recovery Code:
                    <Win95Input type="text" value={code} onChange={(e) => setCode(e.target.value)} required />
                  </label>
                  <label style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "12px" }}>
                    New Password (min 6 chars):
                    <Win95Input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </label>
                  <Win95Button type="submit" disabled={loading} style={{ marginTop: "4px" }}>
                    Reset Password
                  </Win95Button>
                </div>
              </form>
            )}
          </>
        )}

        {error && (
          <div style={{ color: "red", fontSize: "12px", padding: "6px", backgroundColor: "#ffcccc", marginTop: "4px" }}>{error}</div>
        )}
      </div>
    </Win95Modal>
  );
}

