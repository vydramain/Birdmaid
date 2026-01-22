import { Module } from "@nestjs/common";
import { JamController } from "./jam.controller";
import { JamService } from "./jam.service";
import { JamRepository } from "./jam.repository";

@Module({
  controllers: [JamController],
  providers: [JamService, JamRepository],
  exports: [JamService],
})
export class JamModule {}
