import { Controller, Get, ForbiddenException } from "@nestjs/common";
import { HelpService } from "./help.service";
import { JwtAuthGuard } from "../auth/auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { UseGuards } from "@nestjs/common";

@Controller("help")
export class HelpController {
  constructor(private readonly helpService: HelpService) {}

  @Get()
  async getContent() {
    return this.helpService.getContent();
  }

  @Get("admin")
  @UseGuards(JwtAuthGuard)
  async getAdminContent(@CurrentUser() user: any) {
    const role = user?.role ?? "Guest";
    if (role !== "Organizer") {
      throw new ForbiddenException("Admin help is available only to Organizer role.");
    }
    return this.helpService.getAdminContent();
  }
}
