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
    // Don't mock auth/login by default - tests should explicitly set it
  },
};

// Re-export fetchMock for convenience
export { fetchMock };
