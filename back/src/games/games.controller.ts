import { Body, Controller, Get, Param, Patch, Post, UseGuards, Query, UploadedFile, UseInterceptors, BadRequestException, Req } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Request } from "express";
import { GamesService } from "./games.service";
import { JwtAuthGuard } from "../auth/auth.guard";
import { OptionalAuthGuard } from "../auth/optional-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { TeamsRepository } from "../teams/teams.repository";
import { TeamsService } from "../teams/teams.service";
import { BuildUrlService } from "../build-url.service";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { lookup as lookupMime } from "mime-types";
import { randomUUID } from "crypto";

@Controller("games")
export class GamesController {
  private s3Client: S3Client;
  private s3Bucket: string;
  private s3PublicUrl: string;

  constructor(
    private gamesService: GamesService,
    private teamsRepo: TeamsRepository,
    private teamsService: TeamsService,
    private buildUrlService: BuildUrlService
  ) {
    const s3Region = process.env.S3_REGION ?? "us-east-1";
    const s3ForcePathStyle = process.env.S3_FORCE_PATH_STYLE === "true" || process.env.S3_FORCE_PATH_STYLE === undefined;
    const s3AccessKey = process.env.S3_ACCESS_KEY_ID ?? process.env.S3_ACCESS_KEY ?? "minioadmin";
    const s3SecretKey = process.env.S3_SECRET_ACCESS_KEY ?? process.env.S3_SECRET_KEY ?? "minioadmin";
    
    this.s3Client = new S3Client({
      region: s3Region,
      endpoint: process.env.S3_ENDPOINT ?? "http://localhost:9000",
      credentials: {
        accessKeyId: s3AccessKey,
        secretAccessKey: s3SecretKey,
      },
      forcePathStyle: s3ForcePathStyle,
    });
    this.s3Bucket = process.env.S3_BUCKET_ASSETS ?? process.env.S3_BUCKET ?? "birdmaid-builds";
    
    // Determine S3 public URL: prefer S3_PUBLIC_BASE_URL, fallback to S3_PUBLIC_URL, then S3_ENDPOINT, finally localhost
    const s3Endpoint = process.env.S3_ENDPOINT;
    this.s3PublicUrl = process.env.S3_PUBLIC_BASE_URL 
      ?? process.env.S3_PUBLIC_URL 
      ?? s3Endpoint 
      ?? "http://localhost:9000";
    
    // Log S3 configuration for debugging
    console.log(`[GamesController] S3 configuration:`);
    console.log(`  S3_ENDPOINT: ${s3Endpoint ?? 'not set'}`);
    console.log(`  S3_PUBLIC_BASE_URL: ${process.env.S3_PUBLIC_BASE_URL ?? 'not set'}`);
    console.log(`  S3_PUBLIC_URL: ${process.env.S3_PUBLIC_URL ?? 'not set'}`);
    console.log(`  Final s3PublicUrl: ${this.s3PublicUrl}`);
    console.log(`  NODE_ENV: ${process.env.NODE_ENV ?? 'not set'}`);
  }

