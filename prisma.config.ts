import "dotenv/config";
import { defineConfig } from "prisma/config";

/**
 * Prisma 7+ 核心設定檔
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    // 移除 npx 避免重複包裝環境，直接執行
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // 確保這裡正確抓取到環境變數
    url: process.env.DATABASE_URL,
  },
});
