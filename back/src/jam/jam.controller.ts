import { Controller, Get } from "@nestjs/common";
import { JamService } from "./jam.service";

@Controller("jam")
export class JamController {
  constructor(private readonly jamService: JamService) {}

  @Get("current")
  async getCurrent() {
    return this.jamService.findCurrentOrNearest();
  }
}
