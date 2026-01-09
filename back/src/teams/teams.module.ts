import { Module } from "@nestjs/common";
import { TeamsController } from "./teams.controller";
import { TeamsService } from "./teams.service";
import { TeamsRepository } from "./teams.repository";
import { UsersRepository } from "../users/users.repository";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [AuthModule],
  controllers: [TeamsController],
  providers: [TeamsService, TeamsRepository, UsersRepository],
  exports: [TeamsService, TeamsRepository],
})
export class TeamsModule {}

