#!/usr/bin/env node
/**
 * Copy built app from dist-app-{name} to fixtures.
 * Flattens nested output (dist-app-X/infra/.../App/) to fixture App folder.
 */
const fs = require("fs");
const path = require("path");

const APP = process.env.APP || "image-viewer";
const distDir = path.join(__dirname, "..", "dist-app-" + APP);
const targetDir =
  APP === "media-player"
    ? path.join(__dirname, "..", "infra/minio/fixtures/DISK_C/Program Files/Media Player")
    : APP === "explorer"
      ? path.join(__dirname, "..", "infra/minio/fixtures/DISK_C/Program Files/Explorer")
      : path.join(__dirname, "..", "infra/minio/fixtures/DISK_C/Program Files/Image Viewer");
// Source is in _source subfolder; build output goes to dist-app-X

if (!fs.existsSync(distDir)) {
  console.error("dist-app-" + APP + " not found. Run build:apps first.");
  process.exit(1);
}

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    for (const name of fs.readdirSync(src)) {
      copyRecursive(path.join(src, name), path.join(dest, name));
    }
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

// Vite outputs to dist-app-X/infra/minio/fixtures/.../App/_source/ when building from _source
const appName = APP === "image-viewer" ? "Image Viewer" : APP === "media-player" ? "Media Player" : "Explorer";
const nested = path.join(distDir, "infra", "minio", "fixtures", "DISK_C", "Program Files", appName);
const srcDir = path.join(nested, "_source");
const srcDirFallback = fs.existsSync(srcDir) ? srcDir : nested;

// Copy index.html and assets to target (overwrite; keep _source and main.ts)
if (fs.existsSync(path.join(srcDirFallback, "index.html"))) {
  let html = fs.readFileSync(path.join(srcDirFallback, "index.html"), "utf8");
  html = html.replace(/<base[^>]*>/, '<base href="./">');
  // Fix asset paths: any path ending with assets/xxx -> ./assets/xxx
  html = html.replace(/(src|href)="[^"]*assets\/([^"]+)"/g, '$1="./assets/$2"');
  fs.mkdirSync(targetDir, { recursive: true });
  fs.writeFileSync(path.join(targetDir, "index.html"), html);
}
// Assets are at dist root (Vite output) or in srcDir
const assetsSrc = fs.existsSync(path.join(distDir, "assets"))
  ? path.join(distDir, "assets")
  : path.join(srcDirFallback, "assets");
if (fs.existsSync(assetsSrc)) {
  const assetsDest = path.join(targetDir, "assets");
  if (fs.existsSync(assetsDest)) fs.rmSync(assetsDest, { recursive: true });
  copyRecursive(assetsSrc, assetsDest);
}

fs.rmSync(distDir, { recursive: true, force: true });
console.log("Copied " + APP + " to fixtures");
