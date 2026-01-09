import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Win95Button } from "./win95/Win95Button";
import { AuthModal } from "./AuthModal";

export function Header() {
  const auth = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          backgroundColor: "var(--win-gray)",
          borderBottom: "2px solid var(--win-black)",
          padding: "4px 8px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {auth.user ? (
            <div style={{ position: "relative" }}>
              <Win95Button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                style={{ minWidth: "120px" }}
              >
                {auth.user.login}
              </Win95Button>
              {menuOpen && (
                <div
                  className="win-outset"
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    marginTop: "4px",
                    minWidth: "120px",
                    zIndex: 101,
                  }}
                >
                  <button
                    className="win-btn"
                    type="button"
                    onClick={() => {
                      auth.logout();
                      setMenuOpen(false);
                    }}
                    style={{ width: "100%" }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Win95Button type="button" onClick={() => setAuthModalOpen(true)}>
              Login
            </Win95Button>
          )}
        </div>
      </div>
      <div style={{ height: "40px" }} /> {/* Spacer for fixed header */}
      <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
}

