import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "../../src/auth/auth.controller";
import { AuthService } from "../../src/auth/auth.service";

describe("POST /auth/login", () => {
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

  it("logs in user with email and password", async () => {
    const dto = {
      identifier: "user@example.com",
      password: "password123",
    };

    const result = await controller.login(dto);

    expect(result).toHaveProperty("user");
    expect(result.user.email).toBe("user@example.com");
    expect(result.user).toHaveProperty("isSuperAdmin");
    expect(result).toHaveProperty("token");
    expect(typeof result.token).toBe("string");
  });

  it("logs in user with login (username) and password", async () => {
    const dto = {
      identifier: "testuser",
      password: "password123",
    };

    const result = await controller.login(dto);

    expect(result).toHaveProperty("user");
    expect(result.user.login).toBe("testuser");
    expect(result).toHaveProperty("token");
  });

  it("rejects login with invalid email/login", async () => {
    const dto = {
      identifier: "nonexistent@example.com",
      password: "password123",
    };

    await expect(controller.login(dto)).rejects.toThrow();
  });

  it("rejects login with incorrect password", async () => {
    const dto = {
      identifier: "user@example.com",
      password: "wrongpassword",
    };

    await expect(controller.login(dto)).rejects.toThrow();
  });

  it("includes isSuperAdmin flag in user object", async () => {
    const dto = {
      identifier: "admin@example.com",
      password: "password123",
    };

    const result = await controller.login(dto);

    expect(result.user).toHaveProperty("isSuperAdmin");
    expect(typeof result.user.isSuperAdmin).toBe("boolean");
  });
});

