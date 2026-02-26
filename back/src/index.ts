import Fastify from "fastify";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import { S3Client } from "@aws-sdk/client-s3";
import {
  getRoots,
  listDir,
  statItem,
  getOpenUrl,
  createFolder,
  deleteItem,
  renameItem,
  uploadFile,
  uploadZipApp,
} from "./fs.js";
import { checkWritable, validateRenameSameParent } from "./path-policy.js";
import { checkUploadAllowlist } from "./upload-allowlist.js";

// s3.shell.local: Explorer/Image Viewer/Media Player loaded via signed URL need API (roots, list, open-url)
const ALLOWED_ORIGINS = [
  "http://shell.local",
  "http://api.shell.local",
  "http://s3.shell.local",
  "http://localhost:5173",
];

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || "0.0.0.0";

const s3 = new S3Client({
  endpoint: process.env.FS_S3_ENDPOINT,
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.FS_S3_ACCESS_KEY ?? "",
    secretAccessKey: process.env.FS_S3_SECRET_KEY ?? "",
  },
  forcePathStyle: true,
});

// M1: Presign client uses public URL (s3.shell.local) so signed URLs work from browser.
// requestChecksumCalculation: WHEN_REQUIRED — avoid x-amz-checksum-mode in presigned URLs (MinIO/Firefox compatibility).
const s3Presign =
  process.env.FS_S3_PUBLIC_URL &&
  new S3Client({
    endpoint: process.env.FS_S3_PUBLIC_URL,
    region: "us-east-1",
    credentials: {
      accessKeyId: process.env.FS_S3_ACCESS_KEY ?? "",
      secretAccessKey: process.env.FS_S3_SECRET_KEY ?? "",
    },
    forcePathStyle: true,
    requestChecksumCalculation: "WHEN_REQUIRED",
  });

const BUCKET = process.env.FS_S3_BUCKET ?? "birdmaid-dev";

const app = Fastify({ logger: true });

app.addHook("onRequest", (req, reply, done) => {
  const origin = req.headers.origin;
  if (origin && !ALLOWED_ORIGINS.includes(origin)) {
    app.log.info({ event: "request_rejected", reason: "bad_origin", origin }, "request_rejected");
    // FP3 M6: Add CORS so user-app can read 403 (fetch completes, script gets status for FETCH_RESULT)
    reply.header("Access-Control-Allow-Origin", origin);
    reply.status(403).send({
      error: { code: "BAD_ORIGIN", message: "Origin not allowed" },
    });
    return done();
  }
  done();
});

app.register(multipart, { limits: { fileSize: 50 * 1024 * 1024 } });
app.register(cors, {
  origin: (origin, cb) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
  credentials: false,
});

app.setErrorHandler((err, _req, reply) => {
  app.log.error(err);
  const code = err.code ?? "INTERNAL_ERROR";
  const statusCode = err.statusCode ?? 500;
  reply.status(statusCode).send({
    error: {
      code,
      message: err.message ?? "Internal server error",
      ...(err.details && { details: err.details }),
    },
  });
});

app.get("/health", async (_req, reply) => {
  return reply.send({ status: "ok" });
});

function logEvent(
  log: { info: (obj: Record<string, unknown>, msg?: string) => void },
  event: string,
  fields: Record<string, unknown>
) {
  log.info({ ...fields, event }, event);
}

app.get("/api/fs/roots", async (_req, reply) => {
  const start = Date.now();
  const { roots } = getRoots();
  const durationMs = Date.now() - start;
  logEvent(app.log, "fs_roots", { durationMs, status: "ok", count: roots.length });
  return reply.send({ roots });
});

