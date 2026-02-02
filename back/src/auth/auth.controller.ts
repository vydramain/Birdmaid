import { Body, Controller, Post, Get, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { DevAuthDto } from "./dto/dev-auth.dto";
import { TelegramAuthDto } from "./dto/telegram-auth.dto";
import { JwtAuthGuard } from "./auth.guard";
import { CurrentUser } from "./decorators/current-user.decorator";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * DEV MODE auth endpoint
   * ЗАПРЕЩЁН в production (AUTH_MODE !== 'dev')
   * Creates user if userId not found, updates role if provided
   */
  @Post("dev")
  async devAuth(@Body() dto: DevAuthDto) {
    return this.authService.devAuth(dto.userId, dto.role);
  }

  /**
   * Telegram auth endpoint
   * Only available when AUTH_MODE=telegram
   */
  @Post("telegram")
  async telegramAuth(@Body() dto: TelegramAuthDto) {
    return this.authService.telegramAuth(dto);
  }

  /**
   * Get current user from JWT token
   */
  @Get("me")
  @UseGuards(JwtAuthGuard)
  async getMe(@CurrentUser() user: any) {
    // Return user info from JWT payload
    return {
      user: {
        id: user.userId,
        email: user.email,
        login: user.login,
        role: user.role || 'Guest',
      },
    };
  }
}

