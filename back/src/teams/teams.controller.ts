import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { TeamsService } from "./teams.service";
import { JwtAuthGuard } from "../auth/auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";

@Controller("teams")
export class TeamsController {
  constructor(private teamsService: TeamsService) {}

  @Get()
  async getAllTeams() {
    const teams = await this.teamsService.getAllTeams();
    const teamsWithLogins = await Promise.all(
      teams.map(async (t) => {
        const leaderLogin = await this.teamsService.getUserLogin(t.leader);
        const memberLogins = await Promise.all(
          t.members.map((memberId) => this.teamsService.getUserLogin(memberId))
        );
        return {
          id: t._id,
          name: t.name,
          leader: t.leader,
          leaderLogin: leaderLogin || t.leader,
          members: t.members,
          memberLogins: memberLogins.map((login, idx) => login || t.members[idx]),
        };
      })
    );
    return { teams: teamsWithLogins };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createTeam(@Body() body: { name: string }, @CurrentUser() user: any) {
    const team = await this.teamsService.createTeam(body.name, user.userId);
    return { id: team._id, name: team.name, leader: team.leader, members: team.members };
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard)
  async updateTeam(@Param("id") id: string, @Body() body: { name?: string }, @CurrentUser() user: any) {
    if (body.name) {
      const team = await this.teamsService.updateTeamName(id, body.name, user.userId);
      return { id: team._id, name: team.name, leader: team.leader, members: team.members };
    }
    const team = await this.teamsService.getTeam(id);
    if (!team) throw new Error("Team not found");
    return { id: team._id, name: team.name, leader: team.leader, members: team.members };
  }

  @Post(":id/members")
  @UseGuards(JwtAuthGuard)
  async addMember(@Param("id") id: string, @Body() body: { userId: string }, @CurrentUser() user: any) {
    const team = await this.teamsService.addMember(id, body.userId, user.userId);
    return { id: team._id, name: team.name, leader: team.leader, members: team.members };
  }

  @Delete(":id/members/:userId")
  @UseGuards(JwtAuthGuard)
  async removeMember(@Param("id") id: string, @Param("userId") userId: string, @CurrentUser() user: any) {
    const team = await this.teamsService.removeMember(id, userId, user.userId);
    return { id: team._id, name: team.name, leader: team.leader, members: team.members };
  }

  @Post(":id/leader")
  @UseGuards(JwtAuthGuard)
  async transferLeadership(@Param("id") id: string, @Body() body: { newLeaderId: string }, @CurrentUser() user: any) {
    const team = await this.teamsService.transferLeadership(id, body.newLeaderId, user.userId);
    return { id: team._id, name: team.name, leader: team.leader, members: team.members };
  }
}

