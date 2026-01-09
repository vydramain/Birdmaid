import { MongoClient, Filter } from "mongodb";
import { randomUUID } from "crypto";

export type GameDoc = {
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
  adminRemark: { text: string; at: Date } | null;
};

export class GamesRepository {
  private mongoClient: MongoClient;
  private dbPromise: Promise<ReturnType<MongoClient["db"]>> | null = null;
  private useMemory = process.env.NODE_ENV === "test";
  private memoryGames: GameDoc[] = [];

  constructor() {
    this.mongoClient = new MongoClient(process.env.MONGO_URL ?? "mongodb://localhost:27017/birdmaid");
  }

  private async getDb() {
    if (this.useMemory) {
      return null;
    }
    if (!this.dbPromise) {
      this.dbPromise = this.mongoClient.connect().then((client) => client.db());
    }
    return this.dbPromise;
  }

  async create(game: Omit<GameDoc, "_id">): Promise<GameDoc> {
    const newGame: GameDoc = {
      _id: randomUUID(),
      ...game,
    };

    if (this.useMemory) {
      this.memoryGames.push(newGame);
      return newGame;
    }

    const db = await this.getDb();
    if (!db) throw new Error("DB not available");
    const games = db.collection<GameDoc>("games");
    await games.insertOne(newGame);
    return newGame;
  }

  async findById(id: string): Promise<GameDoc | null> {
    if (this.useMemory) {
      return this.memoryGames.find((g) => g._id === id) || null;
    }
    const db = await this.getDb();
    if (!db) return null;
    const games = db.collection<GameDoc>("games");
    return games.findOne({ _id: id });
  }

  async findPublished(): Promise<GameDoc[]> {
    if (this.useMemory) {
      return this.memoryGames.filter((g) => g.status === "published");
    }
    const db = await this.getDb();
    if (!db) return [];
    const games = db.collection<GameDoc>("games");
    return games.find({ status: "published" }).toArray();
  }

  async findByTeam(teamId: string): Promise<GameDoc[]> {
    if (this.useMemory) {
      return this.memoryGames.filter((g) => g.teamId === teamId);
    }
    const db = await this.getDb();
    if (!db) return [];
    const games = db.collection<GameDoc>("games");
    return games.find({ teamId }).toArray();
  }

  async update(id: string, updates: Partial<GameDoc>): Promise<GameDoc> {
    if (this.useMemory) {
      const game = this.memoryGames.find((g) => g._id === id);
      if (!game) throw new Error("Game not found");
      Object.assign(game, updates);
      return game;
    }

    const db = await this.getDb();
    if (!db) throw new Error("DB not available");
    const games = db.collection<GameDoc>("games");
    await games.updateOne({ _id: id }, { $set: updates });
    const game = await games.findOne({ _id: id });
    if (!game) throw new Error("Game not found");
    return game;
  }

  async find(query: Filter<GameDoc>): Promise<GameDoc[]> {
    if (this.useMemory) {
      // Simple in-memory filtering
      // If query is empty, return all games
      if (Object.keys(query).length === 0) {
        return [...this.memoryGames];
      }
      
      return this.memoryGames.filter((g) => {
        if (query.status && g.status !== query.status) return false;
        if (query.teamId && g.teamId !== query.teamId) return false;
        if (query.title) {
          const titleRegex = query.title as any;
          if (titleRegex.$regex) {
            const pattern = new RegExp(titleRegex.$regex, titleRegex.$options || "");
            if (!pattern.test(g.title)) return false;
          } else if (g.title !== query.title) return false;
        }
        if (query.$or) {
          const orConditions = query.$or as any[];
          const matches = orConditions.some((condition) => {
            if (condition.tags_user && !g.tags_user.includes(condition.tags_user)) return false;
            if (condition.tags_system && !g.tags_system.includes(condition.tags_system)) return false;
            if (condition.status && g.status !== condition.status) return false;
            if (condition.teamId) {
              if (condition.teamId.$in) {
                if (!condition.teamId.$in.includes(g.teamId)) return false;
              } else if (g.teamId !== condition.teamId) return false;
            }
            return true;
          });
          if (!matches) return false;
        }
        if (query.$and) {
          const andConditions = query.$and as any[];
          for (const condition of andConditions) {
            if (condition.$or) {
              const orMatches = condition.$or.some((orCond: any) => {
                if (orCond.status && g.status !== orCond.status) return false;
                if (orCond.teamId) {
                  if (orCond.teamId.$in) {
                    if (!orCond.teamId.$in.includes(g.teamId)) return false;
                  } else if (g.teamId !== orCond.teamId) return false;
                }
                return true;
              });
              if (!orMatches) return false;
            }
          }
        }
        return true;
      });
    }

    const db = await this.getDb();
    if (!db) return [];
    const games = db.collection<GameDoc>("games");
    return games.find(query).toArray();
  }
}