  @Get()
  @UseGuards(OptionalAuthGuard)
  async listGames(
    @Query("tag") tag?: string,
    @Query("title") title?: string,
    @Query("teamId") teamId?: string,
    @CurrentUser() user?: any,
    @Req() req?: Request
  ) {
    console.log(`[listGames] ===== METHOD CALLED =====`);
    const userId = user?.userId;
    const isSuperAdmin = user?.isSuperAdmin || false;
    const games = await this.gamesService.listGames(tag, title, teamId, userId, isSuperAdmin);
    
    console.log(`[listGames] Received ${games.length} games from service`);
    if (games.length > 0) {
      console.log(`[listGames] First game from service: id=${games[0].id}, cover_url=${games[0].cover_url}`);
    }
    
    // Determine S3 public URL based on request hostname
    const s3PublicUrl = this.getS3PublicUrlFromRequest(req);
    console.log(`[listGames] Using S3 public URL: ${s3PublicUrl}`);
    
    // Generate signed URLs for cover images
    console.log(`[listGames] Starting to process ${games.length} games for signed URL generation`);
    const gamesWithSignedCovers = await Promise.all(
      games.map(async (game, index) => {
        console.log(`[listGames] Processing game ${index + 1}/${games.length}: id=${game.id}, cover_url=${game.cover_url}`);
        let coverUrl: string | undefined = undefined;
        if (game.cover_url) {
          // Ignore blob URLs - they are temporary and not valid
          if (game.cover_url.startsWith("blob:")) {
            console.warn(`Game ${game.id} has blob URL in cover_url, ignoring: ${game.cover_url}`);
            coverUrl = undefined;
          } else {
            try {
              // If cover_url is an S3 key (starts with "covers/"), generate signed URL
              if (game.cover_url.startsWith("covers/")) {
                console.log(`[listGames] Generating signed URL for game ${game.id} cover key: ${game.cover_url}, s3PublicUrl: ${s3PublicUrl}`);
                try {
                  const signedUrl = await this.buildUrlService.getSignedUrlFromKey(game.cover_url, 3600, s3PublicUrl);
                  console.log(`[listGames] getSignedUrlFromKey returned: ${signedUrl ? (signedUrl.substring(0, 150) + '...') : 'null/undefined'}, type: ${typeof signedUrl}, length: ${signedUrl?.length || 0}`);
                  if (signedUrl && typeof signedUrl === 'string' && signedUrl.length > 0 && signedUrl.startsWith('http')) {
                    coverUrl = signedUrl;
                    console.log(`[listGames] ✓ Successfully set coverUrl for game ${game.id}: ${coverUrl.substring(0, 100)}...`);
                  } else {
                    console.error(`[listGames] ✗ Invalid signed URL for game ${game.id}: got "${signedUrl}" (type: ${typeof signedUrl}, length: ${signedUrl?.length || 0})`);
                    coverUrl = undefined;
                  }
                } catch (err) {
                  console.error(`[listGames] ✗ Exception in getSignedUrlFromKey for game ${game.id}:`, err);
                  coverUrl = undefined;
                }
              } else {
                // Legacy: if it's a full URL, use old method
                console.log(`[listGames] Generating signed URL for game ${game.id} legacy cover URL: ${game.cover_url}`);
                const signedUrl = await this.buildUrlService.getSignedBuildUrl(game.cover_url, 3600, s3PublicUrl);
                if (signedUrl && typeof signedUrl === 'string' && signedUrl.length > 0) {
                  coverUrl = signedUrl;
                } else {
                  console.warn(`[listGames] Failed to generate signed URL for game ${game.id} legacy URL`);
                  coverUrl = undefined;
                }
              }
            } catch (error) {
              console.error(`[listGames] Error generating signed URL for game ${game.id} cover:`, error, "cover_url:", game.cover_url);
              // Leave coverUrl as undefined on error
              coverUrl = undefined;
            }
          }
        }
        // IMPORTANT: Only return cover_url if we have a signed URL, not the S3 key
        // Explicitly set cover_url to avoid spread operator preserving the original S3 key
        const result = {
          id: game.id,
          title: game.title,
          cover_url: coverUrl, // This should be the signed URL, not the S3 key
          teamId: game.teamId,
          tags_user: game.tags_user || [],
          tags_system: game.tags_system || [],
          status: game.status,
        };
        // CRITICAL: Verify we're not returning the S3 key - this should NEVER happen
        if (result.cover_url && result.cover_url.startsWith('covers/')) {
          console.error(`[listGames] ⚠️ CRITICAL ERROR: Returning S3 key instead of signed URL for game ${game.id}: ${result.cover_url}`);
          console.error(`[listGames] Original game.cover_url: ${game.cover_url}, coverUrl variable: ${coverUrl}`);
          // Force to undefined to prevent S3 key from being returned
          result.cover_url = undefined;
        }
        if (result.cover_url) {
          console.log(`[listGames] ✓ Game ${index + 1}/${games.length} (${game.id}): Returning with signed URL: ${result.cover_url.substring(0, 100)}...`);
        } else {
          console.log(`[listGames] - Game ${index + 1}/${games.length} (${game.id}): Returning with no cover_url (was: ${game.cover_url})`);
        }
        return result;
      })
    );
    
    // CRITICAL: Final safety check - remove any S3 keys that somehow made it through
    const sanitizedGames = gamesWithSignedCovers.map((g) => {
      if (g.cover_url && g.cover_url.startsWith('covers/')) {
        console.error(`[listGames] ⚠️⚠️⚠️ FINAL SANITIZATION: Removing S3 key from game ${g.id}: ${g.cover_url}`);
        return {
          ...g,
          cover_url: undefined, // Force to undefined
        };
      }
      return g;
    });
    
    // Debug: log first game to verify signed URLs are generated
    if (sanitizedGames.length > 0) {
      const firstGame = sanitizedGames[0];
      console.log(`[listGames] First game in FINAL response: id=${firstGame.id}, cover_url=${firstGame.cover_url ? (firstGame.cover_url.substring(0, 100) + '...') : 'null/undefined'}`);
    }
    
    // Verify no S3 keys in final response
    const hasS3Keys = sanitizedGames.some((g) => g.cover_url && g.cover_url.startsWith('covers/'));
    if (hasS3Keys) {
      console.error(`[listGames] ⚠️⚠️⚠️ CRITICAL: Final response still contains S3 keys!`);
    } else {
      console.log(`[listGames] ✓ Final response verified: no S3 keys found`);
    }
    
    return sanitizedGames;
  }

