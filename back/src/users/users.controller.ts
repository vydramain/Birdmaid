import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { UsersService } from "./users.service";
import { JwtAuthGuard } from "../auth/auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";

@Controller("users")
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async searchUsers(@Query("login") login?: string, @CurrentUser() user?: any) {
    if (!user) {
      throw new Error("Authentication required");
    }
    if (!login) {
      return { users: [] };
    }
    return this.usersService.searchUsers(login);
  }
}
