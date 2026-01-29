import { Test, TestingModule } from "@nestjs/testing";
import { CommentsController } from "../../src/comments/comments.controller";
import { CommentsService } from "../../src/comments/comments.service";

describe("GET /games/{id}/comments", () => {
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

  it("returns comments for published game (public access)", async () => {
    const gameId = "publishedgame123";

    const result = await controller.getComments(gameId);

    expect(Array.isArray(result.comments)).toBe(true);
    result.comments.forEach((comment) => {
      expect(comment).toHaveProperty("id");
      expect(comment).toHaveProperty("text");
      expect(comment).toHaveProperty("userLogin");
      expect(comment).toHaveProperty("userId");
      expect(comment).toHaveProperty("createdAt");
    });
  });

  it("returns comments sorted by createdAt (newest first)", async () => {
    const gameId = "game123";

    const result = await controller.getComments(gameId);

    if (result.comments.length > 1) {
      const dates = result.comments.map((c) => new Date(c.createdAt).getTime());
      const sorted = [...dates].sort((a, b) => b - a);
      expect(dates).toEqual(sorted);
    }
  });

  it("includes userLogin in each comment (denormalized)", async () => {
    const gameId = "game123";

    const result = await controller.getComments(gameId);

    result.comments.forEach((comment) => {
      expect(comment.userLogin).toBeDefined();
      expect(typeof comment.userLogin).toBe("string");
    });
  });
});