app.get("/api/fs/list", async (req, reply) => {
  const path = (req.query as { path?: string }).path;
  const start = Date.now();
  const r = await listDir(s3, BUCKET, path);
  const durationMs = Date.now() - start;
  if (r.ok) {
    logEvent(app.log, "fs_list", { path, count: r.items.length, durationMs, status: "ok" });
    return reply.send({ items: r.items });
  }
  const reason =
    r.code === "BAD_PATH" ? "bad_path" : r.code === "ROOT_NOT_FOUND" ? "bad_root" : "s3_error";
  logEvent(app.log, "request_rejected", {
    reason,
    path,
    ...(r.code === "INTERNAL_ERROR" && { s3Error: r.message }),
  });
  if (r.code === "INTERNAL_ERROR") {
    logEvent(app.log, "s3_error", { op: "list", code: "INTERNAL", durationMs });
  }
  if (r.code === "BAD_PATH")
    return reply.status(400).send({ error: { code: r.code, message: r.message } });
  if (r.code === "ROOT_NOT_FOUND")
    return reply.status(403).send({ error: { code: r.code, message: r.message } });
  return reply.status(500).send({ error: { code: r.code, message: r.message } });
});

app.get("/api/fs/stat", async (req, reply) => {
  const path = (req.query as { path?: string }).path;
  const start = Date.now();
  const r = await statItem(s3, BUCKET, path);
  const durationMs = Date.now() - start;
  if (r.ok) {
    logEvent(app.log, "fs_stat", { path, durationMs, status: "ok" });
    return reply.send(r.item);
  }
  if (r.code === "BAD_PATH" || r.code === "ROOT_NOT_FOUND") {
    logEvent(app.log, "request_rejected", {
      reason: r.code === "BAD_PATH" ? "bad_path" : "bad_root",
      path,
    });
  }
  if (r.code === "INTERNAL_ERROR") {
    logEvent(app.log, "s3_error", { op: "stat", code: "INTERNAL", durationMs });
  }
  if (r.code === "BAD_PATH")
    return reply.status(400).send({ error: { code: r.code, message: r.message } });
  if (r.code === "ROOT_NOT_FOUND")
    return reply.status(403).send({ error: { code: r.code, message: r.message } });
  if (r.code === "NOT_FOUND")
    return reply.status(404).send({ error: { code: r.code, message: r.message } });
  return reply.status(500).send({ error: { code: r.code, message: r.message } });
});

app.post("/api/fs/open-url", async (req, reply) => {
  const body = (req.body ?? {}) as { path?: string; ttlSec?: number };
  const path = body?.path;
  const ttlSec = body?.ttlSec;
  const start = Date.now();
  const r = await getOpenUrl(
    s3,
    BUCKET,
    path ?? "",
    ttlSec,
    process.env.FS_SIGNED_URL_TTL_SEC,
    s3Presign instanceof S3Client ? s3Presign : undefined
  );
  const durationMs = Date.now() - start;
  if (r.ok) {
    logEvent(app.log, "fs_open_url", { path, ttlSec: r.expiresIn, durationMs, status: "ok" });
    return reply.send({ url: r.url, expiresIn: r.expiresIn });
  }
  if (r.code === "BAD_PATH" || r.code === "ROOT_NOT_FOUND") {
    logEvent(app.log, "request_rejected", {
      reason: r.code === "BAD_PATH" ? "bad_path" : "bad_root",
      path,
    });
  }
  if (r.code === "INTERNAL_ERROR") {
    logEvent(app.log, "s3_error", { op: "open_url", code: "INTERNAL", durationMs });
  }
  if (r.code === "BAD_PATH")
    return reply.status(400).send({ error: { code: r.code, message: r.message } });
  if (r.code === "ROOT_NOT_FOUND")
    return reply.status(403).send({ error: { code: r.code, message: r.message } });
  if (r.code === "NOT_FOUND")
    return reply.status(404).send({ error: { code: r.code, message: r.message } });
  return reply.status(500).send({ error: { code: r.code, message: r.message } });
});

