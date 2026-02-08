import { mockApi } from "../mocks/mockApi";
import { fetchMock } from "./mock-fetch";

export * from "./render";
export { renderWithContextMenu } from "./render";
export { fetchMock, setupFetchMock } from "./mock-fetch";
export * from "../fixtures/game";
export * from "../fixtures/team";
export * from "../fixtures/user";
export * from "../fixtures/comment";
export { mockApi } from "../mocks/mockApi";

/**
 * Reset mockApi - use in test beforeEach hooks
 */
export function resetMockApi() {
  try {
    if (mockApi?.reset) {
      mockApi.reset();
      mockApi.setupDefaults?.();
    }
  } catch {
    fetchMock?.reset?.();
  }
}
