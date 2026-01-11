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
    const s3PublicUrl = process.env.S3_PUBLIC_URL ?? process.env.S3_PUBLIC_BASE_URL ?? "http://localhost:9000";
    const s3Region = process.env.S3_REGION ?? "us-east-1";
    const s3ForcePathStyle = process.env.S3_FORCE_PATH_STYLE === "true" || process.env.S3_FORCE_PATH_STYLE === undefined;
    const s3AccessKey = process.env.S3_ACCESS_KEY_ID ?? process.env.S3_ACCESS_KEY ?? "minioadmin";
    const s3SecretKey = process.env.S3_SECRET_ACCESS_KEY ?? process.env.S3_SECRET_KEY ?? "minioadmin";
    
    // Log S3 configuration for debugging
    console.log(`[BuildUrlService] S3 configuration:`);
    console.log(`  S3_ENDPOINT: ${s3Endpoint}`);
    console.log(`  S3_PUBLIC_URL: ${process.env.S3_PUBLIC_URL ?? 'not set'}`);
    console.log(`  S3_PUBLIC_BASE_URL: ${process.env.S3_PUBLIC_BASE_URL ?? 'not set'}`);
    console.log(`  Final s3PublicUrl: ${s3PublicUrl}`);
    console.log(`  S3_REGION: ${s3Region}`);
    console.log(`  S3_FORCE_PATH_STYLE: ${s3ForcePathStyle}`);
    
    // Client for internal operations (uses internal endpoint)
    this.s3Client = new S3Client({
      region: s3Region,
      endpoint: s3Endpoint,
      credentials: {
        accessKeyId: s3AccessKey,
        secretAccessKey: s3SecretKey,
      },
      forcePathStyle: s3ForcePathStyle,
    });
    
    // Client for signing URLs (uses public endpoint so signed URLs work from browser)
    // IMPORTANT: For Selectel and most S3-compatible services, use the SAME endpoint for signing
    // The signature must match the hostname that will be used to access the URL
    this.s3SigningClient = new S3Client({
      region: s3Region,
      endpoint: s3PublicUrl,
      credentials: {
        accessKeyId: s3AccessKey,
        secretAccessKey: s3SecretKey,
      },
      forcePathStyle: s3ForcePathStyle,
    });
    
    this.s3Bucket = process.env.S3_BUCKET_ASSETS ?? process.env.S3_BUCKET ?? "birdmaid-builds";
    this.s3PublicUrl = s3PublicUrl;
    
    console.log(`[BuildUrlService] Initialized with bucket: ${this.s3Bucket}`);
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
        const s3Region = process.env.S3_REGION ?? "us-east-1";
        const s3ForcePathStyle = process.env.S3_FORCE_PATH_STYLE === "true" || process.env.S3_FORCE_PATH_STYLE === undefined;
        const s3AccessKey = process.env.S3_ACCESS_KEY_ID ?? process.env.S3_ACCESS_KEY ?? "minioadmin";
        const s3SecretKey = process.env.S3_SECRET_ACCESS_KEY ?? process.env.S3_SECRET_KEY ?? "minioadmin";
        signingClient = new S3Client({
          region: s3Region,
          endpoint: customPublicUrl,
          credentials: {
            accessKeyId: s3AccessKey,
            secretAccessKey: s3SecretKey,
          },
          forcePathStyle: s3ForcePathStyle,
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

      console.log(`[BuildUrlService] Generating signed URL:`);
      console.log(`  Bucket: ${this.s3Bucket}`);
      console.log(`  Key: ${s3Key}`);
      console.log(`  Public URL: ${publicUrl}`);
      console.log(`  Custom public URL: ${customPublicUrl ?? 'not provided'}`);
      console.log(`  Default s3PublicUrl: ${this.s3PublicUrl}`);

      // Create a signing client with the custom public URL if provided
      let signingClient = this.s3SigningClient;
      if (customPublicUrl && customPublicUrl !== this.s3PublicUrl) {
        console.log(`[BuildUrlService] Creating S3 signing client with custom endpoint: ${customPublicUrl}`);
        const s3Region = process.env.S3_REGION ?? "us-east-1";
        const s3ForcePathStyle = process.env.S3_FORCE_PATH_STYLE === "true" || process.env.S3_FORCE_PATH_STYLE === undefined;
        const s3AccessKey = process.env.S3_ACCESS_KEY_ID ?? process.env.S3_ACCESS_KEY ?? "minioadmin";
        const s3SecretKey = process.env.S3_SECRET_ACCESS_KEY ?? process.env.S3_SECRET_KEY ?? "minioadmin";
        signingClient = new S3Client({
          region: s3Region,
          endpoint: customPublicUrl,
          credentials: {
            accessKeyId: s3AccessKey,
            secretAccessKey: s3SecretKey,
          },
          forcePathStyle: s3ForcePathStyle,
        });
        console.log(`[BuildUrlService] Custom signing client created with endpoint: ${customPublicUrl}, region: ${s3Region}, forcePathStyle: ${s3ForcePathStyle}`);
      } else {
        console.log(`[BuildUrlService] Using default signing client with endpoint: ${this.s3PublicUrl}`);
      }

      // Use signing client with public endpoint so the signed URL works from browser
      // Log signing client configuration
      console.log(`[BuildUrlService] Signing client config:`);
      console.log(`  Endpoint: ${signingClient.config.endpoint}`);
      console.log(`  Region: ${signingClient.config.region}`);
      console.log(`  ForcePathStyle: ${signingClient.config.forcePathStyle}`);
      console.log(`  Command: GetObjectCommand({ Bucket: ${this.s3Bucket}, Key: ${s3Key} })`);
      
      const signedUrl = await getSignedUrl(signingClient, command, { expiresIn });
      console.log(`[BuildUrlService] Generated signed URL for key ${s3Key}: ${signedUrl.substring(0, 150)}...`);
      console.log(`[BuildUrlService] Full signed URL: ${signedUrl}`);
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

