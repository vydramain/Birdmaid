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
        className="win-header"
        // inline-style: allowed (reason: layout-calc)
        style={{
          zIndex: 100,
        }}
      >
        <div className="win-header-buttons">
          {auth.user ? (
            <div className="win-header-user-menu">
              <Win95Button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                className="min-w-120"
              >
                {auth.user.login}
              </Win95Button>
              {menuOpen && (
                <div
                  className="win-outset win-header-dropdown"
                  // inline-style: allowed (reason: layout-calc)
                  style={{
                    zIndex: 101,
                  }}
                >
                  <button
                    className="win-btn w-full"
                    type="button"
                    onClick={() => {
                      auth.logout();
                      setMenuOpen(false);
                    }}
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
      <div className="win-header-spacer" /> {/* Spacer for fixed header */}
      <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
}
