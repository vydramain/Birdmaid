import { AppController } from "../../src/app.controller";

describe("POST /admin/games/{id}/publish", () => {
  let controller: AppController;
  const adminHeaders = { "x-admin-token": "admin-token" };

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
    }, adminHeaders);
    const gameId = "id" in game ? game.id : game._id;

    await expect(controller.publishGame(gameId, adminHeaders)).rejects.toThrow(/Missing required/);

    await controller.uploadBuild(
      gameId,
      { originalname: "build.zip", buffer: Buffer.from("PK\x03\x04") },
      adminHeaders
    );
    const published = await controller.publishGame(gameId, adminHeaders);

    expect(published.status).toBe("published");
  });
});
