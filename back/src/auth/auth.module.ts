import { Module } from "@nestjs/common";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { EmailService } from "./email.service";
import { UsersRepository } from "../users/users.repository";

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || "default-secret-change-in-production",
      signOptions: { expiresIn: (process.env.JWT_EXPIRES_IN || "7d") as any },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, EmailService, UsersRepository],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}

