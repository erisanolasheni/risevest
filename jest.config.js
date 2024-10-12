module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src", "<rootDir>/tests"],
  testMatch: ["**/*.test.ts", "**/*.spec.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  collectCoverageFrom: [
    "src/controllers/auth.controller.ts",
    "src/controllers/user.controller.ts",
    "src/models/user.model.ts",
    "src/services/auth.service.ts",
    "src/services/user.service.ts"
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov"],
  setupFiles: ["<rootDir>/tests/setup.ts"],
};