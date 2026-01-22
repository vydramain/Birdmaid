import { Injectable } from "@nestjs/common";
import { MongoClient } from "mongodb";

export type Jam = {
  _id?: string;
  name: string;
  startDate: Date;
  endDate: Date;
  description_md?: string;
  registrationUrl?: string;
  createdAt?: Date;
};

@Injectable()
export class JamRepository {
  private mongoClient: MongoClient;
  private dbPromise: Promise<ReturnType<MongoClient["db"]>> | null = null;
  private useMemory = process.env.NODE_ENV === "test";
  private memoryJams: Jam[] = [];

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

  async findCurrentOrNearest(): Promise<Jam | null> {
    const now = new Date();
    const db = await this.getDb();

    if (this.useMemory || !db) {
      // Memory mode for tests
      const current = this.memoryJams.find(
        (j) => j.startDate <= now && j.endDate >= now
      );
      if (current) return current;

      const nearest = this.memoryJams
        .filter((j) => j.startDate > now)
        .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())[0];
      return nearest || null;
    }

    const collection = db.collection<Jam>("jams");

    // Find current jam (startDate <= now <= endDate)
    const currentJam = await collection.findOne({
      startDate: { $lte: now },
      endDate: { $gte: now },
    }, {
      sort: { startDate: 1 },
    });

    if (currentJam) {
      return currentJam;
    }

    // Find nearest upcoming jam (startDate > now)
    const nearestJam = await collection.findOne({
      startDate: { $gt: now },
    }, {
      sort: { startDate: 1 },
    });

    return nearestJam || null;
  }
}
