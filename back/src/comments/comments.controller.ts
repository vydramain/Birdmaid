import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { CommentsService } from "./comments.service";
import { JwtAuthGuard } from "../auth/auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";

@Controller("games/:gameId/comments")
export class CommentsController {
  constructor(private commentsService: CommentsService) {}

  @Get()
  async getComments(@Param("gameId") gameId: string) {
    return this.commentsService.getComments(gameId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createComment(
    @Param("gameId") gameId: string,
    @Body() body: { text: string },
    @CurrentUser() user: any
  ) {
    const comment = await this.commentsService.createComment(gameId, user.userId, body.text, user.login);
    return {
      id: comment._id,
      text: comment.text,
      userLogin: comment.userLogin,
      userId: comment.userId,
      createdAt: comment.createdAt.toISOString(),
    };
  }
}

