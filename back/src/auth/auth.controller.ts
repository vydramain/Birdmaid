import { Body, Controller, Post, Get, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { RecoveryRequestDto } from "./dto/recovery-request.dto";
import { RecoveryVerifyDto } from "./dto/recovery-verify.dto";
import { DevAuthDto } from "./dto/dev-auth.dto";
import { JwtAuthGuard } from "./auth.guard";
import { CurrentUser } from "./decorators/current-user.decorator";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("register")
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto.email, dto.login, dto.password);
  }

  @Post("login")
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto.identifier, dto.password);
  }

  @Post("recovery/request")
  async requestRecovery(@Body() dto: RecoveryRequestDto) {
    return this.authService.requestRecovery(dto.email);
  }

  @Post("recovery/verify")
  async verifyRecovery(@Body() dto: RecoveryVerifyDto) {
    return this.authService.verifyRecovery(dto.email, dto.code, dto.newPassword);
  }

  /**
   * DEV MODE auth endpoint
   * ЗАПРЕЩЁН в production (AUTH_MODE !== 'dev')
   */
  @Post("dev")
  async devAuth(@Body() dto: DevAuthDto) {
    return this.authService.devAuth(dto.userId, dto.role);
  }

  /**
   * Get current user from JWT token
   */
  @Get("me")
  @UseGuards(JwtAuthGuard)
  async getMe(@CurrentUser() user: any) {
    // Return user info from JWT payload
    return {
      id: user.userId,
      email: user.email,
      login: user.login,
      isSuperAdmin: user.isSuperAdmin,
      role: user.role || (user.isSuperAdmin ? 'Organizer' : 'Guest'),
    };
  }
}

