import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { HelpController } from "./help.controller";
import { HelpService } from "./help.service";
import { HelpRepository } from "./help.repository";
import { JwtAuthGuard } from "../auth/auth.guard";

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || "default-secret-change-in-production",
      signOptions: { expiresIn: (process.env.JWT_EXPIRES_IN || "7d") as any },
    }),
  ],
  controllers: [HelpController],
  providers: [HelpService, HelpRepository, JwtAuthGuard],
  exports: [HelpService],
})
export class HelpModule {}
