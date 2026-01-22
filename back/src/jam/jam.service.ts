import { Injectable } from "@nestjs/common";
import { JamRepository } from "./jam.repository";

@Injectable()
export class JamService {
  constructor(private readonly jamRepository: JamRepository) {}

  async findCurrentOrNearest() {
    return this.jamRepository.findCurrentOrNearest();
  }
}
