/**
 * FS service: roots, list, stat. S3/MinIO backend.
 */

import {
  ListObjectsV2Command,
  HeadObjectCommand,
  GetObjectCommand,
  S3Client,
  _Object,
  CommonPrefix,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { validatePath, toS3Prefix, toS3Key } from "./path.js";

const TTL_DEFAULT = 120;
const TTL_MIN = 60;
const TTL_MAX = 300;

const ROOTS: { id: string; label: string }[] = [
  { id: "DISK_C", label: "Disk C" },
  { id: "APPS", label: "Apps" },
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
  ".css": "text/css",
  ".js": "application/javascript",
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

async function checkIsApp(
  s3: S3Client,
  bucket: string,
  dirPrefix: string
): Promise<boolean> {
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
    const head = await s3.send(
      new HeadObjectCommand({ Bucket: bucket, Key: key })
    );

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

  try {
    await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
  } catch (e: unknown) {
    const meta = (e as { $metadata?: { httpStatusCode?: number } }).$metadata;
    if (meta?.httpStatusCode === 404 || (e as { name?: string }).name === "NotFound") {
      return { ok: false, code: "NOT_FOUND", message: "Object not found" };
    }
    return { ok: false, code: "INTERNAL_ERROR", message: (e as Error).message };
  }

  const command = new GetObjectCommand({ Bucket: bucket, Key: key });
  const client = presignS3 ?? s3;
  const url = await getSignedUrl(client, command, { expiresIn: effectiveTtl });

  return { ok: true, url, expiresIn: effectiveTtl };
}
