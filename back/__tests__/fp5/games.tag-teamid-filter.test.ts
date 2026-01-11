import { Test, TestingModule } from "@nestjs/testing";
import { GamesController } from "../../src/games/games.controller";
import { GamesService } from "../../src/games/games.service";

describe("GET /games?tag=...&teamId=... - combined filtering (FP5)", () => {
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

  it("returns games matching both tag AND teamId filters", async () => {
    const tag = "omsk";
    const teamId = "team123";

    const result = await controller.listGames(tag, undefined, teamId);

    // All returned games should match both conditions
    result.forEach((game) => {
      // Must belong to specified team
      expect(game.teamId).toBe(teamId);
      
      // Must have specified tag (in tags_user or tags_system)
      const hasTag =
        (game.tags_user && game.tags_user.includes(tag)) ||
        (game.tags_system && game.tags_system.includes(tag));
      expect(hasTag).toBe(true);
    });
  });

  it("returns empty array when no games match both conditions", async () => {
    const tag = "nonexistent-tag";
    const teamId = "nonexistent-team";

    const result = await controller.listGames(tag, undefined, teamId);

    expect(result).toEqual([]);
  });

  it("applies AND logic (not OR) for tag and teamId filters", async () => {
    const tag = "omsk";
    const teamId = "team123";

    const result = await controller.listGames(tag, undefined, teamId);

    // Should not include games that match only tag but not teamId
    result.forEach((game) => {
      expect(game.teamId).toBe(teamId);
    });

    // Should not include games that match only teamId but not tag
    result.forEach((game) => {
      const hasTag =
        (game.tags_user && game.tags_user.includes(tag)) ||
        (game.tags_system && game.tags_system.includes(tag));
      expect(hasTag).toBe(true);
    });
  });

  it("works correctly with tag filter alone", async () => {
    const tag = "omsk";

    const result = await controller.listGames(tag);

    result.forEach((game) => {
      const hasTag =
        (game.tags_user && game.tags_user.includes(tag)) ||
        (game.tags_system && game.tags_system.includes(tag));
      expect(hasTag).toBe(true);
    });
  });

  it("works correctly with teamId filter alone", async () => {
    const teamId = "team123";

    const result = await controller.listGames(undefined, undefined, teamId);

    result.forEach((game) => {
      expect(game.teamId).toBe(teamId);
    });
  });
});
