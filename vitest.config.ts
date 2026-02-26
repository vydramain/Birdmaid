import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@lib": resolve(__dirname, "front/lib"),
      "@shared": resolve(__dirname, "front/shared"),
    },
  },
  test: {
    environment: "jsdom",
    include: ["front/**/*.test.{ts,tsx}"],
    globals: true,
    setupFiles: ["front/__tests__/setup-url-object.ts"],
  },
});
