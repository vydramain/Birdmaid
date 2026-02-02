import {
  Controller,
  Get,
} from "@nestjs/common";
import { MongoClient } from "mongodb";

@Controller()
export class AppController {

  @Get("/health")
  health() {
    return { status: "ok" };
  }
}
