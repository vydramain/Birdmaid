import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

const API_PROXY_TARGET = process.env.VITE_API_PROXY_TARGET ?? "http://127.0.0.1:80";

export default defineConfig({
  plugins: [
    {
      name: "health",
      enforce: "pre",
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const u = req.url ?? "";
          // M1 fix (Option C): viewer assets need ACAO for opaque-origin iframe (sandbox allow-scripts).
          // Module scripts in opaque-origin context require CORS; ACAO: * allows load.
          // Include @vite/client, @id/, @react-refresh (Vite injects these into HTML in dev).
          // Include /front/lib/ (viewer imports e.g. playlist.ts) and /front/apps/ (viewer entry modules).
          const needsCors =
            u.includes("image-viewer") ||
            u.includes("media-player") ||
            u.startsWith("/@vite/") ||
            u.startsWith("/@id/") ||
            u.startsWith("/@react-refresh") ||
            u.startsWith("/front/lib/") ||
            u.startsWith("/front/apps/") ||
            u.includes("/node_modules/");
          if (needsCors) {
            res.setHeader("Access-Control-Allow-Origin", "*");
          }
          const origEnd = res.end;
          res.end = function (chunk?: unknown, encoding?: unknown, callback?: () => void) {
            const url = req.url ?? "";
            if (
              (url.includes("image-viewer") || url.includes("media-player")) &&
              (url.includes("index.html") || !url.includes("."))
            ) {
              res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
            }
            return (
              origEnd as (chunk?: unknown, encoding?: unknown, callback?: () => void) => void
            ).call(res, chunk, encoding, callback);
          };
          if (req.url === "/health" || req.url === "/health/") {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ status: "ok" }));
            return;
          }
          // Trailing slash redirect: /apps/{viewer} → /apps/{viewer}/ (base href expects slash)
          const viewerRedirect = (path: string) => {
            if (
              req.url === path ||
              (req.url?.startsWith(path + "?") && !req.url.startsWith(path + "/"))
            ) {
              res.statusCode = 301;
              res.setHeader(
                "Location",
                req.url === path ? path + "/" : path + "/" + (req.url?.slice(path.length) ?? "")
              );
              res.end();
              return true;
            }
            return false;
          };
          if (viewerRedirect("/apps/image-viewer") || viewerRedirect("/apps/media-player")) return;
          if (req.url?.startsWith("/apps/explorer")) {
            if (!req.url.includes(".") || req.url === "/apps/explorer/") {
              req.url = "/front/apps/explorer/index.html";
            } else {
              req.url = req.url.replace("/apps/explorer/", "/front/apps/explorer/");
            }
          }
          if (req.url?.startsWith("/apps/image-viewer")) {
            if (!req.url.includes(".") || req.url === "/apps/image-viewer/") {
              req.url = "/front/apps/image-viewer/index.html";
            } else {
              req.url = req.url.replace("/apps/image-viewer/", "/front/apps/image-viewer/");
            }
          }
          if (req.url?.startsWith("/apps/media-player")) {
            if (!req.url.includes(".") || req.url === "/apps/media-player/") {
              req.url = "/front/apps/media-player/index.html";
            } else {
              req.url = req.url.replace("/apps/media-player/", "/front/apps/media-player/");
            }
          }
          if (req.url?.startsWith("/viewers/")) {
            const m = req.url.match(/^\/viewers\/([^?]+)(\?.*)?$/);
            if (m) req.url = "/front/viewers/" + m[1] + (m[2] ?? "");
          }
          next();
        });
      },
    },
    react(),
  ],
  root: ".",
  publicDir: "public",
  server: {
    host: true, // listen on 0.0.0.0 so Traefik can reach dev-server in Docker
    allowedHosts: [
      "shell.local",
      "api.shell.local",
      "s3.shell.local",
      "localhost",
      ".localhost",
      "10.200.1.6",
      "127.0.0.1",
    ],
    proxy: {
      "/api": {
        target: API_PROXY_TARGET,
        changeOrigin: true,
        configure(proxy) {
          proxy.on("proxyReq", (proxyReq) => {
            if (API_PROXY_TARGET.includes("127.0.0.1")) {
              proxyReq.setHeader("Host", "api.shell.local");
            }
          });
        },
      },
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        explorer: resolve(__dirname, "front/apps/explorer/index.html"),
        "image-viewer": resolve(__dirname, "front/apps/image-viewer/index.html"),
        "media-player": resolve(__dirname, "front/apps/media-player/index.html"),
        "viewers/image": resolve(__dirname, "front/viewers/image.html"),
      },
    },
  },
});
