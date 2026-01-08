import { AppController } from "../../src/app.controller";

describe("Tag permission enforcement", () => {
  let controller: AppController;

  beforeEach(() => {
    controller = new AppController();
  });

  it("rejects non-admin tag updates", async () => {
    await expect(
      controller.updateTags("game-1", { tags_user: ["jam"] })
    ).rejects.toThrow(/Forbidden/i);
  });
});
