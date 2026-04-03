import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { randomBytes } from "crypto";

/**
 * 生成邀請碼 API
 * POST /api/invitations/generate
 * Body: { organizationId: string, propertyId?: string, targetRole: "TENANT" | "MANAGER" }
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    // 1. 權限檢查：只有房東或管理員可以邀請
    if (!session || !["ADMIN", "LANDLORD", "MANAGER"].includes((session.user as any).role)) {
      return NextResponse.json({ error: "權限不足" }, { status: 403 });
    }

    const { organizationId, propertyId, targetRole } = await req.json();

    if (!organizationId || !targetRole) {
      return NextResponse.json({ error: "缺少必要參數" }, { status: 400 });
    }

    // 2. 生成 8 位隨機邀請碼 (可以使用大寫字母以便於讀取)
    const code = randomBytes(4).toString("hex").toUpperCase();

    // 3. 設定有效期 (預設 7 天)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // 4. 存入資料庫
    const invitation = await prisma.invitation.create({
      data: {
        code,
        inviterId: (session.user as any).id,
        organizationId,
        propertyId: propertyId || null,
        targetRole,
        expiresAt,
      },
    });

    return NextResponse.json({ 
      success: true, 
      code: invitation.code,
      expiresAt: invitation.expiresAt 
    });

  } catch (error) {
    console.error("生成邀請碼失敗:", error);
    return NextResponse.json({ error: "內部系統錯誤" }, { status: 500 });
  }
}