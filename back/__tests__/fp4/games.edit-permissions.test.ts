import { Test, TestingModule } from "@nestjs/testing";
import { GamesController } from "../../src/games/games.controller";
import { GamesService } from "../../src/games/games.service";

describe("PATCH /games/{id}", () => {
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

  it("allows team member to edit their team's game", async () => {
    const user = { id: "user123", email: "user@example.com", login: "testuser", isSuperAdmin: false };
    const gameId = "game123";
    const dto = { title: "Updated Title" };

    const result = await controller.updateGame(gameId, dto, user);

    expect(result.title).toBe("Updated Title");
  });

  it("rejects edit when user is not team member", async () => {
    const user = { id: "user123", email: "user@example.com", login: "testuser", isSuperAdmin: false };
    const gameId = "otherteamgame123";
    const dto = { title: "Updated Title" };

    await expect(controller.updateGame(gameId, dto, user)).rejects.toThrow();
  });

  it("allows super admin to edit any game", async () => {
    const user = { id: "admin123", email: "admin@example.com", login: "admin", isSuperAdmin: true };
    const gameId = "anygame123";
    const dto = { title: "Updated Title" };

    const result = await controller.updateGame(gameId, dto, user);

    expect(result.title).toBe("Updated Title");
  });
});

