/**
 * Test fixtures for Comment models
 */

export type Comment = {
  id: string;
  text: string;
  userLogin: string;
  userId: string;
  createdAt: string;
};

/**
 * Creates a Comment fixture with all required fields and safe defaults
 */
export function makeComment(overrides?: Partial<Comment>): Comment {
  const defaults: Comment = {
    id: "comment1",
    text: "Test comment",
    userLogin: "testuser",
    userId: "user1",
    createdAt: new Date().toISOString(),
  };

  return { ...defaults, ...overrides };
}

/**
 * Creates an array of Comment fixtures
 */
export function makeComments(count: number, overrides?: Partial<Comment>): Comment[] {
  return Array.from({ length: count }, (_, i) =>
    makeComment({
      ...overrides,
      id: overrides?.id || `comment${i + 1}`,
      text: overrides?.text || `Test comment ${i + 1}`,
    })
  );
}
