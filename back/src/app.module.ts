import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AuthModule } from "./auth/auth.module";
import { TeamsModule } from "./teams/teams.module";
import { CommentsModule } from "./comments/comments.module";
import { GamesModule } from "./games/games.module";
import { UsersModule } from "./users/users.module";
import { JamModule } from "./jam/jam.module";
import { HelpModule } from "./help/help.module";

@Module({
  imports: [AuthModule, TeamsModule, CommentsModule, GamesModule, UsersModule, JamModule, HelpModule],
  controllers: [AppController],
})
export class AppModule {}
