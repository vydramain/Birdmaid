import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Headers,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { lookup as lookupMime } from "mime-types";
import { MongoClient, type Filter } from "mongodb";
import { randomUUID } from "crypto";
import unzipper from "unzipper";

type TeamDoc = {
  _id: string;
  name: string;
  members: string[];
};

type GameDoc = {
  _id: string;
  teamId: string;
  title: string;
  description_md: string;
  repo_url: string;
  cover_url: string;
  status: "editing" | "published" | "archived";
  tags_user: string[];
  tags_system: string[];
  currentBuildId: string | null;
  build_url: string | null;
  adminRemark: string | null;
};

type BuildDoc = {
  _id: string;
  gameId: string;
  s3_key: string;
  storage_url: string;
  createdAt: string;
  sizeBytes: number;
};

type ZipEntry = {
  path: string;
  type: string;
  buffer: () => Promise<Buffer>;
};

@Controller()
export class AppController {
  private static readonly defaultMaxBuildSizeBytes = 300 * 1024 * 1024;
  private static readonly cspPolicy =
    "default-src 'self'; frame-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'self'";
  private useMemory = process.env.NODE_ENV === "test";
  private memoryTeams: { id: string; name: string; members: string[] }[] = [
    { id: "team-1", name: "Omsk", members: [] },
  ];
  private memoryGames: {
    id: string;
    teamId: string;
    title: string;
    description_md: string;
    repo_url: string;
    cover_url: string;
    status: "editing" | "published" | "archived";
    tags_user: string[];
    tags_system: string[];
    currentBuildId: string | null;
    build_url: string | null;
    adminRemark: string | null;
  }[] = [
    {
      id: "game-1",
      teamId: "team-1",
      title: "Demo Game",
      description_md: "Demo description",
      repo_url: "https://example.com/repo",
      cover_url: "https://example.com/cover.png",
      status: "published",
      tags_user: ["jam"],
      tags_system: ["omsk"],
      currentBuildId: "build-1",
      build_url: "https://example.com/build/index.html",
      adminRemark: null,
    },
    {
      id: "game-2",
      teamId: "team-1",
      title: "Draft Game",
      description_md: "",
      repo_url: "",
      cover_url: "",
      status: "editing",
      tags_user: [],
      tags_system: [],
      currentBuildId: null,
      build_url: null,
      adminRemark: null,
    },
  ];
  private memoryBuilds: { id: string; gameId: string; url: string }[] = [];
  private memoryConfig = { maxBuildSizeBytes: AppController.defaultMaxBuildSizeBytes };
  private mongoClient = new MongoClient(process.env.MONGO_URL ?? "mongodb://localhost:27017/birdmaid");
  private dbPromise: Promise<ReturnType<MongoClient["db"]>> | null = null;
  private s3Client = new S3Client({
    region: "us-east-1",
    endpoint: process.env.S3_ENDPOINT ?? "http://localhost:9000",
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY ?? "minioadmin",
      secretAccessKey: process.env.S3_SECRET_KEY ?? "minioadmin",
    },
    forcePathStyle: true,
  });
  private s3Bucket = process.env.S3_BUCKET ?? "birdmaid-builds";
  private s3PublicUrl = process.env.S3_PUBLIC_URL ?? "http://localhost:9000";

  private getAdminToken(headers?: Record<string, string | string[] | undefined>) {
    const headerValue =
      headers?.["x-admin-token"] ??
      headers?.["X-Admin-Token"] ??
      headers?.["x-admin-token".toLowerCase()];
    if (Array.isArray(headerValue)) {
      return headerValue[0];
    }
    return headerValue;
  }

  private assertAdmin(headers?: Record<string, string | string[] | undefined>) {
    const expected = process.env.ADMIN_TOKEN ?? "admin-token";
    const provided = this.getAdminToken(headers);
    if (!provided || provided !== expected) {
      throw new ForbiddenException("Forbidden");
    }
  }

  private async getMaxBuildSizeBytes() {
    if (this.useMemory) {
      return this.memoryConfig.maxBuildSizeBytes;
    }
    const db = await this.getDb();
    const config = db.collection<{ key: string; value: number }>("config");
    const entry = await config.findOne({ key: "maxBuildSizeBytes" });
    return entry?.value ?? AppController.defaultMaxBuildSizeBytes;
  }

  private async getDb() {
    if (this.useMemory) {
      throw new Error("DB access disabled in test mode");
    }
    if (!this.dbPromise) {
      this.dbPromise = this.mongoClient.connect().then((client) => client.db());
    }
    return this.dbPromise;
  }

  @Get("/health")
  health() {
    return { status: "ok" };
  }

  @Get("/games")
  async listGames(@Query("tag") tag?: string) {
    if (this.useMemory) {
      const published = this.memoryGames.filter((game) => game.status === "published");
      const filtered = tag
        ? published.filter((game) => game.tags_user.includes(tag) || game.tags_system.includes(tag))
        : published;
      return filtered.map((game) => ({
        id: game.id,
        title: game.title,
        cover_url: game.cover_url,
        tags_user: game.tags_user,
        tags_system: game.tags_system,
        status: game.status,
      }));
    }
    const db = await this.getDb();
    const games = db.collection<GameDoc>("games");
    const query: Filter<GameDoc> = { status: "published" };
    if (tag) {
      query.$or = [{ tags_user: tag }, { tags_system: tag }];
    }
    const results = await games.find(query).toArray();
    return results.map((game) => ({
      id: game._id,
      title: game.title,
      cover_url: game.cover_url,
      tags_user: game.tags_user ?? [],
      tags_system: game.tags_system ?? [],
      status: game.status,
    }));
  }

  @Get("/games/:id")
  async getGame(@Param("id") id: string, @Headers() headers?: Record<string, string>) {
    const isAdmin = Boolean(this.getAdminToken(headers));
    if (this.useMemory) {
      const game = this.memoryGames.find((item) => item.id === id);
      if (!game) {
        throw new NotFoundException("Game not found");
      }
      if (game.status !== "published" && !isAdmin) {
        throw new NotFoundException("Game not available");
      }
      return {
        id: game.id,
        title: game.title,
        description_md: game.description_md,
        repo_url: game.repo_url,
        cover_url: game.cover_url,
        status: game.status,
        tags_user: game.tags_user,
        tags_system: game.tags_system,
        build_url: game.build_url,
        build_id: game.currentBuildId,
        csp: AppController.cspPolicy,
      };
    }
    const db = await this.getDb();
    const games = db.collection<GameDoc>("games");
    const game = await games.findOne({ _id: id });
    if (!game) {
      throw new NotFoundException("Game not found");
    }
    if (game.status !== "published" && !isAdmin) {
      throw new NotFoundException("Game not available");
    }
    return {
      id: game._id,
      title: game.title ?? "",
      description_md: game.description_md,
      repo_url: game.repo_url,
      cover_url: game.cover_url,
      status: game.status,
      tags_user: game.tags_user ?? [],
      tags_system: game.tags_system ?? [],
      build_url: game.build_url ?? null,
      build_id: game.currentBuildId ?? null,
      csp: AppController.cspPolicy,
    };
  }

  @Post("/admin/teams")
  async createTeam(@Body() body: { name: string }, @Headers() headers?: Record<string, string>) {
    this.assertAdmin(headers);
    if (this.useMemory) {
      const team = { id: randomUUID(), name: body.name, members: [] as string[] };
      this.memoryTeams.push(team);
      return team;
    }
    const db = await this.getDb();
    const teams = db.collection<TeamDoc>("teams");
    const team: TeamDoc = { _id: randomUUID(), name: body.name, members: [] };
    await teams.insertOne(team);
    return team;
  }

  @Post("/admin/games")
  async createGame(
    @Body()
    body: { teamId: string; title: string; description_md: string; repo_url: string; cover_url: string },
    @Headers() headers?: Record<string, string>
  ) {
    this.assertAdmin(headers);
    if (this.useMemory) {
      const game = {
        id: randomUUID(),
        teamId: body.teamId,
        title: body.title,
        description_md: body.description_md,
        repo_url: body.repo_url,
        cover_url: body.cover_url,
        status: "editing" as const,
        tags_user: [] as string[],
        tags_system: [] as string[],
        currentBuildId: null,
        build_url: null,
        adminRemark: null,
      };
      this.memoryGames.push(game);
      return game;
    }
    const db = await this.getDb();
    const games = db.collection<GameDoc>("games");
    const game: GameDoc = {
      _id: randomUUID(),
      teamId: body.teamId,
      title: body.title,
      description_md: body.description_md,
      repo_url: body.repo_url,
      cover_url: body.cover_url,
      status: "editing",
      tags_user: [] as string[],
      tags_system: [] as string[],
      currentBuildId: null,
      build_url: null,
      adminRemark: null,
    };
    await games.insertOne(game);
    return game;
  }

  @Post("/admin/games/:id/build")
  @UseInterceptors(FileInterceptor("file"))
  async uploadBuild(
    @Param("id") id: string,
    @UploadedFile() file: { originalname: string; buffer: Buffer },
    @Headers() headers?: Record<string, string>
  ) {
    this.assertAdmin(headers);
    if (!file?.buffer) {
      throw new BadRequestException("Missing ZIP file");
    }
    const maxSizeBytes = await this.getMaxBuildSizeBytes();
    if (file.buffer.length > maxSizeBytes) {
      throw new BadRequestException("Build exceeds max size");
    }
    if (this.useMemory) {
      const game = this.memoryGames.find((item) => item.id === id);
      if (!game) {
        throw new NotFoundException("Game not found");
      }
      const buildId = randomUUID();
      const buildUrl = `${this.s3PublicUrl}/${this.s3Bucket}/builds/${buildId}/index.html`;
      this.memoryBuilds.push({ id: buildId, gameId: id, url: buildUrl });
      game.currentBuildId = buildId;
      game.build_url = buildUrl;
      return { build_id: buildId, build_url: buildUrl };
    }
    const db = await this.getDb();
    const games = db.collection<GameDoc>("games");
    const builds = db.collection<BuildDoc>("builds");
    const game = await games.findOne({ _id: id });
    if (!game) {
      throw new NotFoundException("Game not found");
    }
    const directory = await unzipper.Open.buffer(file.buffer);
    const entries = (directory.files as ZipEntry[]).filter((entry) => entry.type === "File");
    const hasIndex = entries.some((entry) => entry.path === "index.html");
    if (!hasIndex) {
      throw new BadRequestException("ZIP must include index.html at root");
    }
    const buildId = randomUUID();
    const baseKey = `builds/${buildId}/`;
    await Promise.all(
      entries.map(async (entry) => {
        const buffer = await entry.buffer();
        const contentType = lookupMime(entry.path) || "application/octet-stream";
        const key = `${baseKey}${entry.path}`;
        await this.s3Client.send(
          new PutObjectCommand({
            Bucket: this.s3Bucket,
            Key: key,
            Body: buffer,
            ContentType: contentType.toString(),
          })
        );
      })
    );
    const buildUrl = `${this.s3PublicUrl}/${this.s3Bucket}/${baseKey}index.html`;
    const buildRecord: BuildDoc = {
      _id: buildId,
      gameId: id,
      s3_key: baseKey,
      storage_url: buildUrl,
      createdAt: new Date().toISOString(),
      sizeBytes: file.buffer.length,
    };
    await builds.insertOne(buildRecord);
    await games.updateOne(
      { _id: id },
      { $set: { currentBuildId: buildId, build_url: buildUrl } }
    );
    return { build_id: buildId, build_url: buildUrl };
  }

  @Post("/admin/games/:id/publish")
  async publishGame(@Param("id") id: string, @Headers() headers?: Record<string, string>) {
    this.assertAdmin(headers);
    if (this.useMemory) {
      const game = this.memoryGames.find((item) => item.id === id);
      if (!game) {
        throw new NotFoundException("Game not found");
      }
      if (!game.cover_url || !game.description_md || !game.build_url) {
        throw new BadRequestException("Missing required publish fields");
      }
      game.status = "published";
      return { status: game.status };
    }
    const db = await this.getDb();
    const games = db.collection<GameDoc>("games");
    const game = await games.findOne({ _id: id });
    if (!game) {
      throw new NotFoundException("Game not found");
    }
    if (!game.cover_url || !game.description_md || !game.build_url) {
      throw new BadRequestException("Missing required publish fields");
    }
    await games.updateOne({ _id: id }, { $set: { status: "published" } });
    return { status: "published" };
  }

  @Post("/admin/games/:id/status")
  async updateStatus(
    @Param("id") id: string,
    @Body() body: { status: string; remark?: string },
    @Headers() headers?: Record<string, string>
  ) {
    this.assertAdmin(headers);
    const allowedStatuses = ["editing", "published", "archived"];
    if (!allowedStatuses.includes(body.status)) {
      throw new BadRequestException("Invalid status");
    }
    if (this.useMemory) {
      const game = this.memoryGames.find((item) => item.id === id);
      if (!game) {
        throw new NotFoundException("Game not found");
      }
      if (game.status === "published" && body.status === "editing" && !body.remark?.trim()) {
        throw new BadRequestException("Remark required");
      }
      game.status = body.status as "editing" | "published" | "archived";
      game.adminRemark = body.remark ?? null;
      return { status: game.status, remark: game.adminRemark };
    }
    const db = await this.getDb();
    const games = db.collection<GameDoc>("games");
    const game = await games.findOne({ _id: id });
    if (!game) {
      throw new NotFoundException("Game not found");
    }
    if (game.status === "published" && body.status === "editing" && !body.remark?.trim()) {
      throw new BadRequestException("Remark required");
    }
    const status = body.status as "editing" | "published" | "archived";
    const remark = body.remark ?? null;
    await games.updateOne({ _id: id }, { $set: { status, adminRemark: remark } });
    return { status, remark };
  }

  @Post("/admin/games/:id/tags")
  async updateTags(
    @Param("id") id: string,
    @Body() body: { tags_user?: string[]; tags_system?: string[] },
    @Headers() headers?: Record<string, string>
  ) {
    this.assertAdmin(headers);
    if (this.useMemory) {
      const game = this.memoryGames.find((item) => item.id === id);
      if (!game) {
        throw new NotFoundException("Game not found");
      }
      game.tags_user = body.tags_user ?? game.tags_user;
      game.tags_system = body.tags_system ?? game.tags_system;
      return { tags_user: game.tags_user, tags_system: game.tags_system };
    }
    const db = await this.getDb();
    const games = db.collection<GameDoc>("games");
    const game = await games.findOne({ _id: id });
    if (!game) {
      throw new NotFoundException("Game not found");
    }
    const tags_user = body.tags_user ?? game.tags_user ?? [];
    const tags_system = body.tags_system ?? game.tags_system ?? [];
    await games.updateOne({ _id: id }, { $set: { tags_user, tags_system } });
    return { tags_user, tags_system };
  }

  @Patch("/admin/settings/build-limits")
  async updateBuildLimit(
    @Body() body: { maxBuildSizeBytes: number },
    @Headers() headers?: Record<string, string>
  ) {
    this.assertAdmin(headers);
    if (!body?.maxBuildSizeBytes || body.maxBuildSizeBytes < 1) {
      throw new BadRequestException("Invalid build size");
    }
    if (this.useMemory) {
      this.memoryConfig.maxBuildSizeBytes = body.maxBuildSizeBytes;
      return { maxBuildSizeBytes: this.memoryConfig.maxBuildSizeBytes };
    }
    const db = await this.getDb();
    const config = db.collection<{ key: string; value: number }>("config");
    await config.updateOne(
      { key: "maxBuildSizeBytes" },
      { $set: { value: body.maxBuildSizeBytes } },
      { upsert: true }
    );
    return { maxBuildSizeBytes: body.maxBuildSizeBytes };
  }
}