  @Get(":id")
  @UseGuards(OptionalAuthGuard)
  async getGame(@Param("id") id: string, @CurrentUser() user?: any, @Req() req?: Request) {
    const userId = user?.userId;
    const isSuperAdmin = user?.isSuperAdmin || false;
    const game = await this.gamesService.getGame(id, userId, isSuperAdmin);
    
    // Load team info with member logins
    let team = null;
    if (game.teamId) {
      try {
        const teamData = await this.teamsRepo.findById(game.teamId);
        if (teamData) {
          // Get member logins instead of IDs
          const memberLogins = await Promise.all(
            teamData.members.map((memberId) => 
              this.teamsService.getUserLogin(memberId).then(login => login || memberId)
            )
          );
          team = { name: teamData.name, members: memberLogins };
        }
      } catch {
        // Ignore errors
      }
    }

    // Determine S3 public URL based on request hostname
    const s3PublicUrl = this.getS3PublicUrlFromRequest(req);

    // Generate fresh signed URL for build (expires in 1 hour)
    const buildUrl = await this.buildUrlService.getSignedBuildUrl(game.build_url, 3600, s3PublicUrl);
    
    // Generate fresh signed URL for cover image from coverId (S3 key)
    let coverUrl: string | null = null;
    if (game.cover_url) {
      // Ignore blob URLs - they are temporary and not valid
      if (game.cover_url.startsWith("blob:")) {
        console.warn(`Game ${game._id} has blob URL in cover_url, ignoring: ${game.cover_url}`);
        coverUrl = null;
      } else if (game.cover_url.startsWith("covers/")) {
        // If cover_url is an S3 key (starts with "covers/"), generate signed URL
        const s3Key = game.cover_url;
        coverUrl = await this.buildUrlService.getSignedUrlFromKey(s3Key, 3600, s3PublicUrl);
      } else {
        // Legacy: if it's a full URL, use old method
        coverUrl = await this.buildUrlService.getSignedBuildUrl(game.cover_url, 3600, s3PublicUrl);
      }
    }

    return {
      id: game._id,
      title: game.title,
      description_md: game.description_md,
      repo_url: game.repo_url,
      cover_url: coverUrl,
      status: game.status,
      tags_user: game.tags_user || [],
      tags_system: game.tags_system || [],
      build_url: buildUrl,
      adminRemark: game.adminRemark,
      team,
      teamId: game.teamId,
    };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createGame(@Body() body: any, @CurrentUser() user: any) {
    const game = await this.gamesService.createGame(
      body.teamId,
      body.title,
      user.userId,
      user.isSuperAdmin,
      body
    );
    return {
      id: game._id,
      teamId: game.teamId,
      title: game.title,
      status: game.status,
    };
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard)
  async updateGame(@Param("id") id: string, @Body() body: any, @CurrentUser() user: any) {
    // Remove cover_url from body if it's a blob URL - cover should be uploaded via /cover endpoint
    if (body.cover_url && body.cover_url.startsWith("blob:")) {
      console.warn(`Attempt to save blob URL as cover_url for game ${id}, ignoring`);
      delete body.cover_url;
    }
    
    const game = await this.gamesService.updateGame(id, user.userId, user.isSuperAdmin, body);
    return {
      id: game!._id,
      ...game!,
    };
  }

  @Post(":id/publish")
  @UseGuards(JwtAuthGuard)
  async publishGame(@Param("id") id: string, @CurrentUser() user: any) {
    const game = await this.gamesService.publishGame(id, user.userId, user.isSuperAdmin);
    return {
      id: game!._id,
      status: game!.status,
    };
  }

  @Post(":id/archive")
  @UseGuards(JwtAuthGuard)
  async archiveGame(@Param("id") id: string, @CurrentUser() user: any) {
    const game = await this.gamesService.archiveGame(id, user.userId, user.isSuperAdmin);
    return {
      id: game!._id,
      status: game!.status,
    };
  }

  @Post(":id/status")
  @UseGuards(JwtAuthGuard)
  async updateStatus(@Param("id") id: string, @Body() body: { status: string; remark?: string }, @CurrentUser() user: any) {
    const game = await this.gamesService.forceStatusChange(id, body.status, body.remark, user.isSuperAdmin);
    return {
      id: game!._id,
      status: game!.status,
      adminRemark: game!.adminRemark,
    };
  }

  @Patch(":id/tags")
  @UseGuards(JwtAuthGuard)
  async updateTags(@Param("id") id: string, @Body() body: { tags_user?: string[]; tags_system?: string[] }, @CurrentUser() user: any) {
    const game = await this.gamesService.updateTags(id, user.userId, user.isSuperAdmin, body.tags_user, body.tags_system);
    return {
      id: game!._id,
      tags_user: game!.tags_user || [],
      tags_system: game!.tags_system || [],
    };
  }

  @Post(":id/cover")
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor("file"))
  async uploadCover(
    @Param("id") id: string,
    @UploadedFile() file: { originalname: string; buffer: Buffer; mimetype: string; size: number },
    @CurrentUser() user: any
  ) {
    if (!file?.buffer) {
      throw new BadRequestException("Missing image file");
    }

    // Validate file size (300 KB = 307200 bytes)
    const maxSize = 300 * 1024; // 300 KB
    if (file.size > maxSize) {
      throw new BadRequestException(`File size exceeds 300 KB limit. Current size: ${(file.size / 1024).toFixed(2)} KB`);
    }

    // Validate file type
    if (!file.mimetype.startsWith("image/")) {
      throw new BadRequestException("File must be an image");
    }

    // Check permissions
    const game = await this.gamesService.getGame(id, user.userId, user.isSuperAdmin);
    if (!game) {
      throw new BadRequestException("Game not found");
    }

    // Generate cover ID and determine file extension
    const coverId = randomUUID();
    const extension = file.originalname.split(".").pop() || "jpg";
    const s3Key = `covers/${coverId}.${extension}`;

    // Upload to S3
    const contentType = lookupMime(file.originalname) || file.mimetype || "image/jpeg";
    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.s3Bucket,
        Key: s3Key,
        Body: file.buffer,
        ContentType: contentType.toString(),
      })
    );

    // Update game with cover S3 key
    await this.gamesService.updateGame(id, user.userId, user.isSuperAdmin, {
      cover_url: s3Key, // Store S3 key instead of full URL
    });

    // Return the S3 key (frontend will use it to get signed URL)
      return { cover_id: coverId, cover_key: s3Key };
  }

  /**
   * Get S3 public URL, preferring configured S3_PUBLIC_BASE_URL.
   * Falls back to request-based URL only for local development.
   * 
   * In production, always uses S3_PUBLIC_BASE_URL from environment.
   * In local dev (when S3_PUBLIC_BASE_URL points to localhost), 
   * infers URL from request hostname for flexibility.
   * 
   * @param req Optional request object
   * @returns S3 public base URL
   */
  private getS3PublicUrlFromRequest(req?: Request): string {
    // Always prefer configured S3_PUBLIC_BASE_URL in production
    // Only use request-based URL if configured URL is localhost (dev mode)
    const isLocalDev = this.s3PublicUrl.includes("localhost") || 
                       this.s3PublicUrl.includes("127.0.0.1");
    
    console.log(`[getS3PublicUrlFromRequest] s3PublicUrl from env: ${this.s3PublicUrl}`);
    console.log(`[getS3PublicUrlFromRequest] isLocalDev: ${isLocalDev}`);
    
    if (!isLocalDev) {
      // Production: use configured S3_PUBLIC_BASE_URL
      console.log(`[getS3PublicUrlFromRequest] Using production S3_PUBLIC_BASE_URL: ${this.s3PublicUrl}`);
      return this.s3PublicUrl;
    }
    
    console.log(`[getS3PublicUrlFromRequest] Detected local dev mode, inferring from request`);
    
    // Local dev: try to infer from request if available
    if (!req) {
      return this.s3PublicUrl;
    }

    const origin = req.get("origin") || req.headers.origin;
    const host = req.get("host") || req.headers.host;
    
    // Extract hostname from origin or host
    let hostname = "localhost";
    
    // Try origin first (more reliable for CORS requests)
    if (origin) {
      try {
        const url = new URL(origin);
        hostname = url.hostname;
      } catch (e) {
        console.warn("Invalid origin URL:", origin, e);
      }
    }
    
    // Fallback to host header if origin didn't work
    if (hostname === "localhost" && host) {
      // Extract hostname from host (format: hostname:port)
      const hostParts = host.split(":");
      hostname = hostParts[0];
    }
    
    // Use localhost for localhost/127.0.0.1
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return "http://localhost:9000";
    }
    
    // For local dev with custom hostname, use the same hostname with port 9000
    const s3Url = `http://${hostname}:9000`;
    console.log(`[Local Dev] Using S3 public URL: ${s3Url} (from hostname: ${hostname})`);
    return s3Url;
  }
}

