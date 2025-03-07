import "@testing-library/jest-dom";
import { TextEncoder, TextDecoder } from "util";
import { PrismaClient } from "@prisma/client";

// Mock TextEncoder/TextDecoder
Object.assign(global, { TextDecoder, TextEncoder });

// Mock bcrypt
export const mockBcrypt = {
  compare: jest.fn(),
  hash: jest.fn(),
};

jest.mock("bcryptjs", () => mockBcrypt);

// Mock Prisma
type MockPrismaClient = {
  [K in keyof PrismaClient]: {
    [M in keyof PrismaClient[K]]: jest.Mock;
  };
};

export const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  account: {
    findFirst: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  },
  verificationToken: {
    findFirst: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  },
} as unknown as MockPrismaClient;

jest.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: mockPrisma,
}));

// Mock next-auth
jest.mock("next-auth", () => ({
  signIn: jest.fn(),
  signOut: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe("setup", () => {
  it("should set up test environment", () => {
    expect(global.TextEncoder).toBeDefined();
    expect(global.TextDecoder).toBeDefined();
  });
});

describe("Test Environment", () => {
  it("should have TextEncoder and TextDecoder defined", () => {
    expect(TextEncoder).toBeDefined();
    expect(TextDecoder).toBeDefined();
  });
});
