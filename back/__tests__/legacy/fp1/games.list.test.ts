import { AppController } from "../../src/app.controller";

describe("GET /games", () => {
  let controller: AppController;

  beforeEach(() => {
    controller = new AppController();
  });

  it("returns published games", async () => {
    const games = await controller.listGames();

    expect(games.length).toBeGreaterThan(0);
    expect(games.every((game) => game.status === "published")).toBe(true);
  });

  it("filters by tag", async () => {
    const games = await controller.listGames("omsk");

    expect(games.length).toBeGreaterThan(0);
    expect(
      games.every(
        (game) => game.tags_user.includes("omsk") || game.tags_system.includes("omsk")
      )
    ).toBe(true);
  });
});
