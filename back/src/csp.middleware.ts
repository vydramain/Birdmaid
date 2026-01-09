import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

@Injectable()
export class CspMiddleware implements NestMiddleware {
  private readonly cspPolicy =
    "default-src 'self'; frame-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'self'";

  use(req: Request, res: Response, next: NextFunction) {
    res.setHeader("Content-Security-Policy", this.cspPolicy);
    next();
  }
}