function requireExplorerToken(
  req: { headers: { [k: string]: string | string[] | undefined } },
  reply: { status: (n: number) => { send: (o: object) => void } }
) {
  const appHeader = req.headers["x-system-app"];
  const tokenHeader = req.headers["x-system-token"];
  const token = Array.isArray(tokenHeader) ? tokenHeader[0] : tokenHeader;
  if (appHeader !== "explorer" || !token) {
    reply.status(403).send({
      error: { code: "PERMISSION_DENIED", message: "Explorer token required" },
    });
    return false;
  }
  return true;
}

app.post("/api/fs/create-folder", async (req, reply) => {
  if (!requireExplorerToken(req, reply)) return;
  const body = (req.body ?? {}) as { path?: string };
  const path = body?.path;
  if (!path || typeof path !== "string") {
    return reply.status(400).send({
      error: { code: "BAD_PATH", message: "Path is required" },
    });
  }
  const pathMatch = path.match(/^\/@root\/([^/]+)\/(.*)$/);
  if (!pathMatch) {
    return reply.status(400).send({
      error: { code: "BAD_PATH", message: "Invalid path format" },
    });
  }
  const [, rootId, suffix] = pathMatch;
  const writable = checkWritable(rootId, suffix);
  if (!writable.ok) {
    return reply.status(403).send({
      error: { code: writable.code, message: writable.message },
    });
  }
  const start = Date.now();
  const r = await createFolder(s3, BUCKET, path);
  const durationMs = Date.now() - start;
  if (r.ok) {
    logEvent(app.log, "fs_create_folder", { path, durationMs, status: "ok" });
    return reply.status(201).send({ path: r.path, name: r.name });
  }
  if (r.code === "BAD_PATH" || r.code === "ROOT_NOT_FOUND") {
    return reply.status(r.code === "BAD_PATH" ? 400 : 403).send({
      error: { code: r.code, message: r.message },
    });
  }
  return reply.status(500).send({ error: { code: r.code, message: r.message } });
});

app.delete("/api/fs/delete", async (req, reply) => {
  if (!requireExplorerToken(req, reply)) return;
  const body = (req.body ?? {}) as { path?: string };
  const path = body?.path;
  if (!path || typeof path !== "string") {
    return reply.status(400).send({ error: { code: "BAD_PATH", message: "Path is required" } });
  }
  const pathMatch = path.match(/^\/@root\/([^/]+)\/(.*)$/);
  if (!pathMatch) {
    return reply.status(400).send({ error: { code: "BAD_PATH", message: "Invalid path format" } });
  }
  const [, rootId, suffix] = pathMatch;
  const writable = checkWritable(rootId, suffix);
  if (!writable.ok) {
    return reply.status(403).send({ error: { code: writable.code, message: writable.message } });
  }
  const start = Date.now();
  const r = await deleteItem(s3, BUCKET, path);
  const durationMs = Date.now() - start;
  if (r.ok) {
    logEvent(app.log, "fs_delete", { path, durationMs, status: "ok" });
    return reply.status(204).send();
  }
  if (r.code === "NOT_FOUND")
    return reply.status(404).send({ error: { code: r.code, message: r.message } });
  if (r.code === "BAD_PATH" || r.code === "ROOT_NOT_FOUND") {
    return reply
      .status(r.code === "BAD_PATH" ? 400 : 403)
      .send({ error: { code: r.code, message: r.message } });
  }
  return reply.status(500).send({ error: { code: r.code, message: r.message } });
});

