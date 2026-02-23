/**
 * FS service: roots, list, stat. S3/MinIO backend.
 */

import {
  ListObjectsV2Command,
  HeadObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
  CopyObjectCommand,
  S3Client,
  _Object,
  CommonPrefix,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { validatePath, toS3Prefix, toS3Key } from "./path.js";

const TTL_DEFAULT = 120;
const TTL_MIN = 60;
const TTL_MAX = 300;

// FP3: roots = DISK_A, DISK_C, DISK_D only. APPS deprecated.
const ROOTS: { id: string; label: string }[] = [
  { id: "DISK_A", label: "Floppy (A:)" },
  { id: "DISK_C", label: "(C:)" },
  { id: "DISK_D", label: "(D:)" },
];

const KNOWN_ROOT_IDS = ROOTS.map((r) => r.id);

const MIME_MAP: Record<string, string> = {
  ".txt": "text/plain",
  ".html": "text/html",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".css": "text/css",
  ".js": "application/javascript",
  ".mp3": "audio/mpeg",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
};

function inferMime(key: string, contentType?: string): string | null {
  if (contentType) return contentType;
  const ext = key.slice(key.lastIndexOf(".")).toLowerCase();
  return MIME_MAP[ext] ?? "application/octet-stream";
}

export function getRoots() {
  return { roots: ROOTS };
}

export async function listDir(
  s3: S3Client,
  bucket: string,
  rawPath: string
): Promise<
  | { ok: true; items: FsItem[] }
  | { ok: false; code: "BAD_PATH" | "ROOT_NOT_FOUND"; message: string }
  | { ok: false; code: "INTERNAL_ERROR"; message: string }
> {
  const v = validatePath(rawPath, KNOWN_ROOT_IDS, true);
  if (!v.ok) return { ok: false, code: v.code, message: v.message };

  const prefix = toS3Prefix(v.rootId, v.suffix);

  try {
    const out = await s3.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefix,
        Delimiter: "/",
      })
    );

    const items: FsItem[] = [];

    for (const cp of out.CommonPrefixes ?? []) {
      const p = (cp as CommonPrefix).Prefix ?? "";
      const name = p.slice(prefix.length, -1);
      if (!name) continue;
      const dirPath = `${v.path.replace(/\/$/, "")}/${name}/`;
      const isApp = await checkIsApp(s3, bucket, prefix + name + "/");
      items.push({
        path: dirPath,
        name,
        kind: "dir",
        isApp,
      });
    }

    for (const obj of out.Contents ?? []) {
      const key = (obj as _Object).Key ?? "";
      if (key === prefix || key.endsWith("/")) continue;
      const name = key.slice(prefix.length);
      const filePath = `${v.path.replace(/\/$/, "")}/${name}`;
      const size = (obj as _Object).Size ?? null;
      const modified = (obj as _Object).LastModified?.toISOString() ?? null;
      const mime = inferMime(name, undefined);
      items.push({
        path: filePath,
        name,
        kind: "file",
        size,
        modified,
        mime,
      });
    }

    items.sort((a, b) => {
      if (a.kind !== b.kind) return a.kind === "dir" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });

    return { ok: true, items };
  } catch (e) {
    return {
      ok: false,
      code: "INTERNAL_ERROR",
      message: (e as Error).message,
    };
  }
}

async function checkIsApp(s3: S3Client, bucket: string, dirPrefix: string): Promise<boolean> {
  try {
    await s3.send(
      new HeadObjectCommand({
        Bucket: bucket,
        Key: dirPrefix + "index.html",
      })
    );
    return true;
  } catch {
    return false;
  }
}

export async function statItem(
  s3: S3Client,
  bucket: string,
  rawPath: string
): Promise<
  | { ok: true; item: FsItem }
  | { ok: false; code: "BAD_PATH" | "ROOT_NOT_FOUND"; message: string }
  | { ok: false; code: "NOT_FOUND"; message: string }
  | { ok: false; code: "INTERNAL_ERROR"; message: string }
