import { AppController } from "../../src/app.controller";

describe("POST /admin/teams", () => {
  let controller: AppController;

  beforeEach(() => {
    controller = new AppController();
  });

  it("creates a team with zero members", async () => {
    const team = await controller.createTeam({ name: "Omsk Jam" });

    expect(team.members).toEqual([]);
    expect(team.name).toBe("Omsk Jam");
  });
});
