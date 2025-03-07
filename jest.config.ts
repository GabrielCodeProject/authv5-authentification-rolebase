import type { Config } from "jest";
import nextJest from "next/jest";

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: "./",
});

// Add any custom config to be passed to Jest
const config: Config = {
  setupFilesAfterEnv: ["<rootDir>/__tests__/setup.ts"],
  testEnvironment: "jest-environment-jsdom",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "^@auth/prisma-adapter$": "<rootDir>/__tests__/mocks/prisma-adapter.ts",
    "^next-auth$": "<rootDir>/__tests__/mocks/next-auth.ts",
    "^next-auth/providers/(.*)$": "<rootDir>/__tests__/mocks/next-auth.ts",
    "^@auth/core/providers/(.*)$": "<rootDir>/__tests__/mocks/next-auth.ts",
  },
  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: {
          jsx: "react",
        },
      },
    ],
  },
  transformIgnorePatterns: [
    "/node_modules/(?!(@auth/prisma-adapter|next-auth|@auth/core|@auth/core/providers|next-auth/providers)/)",
  ],
  extensionsToTreatAsEsm: [".ts", ".tsx"],
  moduleDirectories: ["node_modules", "<rootDir>"],
  testPathIgnorePatterns: ["/node_modules/", "/.next/"],
  globals: {
    "ts-jest": {
      useESM: true,
    },
  },
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(config);
