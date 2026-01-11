import { Injectable, ForbiddenException, BadRequestException, NotFoundException } from "@nestjs/common";
import { GamesRepository } from "./games.repository";
import { TeamsRepository } from "../teams/teams.repository";

@Injectable()
export class GamesService {
  constructor(
    private gamesRepo: GamesRepository,
    private teamsRepo: TeamsRepository
  ) {}

  async createGame(teamId: string, title: string, userId: string, isSuperAdmin: boolean, data?: any) {
    // Check if user is team member or super admin
    if (!isSuperAdmin) {
      const team = await this.teamsRepo.findById(teamId);
      if (!team) {
        throw new BadRequestException("Team not found");
      }
      if (!team.members.includes(userId)) {
        throw new ForbiddenException("User is not a team member");
      }
    }

    // Don't allow blob URLs in cover_url - cover should be uploaded via /cover endpoint
    let coverUrl = data?.cover_url || "";
    if (coverUrl.startsWith("blob:")) {
      console.warn(`Attempt to create game with blob URL as cover_url, ignoring`);
      coverUrl = "";
    }
    
    const game = await this.gamesRepo.create({
      teamId,
      title,
      description_md: data?.description_md || "",
      repo_url: data?.repo_url || "",
      cover_url: coverUrl,
      status: "editing",
      tags_user: [],
      tags_system: [],
      currentBuildId: null,
      build_url: null,
      adminRemark: null,
    });

    return game;
  }

  async updateGame(gameId: string, userId: string, isSuperAdmin: boolean, updates: any) {
    const game = await this.gamesRepo.findById(gameId);
    if (!game) {
      throw new NotFoundException("Game not found");
    }

    // Check permissions: team member or super admin
    if (!isSuperAdmin) {
      const team = await this.teamsRepo.findById(game.teamId);
      if (!team || !team.members.includes(userId)) {
        throw new ForbiddenException("User is not authorized to edit this game");
      }
    }

    // Don't allow blob URLs in cover_url - cover should be uploaded via /cover endpoint
    if (updates.cover_url && updates.cover_url.startsWith("blob:")) {
      console.warn(`Attempt to update game ${gameId} with blob URL as cover_url, ignoring`);
      delete updates.cover_url;
    }

    await this.gamesRepo.update(gameId, updates);
    return this.gamesRepo.findById(gameId);
  }

  async forceStatusChange(gameId: string, status: string, remark: string | undefined, isSuperAdmin: boolean) {
    if (!isSuperAdmin) {
      throw new ForbiddenException("Only super admin can force status changes");
    }

    const game = await this.gamesRepo.findById(gameId);
    if (!game) {
      throw new NotFoundException("Game not found");
    }

    const updates: any = { status };
    if (remark !== undefined) {
      updates.adminRemark = remark ? { text: remark, at: new Date() } : null;
    }

    await this.gamesRepo.update(gameId, updates);
    return this.gamesRepo.findById(gameId);
  }

  /**
   * Get game directly from database without access check.
   * Used internally for build file proxy when access was already verified via API.
   */
  async getGameDirect(gameId: string) {
    return this.gamesRepo.findById(gameId);
  }

  async getGame(gameId: string, userId?: string, isSuperAdmin?: boolean) {
    const game = await this.gamesRepo.findById(gameId);
    if (!game) {
      console.log(`[GamesService.getGame] Game ${gameId} not found in database`);
      throw new NotFoundException("Game not found");
    }

    console.log(`[GamesService.getGame] Game ${gameId} found: status=${game.status}, userId=${userId || 'anonymous'}, isSuperAdmin=${isSuperAdmin || false}`);

    // If published, anyone can see it
    if (game.status === "published") {
      console.log(`[GamesService.getGame] Game ${gameId} is published, allowing access`);
      return game;
    }

    // If editing/archived, only team members or super admin can see
    if (userId) {
      const isMember = await this.isTeamMember(game.teamId, userId);
      console.log(`[GamesService.getGame] Game ${gameId} is ${game.status}, checking access: isSuperAdmin=${isSuperAdmin}, isTeamMember=${isMember}`);
      if (isSuperAdmin || isMember) {
        console.log(`[GamesService.getGame] Game ${gameId} access granted`);
        return game;
      }
    }

    console.log(`[GamesService.getGame] Game ${gameId} access denied: status=${game.status}, userId=${userId || 'anonymous'}`);
    throw new NotFoundException("Game not available");
  }

  private async isTeamMember(teamId: string, userId: string): Promise<boolean> {
    const team = await this.teamsRepo.findById(teamId);
    return team?.members.includes(userId) || false;
  }

