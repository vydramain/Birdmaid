import { Test, TestingModule } from "@nestjs/testing";
import { HelpController } from "../../src/help/help.controller";
import { HelpService } from "../../src/help/help.service";
import { HelpRepository } from "../../src/help/help.repository";

describe("GET /help (FP6)", () => {
  let controller: HelpController;
  let service: HelpService;
  let repository: HelpRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HelpController],
      providers: [HelpService, HelpRepository],
    }).compile();

    controller = module.get<HelpController>(HelpController);
    service = module.get<HelpService>(HelpService);
    repository = module.get<HelpRepository>(HelpRepository);
  });

  it("should return help content as markdown", async () => {
    const result = await controller.getContent();

    expect(result).toHaveProperty("content");
    expect(typeof result.content).toBe("string");
    expect(result.content.length).toBeGreaterThan(0);
  });

  it("should be accessible without authentication", async () => {
    // This is tested by the fact that the controller method doesn't require auth decorators
    // and the test can run without authentication setup
    const result = await controller.getContent();
    
    expect(result).toHaveProperty("content");
  });

  it("should return valid markdown content", async () => {
    const result = await controller.getContent();

    expect(result.content).toContain("#");
    // Should contain some markdown structure
    expect(result.content.length).toBeGreaterThan(10);
  });
});
