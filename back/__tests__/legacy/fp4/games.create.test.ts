import { Test, TestingModule } from "@nestjs/testing";
import { GamesController } from "../../src/games/games.controller";
import { GamesService } from "../../src/games/games.service";

describe("POST /games", () => {
  let controller: GamesController;
  let service: GamesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GamesController],
      providers: [GamesService],
    }).compile();

    controller = module.get<GamesController>(GamesController);
    service = module.get<GamesService>(GamesService);
  });

  it("creates game with status 'editing' when user is team member", async () => {
    const user = { id: "user123", email: "user@example.com", login: "testuser", isSuperAdmin: false };
    const dto = {
      teamId: "team123",
      title: "Test Game",
      description_md: "Test description",
    };

    const result = await controller.createGame(dto, user);

    expect(result).toHaveProperty("id");
    expect(result.teamId).toBe("team123");
    expect(result.title).toBe("Test Game");
    expect(result.status).toBe("editing");
  });

  it("rejects game creation when user is not team member", async () => {
    const user = { id: "user123", email: "user@example.com", login: "testuser", isSuperAdmin: false };
    const dto = {
      teamId: "otherteam123",
      title: "Test Game",
    };

    await expect(controller.createGame(dto, user)).rejects.toThrow();
  });

  it("allows game creation when user is super admin", async () => {
    const user = { id: "admin123", email: "admin@example.com", login: "admin", isSuperAdmin: true };
    const dto = {
      teamId: "anyteam123",
      title: "Test Game",
    };

    const result = await controller.createGame(dto, user);

    expect(result).toHaveProperty("id");
    expect(result.status).toBe("editing");
  });
});

