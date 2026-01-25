/**
 * Test fixtures for User models
 */

export type User = {
  id: string;
  email: string;
  login: string;
  isSuperAdmin: boolean;
};

/**
 * Creates a User fixture with all required fields and safe defaults
 */
export function makeUser(overrides?: Partial<User>): User {
  const defaults: User = {
    id: "user1",
    email: "user@example.com",
    login: "testuser",
    isSuperAdmin: false,
  };

  return { ...defaults, ...overrides };
}
