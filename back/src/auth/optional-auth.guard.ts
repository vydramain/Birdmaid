import { Injectable, ExecutionContext } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class OptionalAuthGuard {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    console.log(`[OptionalAuthGuard] Request to: ${request.url}, method: ${request.method}`);
    const token = this.extractTokenFromHeader(request);

    if (token) {
      try {
        const secret = process.env.JWT_SECRET || "default-secret-change-in-production";
        const payload = await this.jwtService.verifyAsync(token, { secret });
        request.user = payload;
        console.log(`[OptionalAuthGuard] Token verified, user: ${payload.userId}`);
      } catch {
        // Token invalid, but continue without user
        request.user = undefined;
        console.log(`[OptionalAuthGuard] Token invalid or missing, continuing without user`);
      }
    } else {
      console.log(`[OptionalAuthGuard] No token in header, continuing without user`);
    }

    return true;
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(" ") ?? [];
    return type === "Bearer" ? token : undefined;
  }
}

