import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { twoFactor } from "better-auth/plugins";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const apiBaseURL = process.env.BETTER_AUTH_URL ?? "http://localhost:3001";
const webOrigin = process.env.WEB_ORIGIN ?? process.env.DASHBOARD_ORIGIN ?? "http://localhost:3000";
const socialProviders = {
  ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
    ? {
        github: {
          clientId: process.env.GITHUB_CLIENT_ID,
          clientSecret: process.env.GITHUB_CLIENT_SECRET,
        },
      }
    : {}),
  ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        },
      }
    : {}),
};

export const auth = betterAuth({
  baseURL: apiBaseURL,
  basePath: "/api/v1/auth",
  trustedOrigins: [webOrigin, apiBaseURL],

  database: prismaAdapter(prisma, { provider: "postgresql" }),

  emailAndPassword: {
    enabled: true,
  },

  socialProviders,

  plugins: [twoFactor()],
});

export type Auth = typeof auth;
