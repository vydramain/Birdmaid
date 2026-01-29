import { AppController } from "../../src/app.controller";

describe("POST /admin/teams", () => {
  let controller: AppController;
  const adminHeaders = { "x-admin-token": "admin-token" };

  beforeEach(() => {
    controller = new AppController();
  });

  it("creates a team with zero members", async () => {
    const team = await controller.createTeam({ name: "Omsk Jam" }, adminHeaders);

    expect(team.members).toEqual([]);
    expect(team.name).toBe("Omsk Jam");
  });
});
