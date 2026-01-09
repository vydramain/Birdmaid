import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { apiClient } from "../api/client";

type User = {
  id: string;
  email: string;
  login: string;
  isSuperAdmin: boolean;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  login: (identifier: string, password: string) => Promise<void>;
  register: (email: string, login: string, password: string) => Promise<void>;
  logout: () => void;
  requestRecovery: (email: string) => Promise<void>;
  verifyRecovery: (email: string, code: string, newPassword: string) => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("birdmaid_token");
    if (storedToken) {
      setToken(storedToken);
      // Decode token to get user info (simple base64 decode)
      try {
        const payload = JSON.parse(atob(storedToken.split(".")[1]));
        setUser({
          id: payload.userId,
          email: payload.email,
          login: payload.login,
          isSuperAdmin: payload.isSuperAdmin || false,
        });
      } catch {
        // Invalid token, clear it
        localStorage.removeItem("birdmaid_token");
        setToken(null);
      }
    }
    setLoading(false);
  }, []);

  const login = async (identifier: string, password: string) => {
    const response = await apiClient.json<{ user: User; token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ identifier, password }),
    });
    setUser(response.user);
    setToken(response.token);
    localStorage.setItem("birdmaid_token", response.token);
  };

  const register = async (email: string, login: string, password: string) => {
    const response = await apiClient.json<{ user: User; token: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, login, password }),
    });
    setUser(response.user);
    setToken(response.token);
    localStorage.setItem("birdmaid_token", response.token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("birdmaid_token");
  };

  const requestRecovery = async (email: string) => {
    await apiClient.json("/auth/recovery/request", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  };

  const verifyRecovery = async (email: string, code: string, newPassword: string) => {
    const response = await apiClient.json<{ token: string }>("/auth/recovery/verify", {
      method: "POST",
      body: JSON.stringify({ email, code, newPassword }),
    });
    setToken(response.token);
    localStorage.setItem("birdmaid_token", response.token);
    // Reload user from token
    const payload = JSON.parse(atob(response.token.split(".")[1]));
    setUser({
      id: payload.userId,
      email: payload.email,
      login: payload.login,
      isSuperAdmin: payload.isSuperAdmin || false,
    });
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, requestRecovery, verifyRecovery, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

