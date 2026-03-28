import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient | undefined;

export async function getPrisma(): Promise<PrismaClient> {
  if (!prisma) {
    prisma = new PrismaClient();
  }
  return prisma;
}
