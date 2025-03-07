import { linkAccount } from "@/actions/link-account";
import { mockPrisma, mockBcrypt } from "../setup";
import { signIn } from "@/auth";

// Mock auth
jest.mock("@/auth", () => ({
  signIn: jest.fn(),
}));

describe("linkAccount", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return error for non-existent user", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);

    const result = await linkAccount("test@example.com", "password123");

    expect(result).toEqual({ error: "Invalid credentials" });
  });

  it("should return error for invalid password", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: "1",
      email: "test@example.com",
      password: "hashedPassword",
    });

    mockBcrypt.compare.mockResolvedValue(false);

    const result = await linkAccount("test@example.com", "wrongpassword");

    expect(result).toEqual({ error: "Invalid credentials" });
  });

  it("should return error if credentials sign-in fails", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: "1",
      email: "test@example.com",
      password: "hashedPassword",
    });

    mockBcrypt.compare.mockResolvedValue(true);
    (signIn as jest.Mock).mockResolvedValue({ error: "Failed to sign in" });

    const result = await linkAccount("test@example.com", "password123");

    expect(result).toEqual({ error: "Failed to verify credentials" });
  });

  it("should return success for valid credentials", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: "1",
      email: "test@example.com",
      password: "hashedPassword",
    });

    mockBcrypt.compare.mockResolvedValue(true);
    (signIn as jest.Mock).mockResolvedValue({ ok: true });

    const result = await linkAccount("test@example.com", "password123");

    expect(result).toEqual({ success: true });
  });
});
