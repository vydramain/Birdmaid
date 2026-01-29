import { Test, TestingModule } from "@nestjs/testing";
import { TeamsController } from "../../src/teams/teams.controller";
import { TeamsService } from "../../src/teams/teams.service";

describe("POST /teams/{id}/members", () => {
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

  it("adds user to team when called by team leader", async () => {
    const leader = { id: "leader123", email: "leader@example.com", login: "leader", isSuperAdmin: false };
    const teamId = "team123";
    const dto = { userId: "newuser123" };

    const result = await controller.addMember(teamId, dto, leader);

    expect(result.members).toContain("newuser123");
  });

  it("rejects adding member when called by non-leader", async () => {
    const member = { id: "member123", email: "member@example.com", login: "member", isSuperAdmin: false };
    const teamId = "team123";
    const dto = { userId: "newuser123" };

    await expect(controller.addMember(teamId, dto, member)).rejects.toThrow();
  });

  it("rejects adding member when called by unauthenticated user", async () => {
    const teamId = "team123";
    const dto = { userId: "newuser123" };

    await expect(controller.addMember(teamId, dto, null as any)).rejects.toThrow();
  });
});

describe("DELETE /teams/{id}/members/{userId}", () => {
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

  it("removes user from team when called by team leader", async () => {
    const leader = { id: "leader123", email: "leader@example.com", login: "leader", isSuperAdmin: false };
    const teamId = "team123";
    const userId = "member123";

    const result = await controller.removeMember(teamId, userId, leader);

    expect(result.members).not.toContain(userId);
  });

  it("rejects removing member when called by non-leader", async () => {
    const member = { id: "member123", email: "member@example.com", login: "member", isSuperAdmin: false };
    const teamId = "team123";
    const userId = "othermember123";

    await expect(controller.removeMember(teamId, userId, member)).rejects.toThrow();
  });
});

