import { Injectable } from "@nestjs/common";
import { MongoClient } from "mongodb";

export type Help = {
  _id?: string;
  content: string;
  updatedAt?: Date;
};

@Injectable()
export class HelpRepository {
  private mongoClient: MongoClient;
  private dbPromise: Promise<ReturnType<MongoClient["db"]>> | null = null;
  private useMemory = process.env.NODE_ENV === "test";
  private memoryHelp: Help | null = null;

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

  async getContent(): Promise<{ content: string }> {
    const db = await this.getDb();

    if (this.useMemory || !db) {
      // Memory mode for tests
      if (this.memoryHelp) {
        return { content: this.memoryHelp.content };
      }
    } else {
      // Try to get from database first
      const collection = db.collection<Help>("help");
      const helpDoc = await collection.findOne({}, { sort: { updatedAt: -1 } });
      
      if (helpDoc) {
        return { content: helpDoc.content };
      }
    }

    // Fallback to default content
    return {
      content: `# HELP.TXT

Welcome to Birdmaid!

## Getting Started

1. Browse games in the catalog
2. Create a team to start publishing games
3. Upload your game builds and share them with the community

## Features

- **Desktop Workspace**: Navigate using icons and windows
- **Explorer**: Browse games organized by jams and teams
- **Comments**: Leave feedback on games
- **Teams**: Collaborate with other developers

For more information, visit the catalog or contact support.
`,
    };
  }
}
