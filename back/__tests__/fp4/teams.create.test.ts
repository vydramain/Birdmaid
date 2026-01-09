import { Test, TestingModule } from "@nestjs/testing";
import { TeamsController } from "../../src/teams/teams.controller";
import { TeamsService } from "../../src/teams/teams.service";

describe("POST /teams", () => {
  let controller: TeamsController;
  let service: TeamsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeamsController],
      providers: [TeamsService],
    }).compile();

    controller = module.get<TeamsController>(TeamsController);
    service = module.get<TeamsService>(TeamsService);
  });

  it("creates team with authenticated user as leader and member", async () => {
    const user = { id: "user123", email: "user@example.com", login: "testuser", isSuperAdmin: false };
    const dto = { name: "Test Team" };

    const result = await controller.createTeam(dto, user);

    expect(result).toHaveProperty("id");
    expect(result.name).toBe("Test Team");
    expect(result.leader).toBe("user123");
    expect(result.members).toContain("user123");
    expect(result.members.length).toBe(1);
  });

  it("requires authentication", async () => {
    const dto = { name: "Test Team" };

    await expect(controller.createTeam(dto, null as any)).rejects.toThrow();
  });

  it("rejects team creation with empty name", async () => {
    const user = { id: "user123", email: "user@example.com", login: "testuser", isSuperAdmin: false };
    const dto = { name: "" };

    await expect(controller.createTeam(dto, user)).rejects.toThrow();
  });
});

