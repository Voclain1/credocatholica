import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Lazy Prisma client singleton instance.
 * Does not execute database queries or establish live network connections on module import.
 */
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({} as any);

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
