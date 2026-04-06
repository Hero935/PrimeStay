import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

/**
 * 憑邀請碼註冊 API
 * POST /api/auth/register
 * Body: { email, password, name, code }
 */
export async function POST(req: Request) {
  try {
    const { email, password, name, code, organizationName } = await req.json();

    if (!email || !password || !name || !code) {
      return NextResponse.json({ error: "請填寫完整註冊資訊" }, { status: 400 });
    }

    // 1. 驗證邀請碼
    const invitation = await prisma.invitation.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!invitation || invitation.isUsed || new Date() > invitation.expiresAt) {
      return NextResponse.json({ error: "邀請碼無效、已使用或已逾期" }, { status: 400 });
    }

    // 2. 檢查 Email 是否已被註冊
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: "此 Email 已被建置過，請嘗試登入" }, { status: 400 });
    }

    // 3. 處理註冊流程 (使用 Transaction 確保資料一致性)
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.$transaction(async (tx: any) => {
      // A. 建立使用者
      const user = await tx.user.create({
        data: {
          email,
          hashedPassword,
          name,
          systemRole: invitation.targetRole,
        },
      });

      // B. 建立組織與關聯
      if (invitation.targetRole === "LANDLORD" || (invitation.targetRole === "MANAGER" && !invitation.organizationId)) {
        let finalOrgId = invitation.organizationId;

        // 如果邀請碼中沒有綁定組織，則建立新組織 (房東自創 或 專業代管)
        if (!finalOrgId) {
          if (!organizationName) {
            throw new Error(`${invitation.targetRole === "LANDLORD" ? "房東" : "專業代管"}註冊需要提供組織名稱`);
          }
          const newOrg = await tx.organization.create({
            data: {
              name: organizationName,
              ownerId: user.id,
              plan: invitation.targetPlan || "FREE",
            },
          });
          finalOrgId = newOrg.id;
        }

        // 建立成員關聯 (OWNER / MANAGER)
        await tx.userOrganization.create({
          data: {
            userId: user.id,
            organizationId: finalOrgId,
            memberRole: "OWNER",
          },
        });
      } else if (invitation.targetRole === "MANAGER") {
        // 一般 MANAGER 加入現有組織 (房東的下屬)
        await tx.userOrganization.create({
          data: {
            userId: user.id,
            organizationId: invitation.organizationId!,
            memberRole: "MANAGER",
          },
        });
      } else if (invitation.targetRole === "TENANT") {
        // TENANT 自動建立租約 (依據 db_design.md 規範)
        if (!invitation.propertyId) {
          throw new Error("租客邀請碼必須綁定房源");
        }

        const property = await tx.property.findUnique({
          where: { id: invitation.propertyId }
        });

        if (!property) {
          throw new Error("找不到對應的房源資訊");
        }

        // 計算預設結束日 (一年後)
        const endDate = new Date();
        endDate.setFullYear(endDate.getFullYear() + 1);

        await tx.contract.create({
          data: {
            propertyId: property.id,
            tenantId: user.id,
            tenantName: user.name || "新租客",
            gender: "OTHER", // 預設值，後續由租客自行完善
            phone: "0900000000", // 預設值
            contactAddress: "待完善", // 預設值
            startDate: new Date(),
            endDate: endDate,
            monthlyRent: property.defaultRent,
            deposit: property.defaultDeposit,
            paymentCycle: "MONTHLY",
            electricityRate: property.defaultElectricityFee,
            waterRate: property.defaultWaterFee,
            managementFee: property.defaultManagementFee,
            status: "OCCUPIED", // 設為 OCCUPIED 讓租客登入即見房源
          },
        });

        // D. 同步將房源狀態標記為 RENTED (已出租)
        await tx.property.update({
          where: { id: property.id },
          data: { status: "RENTED" },
        });

        // E. 建立租客與組織的成員關聯 (TENANT)
        await tx.userOrganization.create({
          data: {
            userId: user.id,
            organizationId: property.organizationId,
            memberRole: "TENANT",
          },
        });
      }

      // C. 將邀請碼標記為已使用
      await tx.invitation.update({
        where: { id: invitation.id },
        data: { isUsed: true },
      });

      return user;
    });

    return NextResponse.json({
      success: true,
      message: "註冊成功，請前往登入",
      userId: newUser.id
    });

  } catch (error) {
    console.error("註冊失敗:", error);
    return NextResponse.json({ error: "註冊過程中發生錯誤" }, { status: 500 });
  }
}