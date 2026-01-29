import { Test, TestingModule } from "@nestjs/testing";
import { GamesController } from "../../src/games/games.controller";
import { GamesService } from "../../src/games/games.service";

describe("POST /games/{id}/status (super admin force)", () => {
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

  it("allows super admin to force status change from published to editing", async () => {
    const user = { id: "admin123", email: "admin@example.com", login: "admin", isSuperAdmin: true };
    const gameId = "game123";
    const dto = { status: "editing", remark: "Fix issues" };

    const result = await controller.updateStatus(gameId, dto, user);

    expect(result.status).toBe("editing");
    expect(result.adminRemark).toHaveProperty("text", "Fix issues");
  });

  it("allows super admin to force status change with optional remark", async () => {
    const user = { id: "admin123", email: "admin@example.com", login: "admin", isSuperAdmin: true };
    const gameId = "game123";
    const dto = { status: "archived" };

    const result = await controller.updateStatus(gameId, dto, user);

    expect(result.status).toBe("archived");
    expect(result.adminRemark).toBeUndefined();
  });

  it("rejects status change when called by non-super-admin", async () => {
    const user = { id: "user123", email: "user@example.com", login: "testuser", isSuperAdmin: false };
    const gameId = "game123";
    const dto = { status: "editing" };

    await expect(controller.updateStatus(gameId, dto, user)).rejects.toThrow();
  });
});

