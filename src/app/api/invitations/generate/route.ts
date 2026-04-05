import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { randomBytes } from "crypto";

/**
 * 生成邀請碼 API
 * POST /api/invitations/generate
 * Body: { organizationId: string, propertyId?: string, targetRole: "LANDLORD" | "MANAGER" | "TENANT" }
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    // 1. 權限檢查：只有房東或管理員可以邀請
    if (!session || !["ADMIN", "LANDLORD", "MANAGER"].includes((session.user as any).role)) {
      return NextResponse.json({ error: "權限不足" }, { status: 403 });
    }

    const { organizationId, propertyId, targetRole } = await req.json();

    // 1.2 角色型權限細分
    if ((session.user as any).role === "MANAGER" && targetRole === "MANAGER") {
      return NextResponse.json({ error: "代管人員無權邀請其他代管人員" }, { status: 403 });
    }

    // 補充：只有 ADMIN 可以邀請 LANDLORD
    if (targetRole === "LANDLORD" && (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "只有系統管理員能邀請房東" }, { status: 403 });
    }

    // 參數驗證：非 LANDLORD 角色必須提供 organizationId
    if (!targetRole || (targetRole !== "LANDLORD" && !organizationId)) {
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
        organizationId: organizationId || null,
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