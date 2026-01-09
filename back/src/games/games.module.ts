import { Module } from "@nestjs/common";
import { GamesController } from "./games.controller";
import { GamesService } from "./games.service";
import { GamesRepository } from "./games.repository";
import { TeamsRepository } from "../teams/teams.repository";
import { AuthModule } from "../auth/auth.module";
import { BuildUrlService } from "../build-url.service";

@Module({
  imports: [AuthModule],
  controllers: [GamesController],
  providers: [GamesService, GamesRepository, TeamsRepository, BuildUrlService],
  exports: [GamesService],
})
export class GamesModule {}

