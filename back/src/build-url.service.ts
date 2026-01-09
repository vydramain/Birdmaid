import { Injectable } from "@nestjs/common";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

@Injectable()
export class BuildUrlService {
  private s3Client: S3Client; // For internal operations (write)
  private s3SigningClient: S3Client; // For signing URLs with public endpoint
  private s3Bucket: string;
  private s3PublicUrl: string;

  constructor() {
    const s3Endpoint = process.env.S3_ENDPOINT ?? "http://localhost:9000";
    const s3PublicUrl = process.env.S3_PUBLIC_URL ?? "http://localhost:9000";
    
    // Client for internal operations (uses internal endpoint)
    this.s3Client = new S3Client({
      region: "us-east-1",
      endpoint: s3Endpoint,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY ?? "minioadmin",
        secretAccessKey: process.env.S3_SECRET_KEY ?? "minioadmin",
      },
      forcePathStyle: true,
    });
    
    // Client for signing URLs (uses public endpoint so signed URLs work from browser)
    this.s3SigningClient = new S3Client({
      region: "us-east-1",
      endpoint: s3PublicUrl,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY ?? "minioadmin",
        secretAccessKey: process.env.S3_SECRET_KEY ?? "minioadmin",
      },
      forcePathStyle: true,
    });
    
    this.s3Bucket = process.env.S3_BUCKET ?? "birdmaid-builds";
    this.s3PublicUrl = s3PublicUrl;
  }

  /**
   * Generates a signed URL for a build or cover image if the URL points to S3.
   * If URL is null or doesn't point to S3, returns null.
   * @param url The stored URL from database (build_url or cover_url)
   * @param expiresIn Expiration time in seconds (default: 1 hour)
   * @param customPublicUrl Optional custom public URL (e.g., from request hostname)
   * @returns Signed URL or null
   */
  async getSignedBuildUrl(url: string | null, expiresIn: number = 3600, customPublicUrl?: string): Promise<string | null> {
    if (!url) {
      return null;
    }

    // Use custom public URL if provided, otherwise use default
    const publicUrl = customPublicUrl || this.s3PublicUrl;

    // Check if URL points to our S3/MinIO
    // URL formats:
    // - http://localhost:9000/birdmaid-builds/builds/{buildId}/index.html
    // - http://localhost:9000/birdmaid-builds/covers/{coverId}.{ext}
    // - http://localhost:9000/birdmaid-builds/{anyPath}
    const escapedPublicUrl = this.s3PublicUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const escapedBucket = this.s3Bucket.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Match any path under the bucket
    const publicUrlPattern = new RegExp(`^${escapedPublicUrl}/${escapedBucket}/(.+)$`);
    const match = url.match(publicUrlPattern);
    
    if (!match) {
      // Not an S3 URL, return as-is (might be external URL)
      return url;
    }

    const s3Key = match[1];

    try {
      const command = new GetObjectCommand({
        Bucket: this.s3Bucket,
        Key: s3Key,
      });

      // Create a signing client with the custom public URL if provided
      let signingClient = this.s3SigningClient;
      if (customPublicUrl && customPublicUrl !== this.s3PublicUrl) {
        signingClient = new S3Client({
          region: "us-east-1",
          endpoint: customPublicUrl,
          credentials: {
            accessKeyId: process.env.S3_ACCESS_KEY ?? "minioadmin",
            secretAccessKey: process.env.S3_SECRET_KEY ?? "minioadmin",
          },
          forcePathStyle: true,
        });
      }

      // Use signing client with public endpoint so the signed URL works from browser
      // The signature will be calculated with the public hostname, so it will be valid
      const signedUrl = await getSignedUrl(signingClient, command, { expiresIn });
      
      return signedUrl;
    } catch (error) {
      console.error("Error generating signed URL:", error);
      // Fallback to original URL if signing fails
      return url;
    }
  }

  /**
   * Generates a signed URL directly from an S3 key (e.g., "covers/{coverId}.jpg")
   * @param s3Key The S3 key (path within bucket)
   * @param expiresIn Expiration time in seconds (default: 1 hour)
   * @param customPublicUrl Optional custom public URL (e.g., from request hostname)
   * @returns Signed URL
   */
  async getSignedUrlFromKey(s3Key: string, expiresIn: number = 3600, customPublicUrl?: string): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.s3Bucket,
        Key: s3Key,
      });

      // Use custom public URL if provided
      const publicUrl = customPublicUrl || this.s3PublicUrl;

      // Create a signing client with the custom public URL if provided
      let signingClient = this.s3SigningClient;
      if (customPublicUrl && customPublicUrl !== this.s3PublicUrl) {
        console.log(`Creating S3 signing client with custom endpoint: ${customPublicUrl}`);
        signingClient = new S3Client({
          region: "us-east-1",
          endpoint: customPublicUrl,
          credentials: {
            accessKeyId: process.env.S3_ACCESS_KEY ?? "minioadmin",
            secretAccessKey: process.env.S3_SECRET_KEY ?? "minioadmin",
          },
          forcePathStyle: true,
        });
      }

      // Use signing client with public endpoint so the signed URL works from browser
      const signedUrl = await getSignedUrl(signingClient, command, { expiresIn });
      console.log(`[BuildUrlService] Generated signed URL for key ${s3Key}: ${signedUrl.substring(0, 150)}...`);
      console.log(`[BuildUrlService] Signed URL type: ${typeof signedUrl}, length: ${signedUrl.length}, starts with http: ${signedUrl.startsWith('http')}`);
      if (!signedUrl || typeof signedUrl !== 'string' || !signedUrl.startsWith('http')) {
        console.error(`[BuildUrlService] Invalid signed URL generated for key ${s3Key}: ${signedUrl}`);
        throw new Error(`Invalid signed URL generated: ${signedUrl}`);
      }
      return signedUrl;
    } catch (error) {
      console.error("[BuildUrlService] Error generating signed URL from key:", error, "s3Key:", s3Key, "customPublicUrl:", customPublicUrl);
      // Don't return fallback URL - it won't work without signature
      // Instead, throw error so controller can handle it
      throw new Error(`Failed to generate signed URL for key ${s3Key}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

