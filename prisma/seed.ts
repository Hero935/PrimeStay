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
  
  if (!process.env.DATABASE_URL) {
    console.error("錯誤: 環境變數 DATABASE_URL 未定義");
    process.exit(1);
  }

  // Prisma 7 推薦使用 Driver Adapter 當 schema 沒有 url 時
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
    const hashedPassword = await bcrypt.hash("password123", 10);

    console.log("正在清理資料庫所有資料...");
    // 依序刪除資料，避免違反外鍵約束
    await prisma.auditLog.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.billing.deleteMany();
    await prisma.maintenance.deleteMany();
    await prisma.contract.deleteMany();
    await prisma.property.deleteMany();
    await prisma.invitation.deleteMany();
    await prisma.userOrganization.deleteMany();
    await prisma.organization.deleteMany();
    await prisma.user.deleteMany();
    console.log("資料庫已清空");

    // 0. 建立平台管理者
    const adminEmail = process.env.ADMIN_EMAIL || "admin@test.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
    const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);

    await prisma.user.upsert({
      where: { email: adminEmail },
      update: { hashedPassword: hashedAdminPassword },
      create: {
        email: adminEmail,
        name: "系統管理員",
        hashedPassword: hashedAdminPassword,
        systemRole: "ADMIN",
      },
    });

    console.log("準備初始化測試資料...");
    const testLandlordEmails = ["david@test.com", "wang@test.com", "rentlove@test.com"];
    
    // 定義測試資料結構
    const landlordData = [
      {
        name: "林大衛房東",
        email: "david@test.com",
        orgName: "大衛資產管理",
        properties: [
          { address: "台北市大安區忠孝東路四段 101 號", room: "A01", rent: 25000, status: "RENTED", tenant: { name: "張小明", email: "xiaoming@test.com" } },
          { address: "台北市大安區忠孝東路四段 101 號", room: "A02", rent: 22000, status: "AVAILABLE" },
          { address: "台北市信義區基隆路二段 50 號", room: "305", rent: 18000, status: "RENTED", tenant: { name: "李國華", email: "guohua@test.com" } },
        ]
      },
      {
        name: "王曉明房東",
        email: "wang@test.com",
        orgName: "曉明物業代管",
        properties: [
          { address: "台中市西屯區台灣大道三段 301 號", room: "1201", rent: 15000, status: "AVAILABLE" },
          { address: "台中市南屯區公益路二段 150 號", room: "B", rent: 12000, status: "RENTED", tenant: { name: "王小玉", email: "xiaoyu@test.com" } },
        ]
      },
      {
        name: "酷愛收租(股)公司",
        email: "rentlove@test.com",
        orgName: "酷愛收租集團",
        properties: [
          { address: "高雄市苓雅區四維三路 2 號", room: "A", rent: 10000, status: "AVAILABLE" },
        ]
      }
    ];

    for (const lData of landlordData) {
      // 1. 建立房東
      const landlord = await prisma.user.upsert({
        where: { email: lData.email },
        update: { hashedPassword },
        create: {
          email: lData.email,
          name: lData.name,
          hashedPassword: hashedPassword,
          systemRole: "LANDLORD",
        },
      });

      // 2. 建立組織 (如果不存在)
      const org = await prisma.organization.create({
        data: {
          name: lData.orgName,
          ownerId: landlord.id,
        },
      });

      // 3. 建立房東組織關聯 (OWNER)
      await prisma.userOrganization.create({
        data: {
          userId: landlord.id,
          organizationId: org.id,
          memberRole: "OWNER",
        },
      });

      // 4. 建立房源與房客租約
      for (const pData of lData.properties) {
        const property = await prisma.property.create({
          data: {
            organizationId: org.id,
            address: pData.address,
            roomNumber: pData.room,
            type: "獨立套房",
            size: 10,
            defaultRent: pData.rent,
            defaultDeposit: pData.rent * 2,
            status: pData.status as any,
          },
        });

        // 如果房源已出租，則建立房客帳號與租約
        if (pData.status === "RENTED" && pData.tenant) {
          const tenant = await prisma.user.upsert({
            where: { email: pData.tenant.email },
            update: { hashedPassword },
            create: {
              email: pData.tenant.email,
              name: pData.tenant.name,
              hashedPassword: hashedPassword,
              systemRole: "TENANT",
            },
          });

          // 計算結束日 (一年後)
          const endDate = new Date();
          endDate.setFullYear(endDate.getFullYear() + 1);

          await prisma.contract.create({
            data: {
              propertyId: property.id,
              tenantId: tenant.id,
              tenantName: tenant.name || "測試房客",
              gender: "OTHER",
              phone: "0900000000",
              contactAddress: "測試地址",
              startDate: new Date(),
              endDate: endDate,
              monthlyRent: pData.rent,
              deposit: pData.rent * 2,
              status: "OCCUPIED",
            }
          });

          // 同時建立組織成員關聯 (TENANT)
          await prisma.userOrganization.upsert({
            where: {
              userId_organizationId: {
                userId: tenant.id,
                organizationId: org.id
              }
            },
            update: { memberRole: "TENANT" },
            create: {
              userId: tenant.id,
              organizationId: org.id,
              memberRole: "TENANT"
            }
          });
        }
      }
      console.log(`房東 ${lData.name} 及其房源資料初始化完成`);
    }

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