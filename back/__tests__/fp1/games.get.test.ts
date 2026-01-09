import { AppController } from "../../src/app.controller";

describe("GET /games/{id}", () => {
  let controller: AppController;

  beforeEach(() => {
    controller = new AppController();
  });

  it("returns game details with build_url", async () => {
    const game = await controller.getGame("game-1", "true");

    expect(game.description_md).toContain("Demo");
    expect(game.repo_url).toContain("http");
    expect(game.cover_url).toContain("http");
    expect(game.build_url).toContain("http");
  });
});
