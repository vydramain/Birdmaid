export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      ["feat", "fix", "docs", "style", "refactor", "perf", "test", "chore", "ci"],
    ],
    "scope-enum": [1, "always", ["front", "back", "docs", "infra", "e2e", "scripts", "deps"]],
    "scope-empty": [0],
    "header-max-length": [2, "always", 100],
  },
};
