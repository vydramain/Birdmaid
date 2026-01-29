import { JwtService } from "@nestjs/jwt";
import { AuthService } from "../../src/auth/auth.service";

describe("JWT token generation and validation", () => {
  let jwtService: JwtService;
  let authService: AuthService;

  beforeEach(async () => {
    jwtService = new JwtService({
      secret: "test-secret",
      signOptions: { expiresIn: "7d" },
    });
    authService = new AuthService(jwtService, null as any, null as any, null as any);
  });

  it("generates JWT token with user info", async () => {
    const user = {
      id: "user123",
      email: "user@example.com",
      login: "testuser",
      isSuperAdmin: false,
    };

    const token = await authService.generateToken(user);

    expect(typeof token).toBe("string");
    expect(token.length).toBeGreaterThan(0);
  });

  it("includes userId, email, login, and isSuperAdmin in token payload", async () => {
    const user = {
      id: "user123",
      email: "user@example.com",
      login: "testuser",
      isSuperAdmin: true,
    };

    const token = await authService.generateToken(user);
    const decoded = jwtService.decode(token) as any;

    expect(decoded.userId).toBe("user123");
    expect(decoded.email).toBe("user@example.com");
    expect(decoded.login).toBe("testuser");
    expect(decoded.isSuperAdmin).toBe(true);
  });

  it("sets token expiration to 7 days", async () => {
    const user = {
      id: "user123",
      email: "user@example.com",
      login: "testuser",
      isSuperAdmin: false,
    };

    const token = await authService.generateToken(user);
    const decoded = jwtService.decode(token) as any;

    expect(decoded.exp).toBeDefined();
    const expirationDate = new Date(decoded.exp * 1000);
    const now = new Date();
    const daysUntilExpiry = (expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

    expect(daysUntilExpiry).toBeCloseTo(7, 0);
  });

  it("validates JWT token", async () => {
    const user = {
      id: "user123",
      email: "user@example.com",
      login: "testuser",
      isSuperAdmin: false,
    };

    const token = await authService.generateToken(user);
    const validated = await jwtService.verifyAsync(token, { secret: "test-secret" });

    expect(validated).toHaveProperty("userId");
    expect(validated.userId).toBe("user123");
  });
});

