jest.mock("@/auth", () => ({
  signIn: jest.fn(),
}));

jest.mock("@/auth.config", () => ({
  providers: [],
}));

jest.mock("@/data/user", () => ({
  getUserAccountByEmail: jest.fn(),
}));

import { login } from "@/actions/login";
import { getUserAccountByEmail } from "@/data/user";

const mockCsrfToken = "mock-csrf-token";

describe("login", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return error for non-existent user", async () => {
    (getUserAccountByEmail as jest.Mock).mockResolvedValue(null);

    const result = await login({
      email: "nonexistent@example.com",
      password: "password123",
      csrfToken: mockCsrfToken,
    });

    expect(result).toEqual({ error: "email not exist please register" });
  });

  it("should return error for unverified email", async () => {
    (getUserAccountByEmail as jest.Mock).mockResolvedValue({
      id: "1",
      email: "test@example.com",
      password: "hashedPassword",
      emailVerified: null,
    });

    const result = await login({
      email: "test@example.com",
      password: "password123",
      csrfToken: mockCsrfToken,
    });

    expect(result).toEqual({
      error: "Please verify your email before logging in",
    });
  });

  it("should return error for invalid credentials", async () => {
    (getUserAccountByEmail as jest.Mock).mockResolvedValue({
      id: "1",
      email: "test@example.com",
      password: "hashedPassword",
      emailVerified: new Date(),
    });

    const signIn = jest.requireMock("@/auth").signIn;
    signIn.mockResolvedValue({ error: "Invalid credentials" });

    const result = await login({
      email: "test@example.com",
      password: "wrongpassword",
      csrfToken: mockCsrfToken,
    });

    expect(result).toEqual({ error: "Invalid email or password" });
  });

  it("should return success for valid credentials", async () => {
    (getUserAccountByEmail as jest.Mock).mockResolvedValue({
      id: "1",
      email: "test@example.com",
      password: "hashedPassword",
      emailVerified: new Date(),
    });

    const signIn = jest.requireMock("@/auth").signIn;
    signIn.mockResolvedValue({ ok: true });

    const result = await login({
      email: "test@example.com",
      password: "correctpassword",
      csrfToken: mockCsrfToken,
    });

    expect(result).toEqual({ success: true, redirect: "/dashboard" });
  });
});
