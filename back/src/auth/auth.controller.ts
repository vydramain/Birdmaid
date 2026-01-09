import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { RecoveryRequestDto } from "./dto/recovery-request.dto";
import { RecoveryVerifyDto } from "./dto/recovery-verify.dto";

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
}

