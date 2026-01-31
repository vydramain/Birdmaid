import { Injectable, ForbiddenException, BadRequestException } from "@nestjs/common";
import { S3Service } from "./s3.service";
import { UserRole } from "../users/users.repository";

export interface ContentItem {
  name: string;
  type: 'file' | 'dir';
  contentType?: 'image' | 'video' | 'txt' | 'html' | 'webapp';
  path: string;
  size?: number;
  modified?: Date;
  children?: ContentItem[];
  s3Key?: string;
  metadata?: Record<string, any>;
}

// Root-level system folders (immutable)
const ROOT_LEVEL_SYSTEM_FOLDERS = ['Disk A', 'Disk B', 'Disk C'];

// System subfolders inside Disk C
const DISK_C_SYSTEM_FOLDERS = ['desktop', 'images', 'videos', 'documents'];

@Injectable()
export class VfsService {
  constructor(private s3Service: S3Service) {}

  /**
   * Check if path is a root-level system folder
   */
  private isRootLevelSystemFolder(path: string): boolean {
    // Normalize path: remove leading/trailing slashes
    const normalized = path.replace(/^\/+|\/+$/g, "");
    // Check if it's exactly one of the root-level system folders
    return ROOT_LEVEL_SYSTEM_FOLDERS.includes(normalized);
  }

  /**
   * Check if path is inside a root-level system folder (but not the folder itself)
   */
  private isInsideSystemFolder(path: string): boolean {
    const normalized = path.replace(/^\/+|\/+$/g, "");
    const parts = normalized.split("/");
    return parts.length > 0 && ROOT_LEVEL_SYSTEM_FOLDERS.includes(parts[0]);
  }

  /**
   * Check if operation would modify a root-level system folder
   */
  private checkSystemFolderImmutable(operation: string, path: string): void {
    if (this.isRootLevelSystemFolder(path)) {
      throw new ForbiddenException(
        `PermissionDenied: Cannot ${operation} root-level system folders (${path}). System folders are immutable.`
      );
    }
  }

  /**
   * Check RBAC permissions for write operations
   */
  private checkWritePermission(role: UserRole, operation: string): void {
    if (role !== 'Organizer') {
      throw new ForbiddenException(
        `PermissionDenied: ${operation} requires Organizer role. Current role: ${role}`
      );
    }
  }

  /**
   * Convert S3 path to VFS path
   * S3 keys are like "Disk C/desktop/file.txt"
   * VFS paths are like "/Disk C/desktop/file.txt"
   */
  private s3KeyToVfsPath(key: string): string {
    return "/" + key.replace(/\/$/, ""); // Remove trailing slash, add leading /
  }

  /**
   * Convert VFS path to S3 key
   * VFS paths are like "/Disk C/desktop/file.txt"
   * S3 keys are like "Disk C/desktop/file.txt"
   */
  private vfsPathToS3Key(path: string): string {
    return path.replace(/^\/+/, ""); // Remove leading slashes
  }

  /**
   * Get file extension from path
   */
  private getFileExtension(path: string): string {
    const parts = path.split(".");
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
  }

  /**
   * Determine content type from extension
   */
  private getContentType(path: string): 'image' | 'video' | 'txt' | 'html' | 'webapp' | undefined {
    const ext = this.getFileExtension(path);
    const imageExts = ['png', 'jpg', 'jpeg', 'gif', 'webp'];
    const videoExts = ['mp4', 'webm', 'ogg'];
    const txtExts = ['txt', 'md'];
    const htmlExts = ['html', 'htm'];
    const webappExts = ['app'];

    if (imageExts.includes(ext)) return 'image';
    if (videoExts.includes(ext)) return 'video';
    if (txtExts.includes(ext)) return 'txt';
    if (htmlExts.includes(ext)) return 'html';
    if (webappExts.includes(ext)) return 'webapp';
    return undefined;
  }

