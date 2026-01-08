module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.test.ts"],
  verbose: true,
  coverageDirectory: "coverage",
  coverageReporters: ["json-summary", "lcov", "text"],
};
