import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import { getEslintAppFiles } from "./scripts/fixture-apps.config.cjs";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: { react: reactPlugin, "react-hooks": reactHooksPlugin },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      globals: {
        window: "readonly",
        document: "readonly",
        fetch: "readonly",
      },
    },
    settings: {
      react: { version: "detect" },
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-console": "warn",
      "prefer-const": "warn",
      "no-var": "error",
      "react/prop-types": "off",
    },
  },
  {
    rules: {
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-react": "off",
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
      "front/core/AppHost.tsx",
      "vite.config.ts",
    ],
    rules: { "no-console": "off" }, // Dev logging: [Shell], [AppHost], [Vite user-app proxy]
  }
);
