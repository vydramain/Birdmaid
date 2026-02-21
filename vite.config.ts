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
          if (req.url === "/health" || req.url === "/health/") {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ status: "ok" }));
            return;
          }
          if (req.url?.startsWith("/apps/explorer")) {
            if (!req.url.includes(".") || req.url === "/apps/explorer/") {
              req.url = "/front/apps/explorer/index.html";
            } else {
              req.url = req.url.replace("/apps/explorer/", "/front/apps/explorer/");
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
    allowedHosts: ["shell.local", "api.shell.local", "s3.shell.local", "localhost", ".localhost"],
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
        "viewers/image": resolve(__dirname, "front/viewers/image.html"),
      },
    },
  },
});
