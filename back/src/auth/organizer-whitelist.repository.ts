import { MongoClient } from "mongodb";

export type OrganizerWhitelistDoc = {
  _id: string;
  telegramId: string; // Telegram numeric ID
  role: 'Organizer'; // Always Organizer for whitelist
  createdAt: Date;
  updatedAt: Date;
};

export class OrganizerWhitelistRepository {
  private mongoClient: MongoClient;
  private dbPromise: Promise<ReturnType<MongoClient["db"]>> | null = null;
  private useMemory = process.env.NODE_ENV === "test";
  private memoryWhitelist: OrganizerWhitelistDoc[] = [];

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

  /**
   * Check if telegramId is in whitelist
   */
  async isOrganizer(telegramId: string): Promise<boolean> {
    if (this.useMemory) {
      return this.memoryWhitelist.some((w) => w.telegramId === telegramId);
    }
    const db = await this.getDb();
    if (!db) return false;
    const whitelist = db.collection<OrganizerWhitelistDoc>("organizerWhitelist");
    const doc = await whitelist.findOne({ telegramId });
    return doc !== null;
  }

  /**
   * Add telegramId to whitelist (admin operation)
   */
  async add(telegramId: string): Promise<OrganizerWhitelistDoc> {
    const now = new Date();
    const doc: OrganizerWhitelistDoc = {
      _id: `${telegramId}-${Date.now()}`,
      telegramId,
      role: 'Organizer',
      createdAt: now,
      updatedAt: now,
    };

    if (this.useMemory) {
      this.memoryWhitelist.push(doc);
      return doc;
    }

    const db = await this.getDb();
    if (!db) throw new Error("DB not available");
    const whitelist = db.collection<OrganizerWhitelistDoc>("organizerWhitelist");
    await whitelist.insertOne(doc);
    return doc;
  }

  /**
   * Remove telegramId from whitelist (admin operation)
   */
  async remove(telegramId: string): Promise<void> {
    if (this.useMemory) {
      this.memoryWhitelist = this.memoryWhitelist.filter((w) => w.telegramId !== telegramId);
      return;
    }

    const db = await this.getDb();
    if (!db) throw new Error("DB not available");
    const whitelist = db.collection<OrganizerWhitelistDoc>("organizerWhitelist");
    await whitelist.deleteOne({ telegramId });
  }
}
