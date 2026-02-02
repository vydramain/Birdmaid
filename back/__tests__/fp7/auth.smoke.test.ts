/**
 * FP7 Smoke Test: Clean DB → Dev Auth → /me OK
 * 
 * Verifies that after legacy cleanup:
 * 1. Project can start with clean DB
 * 2. Dev auth works (creates user if needed)
 * 3. /me endpoint returns user with role
 */

import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "../../src/app.module";
import { UsersRepository } from "../../src/users/users.repository";

describe("FP7 Smoke Test: Clean DB → Dev Auth → /me OK", () => {
  let app: INestApplication;
  let usersRepo: UsersRepository;

  beforeAll(async () => {
    process.env.AUTH_MODE = "dev";
    
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();

    usersRepo = moduleFixture.get<UsersRepository>(UsersRepository);
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
    delete process.env.AUTH_MODE;
  });

  it("should create user via dev auth and return /me with role", async () => {
    // Step 1: Dev auth (creates user if not exists)
    const devAuthResponse = await request(app.getHttpServer())
      .post("/api/auth/dev")
      .send({ userId: "smoke-test-user", role: "Guest" })
      .expect(201);

    expect(devAuthResponse.body).toHaveProperty("token");
    expect(devAuthResponse.body).toHaveProperty("user");
    expect(devAuthResponse.body.user).toMatchObject({
      id: expect.any(String),
      email: expect.stringContaining("dev-smoke-test-user@local.dev"),
      login: "dev-smoke-test-user",
      role: "Guest",
    });
    // Verify isSuperAdmin is NOT present
    expect(devAuthResponse.body.user).not.toHaveProperty("isSuperAdmin");

    const token = devAuthResponse.body.token;

    // Step 2: Verify /me endpoint
    const meResponse = await request(app.getHttpServer())
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(meResponse.body).toHaveProperty("user");
    expect(meResponse.body.user).toMatchObject({
      id: expect.any(String),
      email: expect.stringContaining("dev-smoke-test-user@local.dev"),
      login: "dev-smoke-test-user",
      role: "Guest",
    });
    // Verify isSuperAdmin is NOT present
    expect(meResponse.body.user).not.toHaveProperty("isSuperAdmin");
  });

  it("should handle dev auth with Organizer role", async () => {
    const devAuthResponse = await request(app.getHttpServer())
      .post("/api/auth/dev")
      .send({ userId: "smoke-test-organizer", role: "Organizer" })
      .expect(201);

    expect(devAuthResponse.body.user.role).toBe("Organizer");
    expect(devAuthResponse.body.user).not.toHaveProperty("isSuperAdmin");

    const token = devAuthResponse.body.token;

    const meResponse = await request(app.getHttpServer())
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(meResponse.body.user.role).toBe("Organizer");
    expect(meResponse.body.user).not.toHaveProperty("isSuperAdmin");
  });

  it("should default to Guest role if role not provided", async () => {
    const devAuthResponse = await request(app.getHttpServer())
      .post("/api/auth/dev")
      .send({ userId: "smoke-test-default" })
      .expect(201);

    expect(devAuthResponse.body.user.role).toBe("Guest");
    expect(devAuthResponse.body.user).not.toHaveProperty("isSuperAdmin");
  });
});
