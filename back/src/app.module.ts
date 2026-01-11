import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AuthModule } from "./auth/auth.module";
import { TeamsModule } from "./teams/teams.module";
import { CommentsModule } from "./comments/comments.module";
import { GamesModule } from "./games/games.module";
import { UsersModule } from "./users/users.module";

@Module({
  imports: [AuthModule, TeamsModule, CommentsModule, GamesModule, UsersModule],
  controllers: [AppController],
})
export class AppModule {}