> {
  const v = validatePath(rawPath, KNOWN_ROOT_IDS, false);
  if (!v.ok) return { ok: false, code: v.code, message: v.message };

  const key = toS3Key(v.rootId, v.suffix);

  try {
    const head = await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));

    const name = key.slice(key.lastIndexOf("/") + 1) || key;
    const mime = inferMime(name, head.ContentType ?? undefined);
    const item: FsItem = {
      path: v.path,
      name,
      kind: "file",
      size: head.ContentLength ?? null,
      modified: head.LastModified?.toISOString() ?? null,
      mime,
    };
    return { ok: true, item };
  } catch (e: unknown) {
    const meta = (e as { $metadata?: { httpStatusCode?: number } }).$metadata;
    const is404 = meta?.httpStatusCode === 404 || (e as { name?: string }).name === "NotFound";
    if (is404) {
      const dirPrefix = key.endsWith("/") ? key : key + "/";
      const list = await s3.send(
        new ListObjectsV2Command({
          Bucket: bucket,
          Prefix: dirPrefix,
          MaxKeys: 1,
        })
      );
      if ((list.Contents?.length ?? 0) > 0 || (list.CommonPrefixes?.length ?? 0) > 0) {
        const isApp = await checkIsApp(s3, bucket, dirPrefix);
        const dirName = dirPrefix.slice(0, -1).split("/").pop() ?? "";
        const dirPath = v.path.endsWith("/") ? v.path : v.path + "/";
        return {
          ok: true,
          item: { path: dirPath, name: dirName, kind: "dir", isApp },
        };
      }
    }
    return { ok: false, code: "NOT_FOUND", message: "Item not found" };
  }
}

export type FsItem = {
  path: string;
  name: string;
  kind: "dir" | "file";
  size?: number | null;
  modified?: string | null;
  mime?: string | null;
  isApp?: boolean;
};

function clampTtl(ttlSec: number | undefined, envOverride?: string): number {
  const env = envOverride ? parseInt(envOverride, 10) : NaN;
  const defaultVal = !Number.isNaN(env) ? env : TTL_DEFAULT;
  const base = ttlSec ?? defaultVal;
  return Math.min(TTL_MAX, Math.max(TTL_MIN, base));
}

export async function getOpenUrl(
  s3: S3Client,
  bucket: string,
  rawPath: string,
  ttlSec?: number,
  envTtlSec?: string,
  presignS3?: S3Client
): Promise<
  | { ok: true; url: string; expiresIn: number }
  | { ok: false; code: "BAD_PATH" | "ROOT_NOT_FOUND"; message: string }
  | { ok: false; code: "NOT_FOUND"; message: string }
  | { ok: false; code: "INTERNAL_ERROR"; message: string }
> {
  const v = validatePath(rawPath, KNOWN_ROOT_IDS, false);
  if (!v.ok) return { ok: false, code: v.code, message: v.message };

  const key = toS3Key(v.rootId, v.suffix);
  if (key.endsWith("/")) {
    return { ok: false, code: "BAD_PATH", message: "Path must be a file, not a directory" };
  }

  const effectiveTtl = clampTtl(ttlSec, envTtlSec);

  const maxAttempts = 3;
  const retryDelayMs = 200;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
      break;
    } catch (e: unknown) {
      const meta = (e as { $metadata?: { httpStatusCode?: number } }).$metadata;
      const isNotFound =
        meta?.httpStatusCode === 404 || (e as { name?: string }).name === "NotFound";
      if (!isNotFound) {
        return { ok: false, code: "INTERNAL_ERROR", message: (e as Error).message };
      }
      if (attempt === maxAttempts - 1) {
        return { ok: false, code: "NOT_FOUND", message: "Object not found" };
      }
      await new Promise((r) => setTimeout(r, retryDelayMs));
    }
  }

  const name = key.slice(key.lastIndexOf("/") + 1) || key;
  const responseContentType = inferMime(name, undefined);

  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
    ...(responseContentType && { ResponseContentType: responseContentType }),
  });
  const client = presignS3 ?? s3;
  const url = await getSignedUrl(client, command, { expiresIn: effectiveTtl });

  return { ok: true, url, expiresIn: effectiveTtl };
}

