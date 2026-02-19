import Fastify from "fastify";
import cors from "@fastify/cors";
import { S3Client } from "@aws-sdk/client-s3";
import { getRoots, listDir, statItem, getOpenUrl } from "./fs.js";

const ALLOWED_ORIGINS = [
  "http://shell.local",
  "http://api.shell.local",
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
  });

const BUCKET = process.env.FS_S3_BUCKET ?? "birdmaid-dev";

const app = Fastify({ logger: true });

app.addHook("onRequest", (req, reply, done) => {
  const origin = req.headers.origin;
  if (origin && !ALLOWED_ORIGINS.includes(origin)) {
    app.log.info({ event: "request_rejected", reason: "bad_origin", origin }, "request_rejected");
    reply.status(403).send({
      error: { code: "BAD_ORIGIN", message: "Origin not allowed" },
    });
    return done();
  }
  done();
});

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
  const reason = r.code === "BAD_PATH" ? "bad_path" : r.code === "ROOT_NOT_FOUND" ? "bad_root" : "s3_error";
  logEvent(app.log, "request_rejected", { reason, path, ...(r.code === "INTERNAL_ERROR" && { s3Error: r.message }) });
  if (r.code === "INTERNAL_ERROR") {
    logEvent(app.log, "s3_error", { op: "list", code: "INTERNAL", durationMs });
  }
  if (r.code === "BAD_PATH") return reply.status(400).send({ error: { code: r.code, message: r.message } });
  if (r.code === "ROOT_NOT_FOUND") return reply.status(403).send({ error: { code: r.code, message: r.message } });
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
    logEvent(app.log, "request_rejected", { reason: r.code === "BAD_PATH" ? "bad_path" : "bad_root", path });
  }
  if (r.code === "INTERNAL_ERROR") {
    logEvent(app.log, "s3_error", { op: "stat", code: "INTERNAL", durationMs });
  }
  if (r.code === "BAD_PATH") return reply.status(400).send({ error: { code: r.code, message: r.message } });
  if (r.code === "ROOT_NOT_FOUND") return reply.status(403).send({ error: { code: r.code, message: r.message } });
  if (r.code === "NOT_FOUND") return reply.status(404).send({ error: { code: r.code, message: r.message } });
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
    (s3Presign instanceof S3Client ? s3Presign : undefined)
  );
  const durationMs = Date.now() - start;
  if (r.ok) {
    logEvent(app.log, "fs_open_url", { path, ttlSec: r.expiresIn, durationMs, status: "ok" });
    return reply.send({ url: r.url, expiresIn: r.expiresIn });
  }
  if (r.code === "BAD_PATH" || r.code === "ROOT_NOT_FOUND") {
    logEvent(app.log, "request_rejected", { reason: r.code === "BAD_PATH" ? "bad_path" : "bad_root", path });
  }
  if (r.code === "INTERNAL_ERROR") {
    logEvent(app.log, "s3_error", { op: "open_url", code: "INTERNAL", durationMs });
  }
  if (r.code === "BAD_PATH") return reply.status(400).send({ error: { code: r.code, message: r.message } });
  if (r.code === "ROOT_NOT_FOUND") return reply.status(403).send({ error: { code: r.code, message: r.message } });
  if (r.code === "NOT_FOUND") return reply.status(404).send({ error: { code: r.code, message: r.message } });
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
