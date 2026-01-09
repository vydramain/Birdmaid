import { Injectable, ExecutionContext } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class OptionalAuthGuard {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (token) {
      try {
        const secret = process.env.JWT_SECRET || "default-secret-change-in-production";
        const payload = await this.jwtService.verifyAsync(token, { secret });
        request.user = payload;
      } catch {
        // Token invalid, but continue without user
        request.user = undefined;
      }
    }

    return true;
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(" ") ?? [];
    return type === "Bearer" ? token : undefined;
  }
}

