import { AppController } from "../../src/app.controller";

describe("Status validation", () => {
  let controller: AppController;
  const adminHeaders = { "x-admin-token": "admin-token" };

  beforeEach(() => {
    controller = new AppController();
  });

  it("rejects invalid status values", async () => {
    await expect(
      controller.updateStatus("game-1", { status: "invalid-status" }, adminHeaders)
    ).rejects.toThrow(/Invalid status/i);
  });
});
