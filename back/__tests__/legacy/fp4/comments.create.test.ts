import { Test, TestingModule } from "@nestjs/testing";
import { CommentsController } from "../../src/comments/comments.controller";
import { CommentsService } from "../../src/comments/comments.service";

describe("POST /games/{id}/comments", () => {
  let controller: CommentsController;
  let service: CommentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentsController],
      providers: [CommentsService],
    }).compile();

    controller = module.get<CommentsController>(CommentsController);
    service = module.get<CommentsService>(CommentsService);
  });

  it("creates comment when user is authenticated", async () => {
    const user = { id: "user123", email: "user@example.com", login: "testuser", isSuperAdmin: false };
    const gameId = "game123";
    const dto = { text: "Great game!" };

    const result = await controller.createComment(gameId, dto, user);

    expect(result).toHaveProperty("id");
    expect(result.text).toBe("Great game!");
    expect(result.userId).toBe("user123");
    expect(result.userLogin).toBe("testuser");
    expect(result.gameId).toBe(gameId);
  });

  it("rejects comment creation when user is not authenticated", async () => {
    const gameId = "game123";
    const dto = { text: "Great game!" };

    await expect(controller.createComment(gameId, dto, null as any)).rejects.toThrow();
  });

  it("denormalizes userLogin in comment", async () => {
    const user = { id: "user123", email: "user@example.com", login: "testuser", isSuperAdmin: false };
    const gameId = "game123";
    const dto = { text: "Great game!" };

    const result = await controller.createComment(gameId, dto, user);

    expect(result.userLogin).toBe("testuser");
  });
});

