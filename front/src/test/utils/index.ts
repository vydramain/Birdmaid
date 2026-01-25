export * from "./render";
export { fetchMock, setupFetchMock } from "./mock-fetch";
// Re-export fixtures for convenience
export * from "../fixtures/game";
export * from "../fixtures/team";
export * from "../fixtures/user";
export * from "../fixtures/comment";
// Re-export mockApi - use direct re-export (works in Vitest)
export { mockApi } from "../mocks/mockApi";

/**
 * Safely reset mockApi - use this in test beforeEach hooks to avoid undefined errors
 * This function handles cases where mockApi might not be initialized due to module loading order
 */
export function resetMockApi() {
  // Use dynamic import to avoid circular dependency issues
  try {
    const { mockApi } = require("../mocks/mockApi");
    if (mockApi && typeof mockApi.reset === 'function') {
      mockApi.reset();
      if (typeof mockApi.setupDefaults === 'function') {
        mockApi.setupDefaults();
      }
    }
  } catch (e) {
    // Fallback: try to reset fetchMock directly
    const { fetchMock } = require("./mock-fetch");
    if (fetchMock && typeof fetchMock.reset === 'function') {
      fetchMock.reset();
    }
  }
}
