interface Credentials {
  email?: string;
  password?: string;
}

interface GoogleProfile {
  sub: string;
  given_name: string;
  family_name: string;
  email: string;
  picture: string;
}

export const signIn = jest
  .fn()
  .mockImplementation(async (provider: string, credentials?: Credentials) => {
    if (provider === "credentials") {
      if (
        credentials?.email === "test@example.com" &&
        credentials?.password === "correctpassword"
      ) {
        return { ok: true };
      }
      return { error: "Invalid credentials" };
    }
    return { error: "Invalid provider" };
  });

export const mockGoogleProvider = {
  id: "google",
  name: "Google",
  type: "oauth",
  profile: (profile: GoogleProfile) => ({
    id: profile.sub,
    firstName: profile.given_name,
    lastName: profile.family_name,
    email: profile.email,
    image: profile.picture,
    username:
      `${profile.given_name}${profile.family_name}`.toLowerCase() ?? "unknown",
  }),
  clientId: "mock-client-id",
  clientSecret: "mock-client-secret",
};

export const mockCredentialsProvider = {
  id: "credentials",
  name: "Credentials",
  type: "credentials",
  authorize: async (credentials?: Credentials) => {
    if (
      credentials?.email === "test@example.com" &&
      credentials?.password === "correctpassword"
    ) {
      return {
        id: "1",
        email: "test@example.com",
        name: "Test User",
        role: "USER",
      };
    }
    return null;
  },
};

export const mockNextAuth = {
  signIn,
  providers: {
    Google: jest.fn().mockImplementation(() => mockGoogleProvider),
    Credentials: jest.fn().mockImplementation(() => mockCredentialsProvider),
  },
};

jest.mock("next-auth/providers/google", () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => mockGoogleProvider),
}));

jest.mock("next-auth/providers/credentials", () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => mockCredentialsProvider),
}));

jest.mock("next-auth", () => ({
  __esModule: true,
  ...mockNextAuth,
}));

jest.mock("@/auth", () => ({
  __esModule: true,
  ...mockNextAuth,
}));

jest.mock("@/auth.config", () => ({
  __esModule: true,
  default: {
    providers: [
      { ...mockGoogleProvider, profile: mockGoogleProvider.profile },
      {
        ...mockCredentialsProvider,
        authorize: mockCredentialsProvider.authorize,
      },
    ],
  },
}));
