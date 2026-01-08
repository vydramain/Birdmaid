import { AppController } from "../../src/app.controller";

describe("CSP headers baseline", () => {
  let controller: AppController;

  beforeEach(() => {
    controller = new AppController();
  });

  it("includes CSP header data for iframe sandboxing", async () => {
    const result = await controller.getGame("game-1");

    expect((result as { csp?: string }).csp).toMatch(/frame-ancestors/i);
  });
});
