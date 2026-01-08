import { AppController } from "../../src/app.controller";

describe("POST /admin/games/{id}/publish", () => {
  let controller: AppController;

  beforeEach(() => {
    controller = new AppController();
  });

  it("publishes only with cover + description + build", async () => {
    const game = await controller.createGame({
      teamId: "team-1",
      title: "Publishable",
      description_md: "Ready",
      repo_url: "https://example.com/repo",
      cover_url: "https://example.com/cover.png",
    });

    await expect(controller.publishGame(game.id)).rejects.toThrow(/Missing required/);

    await controller.uploadBuild(game.id, { originalname: "build.zip", buffer: Buffer.from("PK\x03\x04") });
    const published = await controller.publishGame(game.id);

    expect(published.status).toBe("published");
  });
});
