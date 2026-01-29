import { Test, TestingModule } from "@nestjs/testing";
import { GamesController } from "../../src/games/games.controller";
import { GamesService } from "../../src/games/games.service";
import { BuildUrlService } from "../../src/build-url.service";

describe("GET /games - cover URL signing (FP5)", () => {
  let controller: GamesController;
  let service: GamesService;
  let buildUrlService: BuildUrlService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GamesController],
      providers: [GamesService, BuildUrlService],
    }).compile();

    controller = module.get<GamesController>(GamesController);
    service = module.get<GamesService>(GamesService);
    buildUrlService = module.get<BuildUrlService>(BuildUrlService);
  });

  it("returns signed URLs for cover images in listGames() response", async () => {
    const result = await controller.listGames();

    // All games should have cover_url as signed URL (not S3 key)
    result.forEach((game) => {
      if (game.cover_url) {
        // Should be full URL (signed URL)
        expect(game.cover_url).toMatch(/^https?:\/\//);
        // Should not be S3 key format (covers/...)
        expect(game.cover_url).not.toMatch(/^covers\//);
        // Should contain signature/expiration parameters
        expect(game.cover_url).toMatch(/[?&](signature|X-Amz|Expires)=/);
      }
    });
  });

  it("never returns S3 keys as cover_url in listGames()", async () => {
    const result = await controller.listGames();

    result.forEach((game) => {
      if (game.cover_url) {
        // Should not be S3 key format
        expect(game.cover_url).not.toMatch(/^covers\/[^\/]+\.(jpg|png|gif|webp)$/);
        expect(game.cover_url).not.toMatch(/^s3:\/\//);
      }
    });
  });

  it("uses BuildUrlService to sign cover URLs", async () => {
    const buildUrlServiceSpy = jest.spyOn(buildUrlService, "getSignedUrlFromKey");

    await controller.listGames();

    // BuildUrlService should be called for each game with cover_url
    const result = await controller.listGames();
    const gamesWithCovers = result.filter((g) => g.cover_url);
    
    if (gamesWithCovers.length > 0) {
      expect(buildUrlServiceSpy).toHaveBeenCalled();
    }
  });
});
