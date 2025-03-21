import { register } from "@/actions/register";
import { mockPrisma } from "../setup";
import bcryptjs from "bcryptjs";
import { sendVerificationEmail } from "@/lib/mail";
import { generateVerificationToken } from "@/lib/token";

jest.mock("@/lib/mail", () => ({
  sendVerificationEmail: jest.fn(),
}));

jest.mock("bcryptjs", () => ({
  hash: jest.fn(),
}));

jest.mock("crypto", () => ({
  randomUUID: jest.fn(),
}));

jest.mock("@/lib/token", () => ({
  generateVerificationToken: jest.fn(),
}));

jest.mock("@/data/user", () => ({
  getUserAccountByEmail: jest.fn(),
}));

import { getUserAccountByEmail } from "@/data/user";

describe("register", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return error for existing email", async () => {
    (getUserAccountByEmail as jest.Mock).mockResolvedValue({
      id: "1",
      email: "existing@example.com",
    });

    const result = await register({
      email: "existing@example.com",
      name: "John Doe",
      password: "password123",
      passwordConfirmation: "password123",
    });

    expect(result).toEqual({ error: "Email already exists" });
    expect(mockPrisma.user.create).not.toHaveBeenCalled();
  });

  it("should create a new user and send verification email", async () => {
    (getUserAccountByEmail as jest.Mock).mockResolvedValue(null);
    (bcryptjs.hash as jest.Mock).mockResolvedValue("hashedPassword");
    mockPrisma.user.create.mockResolvedValue({
      id: "1",
      email: "test@example.com",
      name: "John Doe",
      role: "USER",
    });

    const mockToken = {
      email: "test@example.com",
      token: "mock-token",
      expires: new Date(),
    };

    (generateVerificationToken as jest.Mock).mockResolvedValue(mockToken);
    (sendVerificationEmail as jest.Mock).mockResolvedValue(undefined);

    const result = await register({
      email: "test@example.com",
      name: "John Doe",
      password: "password123",
      passwordConfirmation: "password123",
    });

    expect(result).toEqual({
      user: {
        id: "1",
        email: "test@example.com",
        name: "John Doe",
        role: "USER",
      },
      success: "confimation email sent ! ",
    });
    expect(mockPrisma.user.create).toHaveBeenCalled();
    expect(generateVerificationToken).toHaveBeenCalledWith("test@example.com");
    expect(sendVerificationEmail).toHaveBeenCalledWith(
      "test@example.com",
      "mock-token"
    );
  });

  it("should handle database error", async () => {
    (getUserAccountByEmail as jest.Mock).mockResolvedValue(null);
    (bcryptjs.hash as jest.Mock).mockResolvedValue("hashedPassword");
    mockPrisma.user.create.mockRejectedValue(new Error("Database error"));

    const result = await register({
      email: "test@example.com",
      name: "John Doe",
      password: "password123",
      passwordConfirmation: "password123",
    });

    expect(result).toEqual({ error: "Error registering user" });
  });

  it("should return error for mismatched passwords", async () => {
    const result = await register({
      email: "test@example.com",
      name: "John Doe",
      password: "password123",
      passwordConfirmation: "differentpassword",
    });

    expect(result).toEqual({ error: "Passwords do not match" });
    expect(mockPrisma.user.create).not.toHaveBeenCalled();
  });
});
