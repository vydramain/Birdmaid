import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { apiClient } from "../api/client";
import { vfs } from "../os/fs/VirtualFileSystem";

export type UserRole = 'Guest' | 'Participant' | 'Organizer';

export type AuthState = 'booting' | 'guest' | 'authed';

type User = {
  id: string;
  email: string;
  login: string;
  role?: UserRole; // 'Guest' | 'Participant' | 'Organizer', defaults to 'Guest' if not set
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  state: AuthState;
  devAuth: (userId?: string, role?: UserRole) => Promise<void>;
  telegramAuth: (telegramId: string, hash: string) => Promise<void>;
  logout: () => void;
  hardLogout: () => void;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [state, setState] = useState<AuthState>('booting');
  const [loading, setLoading] = useState(true);

  const hardLogout = useCallback(() => {
    setUser(null);
    setToken(null);
    setState('guest');
    localStorage.removeItem("birdmaid_token");
  }, []);

  const bootstrapAuth = useCallback(async () => {
    setState('booting');
    setLoading(true);

    const storedToken = localStorage.getItem("birdmaid_token");
    if (!storedToken) {
      setState('guest');
      setLoading(false);
      return;
    }

    try {
      const response = await apiClient.json<{ user: User }>("/api/auth/me", {
        method: "GET",
      });
      
      // Success: user is authenticated
      setToken(storedToken);
      const userRole: UserRole = response.user.role || 'Guest';
      setUser({
        ...response.user,
        role: userRole,
      });
      setState('authed');
    } catch (error) {
      // 401 or other error: token is invalid, clear it
      console.warn("Auth bootstrap failed, clearing token:", error);
      hardLogout();
    } finally {
      setLoading(false);
    }
  }, [hardLogout]);

  useEffect(() => {
    void bootstrapAuth();
  }, [bootstrapAuth]);

  // Sync VFS role when user is authenticated (for in-memory VFS used by Desktop/Explorer).
  // When guest (no user), do not overwrite vfs — tests may have set vfs.setUserRole explicitly.
  useEffect(() => {
    if (user) {
      vfs.setUserRole(user.role ?? "Guest");
    }
  }, [user]);

  // Listen for hardLogout events from apiClient
  useEffect(() => {
    const handleHardLogout = () => {
      hardLogout();
    };

    window.addEventListener('auth:hardLogout', handleHardLogout);
    return () => window.removeEventListener('auth:hardLogout', handleHardLogout);
  }, [hardLogout]);

  const telegramAuth = useCallback(async (telegramId: string, hash: string, additionalData?: { firstName?: string; lastName?: string; username?: string; auth_date?: number }) => {
    const response = await apiClient.json<{ user: User; token: string }>("/api/auth/telegram", {
      method: "POST",
      body: JSON.stringify({ 
        telegramId, 
        hash,
        firstName: additionalData?.firstName,
        lastName: additionalData?.lastName,
        username: additionalData?.username,
        auth_date: additionalData?.auth_date,
      }),
    });
    // Determine role from response
    const userRole: UserRole = response.user.role || 'Guest';
    setUser({
      ...response.user,
      role: userRole,
    });
    setToken(response.token);
    localStorage.setItem("birdmaid_token", response.token);
    setState('authed');
    
    // After successful auth, verify with /api/auth/me
    try {
      const meResponse = await apiClient.json<{ user: User }>("/api/auth/me", {
        method: "GET",
      });
      const verifiedRole: UserRole = meResponse.user.role || 'Guest';
      setUser({
        ...meResponse.user,
        role: verifiedRole,
      });
    } catch (error) {
      console.error("Failed to verify auth after telegram login:", error);
      hardLogout();
    }
  }, [hardLogout]);

  // Listen for postMessage from Telegram auth
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Security: only accept messages from Telegram OAuth origin
      // Telegram sends postMessage from https://oauth.telegram.org
      if (event.origin !== 'https://oauth.telegram.org') {
        return;
      }

      // Telegram OAuth callback format
      // Telegram sends the auth data directly in event.data
      if (event.data && typeof event.data === 'object') {
        const { id, first_name, last_name, username, photo_url, auth_date, hash } = event.data;
        
        if (id && hash) {
          // Call telegramAuth with the data
          void telegramAuth(id.toString(), hash, {
            firstName: first_name,
            lastName: last_name,
            username: username,
            auth_date: auth_date,
          });
        } else {
          console.error("Telegram auth error: missing id or hash");
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [telegramAuth]);

  const devAuth = async (userId?: string, role?: UserRole) => {
    const response = await apiClient.json<{ user: User; token: string }>("/api/auth/dev", {
      method: "POST",
      body: JSON.stringify({ userId, role }),
    });
    // Determine role from response
    const userRole: UserRole = response.user.role || 'Guest';
    setUser({
      ...response.user,
      role: userRole,
    });
    setToken(response.token);
    localStorage.setItem("birdmaid_token", response.token);
    setState('authed');
  };

  const logout = () => {
    hardLogout();
  };

  return (
    <AuthContext.Provider value={{ user, token, state, devAuth, telegramAuth, logout, hardLogout, loading }}>
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

