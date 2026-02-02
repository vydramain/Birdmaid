import { Injectable, UnauthorizedException, BadRequestException, ForbiddenException, NotImplementedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { createHmac } from "crypto";
import { UsersRepository, UserRole } from "../users/users.repository";
import { TelegramAuthDto } from "./dto/telegram-auth.dto";
import { OrganizerWhitelistRepository } from "./organizer-whitelist.repository";

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersRepo: UsersRepository,
    private whitelistRepo: OrganizerWhitelistRepository
  ) {}

  async generateToken(user: { id: string; email: string; login: string; role?: UserRole }): Promise<string> {
    // Use role field, default to Guest if not set
    const role: UserRole = user.role || 'Guest';
    
    const payload = {
      userId: user.id,
      email: user.email,
      login: user.login,
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
      const userRole: UserRole = role || user.role || 'Guest';
      
      const token = await this.generateToken({
        id: user._id,
        email: user.email,
        login: user.login,
        role: userRole,
      });

      return {
        user: {
          id: user._id,
          email: user.email,
          login: user.login,
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
      role: defaultRole,
    });

    const token = await this.generateToken({
      id: user._id,
      email: user.email,
      login: user.login,
      role: defaultRole, // Use the provided/default role, not user.role (which might be undefined)
    });

    return {
      user: {
        id: user._id,
        email: user.email,
        login: user.login,
        role: defaultRole, // Use the provided/default role
      },
      token,
    };
  }

  /**
   * Telegram auth endpoint
   * Only available when AUTH_MODE=telegram
   * 
   * Verifies Telegram signature and checks whitelist for Organizer role
   */
  async telegramAuth(dto: TelegramAuthDto) {
    // Fail-fast: проверка AUTH_MODE
    const authMode = process.env.AUTH_MODE || 'telegram';
    if (authMode !== 'telegram') {
      throw new ForbiddenException('Telegram auth is only available when AUTH_MODE=telegram');
    }

    const { telegramId, hash, firstName, lastName, username } = dto;

    if (!telegramId || !hash) {
      throw new BadRequestException('telegramId and hash are required');
    }

    // Verify Telegram signature
    // Telegram OAuth sends data with hash that needs to be verified
    // Format: hash = HMAC-SHA256(secret_key, data_check_string)
    // data_check_string = sorted key-value pairs joined with \n
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      throw new BadRequestException('TELEGRAM_BOT_TOKEN is not configured');
    }

    // Build data_check_string from dto
    // Format: key=value pairs, sorted alphabetically, joined with \n
    const dataPairs: string[] = [];
    if (dto.auth_date) dataPairs.push(`auth_date=${dto.auth_date}`);
    if (firstName) dataPairs.push(`first_name=${firstName}`);
    dataPairs.push(`id=${telegramId}`);
    if (lastName) dataPairs.push(`last_name=${lastName}`);
    if (username) dataPairs.push(`username=${username}`);
    
    const dataCheckString = dataPairs.sort().join('\n');

    // Calculate expected hash
    // Telegram uses: HMAC-SHA256(secret_key, data_check_string)
    // secret_key = SHA256(bot_token) with key "WebAppData"
    const secretKey = createHmac('sha256', 'WebAppData').update(botToken).digest();
    const expectedHash = createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

    // Verify hash
    if (hash !== expectedHash) {
      throw new UnauthorizedException('Invalid Telegram signature');
    }

    // Check auth_date (should be within last 24 hours)
    const authDate = dto.auth_date ? new Date(dto.auth_date * 1000) : new Date();
    const now = new Date();
    const hoursDiff = (now.getTime() - authDate.getTime()) / (1000 * 60 * 60);
    if (hoursDiff > 24) {
      throw new UnauthorizedException('Telegram auth data expired');
    }

    // Check whitelist for Organizer role
    const isOrganizer = await this.whitelistRepo.isOrganizer(telegramId);
    const role: UserRole = isOrganizer ? 'Organizer' : 'Guest';

    // Find or create user
    // Use telegramId as unique identifier (store in login field or create separate field)
    const login = username || `telegram_${telegramId}`;
    let user = await this.usersRepo.findByLogin(login);

    if (!user) {
      // Create new user
      user = await this.usersRepo.create({
        email: `telegram_${telegramId}@telegram.local`,
        login: login,
        password: '', // No password for Telegram auth
        role: role,
      });
    } else {
      // Update role if changed (e.g., added to whitelist)
      if (user.role !== role) {
        await this.usersRepo.updateRole(user._id, role);
        user.role = role;
      }
    }

    // Generate token
    const token = await this.generateToken({
      id: user._id,
      email: user.email,
      login: user.login,
      role: role,
    });

    return {
      user: {
        id: user._id,
        email: user.email,
        login: user.login,
        role: role,
      },
      token,
    };
  }
}

