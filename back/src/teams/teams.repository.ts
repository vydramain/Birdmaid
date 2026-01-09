import { MongoClient } from "mongodb";
import { randomUUID } from "crypto";

export type TeamDoc = {
  _id: string;
  name: string;
  leader: string; // userId
  members: string[]; // userId[]
  createdAt: Date;
};

export class TeamsRepository {
  private mongoClient: MongoClient;
  private dbPromise: Promise<ReturnType<MongoClient["db"]>> | null = null;
  private useMemory = process.env.NODE_ENV === "test";
  private memoryTeams: TeamDoc[] = [];

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

  async create(name: string, leaderId: string): Promise<TeamDoc> {
    const team: TeamDoc = {
      _id: randomUUID(),
      name,
      leader: leaderId,
      members: [leaderId],
      createdAt: new Date(),
    };

    if (this.useMemory) {
      this.memoryTeams.push(team);
      return team;
    }

    const db = await this.getDb();
    if (!db) throw new Error("DB not available");
    const teams = db.collection<TeamDoc>("teams");
    await teams.insertOne(team);
    return team;
  }

  async findById(id: string): Promise<TeamDoc | null> {
    if (this.useMemory) {
      return this.memoryTeams.find((t) => t._id === id) || null;
    }
    const db = await this.getDb();
    if (!db) return null;
    const teams = db.collection<TeamDoc>("teams");
    return teams.findOne({ _id: id });
  }

  async findAll(): Promise<TeamDoc[]> {
    if (this.useMemory) {
      return [...this.memoryTeams];
    }
    const db = await this.getDb();
    if (!db) return [];
    const teams = db.collection<TeamDoc>("teams");
    return teams.find({}).toArray();
  }

  async addMember(teamId: string, userId: string): Promise<TeamDoc> {
    if (this.useMemory) {
      const team = this.memoryTeams.find((t) => t._id === teamId);
      if (!team) throw new Error("Team not found");
      if (!team.members.includes(userId)) {
        team.members.push(userId);
      }
      return team;
    }

    const db = await this.getDb();
    if (!db) throw new Error("DB not available");
    const teams = db.collection<TeamDoc>("teams");
    await teams.updateOne({ _id: teamId }, { $addToSet: { members: userId } });
    const team = await teams.findOne({ _id: teamId });
    if (!team) throw new Error("Team not found");
    return team;
  }

  async removeMember(teamId: string, userId: string): Promise<TeamDoc> {
    if (this.useMemory) {
      const team = this.memoryTeams.find((t) => t._id === teamId);
      if (!team) throw new Error("Team not found");
      team.members = team.members.filter((id) => id !== userId);
      return team;
    }

    const db = await this.getDb();
    if (!db) throw new Error("DB not available");
    const teams = db.collection<TeamDoc>("teams");
    await teams.updateOne({ _id: teamId }, { $pull: { members: userId } });
    const team = await teams.findOne({ _id: teamId });
    if (!team) throw new Error("Team not found");
    return team;
  }

  async updateLeader(teamId: string, newLeaderId: string): Promise<TeamDoc> {
    if (this.useMemory) {
      const team = this.memoryTeams.find((t) => t._id === teamId);
      if (!team) throw new Error("Team not found");
      team.leader = newLeaderId;
      return team;
    }

    const db = await this.getDb();
    if (!db) throw new Error("DB not available");
    const teams = db.collection<TeamDoc>("teams");
    await teams.updateOne({ _id: teamId }, { $set: { leader: newLeaderId } });
    const team = await teams.findOne({ _id: teamId });
    if (!team) throw new Error("Team not found");
    return team;
  }

  async updateName(teamId: string, name: string): Promise<TeamDoc> {
    if (this.useMemory) {
      const team = this.memoryTeams.find((t) => t._id === teamId);
      if (!team) throw new Error("Team not found");
      team.name = name;
      return team;
    }

    const db = await this.getDb();
    if (!db) throw new Error("DB not available");
    const teams = db.collection<TeamDoc>("teams");
    await teams.updateOne({ _id: teamId }, { $set: { name } });
    const team = await teams.findOne({ _id: teamId });
    if (!team) throw new Error("Team not found");
    return team;
  }
}

