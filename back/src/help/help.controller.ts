import { Controller, Get } from "@nestjs/common";
import { HelpService } from "./help.service";

@Controller("help")
export class HelpController {
  constructor(private readonly helpService: HelpService) {}

  @Get()
  async getContent() {
    return this.helpService.getContent();
  }
}
