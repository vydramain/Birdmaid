import { AppController } from "../../src/app.controller";

describe("POST /admin/games/{id}/build", () => {
  let controller: AppController;

  beforeEach(() => {
    controller = new AppController();
  });

  it("uploads build and returns build_id", async () => {
    const adminHeaders = { "x-admin-token": "admin-token" };
    const game = await controller.createGame(
      {
        teamId: "team-1",
        title: "Build Game",
        description_md: "Ready",
        repo_url: "https://example.com/repo",
        cover_url: "https://example.com/cover.png",
      },
      adminHeaders
    );
    const gameId = "_id" in game ? game._id : game.id;
    const fileBuffer = Buffer.from("PK\x03\x04");
    const result = await controller.uploadBuild(
      gameId,
      {
        originalname: "build.zip",
        buffer: fileBuffer,
      },
      adminHeaders
    );

    expect(result.build_id).toBeTruthy();
    expect(result.build_url).toContain("index.html");
  });
});
