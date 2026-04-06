import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-guards";

/**
 * 模擬方案升級 API
 * POST /api/user/organizations/upgrade
 */
export const POST = withAuth(async (req: Request, { session }) => {
  try {
    const { organizationId, plan } = await req.json();

    if (!organizationId || !plan) {
      return NextResponse.json({ error: "缺少必要參數" }, { status: 400 });
    }

    // 檢查是否有權限 (必須是組織擁有者)
    const isOwner = await prisma.userOrganization.findFirst({
      where: {
        userId: (session.user as any).id,
        organizationId: organizationId,
        memberRole: "OWNER",
      },
    });

    if (!isOwner && (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "權限不足，僅擁有者可變更方案" }, { status: 403 });
    }

    // 更新方案
    const updatedOrg = await prisma.organization.update({
      where: { id: organizationId },
      data: {
        plan: plan,
        // 模擬延展訂閱期 30 天
        planExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      } as any,
    });

    return NextResponse.json({ 
      success: true, 
      message: `已升級至 ${plan} 方案`,
      data: updatedOrg 
    });
  } catch (error) {
    console.error("方案升級失敗:", error);
    return NextResponse.json({ error: "系統錯誤" }, { status: 500 });
  }
}, ["ADMIN", "LANDLORD"]);