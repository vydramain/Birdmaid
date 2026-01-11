import { Injectable, ForbiddenException, BadRequestException } from "@nestjs/common";
import { TeamsRepository } from "./teams.repository";
import { UsersRepository } from "../users/users.repository";

@Injectable()
export class TeamsService {
  constructor(
    private teamsRepo: TeamsRepository,
    private usersRepo: UsersRepository
  ) {}

  async createTeam(name: string, userId: string) {
    if (!name || name.trim().length === 0) {
      throw new BadRequestException("Team name is required");
    }
    return this.teamsRepo.create(name.trim(), userId);
  }

  async getTeam(teamId: string) {
    return this.teamsRepo.findById(teamId);
  }

  async getAllTeams() {
    return this.teamsRepo.findAll();
  }

  async addMember(teamId: string, userIdOrLogin: string, currentUserId: string) {
    const team = await this.teamsRepo.findById(teamId);
    if (!team) {
      throw new BadRequestException("Team not found");
    }
    if (team.leader !== currentUserId) {
      throw new ForbiddenException("Only team leader can add members");
    }
    
    // Check if userIdOrLogin is a userId (UUID format) or login (string)
    // If it's not a UUID, treat it as a login and find the user
    let userId = userIdOrLogin;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userIdOrLogin)) {
      // It's a login, find user by login
      const user = await this.usersRepo.findByLogin(userIdOrLogin);
      if (!user) {
        throw new BadRequestException(`User with login "${userIdOrLogin}" not found`);
      }
      userId = user._id;
    }
    
    return this.teamsRepo.addMember(teamId, userId);
  }

  async removeMember(teamId: string, userId: string, currentUserId: string) {
    const team = await this.teamsRepo.findById(teamId);
    if (!team) {
      throw new BadRequestException("Team not found");
    }
    if (team.leader !== currentUserId) {
      throw new ForbiddenException("Only team leader can remove members");
    }
    return this.teamsRepo.removeMember(teamId, userId);
  }

  async transferLeadership(teamId: string, newLeaderId: string, currentUserId: string) {
    const team = await this.teamsRepo.findById(teamId);
    if (!team) {
      throw new BadRequestException("Team not found");
    }
    if (team.leader !== currentUserId) {
      throw new ForbiddenException("Only current leader can transfer leadership");
    }
    if (!team.members.includes(newLeaderId)) {
      throw new BadRequestException("New leader must be a team member");
    }
    return this.teamsRepo.updateLeader(teamId, newLeaderId);
  }

  async updateTeamName(teamId: string, name: string, currentUserId: string) {
    const team = await this.teamsRepo.findById(teamId);
    if (!team) {
      throw new BadRequestException("Team not found");
    }
    if (team.leader !== currentUserId) {
      throw new ForbiddenException("Only team leader can update team name");
    }
    return this.teamsRepo.updateName(teamId, name);
  }

  async getUserLogin(userId: string): Promise<string | null> {
    const user = await this.usersRepo.findById(userId);
    return user?.login || null;
  }
}

