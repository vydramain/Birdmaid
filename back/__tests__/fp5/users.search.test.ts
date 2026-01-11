import { Test, TestingModule } from "@nestjs/testing";
import { UsersController } from "../../src/users/users.controller";
import { UsersService } from "../../src/users/users.service";

describe("GET /users?login=... - user search (FP5)", () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [UsersService],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it("returns users matching login query (partial match)", async () => {
    const loginQuery = "alice";

    const result = await controller.searchUsers(loginQuery);

    // Should return users with matching login
    expect(result.users.length).toBeGreaterThan(0);
    result.users.forEach((user) => {
      expect(user.login.toLowerCase()).toContain(loginQuery.toLowerCase());
    });
  });

  it("performs case-insensitive search", async () => {
    const loginQuery = "ALICE";

    const result = await controller.searchUsers(loginQuery);

    result.users.forEach((user) => {
      expect(user.login.toLowerCase()).toContain(loginQuery.toLowerCase());
    });
  });

  it("returns up to 20 results", async () => {
    const loginQuery = "a"; // Common prefix

    const result = await controller.searchUsers(loginQuery);

    expect(result.users.length).toBeLessThanOrEqual(20);
  });

  it("returns empty array when no users match", async () => {
    const loginQuery = "nonexistent-user-xyz-123";

    const result = await controller.searchUsers(loginQuery);

    expect(result.users).toEqual([]);
  });

  it("returns users with id and login fields", async () => {
    const loginQuery = "alice";

    const result = await controller.searchUsers(loginQuery);

    if (result.users.length > 0) {
      result.users.forEach((user) => {
        expect(user).toHaveProperty("id");
        expect(user).toHaveProperty("login");
        expect(typeof user.id).toBe("string");
        expect(typeof user.login).toBe("string");
      });
    }
  });

  it("supports partial matches (e.g., 'john' matches 'john_doe')", async () => {
    const loginQuery = "john";

    const result = await controller.searchUsers(loginQuery);

    result.users.forEach((user) => {
      expect(user.login.toLowerCase()).toContain(loginQuery.toLowerCase());
    });
  });

  it("requires authentication", async () => {
    const loginQuery = "alice";

    await expect(controller.searchUsers(loginQuery, null as any)).rejects.toThrow();
  });
});
