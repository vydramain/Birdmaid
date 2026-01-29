import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "../../src/auth/auth.controller";
import { AuthService } from "../../src/auth/auth.service";

describe("POST /auth/recovery/request", () => {
  let controller: AuthController;
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [AuthService],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  it("generates recovery code and sends email", async () => {
    const dto = { email: "user@example.com" };

    const result = await controller.requestRecovery(dto);

    expect(result).toHaveProperty("message");
    expect(result.message).toContain("sent");
  });

  it("invalidates previous recovery code when new code is requested", async () => {
    const dto = { email: "user@example.com" };

    await controller.requestRecovery(dto);
    const firstCode = await service.getRecoveryCode("user@example.com");

    await controller.requestRecovery(dto);
    const secondCode = await service.getRecoveryCode("user@example.com");

    expect(secondCode).not.toBe(firstCode);
  });

  it("rejects recovery request for non-existent email", async () => {
    const dto = { email: "nonexistent@example.com" };

    await expect(controller.requestRecovery(dto)).rejects.toThrow();
  });
});

describe("POST /auth/recovery/verify", () => {
  let controller: AuthController;
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [AuthService],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  it("verifies recovery code and resets password", async () => {
    const email = "user@example.com";
    await controller.requestRecovery({ email });
    const code = await service.getRecoveryCode(email);

    const dto = {
      email,
      code,
      newPassword: "newpassword123",
    };

    const result = await controller.verifyRecovery(dto);

    expect(result).toHaveProperty("message");
    expect(result).toHaveProperty("token");
    expect(typeof result.token).toBe("string");
  });

  it("rejects verification with invalid code", async () => {
    const email = "user@example.com";
    await controller.requestRecovery({ email });

    const dto = {
      email,
      code: "invalidcode",
      newPassword: "newpassword123",
    };

    await expect(controller.verifyRecovery(dto)).rejects.toThrow();
  });

  it("rejects verification with non-existent email", async () => {
    const dto = {
      email: "nonexistent@example.com",
      code: "123456",
      newPassword: "newpassword123",
    };

    await expect(controller.verifyRecovery(dto)).rejects.toThrow();
  });

  it("rejects verification with password shorter than 6 characters", async () => {
    const email = "user@example.com";
    await controller.requestRecovery({ email });
    const code = await service.getRecoveryCode(email);

    const dto = {
      email,
      code,
      newPassword: "12345",
    };

    await expect(controller.verifyRecovery(dto)).rejects.toThrow();
  });
});