app.put("/api/fs/rename", async (req, reply) => {
  if (!requireExplorerToken(req, reply)) return;
  const body = (req.body ?? {}) as { fromPath?: string; toPath?: string };
  const fromPath = body?.fromPath;
  const toPath = body?.toPath;
  if (!fromPath || !toPath || typeof fromPath !== "string" || typeof toPath !== "string") {
    return reply
      .status(400)
      .send({ error: { code: "BAD_PATH", message: "fromPath and toPath required" } });
  }
  const sameParent = validateRenameSameParent(fromPath, toPath);
  if (!sameParent.ok) {
    return reply
      .status(403)
      .send({ error: { code: sameParent.code, message: sameParent.message } });
  }
  const fromMatch = fromPath.match(/^\/@root\/([^/]+)\/(.*)$/);
  if (!fromMatch) {
    return reply.status(400).send({ error: { code: "BAD_PATH", message: "Invalid path format" } });
  }
  const [, rootId, suffix] = fromMatch;
  const writable = checkWritable(rootId, suffix);
  if (!writable.ok) {
    return reply.status(403).send({ error: { code: writable.code, message: writable.message } });
  }
  const start = Date.now();
  const r = await renameItem(s3, BUCKET, fromPath, toPath);
  const durationMs = Date.now() - start;
  if (r.ok) {
    logEvent(app.log, "fs_rename", { fromPath, toPath, durationMs, status: "ok" });
    return reply.send({ path: r.path, name: r.name });
  }
  if (r.code === "NOT_FOUND")
    return reply.status(404).send({ error: { code: r.code, message: r.message } });
  if (r.code === "BAD_PATH" || r.code === "ROOT_NOT_FOUND") {
    return reply
      .status(r.code === "BAD_PATH" ? 400 : 403)
      .send({ error: { code: r.code, message: r.message } });
  }
  return reply.status(500).send({ error: { code: r.code, message: r.message } });
});

app.post("/api/fs/upload-file", async (req, reply) => {
  if (!requireExplorerToken(req, reply)) return;
  let path: string | undefined;
  let fileData: { toBuffer: () => Promise<Buffer>; mimetype: string; filename?: string } | null =
    null;
  if (!req.isMultipart?.()) {
    return reply
      .status(400)
      .send({ error: { code: "BAD_REQUEST", message: "multipart required" } });
  }
  for await (const part of req.parts()) {
    const p = part as {
      type: string;
      fieldname: string;
      value?: string;
      mimetype?: string;
      filename?: string;
      toBuffer?: () => Promise<Buffer>;
    };
    if (p.type === "field" && p.fieldname === "path") {
      path = p.value;
    } else if (p.type === "file" && p.fieldname === "file") {
      fileData = p as { toBuffer: () => Promise<Buffer>; mimetype: string; filename?: string };
      break;
    }
  }
  if (!fileData || !path || typeof path !== "string") {
    return reply
      .status(400)
      .send({ error: { code: "BAD_REQUEST", message: "path and file required" } });
  }
  const data = fileData;
  const pathMatch = path.match(/^\/@root\/([^/]+)\/(.*)$/);
  if (!pathMatch) {
    return reply.status(400).send({ error: { code: "BAD_PATH", message: "Invalid path format" } });
  }
  const [, rootId, suffix] = pathMatch;
  const writable = checkWritable(rootId, suffix);
  if (!writable.ok) {
    return reply.status(403).send({ error: { code: writable.code, message: writable.message } });
  }
  const nameForAllowlist = (data.filename ?? path.slice(path.lastIndexOf("/") + 1)) || "file";
  const allowlist = checkUploadAllowlist(nameForAllowlist, data.mimetype ?? "");
  if (!allowlist.ok) {
    return reply.status(415).send({ error: { code: allowlist.code, message: allowlist.message } });
  }
  const buf = await data.toBuffer();
  const start = Date.now();
  const r = await uploadFile(s3, BUCKET, path, buf, data.mimetype);
  const durationMs = Date.now() - start;
  if (r.ok) {
    logEvent(app.log, "fs_upload_file", { path, size: buf.length, durationMs, status: "ok" });
    return reply.status(201).send({ path: r.path, name: r.name });
  }
  if (r.code === "BAD_PATH" || r.code === "ROOT_NOT_FOUND") {
    return reply
      .status(r.code === "BAD_PATH" ? 400 : 403)
      .send({ error: { code: r.code, message: r.message } });
  }
  if (r.code === "NOT_FOUND") {
    return reply.status(404).send({ error: { code: r.code, message: r.message } });
  }
  if (r.code === "NAME_CONFLICT") {
    return reply.status(409).send({ error: { code: r.code, message: r.message } });
  }
  if (r.code === "SERVICE_UNAVAILABLE") {
    return reply.status(503).send({ error: { code: r.code, message: r.message } });
  }
  if (r.code === "PAYLOAD_TOO_LARGE") {
    return reply.status(413).send({ error: { code: r.code, message: r.message } });
  }
  return reply.status(500).send({ error: { code: r.code, message: r.message } });
});

