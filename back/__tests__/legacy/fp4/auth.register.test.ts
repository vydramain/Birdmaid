import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "../../src/auth/auth.controller";
import { AuthService } from "../../src/auth/auth.service";

describe("POST /auth/register", () => {
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

  it("creates user account with email, login, and password", async () => {
    const dto = {
      email: "test@example.com",
      login: "testuser",
      password: "password123",
    };

    const result = await controller.register(dto);

    expect(result).toHaveProperty("user");
    expect(result.user).toHaveProperty("id");
    expect(result.user.email).toBe("test@example.com");
    expect(result.user.login).toBe("testuser");
    expect(result.user).not.toHaveProperty("password");
    expect(result).toHaveProperty("token");
    expect(typeof result.token).toBe("string");
  });

  it("rejects registration with duplicate email", async () => {
    const dto = {
      email: "existing@example.com",
      login: "newuser",
      password: "password123",
    };

    await expect(controller.register(dto)).rejects.toThrow();
  });

  it("rejects registration with duplicate login", async () => {
    const dto = {
      email: "new@example.com",
      login: "existinguser",
      password: "password123",
    };

    await expect(controller.register(dto)).rejects.toThrow();
  });

  it("rejects registration with password shorter than 6 characters", async () => {
    const dto = {
      email: "test@example.com",
      login: "testuser",
      password: "12345",
    };

    await expect(controller.register(dto)).rejects.toThrow();
  });

  it("hashes password before storing", async () => {
    const dto = {
      email: "test@example.com",
      login: "testuser",
      password: "password123",
    };

    const hashSpy = jest.spyOn(service, "hashPassword");
    await controller.register(dto);

    expect(hashSpy).toHaveBeenCalledWith("password123");
  });
});

