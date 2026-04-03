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
    const { email, password, name, code } = await req.json();

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

      // B. 建立組織關聯 (房東與管理員使用 OrgMemberRole)
      // 非 TENANT (如 MANAGER) 需要加入 UserOrganization
      if (invitation.targetRole === "MANAGER") {
        await tx.userOrganization.create({
          data: {
            userId: user.id,
            organizationId: invitation.organizationId,
            memberRole: "MANAGER",
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