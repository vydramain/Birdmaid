module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.test.ts"],
  testPathIgnorePatterns: [
    "/node_modules/",
    "/dist/",
    "/legacy/", // Legacy tests for old react-router architecture (FP7 v2 cleanup)
  ],
  verbose: true,
  coverageDirectory: "coverage",
  coverageReporters: ["json-summary", "lcov", "text"],
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.test.json",
      },
    ],
  },
};
