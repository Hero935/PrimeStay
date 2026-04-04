import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

// 針對自簽憑證 TLS 問題的緊急修正 (開發環境)
if (process.env.NODE_ENV !== "production") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

/**
 * Prisma Client 實體管理
 * 符合 Prisma 7+ 配置規範，並整合 pg adapter
 * [Trigger Reload] 2026-04-04T19:47 - Force Cache Clear
 */

// Aiven 需要 SSL 連線，若無 SSL 會導致連線失敗
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  }
});
const adapter = new PrismaPg(pool);

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: ["query"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;