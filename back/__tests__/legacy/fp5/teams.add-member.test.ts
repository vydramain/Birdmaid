import { Test, TestingModule } from "@nestjs/testing";
import { TeamsController } from "../../src/teams/teams.controller";
import { TeamsService } from "../../src/teams/teams.service";
import { UsersService } from "../../src/users/users.service";

describe("POST /teams/{id}/members - add member by login (FP5)", () => {
  let controller: TeamsController;
  let service: TeamsService;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeamsController],
      providers: [TeamsService, UsersService],
    }).compile();

    controller = module.get<TeamsController>(TeamsController);
    service = module.get<TeamsService>(TeamsService);
    usersService = module.get<UsersService>(UsersService);
  });

  it("adds user to team when userLogin is provided", async () => {
    const leader = { id: "leader123", email: "leader@example.com", login: "leader", isSuperAdmin: false };
    const teamId = "team123";
    const dto = { userLogin: "alice" }; // Using login instead of userId

    const result = await controller.addMember(teamId, dto, leader);

    // User should be added to team members
    expect(result.members.length).toBeGreaterThan(0);
    
    // Should find user by login and add their ID
    const user = await usersService.findByLogin("alice");
    expect(result.members).toContain(user.id);
  });

  it("adds user to team when userId is provided (backward compatibility)", async () => {
    const leader = { id: "leader123", email: "leader@example.com", login: "leader", isSuperAdmin: false };
    const teamId = "team123";
    const dto = { userId: "user123" };

    const result = await controller.addMember(teamId, dto, leader);

    expect(result.members).toContain("user123");
  });

  it("rejects adding member when userLogin does not exist", async () => {
    const leader = { id: "leader123", email: "leader@example.com", login: "leader", isSuperAdmin: false };
    const teamId = "team123";
    const dto = { userLogin: "nonexistent" };

    await expect(controller.addMember(teamId, dto, leader)).rejects.toThrow();
  });

  it("rejects adding member when called by non-leader", async () => {
    const member = { id: "member123", email: "member@example.com", login: "member", isSuperAdmin: false };
    const teamId = "team123";
    const dto = { userLogin: "alice" };

    await expect(controller.addMember(teamId, dto, member)).rejects.toThrow();
  });

  it("rejects adding member when called by unauthenticated user", async () => {
    const teamId = "team123";
    const dto = { userLogin: "alice" };

    await expect(controller.addMember(teamId, dto, null as any)).rejects.toThrow();
  });
});
