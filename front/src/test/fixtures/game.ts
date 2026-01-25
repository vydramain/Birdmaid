/**
 * Test fixtures for Game models
 * All array fields default to [] to prevent runtime crashes
 */

export type GameSummary = {
  id: string;
  title: string;
  cover_url?: string;
  tags_user?: string[];
  tags_system?: string[];
  status: string;
  teamId?: string;
};

export type GameDetails = GameSummary & {
  description_md?: string;
  repo_url?: string;
  build_url?: string | null;
  team?: { name: string; members: string[] };
  teamId?: string;
};

/**
 * Creates a GameDetails fixture with all required fields and safe defaults
 * Arrays default to [] to prevent runtime crashes
 */
export function makeGame(overrides?: Partial<GameDetails>): GameDetails {
  const defaults: GameDetails = {
    id: "1",
    title: "Test Game",
    status: "published",
    tags_user: [],
    tags_system: [],
    cover_url: undefined,
    description_md: undefined,
    repo_url: undefined,
    build_url: null,
    teamId: undefined,
    team: undefined,
  };

  const result = { ...defaults, ...overrides };

  // Ensure arrays are always arrays, never undefined
  if (!Array.isArray(result.tags_user)) {
    result.tags_user = [];
  }
  if (!Array.isArray(result.tags_system)) {
    result.tags_system = [];
  }
  if (result.team && !Array.isArray(result.team.members)) {
    result.team.members = [];
  }

  return result;
}

/**
 * Creates an array of GameDetails fixtures
 */
export function makeGames(count: number, overrides?: Partial<GameDetails>): GameDetails[] {
  return Array.from({ length: count }, (_, i) =>
    makeGame({
      ...overrides,
      id: overrides?.id || `${i + 1}`,
      title: overrides?.title || `Test Game ${i + 1}`,
    })
  );
}

/**
 * Creates a GameSummary fixture (for list endpoints)
 */
export function makeGameSummary(overrides?: Partial<GameSummary>): GameSummary {
  const defaults: GameSummary = {
    id: "1",
    title: "Test Game",
    status: "published",
    tags_user: [],
    tags_system: [],
    cover_url: undefined,
    teamId: undefined,
  };

  const result = { ...defaults, ...overrides };

  // Ensure arrays are always arrays
  if (!Array.isArray(result.tags_user)) {
    result.tags_user = [];
  }
  if (!Array.isArray(result.tags_system)) {
    result.tags_system = [];
  }

  return result;
}

/**
 * Creates an array of GameSummary fixtures
 */
export function makeGameSummaries(count: number, overrides?: Partial<GameSummary>): GameSummary[] {
  return Array.from({ length: count }, (_, i) =>
    makeGameSummary({
      ...overrides,
      id: overrides?.id || `${i + 1}`,
      title: overrides?.title || `Test Game ${i + 1}`,
    })
  );
}
