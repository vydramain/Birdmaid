import { AppController } from "../../src/app.controller";

describe("Admin guard", () => {
  let controller: AppController;

  beforeEach(() => {
    controller = new AppController();
  });

  it("rejects admin calls without token", async () => {
    await expect(controller.createTeam({ name: "Guarded" })).rejects.toThrow(/Forbidden/i);
  });
});
