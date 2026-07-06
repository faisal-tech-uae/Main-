import { PrismaClient } from "@prisma/client";

declare global {
  var __resumeaiPrisma: PrismaClient | undefined;
}

export const prisma =
  globalThis.__resumeaiPrisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__resumeaiPrisma = prisma;
}

export * from "@prisma/client";
