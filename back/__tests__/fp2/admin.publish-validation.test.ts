import { AppController } from "../../src/app.controller";

describe("Publish validation", () => {
  let controller: AppController;
  const adminHeaders = { "x-admin-token": "admin-token" };

  beforeEach(() => {
    controller = new AppController();
  });

  it("rejects publish when required fields are missing", async () => {
    const game = await controller.createGame({
      teamId: "team-1",
      title: "Missing Fields",
      description_md: "",
      repo_url: "",
      cover_url: "",
    }, adminHeaders);
    const gameId = "id" in game ? game.id : game._id;

    await expect(controller.publishGame(gameId, adminHeaders)).rejects.toThrow(/Missing required/);
  });
});
