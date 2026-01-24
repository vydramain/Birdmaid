import { Module } from "@nestjs/common";
import { HelpController } from "./help.controller";
import { HelpService } from "./help.service";
import { HelpRepository } from "./help.repository";

@Module({
  controllers: [HelpController],
  providers: [HelpService, HelpRepository],
  exports: [HelpService],
})
export class HelpModule {}
