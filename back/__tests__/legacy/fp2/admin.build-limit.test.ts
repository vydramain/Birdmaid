import { AppController } from "../../src/app.controller";

describe("Build size limit enforcement", () => {
  let controller: AppController;
  const adminHeaders = { "x-admin-token": "admin-token" };

  beforeEach(() => {
    controller = new AppController();
  });

  it("rejects ZIP uploads larger than the configured limit", async () => {
    const game = await controller.createGame({
      teamId: "team-1",
      title: "Large Build",
      description_md: "Desc",
      repo_url: "https://example.com/repo",
      cover_url: "https://example.com/cover.png",
    }, adminHeaders);
    const gameId = "id" in game ? game.id : game._id;

    const oversizeBytes = 300 * 1024 * 1024 + 1;
    const file = { originalname: "build.zip", buffer: { length: oversizeBytes } } as {
      originalname: string;
      buffer: Buffer;
    };

    await expect(controller.uploadBuild(gameId, file, adminHeaders)).rejects.toThrow(/size/i);
  });
});
