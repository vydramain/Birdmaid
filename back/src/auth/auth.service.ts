import { Injectable, UnauthorizedException, BadRequestException, ForbiddenException, NotImplementedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UsersRepository, UserRole } from "../users/users.repository";
import { TelegramAuthDto } from "./dto/telegram-auth.dto";

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersRepo: UsersRepository
  ) {}

  async generateToken(user: { id: string; email: string; login: string; isSuperAdmin: boolean; role?: UserRole }): Promise<string> {
    // Determine role: use role field if set, otherwise fallback to isSuperAdmin -> Organizer, else Guest
    const role: UserRole = user.role || (user.isSuperAdmin ? 'Organizer' : 'Guest');
    
    const payload = {
      userId: user.id,
      email: user.email,
      login: user.login,
      isSuperAdmin: user.isSuperAdmin, // keep for backward compatibility
      role: role,
    };
    return this.jwtService.signAsync(payload);
  }

  /**
   * DEV MODE auth: выдаёт JWT без проверки Telegram signature
   * ЗАПРЕЩЁН в production (AUTH_MODE !== 'dev')
   * Creates user if userId not found, updates role if provided
   */
  async devAuth(userId?: string, role?: UserRole) {
    // Fail-fast: проверка AUTH_MODE
    const authMode = process.env.AUTH_MODE || 'telegram';
    if (authMode !== 'dev') {
      throw new ForbiddenException('DEV MODE auth is only available when AUTH_MODE=dev');
    }

    // If userId provided, find existing user
    if (userId) {
      let user = await this.usersRepo.findById(userId);
      
      // If user not found, create new user
      if (!user) {
        const defaultRole: UserRole = role || 'Guest';
        user = await this.usersRepo.create({
          email: `dev-${userId}@local.dev`,
          login: `dev-${userId}`,
          password: '', // No password in dev mode
          isSuperAdmin: false,
          role: defaultRole,
        });
      } else {
        // Update role if provided
        if (role !== undefined && role !== user.role) {
          await this.usersRepo.updateRole(user._id, role);
          user.role = role;
        }
      }
      
      // Use provided role or user's role, or default to Guest
      const userRole: UserRole = role || user.role || (user.isSuperAdmin ? 'Organizer' : 'Guest');
      
      const token = await this.generateToken({
        id: user._id,
        email: user.email,
        login: user.login,
        isSuperAdmin: user.isSuperAdmin,
        role: userRole,
      });

      return {
        user: {
          id: user._id,
          email: user.email,
          login: user.login,
          isSuperAdmin: user.isSuperAdmin,
          role: userRole,
        },
        token,
      };
    }

    // If no userId provided, create a default dev user
    const defaultRole: UserRole = role || 'Guest';
    const user = await this.usersRepo.create({
      email: `dev-${Date.now()}@local.dev`,
      login: `dev-${Date.now()}`,
      password: '', // No password in dev mode
      isSuperAdmin: false,
      role: defaultRole,
    });

    const token = await this.generateToken({
      id: user._id,
      email: user.email,
      login: user.login,
      isSuperAdmin: user.isSuperAdmin,
      role: defaultRole, // Use the provided/default role, not user.role (which might be undefined)
    });

    return {
      user: {
        id: user._id,
        email: user.email,
        login: user.login,
        isSuperAdmin: user.isSuperAdmin,
        role: defaultRole, // Use the provided/default role
      },
      token,
    };
  }

  /**
   * Telegram auth endpoint
   * Only available when AUTH_MODE=telegram
   */
  async telegramAuth(dto: TelegramAuthDto) {
    // Fail-fast: проверка AUTH_MODE
    const authMode = process.env.AUTH_MODE || 'telegram';
    if (authMode !== 'telegram') {
      throw new ForbiddenException('Telegram auth is only available when AUTH_MODE=telegram');
    }

    // TODO: Implement Telegram auth verification
    // For now, return 501 Not Implemented
    throw new NotImplementedException('Telegram auth not yet implemented');
  }
}

