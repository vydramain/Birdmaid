/**
 * Test fixtures for Team models
 * All array fields default to [] to prevent runtime crashes
 */

export type Team = {
  id: string;
  name: string;
  leader: string;
  leaderLogin?: string;
  members: string[];
  memberLogins?: string[];
};

/**
 * Creates a Team fixture with all required fields and safe defaults
 * Arrays default to [] to prevent runtime crashes
 */
export function makeTeam(overrides?: Partial<Team>): Team {
  const defaults: Team = {
    id: "team1",
    name: "Test Team",
    leader: "user1",
    leaderLogin: undefined,
    members: [],
    memberLogins: [],
  };

  const result = { ...defaults, ...overrides };

  // Ensure arrays are always arrays, never undefined
  if (!Array.isArray(result.members)) {
    result.members = [];
  }
  if (!Array.isArray(result.memberLogins)) {
    result.memberLogins = [];
  }

  return result;
}

/**
 * Creates an array of Team fixtures
 */
export function makeTeams(count: number, overrides?: Partial<Team>): Team[] {
  return Array.from({ length: count }, (_, i) =>
    makeTeam({
      ...overrides,
      id: overrides?.id || `team${i + 1}`,
      name: overrides?.name || `Test Team ${i + 1}`,
      leader: overrides?.leader || `user${i + 1}`,
    })
  );
}
