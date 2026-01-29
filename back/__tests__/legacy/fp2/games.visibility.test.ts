import { AppController } from "../../src/app.controller";

describe("GET /games/{id} visibility", () => {
  let controller: AppController;

  beforeEach(() => {
    controller = new AppController();
  });

  it("rejects public access to editing/archived games", async () => {
    await expect(controller.getGame("game-2")).rejects.toThrow(/not available/i);
  });
});
