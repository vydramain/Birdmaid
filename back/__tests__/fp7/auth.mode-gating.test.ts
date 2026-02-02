import { Test, TestingModule } from "@nestjs/testing";
import { JwtModule } from "@nestjs/jwt";
import { AuthService } from "../../src/auth/auth.service";
import { UsersRepository } from "../../src/users/users.repository";
import { OrganizerWhitelistRepository } from "../../src/auth/organizer-whitelist.repository";
import { ForbiddenException, NotImplementedException } from "@nestjs/common";
import { TelegramAuthDto } from "../../src/auth/dto/telegram-auth.dto";

describe("Auth Mode Gating", () => {
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
    delete process.env.TELEGRAM_BOT_TOKEN;
  });

  describe("devAuth endpoint", () => {
    it("should allow dev auth when AUTH_MODE=dev", async () => {
      process.env.AUTH_MODE = "dev";

      const mockUser = {
        _id: "user123",
        email: "test@example.com",
        login: "testuser",
        password: "",
        role: "Guest" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (usersRepo.findById as jest.Mock).mockResolvedValue(mockUser);

      const result = await authService.devAuth("user123", "Organizer");

      expect(result).toHaveProperty("user");
      expect(result).toHaveProperty("token");
      expect(result.user.id).toBe("user123");
    });

    it("should block dev auth when AUTH_MODE=telegram", async () => {
      process.env.AUTH_MODE = "telegram";

      await expect(authService.devAuth("user123", "Organizer")).rejects.toThrow(
        ForbiddenException
      );
      await expect(authService.devAuth("user123", "Organizer")).rejects.toThrow(
        "DEV MODE auth is only available when AUTH_MODE=dev"
      );
    });

    it("should block dev auth when AUTH_MODE is not set (defaults to telegram)", async () => {
      delete process.env.AUTH_MODE;

      await expect(authService.devAuth("user123", "Organizer")).rejects.toThrow(
        ForbiddenException
      );
    });
  });

  describe("telegramAuth endpoint", () => {
    it("should allow telegram auth when AUTH_MODE=telegram", async () => {
      process.env.AUTH_MODE = "telegram";
      process.env.TELEGRAM_BOT_TOKEN = "test-bot-token";

      const dto: TelegramAuthDto = {
        telegramId: "123456789",
        hash: "test-hash",
      };

      // Will throw UnauthorizedException due to invalid hash, but should not throw ForbiddenException
      await expect(authService.telegramAuth(dto)).rejects.toThrow();
      await expect(authService.telegramAuth(dto)).rejects.not.toThrow(
        ForbiddenException
      );
    });

    it("should block telegram auth when AUTH_MODE=dev", async () => {
      process.env.AUTH_MODE = "dev";

      const dto: TelegramAuthDto = {
        telegramId: "123456789",
        hash: "test-hash",
      };

      await expect(authService.telegramAuth(dto)).rejects.toThrow(
        ForbiddenException
      );
      await expect(authService.telegramAuth(dto)).rejects.toThrow(
        "Telegram auth is only available when AUTH_MODE=telegram"
      );
    });

    it("should block telegram auth when AUTH_MODE is not set (defaults to telegram)", async () => {
      delete process.env.AUTH_MODE;
      process.env.TELEGRAM_BOT_TOKEN = "test-bot-token";

      const dto: TelegramAuthDto = {
        telegramId: "123456789",
        hash: "test-hash",
      };

      // Defaults to telegram, so should not throw ForbiddenException
      // Will throw UnauthorizedException due to invalid hash
      await expect(authService.telegramAuth(dto)).rejects.toThrow();
      await expect(authService.telegramAuth(dto)).rejects.not.toThrow(
        ForbiddenException
      );
    });
  });
});
