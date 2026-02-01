import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { apiClient } from "../api/client";

export type UserRole = 'Guest' | 'Participant' | 'Organizer';

type User = {
  id: string;
  email: string;
  login: string;
  isSuperAdmin: boolean; // deprecated, use role instead
  role?: UserRole; // 'Guest' | 'Participant' | 'Organizer', defaults to 'Guest' if not set
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  devAuth: (userId?: string, role?: UserRole) => Promise<void>;
  telegramAuth: (telegramId: string, hash: string) => Promise<void>;
  logout: () => void;
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
        // Determine role: use role field if set, otherwise fallback to isSuperAdmin -> Organizer, else Guest
        const role: UserRole = payload.role || (payload.isSuperAdmin ? 'Organizer' : 'Guest');
        setUser({
          id: payload.userId,
          email: payload.email,
          login: payload.login,
          isSuperAdmin: payload.isSuperAdmin || false,
          role: role,
        });
      } catch {
        // Invalid token, clear it
        localStorage.removeItem("birdmaid_token");
        setToken(null);
      }
    }
    setLoading(false);
  }, []);

  const devAuth = async (userId?: string, role?: UserRole) => {
    const response = await apiClient.json<{ user: User; token: string }>("/auth/dev", {
      method: "POST",
      body: JSON.stringify({ userId, role }),
    });
    // Determine role from response
    const userRole: UserRole = response.user.role || (response.user.isSuperAdmin ? 'Organizer' : 'Guest');
    setUser({
      ...response.user,
      role: userRole,
    });
    setToken(response.token);
    localStorage.setItem("birdmaid_token", response.token);
  };

  const telegramAuth = async (telegramId: string, hash: string) => {
    const response = await apiClient.json<{ user: User; token: string }>("/auth/telegram", {
      method: "POST",
      body: JSON.stringify({ telegramId, hash }),
    });
    // Determine role from response
    const userRole: UserRole = response.user.role || (response.user.isSuperAdmin ? 'Organizer' : 'Guest');
    setUser({
      ...response.user,
      role: userRole,
    });
    setToken(response.token);
    localStorage.setItem("birdmaid_token", response.token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("birdmaid_token");
  };

  return (
    <AuthContext.Provider value={{ user, token, devAuth, telegramAuth, logout, loading }}>
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

