import { Body, Controller, Get, Param, Patch, Post, UseGuards, Query, UploadedFile, UseInterceptors, BadRequestException, Req, Res, NotFoundException } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Request, Response } from "express";
import { GamesService } from "./games.service";
import { JwtAuthGuard } from "../auth/auth.guard";
import { OptionalAuthGuard } from "../auth/optional-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { TeamsRepository } from "../teams/teams.repository";
import { TeamsService } from "../teams/teams.service";
import { BuildUrlService } from "../build-url.service";
import { JwtService } from "@nestjs/jwt";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
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
    private buildUrlService: BuildUrlService,
    private jwtService: JwtService
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

  /**
   * Proxy endpoint for ALL build files (including index.html and all other files).
   * This allows relative paths in index.html to work with signed URLs.
   * Example: /games/:id/build/index.js -> proxies to S3 with signed URL
   * 
   * IMPORTANT: This route must be declared BEFORE :id route to avoid conflicts.
   * Uses a single route that extracts file path from URL for all files.
   * 
   * Note: OPTIONS preflight requests are handled by global middleware in main.ts
   * which sets Access-Control-Allow-Origin: "null" for build asset routes with Origin: null.
   */
  @Get(":id/build/:file")
  @UseGuards(OptionalAuthGuard)
  async proxyBuildFileRoute(
    @Param("id") id: string,
    @Param("file") file: string,
    @Req() req: Request,
    @Res() res: Response
  ) {
    console.log(`[proxyBuildFileRoute] ===== ROUTE CALLED =====`);
    console.log(`[proxyBuildFileRoute] Game ID: ${id}, File param: ${file}`);
    console.log(`[proxyBuildFileRoute] Request URL: ${req.url}`);
    console.log(`[proxyBuildFileRoute] Request path: ${req.path}`);
    console.log(`[proxyBuildFileRoute] Request params:`, req.params);
    
    // Extract file path from URL (everything after /build/)
    // This handles both simple files (index.js) and nested paths (assets/image.png)
    const urlPath = req.url || req.path || "";
    const buildMatch = urlPath.match(/\/build\/(.+?)(?:\?|$)/);
    const filePath = buildMatch ? buildMatch[1] : file;
    
    console.log(`[proxyBuildFileRoute] Resolved file path: ${filePath}`);
    
    return this.proxyBuildFile(id, filePath, req, res);
  }

  /**
   * Internal method to proxy build files from S3.
   */
  private async proxyBuildFile(
    id: string,
    filePath: string,
    req: Request,
    res: Response
  ) {
    console.log(`[proxyBuildFile] ===== ENTRY POINT CALLED =====`);
    console.log(`[proxyBuildFile] Game ID: ${id}`);
    console.log(`[proxyBuildFile] File path: ${filePath}`);
    console.log(`[proxyBuildFile] Request URL: ${req.url}`);
    console.log(`[proxyBuildFile] Request path: ${req.path}`);
    console.log(`[proxyBuildFile] Request query:`, req.query);
    console.log(`[proxyBuildFile] Request method: ${req.method}`);
    console.log(`[proxyBuildFile] Has token in query: ${!!req.query.token}`);
    console.log(`[proxyBuildFile] Is index.html: ${filePath === "index.html"}`);

    // Get game to find build_url
    // Access control:
    // - If game is published: anyone can access build files
    // - If game is editing: only team members can access (requires auth)
    // - If game is archived: only team members can access (requires auth)
    // Authentication is handled by OptionalAuthGuard which checks:
    // 1. Authorization header (Bearer token)
    // 2. HttpOnly cookie (bm_build_auth_<gameId>) for build asset routes
    const user = (req as any).user;
    const userId = user?.userId;
    const isSuperAdmin = user?.isSuperAdmin || false;
    
    console.log(`[proxyBuildFile] Getting game ${id}`);
    console.log(`[proxyBuildFile] User object:`, user ? { userId: user.userId, isSuperAdmin: user.isSuperAdmin } : 'null');
    console.log(`[proxyBuildFile] Authorization header:`, req.headers.authorization ? 'present' : 'missing');
    console.log(`[proxyBuildFile] Cookies:`, req.cookies ? Object.keys(req.cookies).filter(k => k.startsWith('bm_build_auth_')) : 'none');
    console.log(`[proxyBuildFile] Extracted userId: ${userId || 'anonymous'}, isSuperAdmin: ${isSuperAdmin}`);
    
    // Get game with proper access check
    let game;
    try {
      game = await this.gamesService.getGame(id, userId, isSuperAdmin);
      console.log(`[proxyBuildFile] Game found: status=${game.status}`);
    } catch (error) {
      console.error(`[proxyBuildFile] Failed to get game ${id}:`, error instanceof Error ? error.message : String(error));
      const hasCookie = req.cookies && req.cookies[`bm_build_auth_${id}`];
      console.error(`[proxyBuildFile] Access denied - userId: ${userId || 'anonymous'}, hasCookie: ${hasCookie ? 'yes' : 'no'}, game status: ${game?.status || 'unknown'}`);
      
      // Set CORS headers before sending error response
      // CRITICAL: For build asset routes with Origin: null, we MUST respond with "null" (the string)
      const origin = req.headers.origin;
      const corsOrigin = process.env.CORS_ORIGIN;
      const allowedOrigins = corsOrigin ? corsOrigin.split(',').map(o => o.trim()) : ['*'];
      const isBuildAssetRoute = /\/games\/[^\/]+\/build\//.test(req.url || req.path || '');
      
      if (!origin || origin === 'null') {
        // For build asset routes with Origin: null, respond with "null" (required by CORS spec)
        if (isBuildAssetRoute) {
          res.setHeader("Access-Control-Allow-Origin", "null");
        } else if (process.env.NODE_ENV === 'production' && corsOrigin) {
          const allowOrigin = allowedOrigins.includes('*') ? '*' : allowedOrigins[0];
          res.setHeader("Access-Control-Allow-Origin", allowOrigin);
        } else {
          res.setHeader("Access-Control-Allow-Origin", "*");
        }
      } else {
        if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
          res.setHeader("Access-Control-Allow-Origin", origin);
        }
      }
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Cookie");
      if (isBuildAssetRoute) {
        res.setHeader("Vary", "Origin");
      }
      
      // Convert NotFoundException to 403 Forbidden for access denied (more appropriate than 404)
      if (error instanceof NotFoundException && error.message.includes("not available")) {
        res.status(403).json({
          statusCode: 403,
          message: "Access denied: Game is not published and requires authentication",
          error: "Forbidden"
        });
        return;
      }
      
      // Re-throw to be caught by outer catch block
      throw error;
    }
    
    console.log(`[proxyBuildFile] Game found: ${!!game}, status: ${game?.status}, build_url: ${game?.build_url ? 'present' : 'null'}`);
    
    if (!game || !game.build_url) {
      console.error(`[proxyBuildFile] Game ${id} has no build_url`);
      throw new NotFoundException("Game build not found");
    }

    // Extract S3 key from build_url using BuildUrlService logic
    // build_url format: http://localhost:9000/birdmaid-builds/builds/{buildId}/index.html
    // We need to extract the path after bucket name: builds/{buildId}/index.html
    const s3PublicUrl = this.getS3PublicUrlFromRequest(req);
    const bucketName = this.s3Bucket;
    
    // Extract S3 key from build_url (path after bucket name)
    // Match pattern: {s3PublicUrl}/{bucket}/{s3Key}
    const escapedPublicUrl = s3PublicUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const escapedBucket = bucketName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const buildUrlPattern = new RegExp(`^${escapedPublicUrl}/${escapedBucket}/(.+)$`);
    const buildUrlMatch = game.build_url.match(buildUrlPattern);
    
    if (!buildUrlMatch) {
      console.error(`[proxyBuildFile] Invalid build_url format: ${game.build_url}`);
      console.error(`[proxyBuildFile] Expected pattern: ${s3PublicUrl}/${bucketName}/builds/{buildId}/index.html`);
      throw new NotFoundException("Invalid build URL format");
    }
    
    // Extract the directory path from build_url
    // buildPath example: "builds/{buildId}/index.html"
    const buildPath = buildUrlMatch[1];
    
    // Extract directory (everything before the last filename)
    // For "builds/{buildId}/index.html", we want "builds/{buildId}/"
    const lastSlashIndex = buildPath.lastIndexOf('/');
    const buildDir = lastSlashIndex >= 0 ? buildPath.substring(0, lastSlashIndex + 1) : "builds/";
    
    // Construct S3 key: buildDir + filePath
    // If filePath is "index.html" and buildDir is "builds/{buildId}/", result is "builds/{buildId}/index.html"
    const s3Key = `${buildDir}${filePath}`;

    console.log(`[proxyBuildFile] build_url: ${game.build_url}`);
    console.log(`[proxyBuildFile] Extracted build_path: ${buildPath}, build_dir: ${buildDir}, filePath: ${filePath}, s3Key: ${s3Key}`);

    // CRITICAL: Set cookie BEFORE any S3 operations (for index.html with token)
    // This ensures cookie is set even if S3 request fails or times out
    if (filePath === "index.html") {
      const tokenFromQuery = req.query.token as string | undefined;
      
      // Cookie handshake: if token is provided in query, set HttpOnly cookie for subsequent requests
      if (tokenFromQuery) {
        try {
          // Validate token before setting cookie
          const secret = process.env.JWT_SECRET || "default-secret-change-in-production";
          const payload = await this.jwtService.verifyAsync(tokenFromQuery, { secret });
          
          // Set HttpOnly Secure cookie for build asset authentication
          // Cookie is scoped to /games/:id/build path and expires in 1 hour
          const isProduction = process.env.NODE_ENV === "production";
          const host = req.get("host") || req.headers.host || "api.birdmaid.su";
          const origin = req.headers.origin;
          
          // Extract domain for cross-subdomain cookie sharing
          // For birdmaid.su and api.birdmaid.su, use .birdmaid.su as domain
          let cookieDomain: string | undefined = undefined;
          if (isProduction && host.includes("birdmaid.su")) {
            cookieDomain = ".birdmaid.su"; // Allows cookie sharing between birdmaid.su and api.birdmaid.su
          }
          
          // CRITICAL: For build asset routes, we need SameSite=None; Secure in production because:
          // 1. Iframe may have opaque origin (Origin: null) - requires SameSite=None
          // 2. Even with allow-same-origin, iframe on birdmaid.su loading from api.birdmaid.su
          //    is cross-site for cookies (different subdomains) - requires SameSite=None
          // 3. SameSite=Lax only works for same-site top-level navigations, NOT for cross-site iframes
          // 
          // Rationale:
          // - SameSite=Lax: Only sent in same-site (top-level) navigations, NOT in cross-site iframes
          // - SameSite=None; Secure: Sent in all contexts (same-site and cross-site), required for
          //   opaque origins (Origin: null) and cross-subdomain iframes
          // - Secure=true is required when SameSite=None (browser requirement)
          // 
          // In production: Always use SameSite=None for build assets (cross-subdomain iframe context)
          // In development: Use Lax (same-site, no HTTPS for Secure cookies)
          const sameSiteValue = isProduction ? "None" : "Lax";
          
          const cookieOptions: any = {
            httpOnly: true,
            secure: isProduction, // Required when SameSite=None, also good practice in production
            sameSite: sameSiteValue as "Lax" | "None" | "Strict",
            path: `/games/${id}/build`,
            maxAge: 60 * 60 * 1000, // 1 hour
          };
          
          if (cookieDomain) {
            cookieOptions.domain = cookieDomain;
          }
          
          res.cookie(`bm_build_auth_${id}`, tokenFromQuery, cookieOptions);
          
          // Log cookie details (but not the token value)
          console.log(`[proxyBuildFile] Set build auth cookie for game ${id}`);
          console.log(`[proxyBuildFile] Cookie details: domain=${cookieDomain || 'none'}, sameSite=${sameSiteValue}, secure=${isProduction}, origin=${origin || 'null'}, expires in 1 hour`);
          
          // Verify Set-Cookie header is present in response (for debugging)
          const setCookieHeader = res.getHeader('Set-Cookie');
          if (setCookieHeader) {
            console.log(`[proxyBuildFile] ✓ Set-Cookie header present in response (length: ${Array.isArray(setCookieHeader) ? setCookieHeader[0].length : String(setCookieHeader).length})`);
          } else {
            console.error(`[proxyBuildFile] ✗ WARNING: Set-Cookie header NOT present in response!`);
          }
        } catch (error) {
          console.error(`[proxyBuildFile] Invalid token in query, not setting cookie:`, error instanceof Error ? error.message : String(error));
          console.error(`[proxyBuildFile] Token preview: ${tokenFromQuery?.substring(0, 50)}...`);
        }
      } else {
        console.log(`[proxyBuildFile] No token in query for index.html, skipping cookie setup`);
      }
    }

    // Declare variables outside try block for use in catch
    let contentType: string | undefined;
    let content: string | Buffer | undefined;

    try {
      // Use S3Client directly to get object (avoids signed URL signature issues)
      // This uses internal Docker endpoint (S3_ENDPOINT) which is accessible from container
      console.log(`[proxyBuildFile] Fetching file from S3 using S3Client, key: ${s3Key}`);
      
      const getObjectCommand = new GetObjectCommand({
        Bucket: this.s3Bucket,
        Key: s3Key,
      });
      
      const s3Response = await this.s3Client.send(getObjectCommand);
      
      if (!s3Response.Body) {
        throw new NotFoundException("File not found in S3: empty response");
      }

      // Get content type from S3 metadata or infer from file extension
      // Explicit handling for Godot build files
      contentType = s3Response.ContentType;
      if (!contentType) {
        if (filePath.endsWith('.wasm')) {
          contentType = 'application/wasm';
        } else if (filePath.endsWith('.pck')) {
          contentType = 'application/octet-stream'; // Godot .pck files are binary
        } else {
          contentType = lookupMime(filePath) || "application/octet-stream";
        }
      }
      
      const isTextFile = contentType.includes("text/html") || 
                        contentType.includes("text/css") || 
                        contentType.includes("application/javascript") || 
                        contentType.includes("text/javascript");
      
      console.log(`[proxyBuildFile] Content-Type: ${contentType}, isTextFile: ${isTextFile}, filePath: ${filePath}`);
      
      if (isTextFile) {
        // For text files, convert stream to text
        const chunks: Uint8Array[] = [];
        for await (const chunk of s3Response.Body as any) {
          chunks.push(chunk);
        }
        const buffer = Buffer.concat(chunks);
        content = buffer.toString('utf-8');
        
        // Note: We no longer modify index.html content - Godot build files are served as-is
        // Authentication is handled via HttpOnly cookie set above
      } else {
        // For binary files (images, fonts, wasm, pck, etc.), convert stream to buffer
        console.log(`[proxyBuildFile] Processing binary file: ${filePath}, contentType: ${contentType}`);
        const chunks: Uint8Array[] = [];
        let totalSize = 0;
        try {
          for await (const chunk of s3Response.Body as any) {
            chunks.push(chunk);
            totalSize += chunk.length;
            // Log progress for large files
            if (totalSize % (10 * 1024 * 1024) === 0) {
              console.log(`[proxyBuildFile] Downloaded ${Math.round(totalSize / 1024 / 1024)}MB of ${filePath}`);
            }
          }
          content = Buffer.concat(chunks);
          console.log(`[proxyBuildFile] Successfully loaded binary file: ${filePath}, size: ${content.length} bytes`);
        } catch (streamError: any) {
          console.error(`[proxyBuildFile] Error reading stream for ${filePath}:`, streamError);
          throw new Error(`Failed to read file stream: ${streamError.message}`);
        }
      }

      // Set appropriate headers
      res.setHeader("Content-Type", contentType);
      res.setHeader("Cache-Control", "public, max-age=3600");
      
      // CORS headers for build files (critical for iframe requests with Origin: null)
      // 
      // CRITICAL: When Origin is "null" (opaque origin from sandboxed iframe),
      // browsers require the server to respond with Access-Control-Allow-Origin: "null"
      // (the literal string "null") for the response to be accepted. Without this,
      // even if the server returns 200, the browser will block the response.
      //
      // This is required by the CORS specification for opaque origins.
      const origin = req.headers.origin;
      const corsOrigin = process.env.CORS_ORIGIN;
      const allowedOrigins = corsOrigin ? corsOrigin.split(',').map(o => o.trim()) : ['*'];
      
      // Handle Origin: null (opaque origin from sandboxed iframe)
      if (!origin || origin === 'null') {
        // MUST respond with "null" (the string) for opaque origins
        res.setHeader("Access-Control-Allow-Origin", "null");
        res.setHeader("Access-Control-Allow-Credentials", "true");
        console.log(`[proxyBuildFile] Set CORS headers for opaque origin (Origin: null)`);
      } else {
        // For requests with explicit origin, check if allowed
        if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
          res.setHeader("Access-Control-Allow-Origin", origin);
          res.setHeader("Access-Control-Allow-Credentials", "true");
          console.log(`[proxyBuildFile] Set CORS headers for origin: ${origin}`);
        }
      }
      
      // Vary header is required when ACAO can change based on Origin
      res.setHeader("Vary", "Origin");
      res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Cookie");
      res.setHeader("Access-Control-Expose-Headers", "Content-Length, Content-Type");
      
      // Send content
      // Note: res.send() automatically ends the response when using @Res() decorator
      res.send(content);
    } catch (error: any) {
      console.error(`[proxyBuildFile] Error proxying file:`, error);
      console.error(`[proxyBuildFile] Error details:`, {
        name: error?.name,
        message: error?.message,
        code: error?.code,
        statusCode: error?.$metadata?.httpStatusCode,
        s3Key: s3Key,
        filePath: filePath,
        gameId: id
      });
      
      // When using @Res() decorator, we must manually send error response
      // Otherwise NestJS exception filters won't work and connection will hang
      if (res.headersSent) {
        // If headers already sent, we can't send error response
        console.error(`[proxyBuildFile] Headers already sent, closing connection`);
        return res.end();
      }
      
      // Handle AWS SDK errors (NoSuchKey, AccessDenied, etc.)
      let statusCode = 500;
      let errorMessage = error instanceof Error ? error.message : String(error);
      
      if (error instanceof NotFoundException) {
        statusCode = 404;
      } else if (error.name === 'NoSuchKey' || error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404 || error.code === 'NoSuchKey') {
        statusCode = 404;
        errorMessage = `File not found in S3: ${s3Key}`;
        console.error(`[proxyBuildFile] File not found in S3, key: ${s3Key}`);
      } else if (error.name === 'AccessDenied' || error.$metadata?.httpStatusCode === 403 || error.code === 'AccessDenied') {
        statusCode = 403;
        errorMessage = 'Access denied to file in S3';
      }
      
      // Set CORS headers even for errors (critical for iframe requests with Origin: null)
      const origin = req.headers.origin;
      const corsOrigin = process.env.CORS_ORIGIN;
      const allowedOrigins = corsOrigin ? corsOrigin.split(',').map(o => o.trim()) : ['*'];
      
      // Handle Origin: null (opaque origin) - MUST respond with "null" string
      if (!origin || origin === 'null') {
        res.setHeader("Access-Control-Allow-Origin", "null");
        res.setHeader("Access-Control-Allow-Credentials", "true");
      } else if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        res.setHeader("Access-Control-Allow-Origin", origin);
        res.setHeader("Access-Control-Allow-Credentials", "true");
      }
      
      res.setHeader("Vary", "Origin");
      res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Cookie");
      
      res.status(statusCode).json({
        statusCode,
        message: statusCode === 404 ? errorMessage : `Failed to proxy file: ${errorMessage}`,
        error: statusCode === 404 ? 'Not Found' : statusCode === 403 ? 'Forbidden' : 'Internal Server Error'
      });
    }
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

    // Use proxy endpoint for build instead of direct signed URL
    // This allows relative paths in index.html to work (they'll be proxied through /games/:id/build/*)
    // Determine protocol from X-Forwarded-Proto (set by Caddy) or use https for production
    const forwardedProto = req?.get("x-forwarded-proto") || req?.headers["x-forwarded-proto"];
    const protocol = forwardedProto || (process.env.NODE_ENV === "production" ? "https" : "http");
    const host = req?.get("host") || req?.headers.host || "api.birdmaid.su";
    
    // For non-published games, include auth token in URL so iframe can access build files
    // This is safe because:
    // 1. Token is only included if user already has access (verified by getGame)
    // 2. Token expires (JWT has expiration)
    // 3. Token is only used for build file access, not for other operations
    let buildUrl = `${protocol}://${host}/games/${id}/build/index.html`;
    if (game.status !== "published" && user?.userId) {
      // Include auth token for non-published games
      const authHeader = req?.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.substring(7);
        buildUrl += `?token=${encodeURIComponent(token)}`;
      }
    }
    
    console.log(`[getGame] Generated proxy build_url for game ${id}: ${buildUrl}`);
    console.log(`[getGame] Game status: ${game.status}, X-Forwarded-Proto: ${forwardedProto}, protocol: ${protocol}, host: ${host}`);
    
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

    console.log(`[uploadCover] Starting upload for game ${id}:`);
    console.log(`  S3 Bucket: ${this.s3Bucket}`);
    console.log(`  S3 Key: ${s3Key}`);
    console.log(`  S3 Endpoint: ${process.env.S3_ENDPOINT ?? 'not set'}`);
    console.log(`  File size: ${file.size} bytes`);
    console.log(`  File type: ${file.mimetype}`);

    // Upload to S3
    const contentType = lookupMime(file.originalname) || file.mimetype || "image/jpeg";
    try {
      const uploadResult = await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.s3Bucket,
          Key: s3Key,
          Body: file.buffer,
          ContentType: contentType.toString(),
        })
      );
      console.log(`[uploadCover] ✓ Successfully uploaded to S3: ${s3Key}`);
      console.log(`[uploadCover] Upload result:`, JSON.stringify(uploadResult, null, 2));
    } catch (error) {
      console.error(`[uploadCover] ✗ Failed to upload to S3:`, error);
      throw new BadRequestException(`Failed to upload cover image: ${error instanceof Error ? error.message : String(error)}`);
    }

    // Update game with cover S3 key
    await this.gamesService.updateGame(id, user.userId, user.isSuperAdmin, {
      cover_url: s3Key, // Store S3 key instead of full URL
    });

    console.log(`[uploadCover] ✓ Updated game ${id} with cover_url: ${s3Key}`);

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

