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

    const { organizationId, propertyId, targetRole, targetPlan } = await req.json();

    // 1.2 角色型權限細分
    if ((session.user as any).role === "MANAGER" && targetRole === "MANAGER") {
      return NextResponse.json({ error: "代管人員無權邀請其他代管人員" }, { status: 403 });
    }

    // 補充：只有 ADMIN 可以邀請 LANDLORD 及 指派方案
    if (targetRole === "LANDLORD" && (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "只有系統管理員能邀請房東" }, { status: 403 });
    }

    // Admin 限制：平台管理員禁止生成房客 (TENANT) 邀請碼
    if (targetRole === "TENANT" && (session.user as any).role === "ADMIN") {
      return NextResponse.json({ error: "系統管理員不參與租賃事務，禁止生成房客邀請碼" }, { status: 403 });
    }

    // 只有 ADMIN 可以邀請 MANAGER 並指定其為 "專業代管 (有獨立 Organization & 方案)"
    // 如果是 LANDLORD 邀請的 MANAGER，則不應帶 targetPlan (屬於該 LANDLORD 組織)
    if (targetPlan && (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "只有系統管理員能指派訂閱方案" }, { status: 403 });
    }

    // 修正：Admin 發出的 LANDLORD 與 MANAGER 邀請可以不帶 organizationId
    const isGenesisInvite = targetRole === "LANDLORD" || targetRole === "MANAGER";
    
    if (!targetRole || (!isGenesisInvite && !organizationId)) {
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
        targetPlan: targetPlan || null,
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