export async function createFolder(
  s3: S3Client,
  bucket: string,
  rawPath: string
): Promise<
  | { ok: true; path: string; name: string }
  | { ok: false; code: "BAD_PATH" | "ROOT_NOT_FOUND"; message: string }
  | { ok: false; code: "INTERNAL_ERROR"; message: string }
> {
  const v = validatePath(rawPath, KNOWN_ROOT_IDS, true);
  if (!v.ok) return { ok: false, code: v.code, message: v.message };

  const prefix = toS3Prefix(v.rootId, v.suffix);
  if (!prefix.endsWith("/")) {
    return { ok: false, code: "BAD_PATH", message: "Path must be a directory" };
  }

  try {
    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: prefix,
        Body: "",
      })
    );
    const name = prefix.slice(0, -1).split("/").pop() ?? "";
    return { ok: true, path: v.path, name };
  } catch (e) {
    return {
      ok: false,
      code: "INTERNAL_ERROR",
      message: (e as Error).message,
    };
  }
}

export async function deleteItem(
  s3: S3Client,
  bucket: string,
  rawPath: string
): Promise<
  | { ok: true }
  | { ok: false; code: "BAD_PATH" | "ROOT_NOT_FOUND"; message: string }
  | { ok: false; code: "NOT_FOUND"; message: string }
  | { ok: false; code: "INTERNAL_ERROR"; message: string }
> {
  const v = validatePath(rawPath, KNOWN_ROOT_IDS, false);
  if (!v.ok) return { ok: false, code: v.code, message: v.message };

  const key = rawPath.endsWith("/") ? toS3Prefix(v.rootId, v.suffix) : toS3Key(v.rootId, v.suffix);
  try {
    await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
    return { ok: true };
  } catch (e: unknown) {
    const meta = (e as { $metadata?: { httpStatusCode?: number } }).$metadata;
    if (meta?.httpStatusCode === 404 || (e as { name?: string }).name === "NotFound") {
      return { ok: false, code: "NOT_FOUND", message: "Item not found" };
    }
    return { ok: false, code: "INTERNAL_ERROR", message: (e as Error).message };
  }
}

export async function renameItem(
  s3: S3Client,
  bucket: string,
  fromPath: string,
  toPath: string
): Promise<
  | { ok: true; path: string; name: string }
  | { ok: false; code: "BAD_PATH" | "ROOT_NOT_FOUND"; message: string }
  | { ok: false; code: "NOT_FOUND"; message: string }
  | { ok: false; code: "INTERNAL_ERROR"; message: string }
> {
  const vFrom = validatePath(fromPath, KNOWN_ROOT_IDS, false);
  if (!vFrom.ok) return { ok: false, code: vFrom.code, message: vFrom.message };
  const vTo = validatePath(toPath, KNOWN_ROOT_IDS, false);
  if (!vTo.ok) return { ok: false, code: vTo.code, message: vTo.message };

  const fromKey = fromPath.endsWith("/")
    ? toS3Prefix(vFrom.rootId, vFrom.suffix)
    : toS3Key(vFrom.rootId, vFrom.suffix);
  const toKey = toPath.endsWith("/")
    ? toS3Prefix(vTo.rootId, vTo.suffix)
    : toS3Key(vTo.rootId, vTo.suffix);

  try {
    await s3.send(
      new CopyObjectCommand({
        Bucket: bucket,
        CopySource: encodeURIComponent(`${bucket}/${fromKey}`),
        Key: toKey,
      })
    );
    await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: fromKey }));
    const name = toKey.endsWith("/")
      ? (toKey.slice(0, -1).split("/").pop() ?? "")
      : toKey.slice(toKey.lastIndexOf("/") + 1) || toKey;
    return { ok: true, path: vTo.path, name };
  } catch (e: unknown) {
    const meta = (e as { $metadata?: { httpStatusCode?: number } }).$metadata;
    if (meta?.httpStatusCode === 404 || (e as { name?: string }).name === "NotFound") {
      return { ok: false, code: "NOT_FOUND", message: "Source not found" };
    }
    return { ok: false, code: "INTERNAL_ERROR", message: (e as Error).message };
  }
}

