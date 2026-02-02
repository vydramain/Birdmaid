import { Controller, Get, Post, Delete, Query, Param, Body, UseGuards, UseInterceptors, UploadedFile, BadRequestException, Res } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Response } from "express";
import { JwtAuthGuard } from "../auth/auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { VfsService } from "./vfs.service";
import { UserRole } from "../users/users.repository";

@Controller("vfs")
@UseGuards(JwtAuthGuard)
export class VfsController {
  constructor(private vfsService: VfsService) {}

  /**
   * Get user role from JWT payload
   */
  private getUserRole(user: any): UserRole {
    return user.role || 'Guest';
  }

  /**
   * List files and folders in a path
   * GET /api/vfs/list?path=/Disk C/desktop
   */
  @Get("list")
  async list(@Query("path") path: string = "/", @CurrentUser() user: any) {
    const role = this.getUserRole(user);
    return {
      items: await this.vfsService.list(path, role),
    };
  }

  /**
   * Read file content
   * GET /api/vfs/read?key=/Disk C/desktop/file.txt
   */
  @Get("read")
  async read(@Query("key") key: string, @CurrentUser() user: any, @Res() res: Response) {
    if (!key) {
      throw new BadRequestException("key parameter is required");
    }

    const role = this.getUserRole(user);
    const result = await this.vfsService.read(key, role);
    
    // Set content-type if available
    if (result.contentType) {
      res.setHeader('Content-Type', result.contentType);
    }
    
    // Return file content
    res.send(result.body);
  }

  /**
   * Upload file
   * POST /api/vfs/upload?path=/Disk C/desktop
   * Body: multipart/form-data with file
   */
  @Post("upload")
  @UseInterceptors(FileInterceptor("file"))
  async upload(
    @Query("path") path: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: any
  ) {
    if (!path) {
      throw new BadRequestException("path parameter is required");
    }

    if (!file) {
      throw new BadRequestException("file is required");
    }

    const role = this.getUserRole(user);
    const item = await this.vfsService.upload(path, file, role);

    return {
      key: item.s3Key,
      item,
    };
  }

  /**
   * Move item
   * POST /api/vfs/move
   * Body: { oldKey: string, newKey: string }
   */
  @Post("move")
  async move(
    @Body() body: { oldKey: string; newKey: string },
    @CurrentUser() user: any
  ) {
    if (!body.oldKey || !body.newKey) {
      throw new BadRequestException("oldKey and newKey are required");
    }

    const role = this.getUserRole(user);
    await this.vfsService.move(body.oldKey, body.newKey, role);

    return {
      success: true,
    };
  }

  /**
   * Delete item
   * DELETE /api/vfs/delete?key=/Disk C/desktop/file.txt
   */
  @Delete("delete")
  async delete(@Query("key") key: string, @CurrentUser() user: any) {
    if (!key) {
      throw new BadRequestException("key parameter is required");
    }

    const role = this.getUserRole(user);
    await this.vfsService.delete(key, role);

    return {
      success: true,
    };
  }
}
