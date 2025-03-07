import { register } from "@/actions/register";
import { mockPrisma } from "../setup";
import { generateVerificationToken } from "@/lib/token";
import { sendVerificationEmail } from "@/lib/mail";

jest.mock("@/lib/mail");
jest.mock("@/lib/token", () => ({
  generateVerificationToken: jest.fn(),
}));

describe("register", () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it("should return error for existing email", async () => {
    mockPrisma.user.findFirst.mockResolvedValue({
      id: "1",
      email: "test@example.com",
    });

    const result = await register({
      email: "test@example.com",
      password: "password123",
      name: "Test User",
      passwordConfirmation: "password123",
    });

    expect(result).toEqual({ error: "User already exists" });
  });

  it("should successfully register a new user", async () => {
    mockPrisma.user.findFirst.mockResolvedValue(null);
    mockPrisma.user.create.mockResolvedValue({
      id: "1",
      email: "test@example.com",
      name: "Test User",
      role: "USER",
    });

    const mockToken = {
      email: "test@example.com",
      token: "mock-token",
      expires: new Date(),
    };

    jest.mocked(generateVerificationToken).mockResolvedValue(mockToken);
    jest.mocked(sendVerificationEmail).mockResolvedValue();

    const result = await register({
      email: "test@example.com",
      password: "password123",
      name: "Test User",
      passwordConfirmation: "password123",
    });

    expect(result).toEqual({
      user: {
        id: "1",
        email: "test@example.com",
        name: "Test User",
        role: "USER",
      },
      success: "user created with success",
    });
    expect(generateVerificationToken).toHaveBeenCalledWith("test@example.com");
    expect(sendVerificationEmail).toHaveBeenCalledWith(
      "test@example.com",
      "mock-token"
    );
  });

  it("should handle registration error gracefully", async () => {
    mockPrisma.user.findFirst.mockResolvedValue(null);
    mockPrisma.user.create.mockRejectedValue(new Error("Database error"));

    const result = await register({
      email: "test@example.com",
      password: "password123",
      name: "Test User",
      passwordConfirmation: "password123",
    });

    expect(result).toEqual({ error: "Error registering user" });
    expect(mockPrisma.user.create).toHaveBeenCalled();
    expect(generateVerificationToken).not.toHaveBeenCalled();
    expect(sendVerificationEmail).not.toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error registering user: ",
      expect.any(Error)
    );
  });

  it("should return error for mismatched passwords", async () => {
    const result = await register({
      email: "test@example.com",
      password: "password123",
      name: "Test User",
      passwordConfirmation: "password456",
    });

    expect(result).toEqual({ error: "Passwords do not match" });
    expect(mockPrisma.user.findFirst).not.toHaveBeenCalled();
    expect(mockPrisma.user.create).not.toHaveBeenCalled();
  });
});
