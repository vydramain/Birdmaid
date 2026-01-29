import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "url";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
  },
  preview: {
    host: "0.0.0.0",
    port: 5173,
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
});
