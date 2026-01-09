import { AppController } from "../../src/app.controller";

describe("POST /admin/games/{id}/status", () => {
  let controller: AppController;

  beforeEach(() => {
    controller = new AppController();
  });

  it("updates status and saves remark", async () => {
    const adminHeaders = { "x-admin-token": "admin-token" };
    const result = await controller.updateStatus(
      "game-1",
      {
        status: "editing",
        remark: "Fix issue",
      },
      adminHeaders
    );

    expect(result.status).toBe("editing");
    expect(result.remark).toBe("Fix issue");
  });
});
