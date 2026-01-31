import { Module } from "@nestjs/common";
import { VfsController } from "./vfs.controller";
import { VfsService } from "./vfs.service";
import { S3Service } from "./s3.service";

@Module({
  controllers: [VfsController],
  providers: [VfsService, S3Service],
  exports: [VfsService, S3Service],
})
export class VfsModule {}
