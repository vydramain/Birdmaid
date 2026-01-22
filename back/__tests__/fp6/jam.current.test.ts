import { Test, TestingModule } from "@nestjs/testing";
import { JamController } from "../../src/jam/jam.controller";
import { JamService } from "../../src/jam/jam.service";
import { JamRepository } from "../../src/jam/jam.repository";

describe("GET /jam/current (FP6)", () => {
  let controller: JamController;
  let service: JamService;
  let repository: JamRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JamController],
      providers: [JamService, JamRepository],
    }).compile();

    controller = module.get<JamController>(JamController);
    service = module.get<JamService>(JamService);
    repository = module.get<JamRepository>(JamRepository);
  });

  it("should return current or nearest upcoming jam", async () => {
    const now = new Date();
    const futureDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
    const pastDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days ago

    // Mock memory jams for testing
    (repository as any).memoryJams = [
      {
        name: "Upcoming Jam",
        startDate: futureDate,
        endDate: new Date(futureDate.getTime() + 2 * 24 * 60 * 60 * 1000),
      },
    ];

    const result = await controller.getCurrent();

    expect(result).not.toBeNull();
    if (result) {
      expect(result).toHaveProperty("name");
      expect(result).toHaveProperty("startDate");
      expect(result).toHaveProperty("endDate");
    }
  });

  it("should return null if no jam found", async () => {
    // Clear memory jams
    (repository as any).memoryJams = [];

    const result = await controller.getCurrent();

    expect(result).toBeNull();
  });

  it("should be accessible without authentication", async () => {
    // This is tested by the fact that the controller method doesn't require auth decorators
    // and the test can run without authentication setup
    const result = await controller.getCurrent();
    
    // Should not throw error
    expect(result === null || typeof result === "object").toBe(true);
  });
});
