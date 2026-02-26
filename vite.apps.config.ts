/**
 * Build Image Viewer, Media Player, Explorer to fixtures for S3 deployment.
 * Source lives in infra/minio/fixtures/DISK_C/Program Files/{Explorer|Image Viewer|Media Player}/
 * Usage: APP=image-viewer vite build -c vite.apps.config.ts
 *        APP=media-player vite build -c vite.apps.config.ts
 *        APP=explorer vite build -c vite.apps.config.ts
 * Output: dist-app-{name} then copy to fixtures
 * base: "./" so assets resolve when loaded from S3 signed URL.
 */
import { defineConfig } from "vite";
import { resolve } from "path";

const APP = process.env.APP || "image-viewer";
const appDir =
  APP === "media-player"
    ? "infra/minio/fixtures/DISK_C/Program Files/Media Player/_source"
    : APP === "explorer"
      ? "infra/minio/fixtures/DISK_C/Program Files/Explorer/_source"
      : "infra/minio/fixtures/DISK_C/Program Files/Image Viewer/_source";

const outDir = resolve(__dirname, "dist-app-" + APP);

export default defineConfig({
  root: ".",
  base: "./",
  resolve: {
    alias: {
      "@lib": resolve(__dirname, "front/lib"),
      "@shared": resolve(__dirname, "front/shared"),
    },
  },
  build: {
    emptyOutDir: true,
    outDir,
    rollupOptions: {
      input: resolve(__dirname, appDir, "index.html"),
      output: {
        entryFileNames: "assets/[name]-[hash].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]",
      },
    },
  },
});
