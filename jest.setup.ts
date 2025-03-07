import "@testing-library/jest-dom";
import { TextEncoder, TextDecoder } from "util";

// Mock TextEncoder/TextDecoder
Object.assign(global, { TextDecoder, TextEncoder });

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      refresh: jest.fn(),
    };
  },
  useSearchParams() {
    return {
      get: jest.fn(),
    };
  },
}));

// Mock next-auth
jest.mock("next-auth", () => ({
  signIn: jest.fn(),
  signOut: jest.fn(),
}));