type UploadFileError =
  | "BAD_PATH"
  | "ROOT_NOT_FOUND"
  | "NOT_FOUND"
  | "NAME_CONFLICT"
  | "PAYLOAD_TOO_LARGE"
  | "SERVICE_UNAVAILABLE"
  | "INTERNAL_ERROR";

export async function uploadFile(
  s3: S3Client,
  bucket: string,
  rawPath: string,
  body: Buffer | Uint8Array,
  contentType?: string
): Promise<
  { ok: true; path: string; name: string } | { ok: false; code: UploadFileError; message: string }
> {
  const v = validatePath(rawPath, KNOWN_ROOT_IDS, false);
  if (!v.ok) return { ok: false, code: v.code, message: v.message };

  const key = toS3Key(v.rootId, v.suffix);
  if (key.endsWith("/")) {
    return { ok: false, code: "BAD_PATH", message: "Path must be a file" };
  }

  try {
    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: body,
        ContentType: contentType ?? "application/octet-stream",
      })
    );
    const name = key.slice(key.lastIndexOf("/") + 1) || key;
    return { ok: true, path: v.path, name };
  } catch (e) {
    const err = e as { name?: string; message?: string; $metadata?: { httpStatusCode?: number } };
    const name = err.name ?? "";
    const status = err.$metadata?.httpStatusCode;
    if (name === "NoSuchBucket" || status === 404) {
      return { ok: false, code: "NOT_FOUND", message: err.message ?? "Bucket or object not found" };
    }
    if (name === "AccessDenied" || name === "Forbidden" || status === 403) {
      return { ok: false, code: "ROOT_NOT_FOUND", message: err.message ?? "Access denied" };
    }
    if (name === "RequestEntityTooLarge" || status === 413) {
      return { ok: false, code: "PAYLOAD_TOO_LARGE", message: "Payload too large" };
    }
    if (
      name === "InvalidAccessKeyId" ||
      name === "SignatureDoesNotMatch" ||
      name === "CredentialsError" ||
      name === "NetworkingError" ||
      status === 503
    ) {
      return {
        ok: false,
        code: "SERVICE_UNAVAILABLE",
        message: err.message ?? "Service unavailable",
      };
    }
    return { ok: false, code: "INTERNAL_ERROR", message: err.message ?? "Internal error" };
  }
}

export async function uploadZipApp(
  s3: S3Client,
  bucket: string,
  rawPath: string,
  zipBuffer: Buffer
): Promise<
  | { ok: true; path: string; name: string }
  | { ok: false; code: "BAD_PATH" | "ROOT_NOT_FOUND"; message: string }
  | { ok: false; code: "NO_INDEX_HTML"; message: string }
  | { ok: false; code: "INTERNAL_ERROR"; message: string }
> {
  const v = validatePath(rawPath, KNOWN_ROOT_IDS, true);
  if (!v.ok) return { ok: false, code: v.code, message: v.message };

  const prefix = toS3Prefix(v.rootId, v.suffix);
  const AdmZip = (await import("adm-zip")).default;
  const zip = new AdmZip(zipBuffer);
  const entries = zip.getEntries();

  const hasIndex = entries.some(
    (e) => !e.isDirectory && (e.entryName === "index.html" || e.entryName.endsWith("/index.html"))
  );
  if (!hasIndex) {
    return { ok: false, code: "NO_INDEX_HTML", message: "Zip must contain index.html in root" };
  }

  const uploaded: string[] = [];
  try {
    for (const e of entries) {
      if (e.isDirectory) continue;
      const name = e.entryName.replace(/\/$/, "");
      if (name.includes("..") || name.startsWith("/")) continue;
      const key = prefix + name;
      const data = e.getData();
      if (!data) continue;
      await s3.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: data,
          ContentType: e.header?.contentType ?? "application/octet-stream",
        })
      );
      uploaded.push(key);
    }
    const dirName = prefix.slice(0, -1).split("/").pop() ?? "";
    return { ok: true, path: v.path, name: dirName };
  } catch (err) {
    for (const key of uploaded) {
      try {
        await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
      } catch {
        /* ignore rollback errors */
      }
    }
    return { ok: false, code: "INTERNAL_ERROR", message: (err as Error).message };
  }
}
