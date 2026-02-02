import { Test, TestingModule } from "@nestjs/testing";
import { JwtModule } from "@nestjs/jwt";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { AuthController } from "../../src/auth/auth.controller";
import { AuthService } from "../../src/auth/auth.service";
import { UsersRepository } from "../../src/users/users.repository";
import { OrganizerWhitelistRepository } from "../../src/auth/organizer-whitelist.repository";
import { JwtAuthGuard } from "../../src/auth/auth.guard";

describe("Auth Integration Tests", () => {
  let app: INestApplication;
  let usersRepo: UsersRepository;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: "test-secret",
          signOptions: { expiresIn: "7d" },
        }),
      ],
      controllers: [AuthController],
      providers: [
        AuthService,
        {
          provide: UsersRepository,
          useValue: {
            findById: jest.fn(),
            create: jest.fn(),
            updateRole: jest.fn(),
          },
        },
        {
          provide: OrganizerWhitelistRepository,
          useValue: {
            isOrganizer: jest.fn(),
            add: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: jest.fn((context) => {
          const request = context.switchToHttp().getRequest();
          const token = request.headers.authorization?.replace("Bearer ", "");
          if (!token) {
            return false;
          }
          // Simple mock: set user from token payload
          try {
            const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());
            request.user = payload;
            return true;
          } catch {
            return false;
          }
        }),
      })
      .compile();

    app = module.createNestApplication();
    await app.init();

    usersRepo = module.get<UsersRepository>(UsersRepository);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
    delete process.env.AUTH_MODE;
  });

  describe("POST /api/auth/dev", () => {
    it("should return token and user with role", async () => {
      process.env.AUTH_MODE = "dev";

      const mockUser = {
        _id: "user123",
        email: "test@example.com",
        login: "testuser",
        password: "",
        role: "Organizer" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (usersRepo.findById as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app.getHttpServer())
        .post("/auth/dev")
        .send({ userId: "user123", role: "Organizer" })
        .expect(201);

      expect(response.body).toHaveProperty("user");
      expect(response.body).toHaveProperty("token");
      expect(response.body.user.id).toBe("user123");
      expect(response.body.user.role).toBe("Organizer");
      expect(typeof response.body.token).toBe("string");
    });

    it("should create user if userId not found", async () => {
      process.env.AUTH_MODE = "dev";

      (usersRepo.findById as jest.Mock).mockResolvedValue(null);
      const mockNewUser = {
        _id: "newuser123",
        email: "dev-newuser123@local.dev",
        login: "dev-newuser123",
        password: "",
        role: "Guest" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      (usersRepo.create as jest.Mock).mockResolvedValue(mockNewUser);

      const response = await request(app.getHttpServer())
        .post("/auth/dev")
        .send({ userId: "newuser123", role: "Participant" })
        .expect(201);

      expect(response.body.user.id).toBe("newuser123");
      expect(response.body.user.role).toBe("Participant");
      expect(usersRepo.create).toHaveBeenCalled();
    });
  });

  describe("GET /api/auth/me", () => {
    it("should return user with role from JWT token", async () => {
      process.env.AUTH_MODE = "dev";

      // First, get a token
      const mockUser = {
        _id: "user123",
        email: "test@example.com",
        login: "testuser",
        password: "",
        role: "Organizer" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (usersRepo.findById as jest.Mock).mockResolvedValue(mockUser);

      const authResponse = await request(app.getHttpServer())
        .post("/auth/dev")
        .send({ userId: "user123", role: "Organizer" })
        .expect(201);

      const token = authResponse.body.token;

      // Then, use the token to get /me
      const meResponse = await request(app.getHttpServer())
        .get("/auth/me")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(meResponse.body).toHaveProperty("user");
      expect(meResponse.body.user).toHaveProperty("id");
      expect(meResponse.body.user).toHaveProperty("role");
      expect(meResponse.body.user.id).toBe("user123");
      expect(meResponse.body.user.role).toBe("Organizer");
    });
  });
});
