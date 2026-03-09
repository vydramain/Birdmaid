import js from "@eslint/js";
import tseslint from "typescript-eslint";
import vuePlugin from "eslint-plugin-vue";
import vueParser from "vue-eslint-parser";
import { getEslintAppFiles } from "./scripts/fixture-apps.config.cjs";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...vuePlugin.configs["flat/essential"],
  {
    files: ["**/*.vue"],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tseslint.parser,
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
  },
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.vue"],
    rules: {
      "no-undef": "off", // TypeScript handles undeclared variables
    },
  },
  {
    languageOptions: {
      globals: {
        window: "readonly",
        document: "readonly",
        fetch: "readonly",
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-console": "warn",
      "prefer-const": "warn",
      "no-var": "error",
      "vue/multi-word-component-names": "off",
    },
  },
  {
    ignores: ["node_modules", "dist", "coverage", "playwright-report", "test-results"],
  },
  {
    files: getEslintAppFiles(),
    rules: { "no-console": "off" }, // FP3/FP4: Explorer + viewers log errors (M3)
  },
  {
    files: [
      "front/core/analytics.ts",
      "front/core/AppHost.vue",
      "vite.config.ts",
    ],
    rules: { "no-console": "off" }, // Dev logging: [Shell], [AppHost], [Vite user-app proxy]
  }
);
