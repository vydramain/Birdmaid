import { Module } from "@nestjs/common";
import { GamesController } from "./games.controller";
import { GamesService } from "./games.service";
import { GamesRepository } from "./games.repository";
import { TeamsRepository } from "../teams/teams.repository";
import { TeamsService } from "../teams/teams.service";
import { AuthModule } from "../auth/auth.module";
import { BuildUrlService } from "../build-url.service";
import { UsersRepository } from "../users/users.repository";

@Module({
  imports: [AuthModule],
  controllers: [GamesController],
  providers: [GamesService, GamesRepository, TeamsRepository, TeamsService, UsersRepository, BuildUrlService],
  exports: [GamesService],
})
export class GamesModule {}

