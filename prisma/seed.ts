// @ts-ignore: PrismaClient is generated at build time
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
// 針對自簽憑證 TLS 問題的緊急修正
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
import pg from "pg";
import bcrypt from "bcrypt";
import * as dotenv from "dotenv";

// 在獨立腳本中，手動載入 .env
dotenv.config();

/**
 * 資料庫種子資料腳本 (Prisma 7 驅動適配器版本)
 */
async function main() {
  console.log("--- Seed 腳本開始執行 ---");
  console.log("環境變數檢查 - ADMIN_EMAIL:", process.env.ADMIN_EMAIL);
  
  if (!process.env.DATABASE_URL) {
    console.error("錯誤: 環境變數 DATABASE_URL 未定義");
    process.exit(1);
  }

  // Prisma 7 推薦使用 Driver Adapter 當 schema 沒有 url 時
  // 移除連線字串中的參數，完全依賴 pool 設定
  const cleanUrl = process.env.DATABASE_URL.split('?')[0];

  const pool = new pg.Pool({
    connectionString: cleanUrl,
    ssl: {
      rejectUnauthorized: false,
    }
  });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    // 0. 建立平台管理者 (從環境變數讀取)
    const adminEmail = process.env.ADMIN_EMAIL || "admin@test.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
    const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);

    const admin = await prisma.user.upsert({
      where: { email: adminEmail },
      update: { hashedPassword: hashedAdminPassword },
      create: {
        email: adminEmail,
        name: "系統管理員",
        hashedPassword: hashedAdminPassword,
        systemRole: "ADMIN",
      },
    });

    console.log("平台管理者帳號處理完成:", admin.email);

    const landlordEmail = "landlord@test.com";
    const hashedPassword = await bcrypt.hash("password123", 10);

    // 1. 建立測試房東
    const landlord = await prisma.user.upsert({
      where: { email: landlordEmail },
      update: { hashedPassword },
      create: {
        email: landlordEmail,
        name: "測試房東",
        hashedPassword: hashedPassword,
        systemRole: "LANDLORD",
      },
    });

    console.log("房東帳號處理完成:", landlord.email);

    // 2. 建立組織
    const org = await prisma.organization.upsert({
      where: { id: "test-org-id" },
      update: { name: "頂級首選租代管中心" },
      create: {
        id: "test-org-id",
        name: "頂級首選租代管中心",
        ownerId: landlord.id,
      },
    });

    console.log("組織處理完成:", org.name);

    // 3. 建立關聯
    await prisma.userOrganization.upsert({
      where: {
        userId_organizationId: {
          userId: landlord.id,
          organizationId: org.id,
        },
      },
      update: {},
      create: {
        userId: landlord.id,
        organizationId: org.id,
        memberRole: "OWNER",
      },
    });

    console.log("Seed 成功完成！");
  } catch (err) {
    console.error("Seed 失敗:", err);
    throw err;
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main()
  .catch((e) => {
    console.error("腳本終止:", e);
    process.exit(1);
  });