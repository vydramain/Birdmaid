import { fetchMock } from "../utils/mock-fetch";
import { makeGame, makeGames, makeGameSummary, makeGameSummaries, type GameSummary, type GameDetails } from "../fixtures/game";
import { makeTeam, makeTeams, type Team } from "../fixtures/team";
import { makeUser, type User } from "../fixtures/user";
import { makeComment, makeComments, type Comment } from "../fixtures/comment";

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
type MockHandler = (url: string, options?: RequestInit, params?: Record<string, string>) => Promise<Response>;

/**
 * Converts a path pattern with params (e.g., "/games/:id") to a regex
 * Returns { regex, paramNames } or null if no params
 */
function parsePathPattern(pattern: string): { regex: RegExp; paramNames: string[] } | null {
  const paramNames: string[] = [];
  let regexPattern = pattern
    .replace(/:(\w+)/g, (_, paramName) => {
      paramNames.push(paramName);
      return "([^/?#]+)"; // Match any chars except /, ?, #
    })
    .replace(/\//g, "\\/"); // Escape slashes

  // Match end of path or query string
  regexPattern = `^${regexPattern}(?:\\?|$|/)`;

  return {
    regex: new RegExp(regexPattern),
    paramNames,
  };
}

/**
 * Extracts path from full URL
 */
function extractPath(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.pathname + urlObj.search;
  } catch {
    // If URL parsing fails, assume it's already a path
    return url;
  }
}

/**
 * Converts pattern to regex for matching
 */
function patternToRegex(pattern: RegExp | string): RegExp | string {
  if (pattern instanceof RegExp) {
    return pattern;
  }

  // Check if pattern has path params
  if (pattern.includes(":")) {
    const parsed = parsePathPattern(pattern);
    if (parsed) {
      return parsed.regex;
    }
  }

  return pattern;
}

/**
 * Extracts params from URL using pattern
 */
function extractParams(url: string, pattern: string): Record<string, string> | undefined {
  if (!pattern.includes(":")) {
    return undefined;
  }

  const parsed = parsePathPattern(pattern);
  if (!parsed) {
    return undefined;
  }

  const path = extractPath(url);
  const execResult = parsed.regex.exec(path);
  if (!execResult) {
    return undefined;
  }

  const params: Record<string, string> = {};
  parsed.paramNames.forEach((name, index) => {
    params[name] = execResult[index + 1];
  });

  return params;
}

/**
 * Enhanced Mock API registry with path parameter support
 * Integrates with existing fetchMock system
 */
