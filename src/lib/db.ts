import { PrismaClient } from "@prisma/client";
import { AdminApiError } from "@/lib/admin/http";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/** 懒加载 Prisma 单例：DATABASE_URL 未配置时抛出可读的 503 业务错误，而不是崩溃。 */
export function getPrisma(): PrismaClient {
  if (!process.env.DATABASE_URL) {
    throw new AdminApiError(
      503,
      "DATABASE_UNAVAILABLE",
      "数据库未配置：请在 .env 中设置 DATABASE_URL 并运行 npm run db:setup",
    );
  }
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient();
  }
  return globalForPrisma.prisma;
}

export type PrismaTx = Parameters<Parameters<PrismaClient["$transaction"]>[0]>[0];
