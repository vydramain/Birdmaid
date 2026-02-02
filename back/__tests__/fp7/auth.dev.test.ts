import { Test, TestingModule } from "@nestjs/testing";
import { JwtModule } from "@nestjs/jwt";
import { AuthService } from "../../src/auth/auth.service";
import { UsersRepository } from "../../src/users/users.repository";
import { OrganizerWhitelistRepository } from "../../src/auth/organizer-whitelist.repository";
import { ForbiddenException } from "@nestjs/common";

describe("Auth Dev Mode", () => {
  let authService: AuthService;
  let usersRepo: UsersRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: "test-secret",
          signOptions: { expiresIn: "7d" },
        }),
      ],
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
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersRepo = module.get<UsersRepository>(UsersRepository);
  });

  afterEach(() => {
    delete process.env.AUTH_MODE;
  });

  it("should allow dev auth when AUTH_MODE=dev", async () => {
    process.env.AUTH_MODE = "dev";

    const mockUser = {
      _id: "user123",
      email: "test@example.com",
      login: "testuser",
      password: "hashed",
      role: "Guest" as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (usersRepo.findById as jest.Mock).mockResolvedValue(mockUser);

    const result = await authService.devAuth("user123", "Organizer");

    expect(result).toHaveProperty("user");
    expect(result).toHaveProperty("token");
    expect(result.user.id).toBe("user123");
    expect(result.user.role).toBe("Organizer");
  });

  it("should fail when AUTH_MODE is not 'dev'", async () => {
    process.env.AUTH_MODE = "telegram";

    await expect(authService.devAuth("user123", "Organizer")).rejects.toThrow(
      ForbiddenException
    );
    await expect(authService.devAuth("user123", "Organizer")).rejects.toThrow(
      "DEV MODE auth is only available when AUTH_MODE=dev"
    );
  });

  it("should fail when AUTH_MODE is not set (defaults to telegram)", async () => {
    delete process.env.AUTH_MODE;

    await expect(authService.devAuth("user123", "Organizer")).rejects.toThrow(
      ForbiddenException
    );
  });

  it("should use user's role from DB if role not provided", async () => {
    process.env.AUTH_MODE = "dev";

    const mockUser = {
      _id: "user123",
      email: "test@example.com",
      login: "testuser",
      password: "hashed",
      isSuperAdmin: false,
      role: "Participant" as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (usersRepo.findById as jest.Mock).mockResolvedValue(mockUser);

    const result = await authService.devAuth("user123");

    expect(result.user.role).toBe("Participant");
  });

  it("should default to Guest if user has no role", async () => {
    process.env.AUTH_MODE = "dev";

    const mockUser = {
      _id: "user123",
      email: "test@example.com",
      login: "testuser",
      password: "hashed",
      isSuperAdmin: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (usersRepo.findById as jest.Mock).mockResolvedValue(mockUser);

    const result = await authService.devAuth("user123");

    expect(result.user.role).toBe("Guest");
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

    const result = await authService.devAuth("newuser123", "Organizer");

    expect(usersRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "dev-newuser123@local.dev",
        login: "dev-newuser123",
        role: "Organizer",
      })
    );
    expect(result.user.id).toBe("newuser123");
    expect(result.user.role).toBe("Organizer");
  });

  it("should create default dev user if no userId provided", async () => {
    process.env.AUTH_MODE = "dev";

    const mockNewUser = {
      _id: "devuser123",
      email: expect.stringMatching(/^dev-\d+@local\.dev$/),
      login: expect.stringMatching(/^dev-\d+$/),
      password: "",
      role: "Guest" as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    (usersRepo.create as jest.Mock).mockResolvedValue(mockNewUser);

    const result = await authService.devAuth(undefined, "Participant");

    expect(usersRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        role: "Participant",
      })
    );
    expect(result.user.role).toBe("Participant");
  });

  it("should update role if provided and different from user's role", async () => {
    process.env.AUTH_MODE = "dev";

    const mockUser = {
      _id: "user123",
      email: "test@example.com",
      login: "testuser",
      password: "hashed",
      role: "Guest" as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (usersRepo.findById as jest.Mock).mockResolvedValue(mockUser);
    (usersRepo.updateRole as jest.Mock).mockResolvedValue(undefined);

    const result = await authService.devAuth("user123", "Organizer");

    expect(usersRepo.updateRole).toHaveBeenCalledWith("user123", "Organizer");
    expect(result.user.role).toBe("Organizer");
  });
});