export const mockApi = {
  /**
   * Low-level registration method
   * Registers with fetchMock but provides better API
   */
  register: (method: Method, pattern: RegExp | string, handler: MockHandler) => {
    // Add safety check
    if (!fetchMock || typeof fetchMock.register !== 'function') {
      console.warn('[mockApi] fetchMock is not available, skipping registration');
      return;
    }
    
    const regexPattern = patternToRegex(pattern);
    
    // Wrap handler to extract params
    const wrappedHandler = (url: string, options?: RequestInit) => {
      const params = typeof pattern === "string" ? extractParams(url, pattern) : undefined;
      return handler(url, options, params);
    };

    fetchMock.register(method, regexPattern, wrappedHandler);
  },

  /**
   * Register GET handler
   */
  get: (pattern: RegExp | string, handler: MockHandler) => {
    mockApi.register("GET", pattern, handler);
  },

  /**
   * Register POST handler
   */
  post: (pattern: RegExp | string, handler: MockHandler) => {
    mockApi.register("POST", pattern, handler);
  },

  /**
   * Register PUT handler
   */
  put: (pattern: RegExp | string, handler: MockHandler) => {
    mockApi.register("PUT", pattern, handler);
  },

  /**
   * Register PATCH handler
   */
  patch: (pattern: RegExp | string, handler: MockHandler) => {
    mockApi.register("PATCH", pattern, handler);
  },

  /**
   * Register DELETE handler
   */
  delete: (pattern: RegExp | string, handler: MockHandler) => {
    mockApi.register("DELETE", pattern, handler);
  },

  /**
   * Reset all registered mocks
   */
  reset: () => {
    // Add safety check
    if (fetchMock && typeof fetchMock.reset === 'function') {
      fetchMock.reset();
    }
  },

  // --- Convenience helpers using fixtures ---

  /**
   * Mock GET /games - returns list of games
   */
  games: (games?: GameSummary[] | GameDetails[]) => {
    // Add safety check
    if (!fetchMock || typeof fetchMock.json !== 'function') {
      console.warn('[mockApi] fetchMock is not available, skipping games mock');
      return;
    }
    const fixtureGames = games || [];
    mockApi.get("/games", () => fetchMock.json(fixtureGames));
  },

  /**
   * Mock GET /games/:id - returns single game
   */
  game: (id: string, game?: Partial<GameDetails>) => {
    // Add safety check
    if (!fetchMock || typeof fetchMock.json !== 'function') {
      console.warn('[mockApi] fetchMock is not available, skipping game mock');
      return;
    }
    const fixtureGame = makeGame({ id, ...game });
    // Use regex to match /games/:id with optional query params
    mockApi.get(new RegExp(`/games/${id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:\\?|$|/)`), () => fetchMock.json(fixtureGame));
  },

  /**
   * Mock GET /games/:id/comments - returns comments
   */
  comments: (gameId: string, comments?: Comment[]) => {
    // Add safety check
    if (!fetchMock || typeof fetchMock.json !== 'function') {
      console.warn('[mockApi] fetchMock is not available, skipping comments mock');
      return;
    }
    const fixtureComments = comments || [];
    mockApi.get(`/games/${gameId}/comments`, () => fetchMock.json({ comments: fixtureComments }));
  },

  /**
   * Mock GET /teams - returns teams
   */
  teams: (teams?: Team[]) => {
    // Add safety check
    if (!fetchMock || typeof fetchMock.json !== 'function') {
      console.warn('[mockApi] fetchMock is not available, skipping teams mock');
      return;
    }
    const fixtureTeams = teams || [];
    mockApi.get("/teams", () => fetchMock.json({ teams: fixtureTeams }));
  },

  /**
   * Mock POST /auth/login - returns user and token
   */
  authLogin: (user?: Partial<User>, token?: string) => {
    // Add safety check
    if (!fetchMock || typeof fetchMock.json !== 'function') {
      console.warn('[mockApi] fetchMock is not available, skipping authLogin mock');
      return;
    }
    const fixtureUser = makeUser(user);
    const fixtureToken = token || `mock.${btoa(JSON.stringify({ userId: fixtureUser.id, email: fixtureUser.email, login: fixtureUser.login, isSuperAdmin: fixtureUser.isSuperAdmin }))}.sig`;
    mockApi.post("/auth/login", () => fetchMock.json({ user: fixtureUser, token: fixtureToken }));
  },

  /**
   * Mock POST /auth/register - returns user and token
   */
  authRegister: (user?: Partial<User>, token?: string) => {
    // Add safety check
    if (!fetchMock || typeof fetchMock.json !== 'function') {
      console.warn('[mockApi] fetchMock is not available, skipping authRegister mock');
      return;
    }
    const fixtureUser = makeUser(user);
    const fixtureToken = token || `mock.${btoa(JSON.stringify({ userId: fixtureUser.id, email: fixtureUser.email, login: fixtureUser.login, isSuperAdmin: fixtureUser.isSuperAdmin }))}.sig`;
    mockApi.post("/auth/register", () => fetchMock.json({ user: fixtureUser, token: fixtureToken }));
  },

  /**
   * Mock POST /auth/recovery/request - returns success message
   */
  authRecoveryRequest: () => {
    // Add safety check
    if (!fetchMock || typeof fetchMock.json !== 'function') {
      console.warn('[mockApi] fetchMock is not available, skipping authRecoveryRequest mock');
      return;
    }
    mockApi.post("/auth/recovery/request", () => fetchMock.json({ message: "Recovery code sent" }));
  },

  /**
   * Mock POST /api/auth/dev - returns user and token (dev mode auth)
   */
  authDev: (user?: Partial<User & { role?: 'Guest' | 'Participant' | 'Organizer' }>, token?: string) => {
    if (!fetchMock || typeof fetchMock.json !== 'function') {
      console.warn('[mockApi] fetchMock is not available, skipping authDev mock');
      return;
    }
    const fixtureUser = makeUser(user);
    const userWithRole = { ...fixtureUser, role: (user?.role as 'Guest' | 'Participant' | 'Organizer') || 'Organizer' };
    const fixtureToken = token || `mock.dev.${btoa(JSON.stringify({ userId: userWithRole.id, role: userWithRole.role }))}.sig`;
    mockApi.post("/api/auth/dev", () => fetchMock.json({ user: userWithRole, token: fixtureToken }));
  },

  /**
   * Mock POST /auth/recovery/verify - returns token
   */
  authRecoveryVerify: (user?: Partial<User>, token?: string) => {
    // Add safety check
    if (!fetchMock || typeof fetchMock.json !== 'function') {
      console.warn('[mockApi] fetchMock is not available, skipping authRecoveryVerify mock');
      return;
    }
    const fixtureUser = makeUser(user);
    const fixtureToken = token || `mock.${btoa(JSON.stringify({ userId: fixtureUser.id, email: fixtureUser.email, login: fixtureUser.login, isSuperAdmin: fixtureUser.isSuperAdmin }))}.sig`;
    mockApi.post("/auth/recovery/verify", () => fetchMock.json({ message: "Password reset", token: fixtureToken }));
  },

  /**
   * Mock GET /users?login=... - returns users
   */
  users: (users?: User[]) => {
    // Add safety check
    if (!fetchMock || typeof fetchMock.json !== 'function') {
      console.warn('[mockApi] fetchMock is not available, skipping users mock');
      return;
    }
    const fixtureUsers = users || [];
    mockApi.get("/users", () => fetchMock.json({ users: fixtureUsers }));
  },

  /**
   * Mock GET /api/auth/me - returns user from token
   * Decodes JWT token from localStorage and returns user data
   * Supports role field from token payload
   * Returns 401 if no token is found
   */
  authMe: (user?: Partial<User & { role?: 'Guest' | 'Participant' | 'Organizer' }>) => {
    // Add safety check
    if (!fetchMock || typeof fetchMock.json !== 'function') {
      console.warn('[mockApi] fetchMock is not available, skipping authMe mock');
      return;
    }
    
    mockApi.get('/api/auth/me', () => {
      // Try to decode token from localStorage
      const token = localStorage.getItem('birdmaid_token');
      if (!token) {
        // No token - return 401
        return fetchMock.json({ error: 'Unauthorized' }, { status: 401 });
      }
      
      // Check for expired/invalid token markers
      if (token.includes('.expired') || token.endsWith('.expired')) {
        return fetchMock.json({ error: 'Token expired' }, { status: 401 });
      }
      
      try {
        // Decode JWT token (format: header.payload.signature)
        const parts = token.split('.');
        if (parts.length >= 2 && parts[1]) {
          // Try to decode payload
          try {
            const decoded = atob(parts[1]);
            const payload = JSON.parse(decoded);
            const userData: User & { role?: 'Guest' | 'Participant' | 'Organizer' } = {
              id: payload.userId || payload.id || '123',
              email: payload.email || 'test@example.com',
              login: payload.login || 'testuser',
              isSuperAdmin: payload.isSuperAdmin || false,
              role: payload.role || 'Guest',
            };
            // Merge with provided overrides
            const finalUser = { ...userData, ...user };
            return fetchMock.json({ user: finalUser });
          } catch (decodeError) {
            // If base64 decode or JSON parse fails, return 401
            return fetchMock.json({ error: 'Invalid token' }, { status: 401 });
          }
        } else {
          // Invalid token format (missing parts)
          return fetchMock.json({ error: 'Invalid token format' }, { status: 401 });
        }
      } catch (e) {
        // If token decode fails (invalid base64, invalid JSON, etc.), return 401
        return fetchMock.json({ error: 'Invalid token' }, { status: 401 });
      }
      
      // Fallback: use provided user or default
      if (user) {
        const fixtureUser = makeUser(user);
        const userWithRole = { ...fixtureUser, role: (user.role as 'Guest' | 'Participant' | 'Organizer') || 'Guest' };
        return fetchMock.json({ user: userWithRole });
      }
      
      // No user provided and token decode failed - return 401
      return fetchMock.json({ error: 'Unauthorized' }, { status: 401 });
    });
  },

  /**
   * Mock GET /api/vfs/list - List files in path
   * itemsByPath: map path -> VfsListItem[]; or use getItems(path) for dynamic
   */
  vfsList: (itemsByPath: Record<string, { name: string; type: "file" | "dir" }[]>) => {
    if (!fetchMock || typeof fetchMock.json !== 'function') return;
    mockApi.get(/\/api\/vfs\/list/, async (url) => {
      const u = new URL(url.startsWith('http') ? url : `http://x${url}`);
      const path = u.searchParams.get('path') ?? '/';
      const items = itemsByPath[path] ?? itemsByPath['/'] ?? [];
      return fetchMock.json({ items });
    });
  },

  /**
   * Mock GET /api/vfs/read - Read file content
   * contentByKey: map key -> string content
   */
  vfsRead: (contentByKey: Record<string, string>) => {
    if (!fetchMock || typeof fetchMock.json !== 'function') return;
    mockApi.get(/\/api\/vfs\/read/, async (url) => {
      const u = new URL(url.startsWith('http') ? url : `http://x${url}`);
      const key = u.searchParams.get('key') ?? '';
      const content = contentByKey[key];
      if (content === undefined) {
        return new Response('Not Found', { status: 404 });
      }
      return new Response(content, {
        headers: { 'Content-Type': 'text/plain' },
      });
    });
  },

  /**
   * Mock POST /api/vfs/mkdir - Create folder
   * Returns success or 409/403 based on handler
   */
  vfsMkdir: (options?: { existingPaths?: string[]; reject403?: boolean }) => {
    if (!fetchMock || typeof fetchMock.json !== 'function') return;
    const existingPaths = new Set(options?.existingPaths ?? []);
    mockApi.post("/api/vfs/mkdir", async (_url, init) => {
      if (options?.reject403) {
        return fetchMock.json(
          { statusCode: 403, message: "PermissionDenied: mkdir requires Organizer role" },
          403
        );
      }
      try {
        const body = init?.body ? JSON.parse(init.body as string) : {};
        const path = body?.path;
        if (!path) {
          return fetchMock.json({ statusCode: 400, message: "path is required" }, 400);
        }
        if (existingPaths.has(path)) {
          return fetchMock.json(
            { statusCode: 409, message: "A file with that name already exists" },
            409
          );
        }
        return fetchMock.json({ success: true, item: { name: path.split("/").pop(), type: "dir", path, s3Key: path } });
      } catch {
        return fetchMock.json({ statusCode: 400, message: "Invalid path" }, 400);
      }
    });
  },

  /**
   * Setup default mocks for common test scenarios
   * Safe defaults that prevent crashes
   */
  setupDefaults: () => {
    // Add safety check
    if (!fetchMock || typeof fetchMock.json !== 'function') {
      console.warn('[mockApi] fetchMock is not available, skipping setupDefaults');
      return;
    }
    mockApi.games([]);
    mockApi.teams([]);
    // Mock /jam/current endpoint (used by LandingWindow in FP6/FP7)
    mockApi.get('/jam/current', () => fetchMock.json(null));
    // VFS list/read - empty by default; tests that need Desktop/Explorer data call mockApi.vfsList() and mockApi.vfsRead()
    mockApi.vfsList({});
    mockApi.vfsRead({});
    // Don't mock auth/login by default - tests should explicitly set it
    // Don't mock auth/me by default - tests should explicitly set it
  },
};

// Re-export fetchMock for convenience
export { fetchMock };