  /**
   * List items in a path
   */
  async list(path: string, role: UserRole): Promise<ContentItem[]> {
    // Normalize path: remove leading slash, ensure it doesn't end with slash (except root)
    const normalizedPath = path === "/" ? "" : path.replace(/^\/+|\/+$/g, "");
    const s3Prefix = normalizedPath ? normalizedPath + "/" : "";

    const s3Objects = await this.s3Service.list(s3Prefix);
    const items: ContentItem[] = [];

    for (const obj of s3Objects) {
      if (!obj.key) continue;

      const vfsPath = this.s3KeyToVfsPath(obj.key);
      const name = obj.isDirectory 
        ? obj.key.replace(s3Prefix, "").replace(/\/$/, "")
        : obj.key.replace(s3Prefix, "");

      if (name) {
        items.push({
          name,
          type: obj.isDirectory ? 'dir' : 'file',
          contentType: obj.isDirectory ? undefined : this.getContentType(name),
          path: vfsPath,
          size: obj.size,
          modified: obj.lastModified,
          s3Key: obj.key,
        });
      }
    }

    // If listing root, ensure system folders exist
    if (path === "/" || path === "") {
      // Add system folders if they don't exist in S3
      for (const folderName of ROOT_LEVEL_SYSTEM_FOLDERS) {
        if (!items.find(item => item.name === folderName)) {
          items.push({
            name: folderName,
            type: 'dir',
            path: `/${folderName}`,
            s3Key: `${folderName}/`,
          });
        }
      }
    }

    return items;
  }

  /**
   * Read file content
   */
  async read(key: string, role: UserRole): Promise<{ body: Buffer; contentType?: string; size?: number }> {
    const s3Key = this.vfsPathToS3Key(key);
    return this.s3Service.read(s3Key);
  }

  /**
   * Upload file
   * @param path - Directory path where file should be uploaded (e.g., "/Disk C/desktop")
   */
  async upload(path: string, file: Express.Multer.File, role: UserRole): Promise<ContentItem> {
    this.checkWritePermission(role, 'upload');
    
    // Normalize path: remove leading/trailing slashes
    const normalizedPath = path.replace(/^\/+|\/+$/g, "");
    
    // Check if path is a root-level system folder (not allowed to upload directly to it)
    if (this.isRootLevelSystemFolder(normalizedPath)) {
      throw new ForbiddenException(
        `PermissionDenied: Cannot upload to root-level system folder (${path}). Upload to a subfolder instead.`
      );
    }

    // Check if path is inside a system folder
    if (!this.isInsideSystemFolder(normalizedPath)) {
      throw new BadRequestException(
        `Invalid path: ${path}. Files must be uploaded inside system folders (Disk A, Disk B, Disk C).`
      );
    }

    // Construct S3 key: path + filename
    const s3Key = normalizedPath ? `${normalizedPath}/${file.originalname}` : file.originalname;
    await this.s3Service.upload(s3Key, file.buffer, file.mimetype);

    return {
      name: file.originalname,
      type: 'file',
      contentType: this.getContentType(file.originalname),
      path: this.s3KeyToVfsPath(s3Key),
      size: file.size,
      modified: new Date(),
      s3Key,
    };
  }

  /**
   * Move item
   */
  async move(oldPath: string, newPath: string, role: UserRole): Promise<void> {
    this.checkWritePermission(role, 'move');
    this.checkSystemFolderImmutable('move', oldPath);
    this.checkSystemFolderImmutable('move', newPath);

    if (!this.isInsideSystemFolder(oldPath) || !this.isInsideSystemFolder(newPath)) {
      throw new BadRequestException(
        `Invalid paths: items must be inside system folders (Disk A, Disk B, Disk C).`
      );
    }

    const oldS3Key = this.vfsPathToS3Key(oldPath);
    const newS3Key = this.vfsPathToS3Key(newPath);

    await this.s3Service.move(oldS3Key, newS3Key);
  }

  /**
   * Delete item
   */
  async delete(path: string, role: UserRole): Promise<void> {
    this.checkWritePermission(role, 'delete');
    this.checkSystemFolderImmutable('delete', path);

    if (!this.isInsideSystemFolder(path)) {
      throw new BadRequestException(
        `Invalid path: ${path}. Items must be inside system folders (Disk A, Disk B, Disk C).`
      );
    }

    const s3Key = this.vfsPathToS3Key(path);
    await this.s3Service.delete(s3Key);
  }
}
