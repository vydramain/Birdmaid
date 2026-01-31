import { Injectable } from "@nestjs/common";
import { S3Client, ListObjectsV2Command, GetObjectCommand, PutObjectCommand, CopyObjectCommand, DeleteObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";

export interface S3Object {
  key: string;
  size?: number;
  lastModified?: Date;
  isDirectory?: boolean;
}

@Injectable()
export class S3Service {
  private s3Client: S3Client;
  private bucket: string;

  constructor() {
    const s3Region = process.env.S3_REGION ?? "us-east-1";
    const s3ForcePathStyle = process.env.S3_FORCE_PATH_STYLE === "true" || process.env.S3_FORCE_PATH_STYLE === undefined;
    const s3AccessKey = process.env.S3_ACCESS_KEY_ID ?? process.env.S3_ACCESS_KEY ?? "minioadmin";
    const s3SecretKey = process.env.S3_SECRET_ACCESS_KEY ?? process.env.S3_SECRET_KEY ?? "minioadmin";
    
    this.s3Client = new S3Client({
      region: s3Region,
      endpoint: process.env.S3_ENDPOINT ?? "http://localhost:9000",
      credentials: {
        accessKeyId: s3AccessKey,
        secretAccessKey: s3SecretKey,
      },
      forcePathStyle: s3ForcePathStyle,
    });
    
    this.bucket = process.env.S3_BUCKET_VFS ?? process.env.S3_BUCKET ?? "birdmaid-vfs";
  }

  /**
   * List objects in a path (prefix)
   * Returns both files and "directories" (keys ending with /)
   */
  async list(prefix: string = ""): Promise<S3Object[]> {
    // Normalize prefix: ensure it doesn't start with /, but ends with / if not empty
    const normalizedPrefix = prefix ? prefix.replace(/^\//, "").replace(/\/$/, "") + "/" : "";
    
    const command = new ListObjectsV2Command({
      Bucket: this.bucket,
      Prefix: normalizedPrefix,
      Delimiter: "/",
    });

    try {
      const response = await this.s3Client.send(command);
      const items: S3Object[] = [];

      // Add "directories" (common prefixes)
      if (response.CommonPrefixes) {
        for (const prefix of response.CommonPrefixes) {
          if (prefix.Prefix) {
            // Remove the trailing / and normalize
            const dirName = prefix.Prefix.replace(normalizedPrefix, "").replace(/\/$/, "");
            items.push({
              key: prefix.Prefix,
              isDirectory: true,
            });
          }
        }
      }

      // Add files
      if (response.Contents) {
        for (const obj of response.Contents) {
          // Skip the "directory marker" itself (key equals prefix)
          if (obj.Key && obj.Key !== normalizedPrefix) {
            const fileName = obj.Key.replace(normalizedPrefix, "");
            items.push({
              key: obj.Key,
              size: obj.Size,
              lastModified: obj.LastModified,
              isDirectory: false,
            });
          }
        }
      }

      return items;
    } catch (error) {
      console.error(`[S3Service] Error listing prefix ${prefix}:`, error);
      throw error;
    }
  }

  /**
   * Read object content
   */
  async read(key: string): Promise<{ body: Buffer; contentType?: string; size?: number }> {
    const normalizedKey = key.replace(/^\//, "");
    
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: normalizedKey,
    });

    try {
      const response = await this.s3Client.send(command);
      const chunks: Uint8Array[] = [];
      
      if (response.Body) {
        for await (const chunk of response.Body as any) {
          chunks.push(chunk);
        }
      }

      const body = Buffer.concat(chunks);
      return {
        body,
        contentType: response.ContentType,
        size: response.ContentLength,
      };
    } catch (error) {
      console.error(`[S3Service] Error reading key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Upload object
   */
  async upload(key: string, body: Buffer, contentType?: string): Promise<void> {
    const normalizedKey = key.replace(/^\//, "");
    
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: normalizedKey,
      Body: body,
      ContentType: contentType,
    });

    try {
      await this.s3Client.send(command);
    } catch (error) {
      console.error(`[S3Service] Error uploading key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Move object (copy + delete)
   */
  async move(oldKey: string, newKey: string): Promise<void> {
    const normalizedOldKey = oldKey.replace(/^\//, "");
    const normalizedNewKey = newKey.replace(/^\//, "");
    
    // Copy object
    const copyCommand = new CopyObjectCommand({
      Bucket: this.bucket,
      CopySource: `${this.bucket}/${normalizedOldKey}`,
      Key: normalizedNewKey,
    });

    try {
      await this.s3Client.send(copyCommand);
      
      // Delete old object
      const deleteCommand = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: normalizedOldKey,
      });
      await this.s3Client.send(deleteCommand);
    } catch (error) {
      console.error(`[S3Service] Error moving ${oldKey} to ${newKey}:`, error);
      throw error;
    }
  }

  /**
   * Delete object
   */
  async delete(key: string): Promise<void> {
    const normalizedKey = key.replace(/^\//, "");
    
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: normalizedKey,
    });

    try {
      await this.s3Client.send(command);
    } catch (error) {
      console.error(`[S3Service] Error deleting key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Check if object exists
   */
  async exists(key: string): Promise<boolean> {
    const normalizedKey = key.replace(/^\//, "");
    
    const command = new HeadObjectCommand({
      Bucket: this.bucket,
      Key: normalizedKey,
    });

    try {
      await this.s3Client.send(command);
      return true;
    } catch (error: any) {
      if (error.name === "NotFound" || error.$metadata?.httpStatusCode === 404) {
        return false;
      }
      throw error;
    }
  }
}