  async getTeam(teamId: string) {
    return this.teamsRepo.findById(teamId);
  }

  async listGames(tag?: string, title?: string, teamId?: string, userId?: string, isSuperAdmin?: boolean) {
    // Get all games first, then filter
    let allGames = await this.gamesRepo.find({});
    
    // Filter by teamId if specified
    if (teamId) {
      allGames = allGames.filter(g => g.teamId === teamId);
      
      // For team catalog, show only published to unauthenticated users
      // Authenticated team members can see all their team's games (including editing/archived)
      if (!userId) {
        allGames = allGames.filter(g => g.status === "published");
      } else {
        const team = await this.teamsRepo.findById(teamId);
        if (team && (isSuperAdmin || team.members.includes(userId))) {
          // Team member or super admin - show all statuses
          // Don't filter by status
        } else {
          // Not a member, show only published
          allGames = allGames.filter(g => g.status === "published");
        }
      }
    } else {
      // Public catalog: unauthenticated see only published
      // Authenticated users see published + their teams' games (editing/archived)
      if (!userId) {
        allGames = allGames.filter(g => g.status === "published");
      } else {
        // Get user's teams
        const allTeams = await this.teamsRepo.findAll();
        const userTeams = allTeams.filter(t => isSuperAdmin || t.members.includes(userId));
        const userTeamIds = new Set(userTeams.map(t => t._id));
        
        // Show published games OR games from user's teams
        allGames = allGames.filter(g => 
          g.status === "published" || userTeamIds.has(g.teamId)
        );
      }
    }

    // Filter by tag
    if (tag) {
      allGames = allGames.filter(g => 
        (g.tags_user || []).includes(tag) || (g.tags_system || []).includes(tag)
      );
    }

    // Filter by title
    if (title) {
      const titleLower = title.toLowerCase();
      allGames = allGames.filter(g => g.title.toLowerCase().includes(titleLower));
    }

    return allGames.map((game) => ({
      id: game._id,
      title: game.title,
      cover_url: game.cover_url,
      teamId: game.teamId,
      tags_user: game.tags_user || [],
      tags_system: game.tags_system || [],
      status: game.status,
    }));
  }

  async publishGame(gameId: string, userId: string, isSuperAdmin: boolean) {
    const game = await this.gamesRepo.findById(gameId);
    if (!game) {
      throw new NotFoundException("Game not found");
    }

    // Check permissions
    if (!isSuperAdmin) {
      const team = await this.teamsRepo.findById(game.teamId);
      if (!team || !team.members.includes(userId)) {
        throw new ForbiddenException("User is not authorized to publish this game");
      }
    }

    // Validate publish requirements
    if (!game.cover_url || !game.description_md || !game.build_url) {
      throw new BadRequestException("Game must have cover_url, description_md, and build_url to publish");
    }

    await this.gamesRepo.update(gameId, { status: "published" });
    return this.gamesRepo.findById(gameId);
  }

  async archiveGame(gameId: string, userId: string, isSuperAdmin: boolean) {
    const game = await this.gamesRepo.findById(gameId);
    if (!game) {
      throw new NotFoundException("Game not found");
    }

    // Check permissions
    if (!isSuperAdmin) {
      const team = await this.teamsRepo.findById(game.teamId);
      if (!team || !team.members.includes(userId)) {
        throw new ForbiddenException("User is not authorized to archive this game");
      }
    }

    await this.gamesRepo.update(gameId, { status: "archived" });
    return this.gamesRepo.findById(gameId);
  }

  async updateTags(gameId: string, userId: string, isSuperAdmin: boolean, tags_user?: string[], tags_system?: string[]) {
    const game = await this.gamesRepo.findById(gameId);
    if (!game) {
      throw new NotFoundException("Game not found");
    }

    // Check permissions: team members can set tags_user, super admin can set both
    if (!isSuperAdmin) {
      const team = await this.teamsRepo.findById(game.teamId);
      if (!team || !team.members.includes(userId)) {
        throw new ForbiddenException("User is not authorized to update tags");
      }
      // Team members can only update tags_user
      if (tags_system !== undefined) {
        throw new ForbiddenException("Only super admin can update tags_system");
      }
    }

    const updates: any = {};
    if (tags_user !== undefined) {
      updates.tags_user = tags_user;
    }
    if (tags_system !== undefined && isSuperAdmin) {
      updates.tags_system = tags_system;
    }

    await this.gamesRepo.update(gameId, updates);
    return this.gamesRepo.findById(gameId);
  }
}

