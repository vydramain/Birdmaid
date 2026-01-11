import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
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

  // Removed @Get("/games") - now handled by GamesController with signed URLs

  @Get("/games-legacy/:id")
  async getGameLegacy(@Param("id") id: string, @Query("admin") admin?: string) {
    if (this.useMemory) {
      const game = this.memoryGames.find((item) => item.id === id);
      if (!game) {
        throw new NotFoundException("Game not found");
      }
      if (game.status !== "published" && admin !== "true") {
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
      };
    }
    const db = await this.getDb();
    const games = db.collection<GameDoc>("games");
    const game = await games.findOne({ _id: id });
    if (!game) {
      throw new NotFoundException("Game not found");
    }
    if (game.status !== "published" && admin !== "true") {
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
    };
  }

  @Post("/admin/teams")
  async createTeamLegacy(@Body() body: { name: string }) {
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
    body: { teamId: string; title: string; description_md: string; repo_url: string; cover_url: string }
  ) {
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
  async uploadBuild(@Param("id") id: string, @UploadedFile() file: { originalname: string; buffer: Buffer }) {
    if (!file?.buffer) {
      throw new BadRequestException("Missing ZIP file");
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
  async publishGameLegacy(@Param("id") id: string) {
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

  @Post("/admin/games/:id/status-legacy")
  async updateStatusLegacy(@Param("id") id: string, @Body() body: { status: string; remark?: string }) {
    if (this.useMemory) {
      const game = this.memoryGames.find((item) => item.id === id);
      if (!game) {
        throw new NotFoundException("Game not found");
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
    const status = body.status as "editing" | "published" | "archived";
    const remark = body.remark ?? null;
    await games.updateOne({ _id: id }, { $set: { status, adminRemark: remark } });
    return { status, remark };
  }

  @Post("/admin/games/:id/tags-legacy")
  async updateTagsLegacy(
    @Param("id") id: string,
    @Body() body: { tags_user?: string[]; tags_system?: string[] }
  ) {
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
}
