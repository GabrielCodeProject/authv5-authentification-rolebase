# Authentication System Implementation Guide

This guide provides a step-by-step process to build a secure authentication system using Next.js 14, Auth.js, and Prisma.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Project Setup](#project-setup)
- [Database Setup](#database-setup)
- [Authentication Setup](#authentication-setup)
- [UI Components](#ui-components)
- [Server Actions](#server-actions)
- [Testing](#testing)

## Prerequisites

Required tools and accounts:

- Node.js 18+
- PostgreSQL
- Google Cloud Console account (for OAuth)
- Resend account (for email verification)
- Git

## Project Setup

1. Create a new Next.js project:

```bash
npx create-next-app@latest authv5-authentification-rolebase
```

Choose the following options:

- TypeScript: Yes
- ESLint: Yes
- Tailwind CSS: Yes
- `src/` directory: No
- App Router: Yes
- Import alias: Yes

2. Install required dependencies:

```bash
npm install @prisma/client @auth/prisma-adapter bcryptjs
npm install next-auth@beta zod react-hook-form @hookform/resolvers/zod
npm install @radix-ui/react-slot class-variance-authority clsx tailwind-merge
npm install lucide-react
npm install -D prisma @types/bcryptjs
```

3. Install development dependencies for testing:

```bash
npm install -D jest @types/jest @testing-library/react @testing-library/jest-dom
npm install -D ts-jest jest-environment-jsdom
```

## Database Setup

1. Initialize Prisma:

```bash
npx prisma init
```

2. Create the schema in `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum UserRole {
  ADMIN
  USER
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  password      String?
  role          UserRole  @default(USER)
  accounts      Account[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}
```

3. Create and apply migrations:

```bash
npx prisma migrate dev --name init
```

## Authentication Setup

1. Create auth configuration (`auth.config.ts`):

```typescript
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { LoginSchema } from "./schemas";
import type { NextAuthConfig } from "next-auth";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export default {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      async authorize(credentials) {
        const validatedFields = LoginSchema.safeParse(credentials);

        if (!validatedFields.success) return null;

        const { email, password } = validatedFields.data;

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.password) return null;

        const passwordsMatch = await bcrypt.compare(password, user.password);

        if (!passwordsMatch) return null;

        return user;
      },
    }),
  ],
} satisfies NextAuthConfig;
```

2. Create auth setup (`auth.ts`):

```typescript
import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";
import authConfig from "./auth.config";
import { getUserById } from "@/data/user";

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  callbacks: {
    async session({ token, session }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }

      if (token.role && session.user) {
        session.user.role = token.role as "ADMIN" | "USER";
      }

      return session;
    },
    async jwt({ token }) {
      if (!token.sub) return token;

      const existingUser = await getUserById(token.sub);

      if (!existingUser) return token;

      token.role = existingUser.role;

      return token;
    },
  },
  ...authConfig,
});
```

3. Create middleware (`middleware.ts`):

```typescript
import authConfig from "./auth.config";
import NextAuth from "next-auth";
import {
  DEFAULT_LOGIN_REDIRECT,
  apiAuthPrefix,
  authRoutes,
  publicRoutes,
} from "@/routes";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  if (isApiAuthRoute) {
    return null;
  }

  if (isAuthRoute) {
    if (isLoggedIn) {
      return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }
    return null;
  }

  if (!isLoggedIn && !isPublicRoute) {
    return Response.redirect(new URL("/auth/login", nextUrl));
  }

  return null;
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
```

## UI Components

1. Create reusable form components:

```typescript
// components/ui/form.tsx
// components/ui/input.tsx
// components/ui/button.tsx
```

2. Create auth components:

```typescript
// components/auth/login-form.tsx
// components/auth/register-form.tsx
// components/auth/google-button.tsx
```

## Server Actions

1. Create login action:

```typescript
// actions/login.ts
"use server";

import * as z from "zod";
import { LoginSchema } from "@/schemas";
import { signIn } from "@/auth";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { AuthError } from "next-auth";

export const login = async (
  values: z.infer<typeof LoginSchema>,
  callbackUrl?: string | null
) => {
  const validatedFields = LoginSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { email, password } = validatedFields.data;

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: callbackUrl || DEFAULT_LOGIN_REDIRECT,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials!" };
        default:
          return { error: "Something went wrong!" };
      }
    }

    throw error;
  }
};
```

2. Create register action:

```typescript
// actions/register.ts
"use server";

import * as z from "zod";
import { RegisterSchema } from "@/schemas";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { getUserByEmail } from "@/data/user";

export const register = async (values: z.infer<typeof RegisterSchema>) => {
  const validatedFields = RegisterSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { email, password, name } = validatedFields.data;
  const hashedPassword = await bcrypt.hash(password, 10);

  const existingUser = await getUserByEmail(email);

  if (existingUser) {
    return { error: "Email already in use!" };
  }

  await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  return { success: "User created!" };
};
```

## Testing

1. Configure Jest (`jest.config.ts`):

```typescript
import type { Config } from "jest";
import nextJest from "next/jest";

const createJestConfig = nextJest({
  dir: "./",
});

const config: Config = {
  setupFilesAfterEnv: ["<rootDir>/__tests__/setup.ts"],
  testEnvironment: "jest-environment-jsdom",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
};

export default createJestConfig(config);
```

2. Create test setup (`__tests__/setup.ts`):

```typescript
import "@testing-library/jest-dom";
import { TextDecoder, TextEncoder } from "util";

Object.assign(global, { TextDecoder, TextEncoder });

export const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

jest.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: mockPrisma,
}));
```

3. Write tests for actions:

```typescript
// __tests__/actions/login.test.ts
// __tests__/actions/register.test.ts
```

## Environment Setup

1. Create `.env` file with required variables:

```env
DATABASE_URL=
NEXTAUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXTAUTH_URL=
```

2. Generate NEXTAUTH_SECRET:

```bash
openssl rand -base64 32
```

3. Set up Google OAuth:

- Go to Google Cloud Console
- Create a new project
- Enable OAuth 2.0
- Create credentials
- Add authorized redirect URIs
- Copy Client ID and Secret

## Running the Project

1. Start the development server:

```bash
npm run dev
```

2. Run tests:

```bash
npm test
```

## Security Considerations

1. CSRF Protection:

- Auth.js automatically handles CSRF tokens
- Tokens are validated on non-GET requests
- Secure cookie handling implemented

2. Password Security:

- Passwords are hashed using bcrypt
- Minimum password requirements enforced
- Secure password reset flow

3. Session Management:

- JWT-based sessions
- Secure cookie handling
- Session expiration implemented

4. OAuth Security:

- Secure state parameter validation
- Account linking protection
- Proper scope handling

## Deployment

1. Database setup:

```bash
npx prisma migrate deploy
```

2. Build the application:

```bash
npm run build
```

3. Start the production server:

```bash
npm start
```

## Troubleshooting

Common issues and solutions:

1. Database Connection:

- Check DATABASE_URL format
- Ensure PostgreSQL is running
- Verify database exists

2. OAuth Issues:

- Verify redirect URIs
- Check credentials
- Confirm OAuth setup

3. Email Verification:

- Check Resend API key
- Verify email templates
- Check email configuration

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Auth.js Documentation](https://authjs.dev)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Testing Library Documentation](https://testing-library.com/docs)

## Support

For issues and questions:

1. Check the troubleshooting guide
2. Review existing GitHub issues
3. Create a new issue with:
   - Environment details
   - Steps to reproduce
   - Expected vs actual behavior
