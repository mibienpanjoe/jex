import { PrismaClient } from "@prisma/client";

const HEX64 = /^[0-9a-fA-F]{64}$/;

export async function validateEnv(): Promise<void> {
  const encryptionKey = process.env.ENCRYPTION_KEY;
  if (!encryptionKey) {
    throw new Error(
      "ENCRYPTION_KEY is not set. Generate one with: openssl rand -hex 32",
    );
  }
  if (!HEX64.test(encryptionKey)) {
    throw new Error(
      "ENCRYPTION_KEY must be a 64-character hex string (32 bytes). " +
        "Generate one with: openssl rand -hex 32",
    );
  }

  if (!process.env.BETTER_AUTH_SECRET) {
    throw new Error(
      "BETTER_AUTH_SECRET is not set. Generate one with: openssl rand -base64 32",
    );
  }

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set.");
  }

  const prisma = new PrismaClient();
  try {
    await prisma.$connect();
  } catch (err) {
    throw new Error(
      `Cannot connect to DATABASE_URL: ${(err as Error).message}`,
    );
  } finally {
    await prisma.$disconnect();
  }
}
