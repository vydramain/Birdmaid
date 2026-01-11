import { Injectable } from "@nestjs/common";
import { UsersRepository } from "./users.repository";

@Injectable()
export class UsersService {
  constructor(private usersRepo: UsersRepository) {}

  async searchUsers(loginQuery: string): Promise<{ users: Array<{ id: string; login: string }> }> {
    const users = await this.usersRepo.searchByLogin(loginQuery, 20);
    return {
      users: users.map((u) => ({
        id: u._id,
        login: u.login,
      })),
    };
  }
}
