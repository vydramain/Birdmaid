import { Injectable, ExecutionContext } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class OptionalAuthGuard {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    console.log(`[OptionalAuthGuard] Request to: ${request.url}, method: ${request.method}`);
    
    // Try Authorization header first
    let token = this.extractTokenFromHeader(request);
    
    // If no token in header and this is a build asset route, try cookie
    if (!token && this.isBuildAssetRoute(request.url)) {
      token = this.extractTokenFromCookie(request);
      if (token) {
        console.log(`[OptionalAuthGuard] Found token in cookie for build asset route`);
      }
    }

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
      console.log(`[OptionalAuthGuard] No token in header or cookie, continuing without user`);
    }

    return true;
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(" ") ?? [];
    return type === "Bearer" ? token : undefined;
  }

  private extractTokenFromCookie(request: any): string | undefined {
    // Extract game ID from URL to find the right cookie
    // Cookie name format: bm_build_auth_<gameId>
    const buildMatch = request.url?.match(/\/games\/([^\/]+)\/build\//);
    if (!buildMatch) {
      return undefined;
    }
    
    const gameId = buildMatch[1];
    const cookieName = `bm_build_auth_${gameId}`;
    const cookies = request.cookies || {};
    const token = cookies[cookieName];
    
    if (token) {
      console.log(`[OptionalAuthGuard] Found build auth cookie for game ${gameId}`);
    }
    
    return token;
  }

  private isBuildAssetRoute(url: string | undefined): boolean {
    if (!url) return false;
    return /\/games\/[^\/]+\/build\//.test(url);
  }
}

