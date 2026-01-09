import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AuthModule } from "./auth/auth.module";
import { TeamsModule } from "./teams/teams.module";
import { CommentsModule } from "./comments/comments.module";
import { GamesModule } from "./games/games.module";

@Module({
  imports: [AuthModule, TeamsModule, CommentsModule, GamesModule],
  controllers: [AppController],
})
export class AppModule {}
