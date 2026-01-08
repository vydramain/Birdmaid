import { AppController } from "../../src/app.controller";

describe("POST /admin/games/{id}/tags", () => {
  let controller: AppController;

  beforeEach(() => {
    controller = new AppController();
  });

  it("updates tags_user/tags_system", async () => {
    const result = await controller.updateTags("game-1", {
      tags_user: ["jam"],
      tags_system: ["winter"],
    });

    expect(result.tags_user).toEqual(["jam"]);
    expect(result.tags_system).toEqual(["winter"]);
  });
});
