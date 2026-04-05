import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

// 針對自簽憑證 TLS 問題的緊急修正 (開發環境)
// 只有在明確需要忽略憑證驗證時才開啟，並儘量透過連線字串控制
if (process.env.NODE_ENV !== "production") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

/**
 * Prisma Client 實體管理
 * 符合 Prisma 7+ 配置規範，並整合 pg adapter
 * [Trigger Reload] 2026-04-05T11:44 - TLS Fix
 */

// Aiven 需要 SSL 連線，若無 SSL 會導致連線失敗
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  // Aiven PostgreSQL 通常需要忽略 TLS 憑證驗證 (self-signed)
  ssl: { rejectUnauthorized: false }
});
const adapter = new PrismaPg(pool);

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;