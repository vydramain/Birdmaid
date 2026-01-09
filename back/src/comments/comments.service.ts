import { Injectable } from "@nestjs/common";
import { CommentsRepository } from "./comments.repository";

@Injectable()
export class CommentsService {
  constructor(private commentsRepo: CommentsRepository) {}

  async createComment(gameId: string, userId: string, text: string, userLogin: string) {
    return this.commentsRepo.create(gameId, userId, text, userLogin);
  }

  async getComments(gameId: string) {
    const comments = await this.commentsRepo.findByGameId(gameId);
    return {
      comments: comments.map((c) => ({
        id: c._id,
        text: c.text,
        userLogin: c.userLogin,
        userId: c.userId,
        createdAt: c.createdAt.toISOString(),
      })),
    };
  }
}

