import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { JamModule } from "./jam/jam.module";
import { HelpModule } from "./help/help.module";
import { VfsModule } from "./vfs/vfs.module";

@Module({
  imports: [AuthModule, UsersModule, JamModule, HelpModule, VfsModule],
  controllers: [AppController],
})
export class AppModule {}
