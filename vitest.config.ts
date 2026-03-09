import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";

export default defineConfig({
  plugins: [vue()],
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
