import { Test, TestingModule } from "@nestjs/testing";
import { TeamsController } from "../../src/teams/teams.controller";
import { TeamsService } from "../../src/teams/teams.service";

describe("POST /teams/{id}/leader", () => {
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

  it("transfers leadership when called by current leader", async () => {
    const currentLeader = {
      id: "leader123",
      email: "leader@example.com",
      login: "leader",
      isSuperAdmin: false,
    };
    const teamId = "team123";
    const dto = { newLeaderId: "newleader123" };

    const result = await controller.transferLeadership(teamId, dto, currentLeader);

    expect(result.leader).toBe("newleader123");
    expect(result.leader).not.toBe("leader123");
  });

  it("rejects leadership transfer when called by non-leader", async () => {
    const member = { id: "member123", email: "member@example.com", login: "member", isSuperAdmin: false };
    const teamId = "team123";
    const dto = { newLeaderId: "newleader123" };

    await expect(controller.transferLeadership(teamId, dto, member)).rejects.toThrow();
  });

  it("rejects leadership transfer to non-member", async () => {
    const currentLeader = {
      id: "leader123",
      email: "leader@example.com",
      login: "leader",
      isSuperAdmin: false,
    };
    const teamId = "team123";
    const dto = { newLeaderId: "nonmember123" };

    await expect(controller.transferLeadership(teamId, dto, currentLeader)).rejects.toThrow();
  });
});

