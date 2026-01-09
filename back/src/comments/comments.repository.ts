import { MongoClient } from "mongodb";
import { randomUUID } from "crypto";

export type CommentDoc = {
  _id: string;
  gameId: string;
  userId: string;
  text: string;
  userLogin: string; // denormalized
  createdAt: Date;
};

export class CommentsRepository {
  private mongoClient: MongoClient;
  private dbPromise: Promise<ReturnType<MongoClient["db"]>> | null = null;
  private useMemory = process.env.NODE_ENV === "test";
  private memoryComments: CommentDoc[] = [];

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

  async create(gameId: string, userId: string, text: string, userLogin: string): Promise<CommentDoc> {
    const comment: CommentDoc = {
      _id: randomUUID(),
      gameId,
      userId,
      text,
      userLogin,
      createdAt: new Date(),
    };

    if (this.useMemory) {
      this.memoryComments.push(comment);
      return comment;
    }

    const db = await this.getDb();
    if (!db) throw new Error("DB not available");
    const comments = db.collection<CommentDoc>("comments");
    await comments.insertOne(comment);
    return comment;
  }

  async findByGameId(gameId: string): Promise<CommentDoc[]> {
    if (this.useMemory) {
      return this.memoryComments.filter((c) => c.gameId === gameId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    const db = await this.getDb();
    if (!db) return [];
    const comments = db.collection<CommentDoc>("comments");
    return comments.find({ gameId }).sort({ createdAt: -1 }).toArray();
  }
}

