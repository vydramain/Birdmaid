import { fetchMock } from "./mock-fetch";

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

/**
 * Mock API registry with convenient helpers for common endpoints
 */
export const mockApi = {
  /**
   * Register a mock endpoint
   */
  register: (method: Method, urlPattern: RegExp | string, handler: (url: string, options?: RequestInit) => Promise<Response>) => {
    fetchMock.register(method, urlPattern, handler);
  },

  /**
   * Reset all registered mocks
   */
  reset: () => {
    fetchMock.reset();
  },

  // --- Helper methods for common endpoints ---

  /**
   * Mock GET /games - returns list of games
   */
  games: (games: Array<{ id: string; title: string; status: string; [key: string]: unknown }>) => {
    fetchMock.register("GET", "/games", () => fetchMock.json(games));
  },

  /**
   * Mock GET /games/:id - returns single game
   */
  game: (id: string, game: { id: string; title: string; status: string; [key: string]: unknown }) => {
    fetchMock.register("GET", `/games/${id}`, () => fetchMock.json(game));
  },

  /**
   * Mock GET /games/:id/comments - returns comments
   */
  comments: (gameId: string, comments: Array<{ id: string; text: string; userLogin: string; createdAt: string; [key: string]: unknown }>) => {
    fetchMock.register("GET", `/games/${gameId}/comments`, () => 
      fetchMock.json({ comments })
    );
  },

  /**
   * Mock GET /teams - returns teams
   */
  teams: (teams: Array<{ id: string; name: string; leader: string; members: string[]; [key: string]: unknown }>) => {
    fetchMock.register("GET", "/teams", () => fetchMock.json({ teams }));
  },

  /**
   * Mock POST /auth/login - returns user and token
   */
  authLogin: (user: { id: string; email: string; login: string; isSuperAdmin: boolean }, token: string = "test-token") => {
    fetchMock.register("POST", "/auth/login", () => 
      fetchMock.json({ user, token })
    );
  },

  /**
   * Mock GET /users?login=... - returns users
   */
  users: (users: Array<{ id: string; login: string; [key: string]: unknown }>) => {
    fetchMock.register("GET", "/users", () => fetchMock.json({ users }));
  },

  /**
   * Setup default mocks for common test scenarios
   */
  setupDefaults: () => {
    fetchMock.register("GET", "/teams", () => fetchMock.json({ teams: [] }));
    fetchMock.register("GET", "/games", () => fetchMock.json([]));
  },
};