app.post("/api/fs/upload-zip-app", async (req, reply) => {
  if (!requireExplorerToken(req, reply)) return;
  let path: string | undefined;
  let fileData: { toBuffer: () => Promise<Buffer>; mimetype: string; filename?: string } | null =
    null;
  if (!req.isMultipart?.()) {
    return reply
      .status(400)
      .send({ error: { code: "BAD_REQUEST", message: "multipart required" } });
  }
  for await (const part of req.parts()) {
    const p = part as {
      type: string;
      fieldname: string;
      value?: string;
      mimetype?: string;
      filename?: string;
      toBuffer?: () => Promise<Buffer>;
    };
    if (p.type === "field" && p.fieldname === "path") {
      path = p.value;
    } else if (p.type === "file" && p.fieldname === "file") {
      fileData = p as { toBuffer: () => Promise<Buffer>; mimetype: string; filename?: string };
      break;
    }
  }
  if (!fileData || !path || typeof path !== "string") {
    return reply
      .status(400)
      .send({ error: { code: "BAD_REQUEST", message: "path and file required" } });
  }
  const data = fileData;
  const zipFilename = (data.filename ?? path.slice(path.lastIndexOf("/") + 1)) || "file";
  const zipExt = zipFilename.slice(zipFilename.lastIndexOf(".")).toLowerCase();
  const zipMime = (data.mimetype ?? "").toLowerCase().split(";")[0].trim();
  if (zipExt !== ".zip") {
    return reply.status(415).send({
      error: { code: "UNSUPPORTED_MEDIA", message: "upload-zip-app requires .zip file" },
    });
  }
  if (zipMime && !["application/zip", "application/octet-stream"].includes(zipMime)) {
    return reply.status(415).send({
      error: { code: "UNSUPPORTED_MEDIA", message: "upload-zip-app requires zip content type" },
    });
  }
  const pathMatch = path.match(/^\/@root\/([^/]+)\/(.*)$/);
  if (!pathMatch) {
    return reply.status(400).send({ error: { code: "BAD_PATH", message: "Invalid path format" } });
  }
  const [, rootId, suffix] = pathMatch;
  const writable = checkWritable(rootId, suffix);
  if (!writable.ok) {
    return reply.status(403).send({ error: { code: writable.code, message: writable.message } });
  }
  const buf = await data.toBuffer();
  const start = Date.now();
  const r = await uploadZipApp(s3, BUCKET, path, buf);
  const durationMs = Date.now() - start;
  if (r.ok) {
    logEvent(app.log, "fs_upload_zip_app", { path, durationMs, status: "ok", hasIndexHtml: true });
    return reply.status(201).send({ path: r.path, name: r.name });
  }
  if (r.code === "NO_INDEX_HTML") {
    return reply.status(400).send({ error: { code: r.code, message: r.message } });
  }
  if (r.code === "BAD_PATH" || r.code === "ROOT_NOT_FOUND") {
    return reply
      .status(r.code === "BAD_PATH" ? 400 : 403)
      .send({ error: { code: r.code, message: r.message } });
  }
  return reply.status(500).send({ error: { code: r.code, message: r.message } });
});

const start = async () => {
  try {
    await app.listen({ port: PORT, host: HOST });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
