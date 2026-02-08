import { Injectable } from "@nestjs/common";
import { HelpRepository } from "./help.repository";

@Injectable()
export class HelpService {
  constructor(private readonly helpRepository: HelpRepository) {}

  async getContent() {
    return this.helpRepository.getContent();
  }

  async getAdminContent() {
    return this.helpRepository.getAdminContent();
  }
}
