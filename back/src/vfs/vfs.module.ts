import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { VfsController } from "./vfs.controller";
import { VfsService } from "./vfs.service";
import { S3Service } from "./s3.service";
import { JwtAuthGuard } from "../auth/auth.guard";

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || "default-secret-change-in-production",
      signOptions: { expiresIn: (process.env.JWT_EXPIRES_IN || "7d") as any },
    }),
  ],
  controllers: [VfsController],
  providers: [VfsService, S3Service, JwtAuthGuard],
  exports: [VfsService, S3Service],
})
export class VfsModule {}
