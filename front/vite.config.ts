import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "url";
import { resolve } from "node:path";

export default defineConfig(({ command, mode }) => {
  const isMobile = mode === 'mobile' || process.env.VITE_APP === 'mobile';
  
  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    build: {
      rollupOptions: isMobile ? {
        input: {
          mobile: resolve(__dirname, 'index-mobile.html'),
        },
      } : {
        input: {
          desktop: resolve(__dirname, 'index.html'),
        },
      },
    },
    server: {
      host: "0.0.0.0",
      port: isMobile ? 5174 : 5173,
    },
    preview: {
      host: "0.0.0.0",
      port: isMobile ? 5174 : 5173,
    },
    test: {
      environment: "jsdom",
      setupFiles: "./src/test/setup.ts",
      globals: true,
      exclude: [
        "**/node_modules/**",
        "**/dist/**",
        "**/legacy/**", // Legacy tests for old react-router architecture (FP7 v2 cleanup)
      ],
      coverage: {
        reporter: ["json-summary", "lcov", "text"],
      },
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
  };
});
