import { MongoClient } from "mongodb";
import { randomUUID } from "crypto";

export type UserDoc = {
  _id: string;
  email: string;
  login: string;
  password: string; // hashed
  isSuperAdmin: boolean;
  recoveryCode?: { code: string; createdAt: Date };
  createdAt: Date;
  updatedAt: Date;
};

export class UsersRepository {
  private mongoClient: MongoClient;
  private dbPromise: Promise<ReturnType<MongoClient["db"]>> | null = null;
  private useMemory = process.env.NODE_ENV === "test";
  private memoryUsers: UserDoc[] = [];

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

  async findByEmail(email: string): Promise<UserDoc | null> {
    if (this.useMemory) {
      return this.memoryUsers.find((u) => u.email === email) || null;
    }
    const db = await this.getDb();
    if (!db) return null;
    const users = db.collection<UserDoc>("users");
    return users.findOne({ email });
  }

  async findByLogin(login: string): Promise<UserDoc | null> {
    if (this.useMemory) {
      return this.memoryUsers.find((u) => u.login === login) || null;
    }
    const db = await this.getDb();
    if (!db) return null;
    const users = db.collection<UserDoc>("users");
    return users.findOne({ login });
  }

  async findByEmailOrLogin(identifier: string): Promise<UserDoc | null> {
    if (this.useMemory) {
      return this.memoryUsers.find((u) => u.email === identifier || u.login === identifier) || null;
    }
    const db = await this.getDb();
    if (!db) return null;
    const users = db.collection<UserDoc>("users");
    return users.findOne({ $or: [{ email: identifier }, { login: identifier }] });
  }

  async create(user: Omit<UserDoc, "_id" | "createdAt" | "updatedAt">): Promise<UserDoc> {
    const now = new Date();
    const newUser: UserDoc = {
      _id: randomUUID(),
      ...user,
      createdAt: now,
      updatedAt: now,
    };

    if (this.useMemory) {
      this.memoryUsers.push(newUser);
      return newUser;
    }

    const db = await this.getDb();
    if (!db) throw new Error("DB not available");
    const users = db.collection<UserDoc>("users");
    await users.insertOne(newUser);
    return newUser;
  }

  async updateRecoveryCode(email: string, code: string): Promise<void> {
    if (this.useMemory) {
      const user = this.memoryUsers.find((u) => u.email === email);
      if (user) {
        user.recoveryCode = { code, createdAt: new Date() };
        user.updatedAt = new Date();
      }
      return;
    }

    const db = await this.getDb();
    if (!db) throw new Error("DB not available");
    const users = db.collection<UserDoc>("users");
    await users.updateOne(
      { email },
      { $set: { recoveryCode: { code, createdAt: new Date() }, updatedAt: new Date() } }
    );
  }

  async getRecoveryCode(email: string): Promise<string | null> {
    if (this.useMemory) {
      const user = this.memoryUsers.find((u) => u.email === email);
      return user?.recoveryCode?.code || null;
    }

    const db = await this.getDb();
    if (!db) return null;
    const users = db.collection<UserDoc>("users");
    const user = await users.findOne({ email }, { projection: { recoveryCode: 1 } });
    return user?.recoveryCode?.code || null;
  }

  async updatePassword(email: string, hashedPassword: string): Promise<void> {
    if (this.useMemory) {
      const user = this.memoryUsers.find((u) => u.email === email);
      if (user) {
        user.password = hashedPassword;
        user.recoveryCode = undefined;
        user.updatedAt = new Date();
      }
      return;
    }

    const db = await this.getDb();
    if (!db) throw new Error("DB not available");
    const users = db.collection<UserDoc>("users");
    await users.updateOne(
      { email },
      { $set: { password: hashedPassword, recoveryCode: undefined, updatedAt: new Date() } }
    );
  }

  async findById(id: string): Promise<UserDoc | null> {
    if (this.useMemory) {
      return this.memoryUsers.find((u) => u._id === id) || null;
    }
    const db = await this.getDb();
    if (!db) return null;
    const users = db.collection<UserDoc>("users");
    return users.findOne({ _id: id });
  }

  async searchByLogin(loginQuery: string, limit: number = 20): Promise<UserDoc[]> {
    if (this.useMemory) {
      const queryLower = loginQuery.toLowerCase();
      return this.memoryUsers
        .filter((u) => u.login.toLowerCase().includes(queryLower))
        .slice(0, limit);
    }
    const db = await this.getDb();
    if (!db) return [];
    const users = db.collection<UserDoc>("users");
    return users
      .find({
        login: { $regex: loginQuery, $options: "i" },
      })
      .limit(limit)
      .toArray();
  }
}

